import { useEffect, useRef, useState } from "react";

interface SakuraTreeProps {
  anniversaryDate: string; // ISO string
}

interface BranchData {
  x1: number; y1: number;
  x2: number; y2: number;
  cpx: number; cpy: number; // control point for quadratic curve
  width: number;
  depth: number;
}

interface FlowerData {
  x: number; y: number;
  r: number;
  opacity: number;
  phase: number;
  speed: number;
}

function useCountup(anniversaryDate: string) {
  const calc = () => {
    const diff = Date.now() - new Date(anniversaryDate).getTime();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      totalHours: Math.floor(totalSeconds / 3600),
    };
  };
  const [elapsed, setElapsed] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(id);
  }, [anniversaryDate]);
  return elapsed;
}

// Seeded pseudo-random for deterministic jitter (same tree every render)
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function buildTree(
  cx: number,
  baseY: number,
  trunkLen: number,
  trunkWidth: number
): { branches: BranchData[]; tips: Array<{ x: number; y: number }> } {
  const branches: BranchData[] = [];
  const tips: Array<{ x: number; y: number }> = [];
  let seed = 0;

  function grow(
    x: number, y: number,
    angle: number, length: number,
    width: number, depth: number
  ) {
    if (depth > 9 || length < 5) {
      tips.push({ x, y });
      return;
    }

    const rad = (angle * Math.PI) / 180;
    const x2 = x + Math.cos(rad) * length;
    const y2 = y - Math.sin(rad) * length;

    // Control point: organic lateral bow
    const jitter = (seededRand(seed++) - 0.5) * width * 2.5;
    const cpx = (x + x2) / 2 + jitter;
    const cpy = (y + y2) / 2 + (seededRand(seed++) - 0.5) * width;

    branches.push({ x1: x, y1: y, x2, y2, cpx, cpy, width, depth });

    if (depth >= 6) {
      // Terminal — record tip
      tips.push({ x: x2, y: y2 });
    }

    const spread = 20 + depth * 2.5;
    const lenRatio = 0.67 - depth * 0.008;
    const wRatio = 0.60;

    grow(x2, y2, angle - spread, length * lenRatio, width * wRatio, depth + 1);
    grow(x2, y2, angle + spread, length * lenRatio, width * wRatio, depth + 1);

    // Extra mid branch for fuller canopy
    if (depth < 4) {
      const lateralAngle = angle + (seededRand(seed++) - 0.5) * 15;
      grow(x2, y2, lateralAngle, length * lenRatio * 0.8, width * wRatio * 0.75, depth + 2);
    }
  }

  grow(cx, baseY, 90, trunkLen, trunkWidth, 0);
  return { branches, tips };
}

export default function SakuraTree({ anniversaryDate }: SakuraTreeProps) {
  const { days, hours, minutes, seconds, totalHours } = useCountup(anniversaryDate);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<{
    branches: BranchData[];
    flowers: FlowerData[];
    initialized: boolean;
  }>({ branches: [], flowers: [], initialized: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Resize ──────────────────────────────────────────────
    const resize = () => {
      const parent = canvas.parentElement;
      const size = Math.min(parent?.clientWidth ?? 420, 500);
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size;
        canvas.height = size;
        stateRef.current.initialized = false; // rebuild on size change
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // ── Animation loop ───────────────────────────────────────
    let t = 0;

    const draw = () => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      const W = c.width;
      const H = c.height;
      const cx = W / 2;
      const baseY = H * 0.94;
      const trunkLen = H * 0.26;
      const trunkWidth = W * 0.022;

      // Build geometry once (or after resize)
      if (!stateRef.current.initialized) {
        const { branches, tips } = buildTree(cx, baseY, trunkLen, trunkWidth);
        stateRef.current.branches = branches;

        // Shuffle tips deterministically so first N are spread across canopy
        const shuffled = [...tips];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(seededRand(i * 7 + 3) * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const count = Math.min(totalHours, shuffled.length * 4); // each tip hosts ~4 flowers
        stateRef.current.flowers = Array.from({ length: Math.min(count, shuffled.length * 4) }, (_, i) => {
          const tip = shuffled[i % shuffled.length];
          const scatter = 18;
          return {
            x: tip.x + (seededRand(i * 3 + 1) - 0.5) * scatter,
            y: tip.y + (seededRand(i * 3 + 2) - 0.5) * scatter,
            r: 5 + seededRand(i * 3 + 3) * 9,
            opacity: 0.55 + seededRand(i * 5) * 0.45,
            phase: seededRand(i * 7) * Math.PI * 2,
            speed: 0.3 + seededRand(i * 11) * 0.5,
          };
        });

        stateRef.current.initialized = true;
      }

      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      const { branches, flowers } = stateRef.current;

      // ── Draw branches — sorted so trunk draws last (on top) ──
      const sorted = [...branches].sort((a, b) => b.depth - a.depth);
      for (const b of sorted) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.quadraticCurveTo(b.cpx, b.cpy, b.x2, b.y2);

        // Warm bark color, slightly lighter at tips
        const depthRatio = b.depth / 9;
        const r = Math.round(110 + depthRatio * 30);
        const g = Math.round(82 + depthRatio * 20);
        const bv = Math.round(45 + depthRatio * 15);
        ctx.strokeStyle = `rgb(${r},${g},${bv})`;
        ctx.lineWidth = b.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.restore();
      }

      // ── Draw flowers with gentle sway ───────────────────────
      for (const f of flowers) {
        const sway = Math.sin(t * f.speed + f.phase) * 1.8;
        const bob = Math.cos(t * f.speed * 0.6 + f.phase) * 1.2;
        const fx = f.x + sway;
        const fy = f.y + bob;

        ctx.save();
        ctx.globalAlpha = f.opacity;

        const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.r);
        grad.addColorStop(0, "rgba(255, 215, 225, 1)");
        grad.addColorStop(0.45, "rgba(255, 185, 205, 0.85)");
        grad.addColorStop(1, "rgba(255, 160, 190, 0)");

        ctx.beginPath();
        ctx.arc(fx, fy, f.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Center highlight
        ctx.beginPath();
        ctx.arc(fx, fy, f.r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 240, 245, 0.95)";
        ctx.fill();

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [totalHours]);

  // Rebuild flowers when totalHours changes (new hour ticks)
  useEffect(() => {
    stateRef.current.initialized = false;
  }, [totalHours]);

  const poeticLabel =
    totalHours === 0
      ? "el primer momento"
      : totalHours === 1
      ? "una hora, una flor"
      : `${totalHours.toLocaleString()} flores — una por cada hora juntos`;

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full max-w-[500px] aspect-square"
        aria-label="Árbol de sakura — flores que crecen con el tiempo"
      />

      {/* Poetic label */}
      <p className="text-xs text-[#8C7565] italic tracking-wide text-center px-4 font-sans">
        {poeticLabel}
      </p>

      {/* Contador debajo, fuera del canvas */}
      <div className="flex items-end gap-6 sm:gap-10">
        {[
          { value: days, label: "días" },
          { value: hours, label: "horas" },
          { value: minutes, label: "minutos" },
          { value: seconds, label: "segundos" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-3xl sm:text-5xl font-serif font-semibold text-[#FFFDFD] tabular-nums leading-none">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
