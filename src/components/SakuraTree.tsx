import { useEffect, useRef, useState } from 'react';

interface SakuraTreeProps {
  anniversaryDate: string;
}

interface CounterState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateCounter(dateStr: string): CounterState {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function drawSakuraTree(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  days: number,
  windPhase: number
) {
  ctx.clearRect(0, 0, canvasW, canvasH);

  const maxDepth = days < 30 ? 5 : days < 60 ? 6 : 7;
  const trunkLen = canvasH * 0.28;
  const startX = canvasW / 2;
  const startY = canvasH;

  // Medir bounding box para escalado dinámico
  let minX = Infinity, maxX = -Infinity, minY = Infinity;

  function measureBranch(x: number, y: number, len: number, angleDeg: number, depth: number) {
    if (depth === 0 || len < 2) return;
    const angleRad = (angleDeg * Math.PI) / 180;
    const nx = x + Math.sin(angleRad) * len;
    const ny = y - Math.cos(angleRad) * len;
    if (nx < minX) minX = nx;
    if (nx > maxX) maxX = nx;
    if (ny < minY) minY = ny;
    const spread = 22 + depth * 2;
    const windOffset = depth > 2 ? Math.sin(windPhase) * 3 * (depth - 2) : 0;
    measureBranch(nx, ny, len * 0.68, angleDeg - spread + windOffset, depth - 1);
    measureBranch(nx, ny, len * 0.68, angleDeg + spread + windOffset, depth - 1);
    if (depth === maxDepth - 1) {
      measureBranch(nx, ny, len * 0.55, angleDeg + windOffset, depth - 1);
    }
  }

  measureBranch(startX, startY, trunkLen, 0, maxDepth);

  const treeWidth = maxX - minX;
  const treeHeight = startY - minY;
  const scaleX = treeWidth > 0 ? (canvasW * 0.88) / treeWidth : 1;
  const scaleY = treeHeight > 0 ? (canvasH * 0.88) / treeHeight : 1;
  const scale = Math.min(scaleX, scaleY, 1.0);
  const offsetX = startX - ((minX + maxX) / 2) * scale + (canvasW / 2) * (1 - scale);

  ctx.save();
  ctx.transform(scale, 0, 0, scale, offsetX * (1 - scale), startY * (1 - scale));

  function drawBranch(x: number, y: number, len: number, angleDeg: number, depth: number, parentWidth: number) {
    if (depth === 0 || len < 1.5) return;

    const angleRad = (angleDeg * Math.PI) / 180;
    const nx = x + Math.sin(angleRad) * len;
    const ny = y - Math.cos(angleRad) * len;
    const branchWidth = Math.max(parentWidth * 0.68, 0.8);

    const warmth = 1 - depth / maxDepth;
    const r = Math.round(120 + warmth * 40);
    const g = Math.round(90 + warmth * 30);
    const b = Math.round(70 + warmth * 20);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.lineWidth = branchWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Flores en las últimas 3 capas — densidad alta para centro frondoso
    if (depth <= 3) {
      const blossomCount = depth === 1 ? 7 : depth === 2 ? 5 : 3;
      const spreadRadius = len * (depth === 1 ? 1.4 : 0.9);
      const palettes = [
        'rgba(240,180,175,',
        'rgba(232,165,152,',
        'rgba(255,200,195,',
        'rgba(244,63,94,',
        'rgba(255,220,215,',
      ];

      for (let i = 0; i < blossomCount; i++) {
        const angle = (i / blossomCount) * Math.PI * 2 + windPhase * 0.3;
        const dist = spreadRadius * (0.5 + Math.random() * 0.5);
        const bx = nx + Math.cos(angle) * dist;
        const by = ny + Math.sin(angle) * dist * 0.6;
        const size = depth === 1 ? 3.5 + Math.random() * 3 : 2.5 + Math.random() * 2;
        const alpha = 0.55 + Math.random() * 0.45;

        ctx.beginPath();
        ctx.arc(bx, by, size, 0, Math.PI * 2);
        ctx.fillStyle = palettes[i % palettes.length] + alpha + ')';
        ctx.fill();

        // Pétalos de relleno para el corazón del árbol
        if (depth <= 2 && i % 2 === 0) {
          const ibx = nx + Math.cos(angle + 0.5) * dist * 0.4;
          const iby = ny + Math.sin(angle + 0.5) * dist * 0.4 * 0.6;
          ctx.beginPath();
          ctx.arc(ibx, iby, size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,210,205,${alpha * 0.7})`;
          ctx.fill();
        }
      }
    }

    const spread = 22 + depth * 2;
    // Viento elegante: solo afecta ramas finas, continuo y sin saltos
    const windStrength = depth < 3 ? Math.sin(windPhase) * 2.5 * (3 - depth) : 0;

    drawBranch(nx, ny, len * 0.68, angleDeg - spread + windStrength, depth - 1, branchWidth);
    drawBranch(nx, ny, len * 0.68, angleDeg + spread + windStrength, depth - 1, branchWidth);

    if (depth === maxDepth - 1) {
      drawBranch(nx, ny, len * 0.55, angleDeg + windStrength * 0.5, depth - 1, branchWidth * 0.7);
    }
    if (depth === maxDepth - 2 && days > 45) {
      drawBranch(nx, ny, len * 0.45, angleDeg - 8 + windStrength, depth - 1, branchWidth * 0.6);
    }
  }

  drawBranch(startX, startY, trunkLen, 0, maxDepth, 12);

  // Partículas de pétalos flotando
  const petalCount = Math.min(20, Math.floor(days / 3) + 8);
  for (let i = 0; i < petalCount; i++) {
    const phase = windPhase + (i * 137.5 * Math.PI) / 180;
    const px = canvasW * 0.1 + ((Math.sin(phase * 0.7 + i) * 0.5 + 0.5) * canvasW * 0.8);
    const py = (windPhase * 0.4 + i * (canvasH / petalCount)) % canvasH;
    const alpha = 0.2 + Math.sin(phase) * 0.2;
    ctx.beginPath();
    ctx.arc(px, py, 1.5 + Math.sin(i) * 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,165,152,${Math.max(0.05, alpha)})`;
    ctx.fill();
  }

  ctx.restore();
}

export default function SakuraTree({ anniversaryDate }: SakuraTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [counter, setCounter] = useState<CounterState>(() => calculateCounter(anniversaryDate));
  const animRef = useRef<number>(0);
  const windRef = useRef<number>(0);
  const counterRef = useRef<CounterState>(counter);

  useEffect(() => {
    const tick = () => {
      const next = calculateCounter(anniversaryDate);
      counterRef.current = next;
      setCounter(next);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [anniversaryDate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = Math.min(w * 0.85, 480);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const loop = () => {
      windRef.current += 0.008; // Viento muy lento y continuo
      const { days } = counterRef.current;
      const cssW = parseInt(canvas.style.width || '600');
      const cssH = parseInt(canvas.style.height || '400');
      if (days > 0) {
        drawSakuraTree(ctx, cssW, cssH, days, windRef.current);
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="w-full max-w-2xl mx-auto">
        <canvas
          ref={canvasRef}
          className="w-full block"
          aria-label="Árbol de sakura que crece con el tiempo juntos"
        />
      </div>

      {/* Contador fuera del canvas */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
        {[
          { value: counter.days, label: 'Días' },
          { value: counter.hours, label: 'Horas' },
          { value: counter.minutes, label: 'Minutos' },
          { value: counter.seconds, label: 'Segundos' },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-4xl sm:text-5xl font-serif font-semibold text-[#E8A598] tabular-nums leading-none">
              {label === 'Días' ? value : pad(value)}
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#62464D]">
              {label}
            </span>
          </div>
        ))}
      </div>

      <span className="text-[10px] font-mono tracking-widest uppercase text-[#62464D] animate-pulse-soft">
        Raíces creciendo
      </span>
    </div>
  );
}
