import { useState, useRef, useCallback } from 'react';
import { DateIdea } from '../config';

interface DateRouletteProps {
  options: DateIdea[];
}

// Dibuja el cupón en canvas y lo descarga como PNG
function downloadCoupon(idea: DateIdea) {
  const W = 700;
  const H = 340;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;     // 2x para pantallas retina
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // Fondo oscuro
  ctx.fillStyle = '#130D0F';
  ctx.fillRect(0, 0, W, H);

  // Borde punteado estilo cupón
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#3C282D';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, W - 32, H - 32);
  ctx.setLineDash([]);

  // Semicírculos laterales (perforación de cupón)
  const perf = (x: number) => {
    ctx.beginPath();
    ctx.arc(x, H / 2, 18, -Math.PI / 2, Math.PI / 2, x === 0);
    ctx.fillStyle = '#130D0F';
    ctx.fill();
    ctx.strokeStyle = '#3C282D';
    ctx.lineWidth = 1;
    ctx.stroke();
  };
  perf(0);
  perf(W);

  // Línea vertical separadora
  ctx.strokeStyle = '#2D1C22';
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(160, 36);
  ctx.lineTo(160, H - 36);
  ctx.stroke();
  ctx.setLineDash([]);

  // Emoji + título izquierda
  const emoji = idea.title.match(/^\S+/)?.[0] ?? '🌸';
  const titleText = idea.title.replace(/^\S+\s*/, '');

  ctx.textAlign = 'center';
  ctx.font = '44px serif';
  ctx.fillText(emoji, 80, H / 2 - 12);

  ctx.fillStyle = '#E8A598';
  ctx.font = 'bold 11px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('CUPÓN DE CITA', 80, H / 2 + 28);
  ctx.letterSpacing = '0px';

  // Título derecha
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFDFD';
  ctx.font = 'bold 22px serif';
  wrapText(ctx, titleText, 184, 80, W - 210, 30);

  // Descripción
  ctx.fillStyle = '#B59F9F';
  ctx.font = '15px serif';
  wrapText(ctx, idea.description, 184, 130, W - 210, 22);

  // Pie
  ctx.fillStyle = '#3C282D';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('válido cuando quieras · hecho con amor 🌸', W - 28, H - 26);

  // Descarga
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `cupon-cita-${titleText.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}.png`;
  link.click();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number
) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, y);
      y += lineH;
      line = word + ' ';
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line.trim(), x, y);
}

export default function DateRoulette({ options }: DateRouletteProps) {
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<DateIdea | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    let count = 0;
    const totalSteps = 20 + Math.floor(Math.random() * 8);

    intervalRef.current = setInterval(() => {
      setSelected(options[Math.floor(Math.random() * options.length)]);
      count++;
      if (count >= totalSteps) {
        clearInterval(intervalRef.current!);
        const final = options[Math.floor(Math.random() * options.length)];
        setSelected(final);
        setSpinning(false);
        setSpinCount((n) => n + 1);
      }
    }, 100);
  }, [spinning, options]);

  const handleDownload = () => {
    if (selected) downloadCoupon(selected);
  };

  return (
    <div className="space-y-8 max-w-md mx-auto">
      {/* Resultado */}
      <div className="min-h-[140px] flex flex-col items-center justify-center">
        {spinning ? (
          <div className="flex flex-col items-center gap-3">
            <span
              className="text-2xl text-[#E8A598] inline-block"
              style={{ animation: 'spin 0.6s linear infinite' }}
            >
              ✦
            </span>
            <p className="text-xs font-serif italic text-[#8C7565]">
              Buscando nuestra próxima memoria...
            </p>
          </div>
        ) : selected ? (
          <div
            key={`${selected.title}-${spinCount}`}
            className="space-y-3 text-center animate-fade-in-up"
          >
            <h4 className="text-2xl font-serif font-bold text-[#FFFDFD]">
              {selected.title}
            </h4>
            <p className="text-sm text-[#B59F9F] font-sans font-light leading-relaxed">
              {selected.description}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#62464D] font-serif italic text-center">
            A veces, lo mejor es dejarse sorprender.
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <button
          onClick={spin}
          disabled={spinning}
          className={`w-full sm:w-auto py-4 px-8 rounded-full font-sans font-light text-sm tracking-wide transition-all duration-500 ease-out border ${
            spinning
              ? 'bg-transparent border-[#2D1C22] text-[#62464D] cursor-not-allowed'
              : 'bg-[#E8A598]/5 border-[#E8A598]/30 text-[#E8A598] hover:bg-[#E8A598]/10 hover:border-[#E8A598]/60 hover:shadow-[0_0_20px_rgba(232,165,152,0.1)]'
          }`}
        >
          {spinning
            ? 'Girando la brújula...'
            : spinCount === 0
            ? 'Descubrir nuestro siguiente plan'
            : 'Girar de nuevo ✦'}
        </button>

        {selected && !spinning && (
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto py-4 px-6 rounded-full font-sans font-light text-sm tracking-wide transition-all duration-300 border border-[#2D1C22] text-[#62464D] hover:border-[#8C7565] hover:text-[#B59F9F] flex items-center justify-center gap-2"
            aria-label="Guardar cupón como imagen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            Guardar cupón
          </button>
        )}
      </div>

      {spinCount > 0 && !spinning && (
        <p className="text-[10px] font-mono text-[#3C282D] text-center tracking-wider">
          {spinCount === 1 ? '1 tirada' : `${spinCount} tiradas`} — elige la que más te llame
        </p>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
