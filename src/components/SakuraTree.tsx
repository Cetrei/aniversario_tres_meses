import { useEffect, useRef, useState } from "react";

interface SakuraTreeProps {
  anniversaryDate: string;
}

interface BranchData {
  x1: number; y1: number;
  x2: number; y2: number;
  cpx: number; cpy: number;
  baseWidth: number;
  depth: number;
  appearTimeline: number; // Momento específico en el que brota esta rama (0-1)
}

interface FlowerData {
  x: number; y: number;
  maxRadius: number;
  opacity: number;
  phase: number;
  speed: number;
  appearTimeline: number; // Momento en el que florece (0.6 - 1.0)
}

interface FallingPetal {
  x: number; y: number;
  speedY: number; speedX: number;
  size: number; phase: number;
}

function seededRand(seed: number) {
  const x = Math.sin(seed + 8) * 10000;
  return x - Math.floor(x);
}

// Genera la estructura botánica completa distribuyendo el momento exacto en que brota cada rama
function buildEvolutionaryTree(cx: number, baseY: number, maxLen: number, maxWidth: number) {
  const branches: BranchData[] = [];
  const tips: { x: number; y: number; depth: number }[] = [];
  let seed = 205;

  function grow(x: number, y: number, angle: number, length: number, width: number, depth: number, parentTimeline: number) {
    const rad = (angle * Math.PI) / 180;
    const x2 = x + Math.cos(rad) * length;
    const y2 = y - Math.sin(rad) * length;
    
    const jitter = (seededRand(seed++) - 0.5) * width * 2.0;
    const cpx = (x + x2) / 2 + jitter;
    const cpy = (y + y2) / 2 + (seededRand(seed++) - 0.5) * width;

    // Las ramas exteriores (mayor depth) brotan más tarde en la línea de tiempo
    const appearTimeline = parentTimeline + (0.05 + seededRand(seed++) * 0.08);

    branches.push({ x1: x, y1: y, x2, y2, cpx, cpy, baseWidth: width, depth, appearTimeline: Math.min(0.65, appearTimeline) });

    if (depth > 8 || length < 5) {
      tips.push({ x: x2, y: y2, depth });
      return;
    }

    const spread = 20 + depth * 2.5;
    const lenRatio = 0.70 - depth * 0.01;
    grow(x2, y2, angle - spread, length * lenRatio, width * 0.65, depth + 1, appearTimeline);
    grow(x2, y2, angle + spread, length * lenRatio, width * 0.65, depth + 1, appearTimeline);
  }

  // La base/tronco inicial nace en el tiempo 0
  grow(cx, baseY, 90, maxLen, maxWidth, 0, 0);
  return { branches, tips };
}

export default function SakuraTree({ anniversaryDate }: SakuraTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<{
    branches: BranchData[];
    flowers: FlowerData[];
    ambientPetals: FallingPetal[];
    initialized: boolean;
  }>({ branches: [], flowers: [], ambientPetals: [], initialized: false });

  // 8 Segundos totales de una transición cinemática suave desde la semilla
  const [introProgress, setIntroProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const size = Math.min(canvas.parentElement?.clientWidth || 360, 380);
      canvas.width = size;
      canvas.height = size;
      stateRef.current.initialized = false;
    };
    resize();

    let startTimestamp: number | null = null;
    let t = 0;

    const draw = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      
      // Control de progreso lineal de la animación de crecimiento (0.0 a 1.0)
      const currentProgress = Math.min(1, elapsed / 8000);
      setIntroProgress(currentProgress);

      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      const W = c.width;
      const H = c.height;
      const cx = W / 2;
      const baseY = H * 0.90;

      // Inicialización determinista estructurada única
      if (!stateRef.current.initialized) {
        const { branches, tips } = buildEvolutionaryTree(cx, baseY, H * 0.25, W * 0.024);
        stateRef.current.branches = branches;

        // Flores mapeadas al final del crecimiento (tiempo 0.62 en adelante)
        stateRef.current.flowers = Array.from({ length: 280 }, (_, i) => {
          const tip = tips[i % tips.length];
          return {
            x: tip.x + (seededRand(i * 3) - 0.5) * 35,
            y: tip.y + (seededRand(i * 4 + 1) - 0.5) * 35,
            maxRadius: 3.5 + seededRand(i * 5) * 4.5,
            opacity: 0.7 + seededRand(i * 6) * 0.3,
            phase: seededRand(i * 7) * Math.PI * 2,
            speed: 0.4 + seededRand(i * 8) * 0.4,
            appearTimeline: 0.60 + seededRand(i * 9) * 0.38 // Florecen al final del ciclo
          };
        });

        // Inicialización de pétalos que caen continuamente por el viento
        stateRef.current.ambientPetals = Array.from({ length: 25 }, (_, i) => ({
          x: seededRand(i * 2) * W,
          y: seededRand(i * 3) * H * 0.8,
          speedY: 0.6 + seededRand(i * 4) * 0.8,
          speedX: -0.3 + seededRand(i * 5) * 0.6,
          size: 3 + seededRand(i * 6) * 4,
          phase: seededRand(i * 7) * 5
        }));

        stateRef.current.initialized = true;
      }

      t += 0.015;
      ctx.clearRect(0, 0, W, H);

      // 1. DIBUJAR RAMAS (Aparecen según su línea de tiempo evolutiva)
      for (const b of stateRef.current.branches) {
        if (currentProgress < b.appearTimeline) continue;

        // Easing de extensión interna de la rama
        const branchLocalProgress = Math.min(1, (currentProgress - b.appearTimeline) / 0.15);
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);

        // Interpolamos la curva de crecimiento lineal
        const currentEndX = b.x1 + (b.x2 - b.x1) * branchLocalProgress;
        const currentEndY = b.y1 + (b.y2 - b.y1) * branchLocalProgress;
        const currentCpx = b.x1 + (b.cpx - b.x1) * branchLocalProgress;
        const currentCpy = b.y1 + (b.cpy - b.y1) * branchLocalProgress;

        ctx.quadraticCurveTo(currentCpx, currentCpy, currentEndX, currentEndY);

        const ratio = b.depth / 9;
        ctx.strokeStyle = `rgb(${Math.round(85 + ratio * 35)}, ${Math.round(60 + ratio * 20)}, ${Math.round(40 + ratio * 10)})`;
        ctx.lineWidth = Math.max(0.6, b.baseWidth * (1 - ratio * 0.4));
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      }

      // 2. DIBUJAR PÉTALOS EN LAS RAMAS (Nacen de un capullo diminuto a flor completa)
      for (const f of stateRef.current.flowers) {
        if (currentProgress < f.appearTimeline) continue;

        // Escala del pétalo creciendo individualmente desde 0% a su tamaño real
        const flowerLocalProgress = Math.min(1, (currentProgress - f.appearTimeline) / 0.20);
        
        const swayX = Math.sin(t * f.speed + f.phase) * 1.8;
        const currentR = f.maxRadius * flowerLocalProgress;

        ctx.save();
        ctx.globalAlpha = f.opacity * flowerLocalProgress;
        ctx.translate(f.x + swayX, f.y + Math.cos(t * f.speed) * 1);
        ctx.rotate(f.phase + t * 0.05);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-currentR, -currentR, -currentR, currentR / 2, 0, currentR);
        ctx.bezierCurveTo(currentR, currentR / 2, currentR, -currentR, 0, 0);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentR || 1);
        grad.addColorStop(0, "rgba(255, 240, 243, 1)");
        grad.addColorStop(0.7, "rgba(242, 154, 173, 0.95)");
        grad.addColorStop(1, "rgba(232, 115, 140, 0)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // 3. RETORNO DE LOS PÉTALOS AMBIENTALES FLOTANTES EN EL CANVAS
      if (currentProgress > 0.45) {
        for (const p of stateRef.current.ambientPetals) {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(t + p.phase) * 0.2;

          // Si el pétalo sale de los bordes, reinicia arriba de forma infinita
          if (p.y > H || p.x < 0 || p.x > W) {
            p.y = -10;
            p.x = Math.random() * W;
          }

          ctx.save();
          ctx.globalAlpha = 0.65;
          ctx.fillStyle = "rgba(242, 154, 173, 0.85)";
          ctx.translate(p.x, p.y);
          ctx.rotate(p.phase + t * 0.4);
          
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const textLabels = [
    { max: 0.20, txt: "Una pequeña semilla despierta en la tierra..." },
    { max: 0.45, txt: "Brota un tallo joven buscando el cielo..." },
    { max: 0.70, txt: "Las ramas se extienden creando vuestro espacio..." },
    { max: 1.00, txt: "Los pétalos de Sakura se abren ante ti... Floreciendo." }
  ];
  const currentText = textLabels.find(l => introProgress <= l.max)?.txt || textLabels[3].txt;

  return (
    <div className="flex flex-col items-center gap-2 w-full select-none">
      <canvas ref={canvasRef} className="w-full max-w-[340px] aspect-square drop-shadow-[0_0_20px_rgba(232,165,152,0.06)]" />
      <p className="text-[11px] font-sans italic text-[#8C7565] tracking-wide text-center min-h-[16px] px-2">
        {currentText}
      </p>
    </div>
  );
}