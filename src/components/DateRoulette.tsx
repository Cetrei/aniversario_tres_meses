import { useState, useRef, useCallback } from 'react';
import { DateIdea } from '../config';

interface DateRouletteProps {
  options: DateIdea[];
}

interface ConfettiPetal {
  id: number;
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

function downloadCoupon(idea: DateIdea) {
  const W = 700;
  const H = 340;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // 1. FONDO CON TEXTURA Y DEGRADADO COMPLEJO (Adiós a lo plano)
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.6);
  bgGrad.addColorStop(0, '#1C1316');
  bgGrad.addColorStop(1, '#0F0A0C');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Inyección de grano/ruido orgánico al lienzo
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const opacity = Math.random() * 0.035;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }
  ctx.restore();

  // Marcas de agua botánicas tenues de fondo
  ctx.strokeStyle = 'rgba(232, 165, 152, 0.025)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(W - 80, H / 2, 90, 0, Math.PI * 2);
  ctx.arc(W - 80, H / 2, 130, 0, Math.PI * 2);
  ctx.stroke();

  // Borde punteado clásico de ticket
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#3C282D';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, W - 32, H - 32);
  ctx.setLineDash([]);

  // Perforaciones circulares de cupones antiguos
  const perf = (x: number) => {
    ctx.beginPath();
    ctx.arc(x, H / 2, 16, -Math.PI / 2, Math.PI / 2, x === 0);
    ctx.fillStyle = '#130D0F';
    ctx.fill();
    ctx.strokeStyle = '#3C282D';
    ctx.lineWidth = 1;
    ctx.stroke();
  };
  perf(0);
  perf(W);

  // Línea divisoria interna
  ctx.strokeStyle = '#2D1C22';
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(160, 36);
  ctx.lineTo(160, H - 36);
  ctx.stroke();
  ctx.setLineDash([]);

  const emoji = idea.title.match(/^\S+/)?.[0] ?? '🌸';
  const titleText = idea.title.replace(/^\S+\s*/, '');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFDFD';
  ctx.font = '42px serif';
  ctx.fillText(emoji, 80, H / 2 - 12);

  ctx.fillStyle = '#E8A598';
  ctx.font = 'bold 10px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('CUPÓN DE CITA', 80, H / 2 + 28);
  ctx.letterSpacing = '0px';

  // ILUSTRACIÓN VECTORIAL EXTRA: RAMA DE ROSAS ROMÁNTICA
  ctx.save();
  ctx.translate(W - 90, 60);
  ctx.strokeStyle = '#4E313C';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.bezierCurveTo(0, 0, 15, -15, 20, -32);
  ctx.stroke();
  // Hoja
  ctx.fillStyle = '#24171A';
  ctx.beginPath();
  ctx.ellipse(8, -14, 4, 7, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  // Flor principal
  ctx.fillStyle = '#E8A598';
  ctx.beginPath();
  ctx.arc(20, -34, 9, 0, Math.PI * 2);
  ctx.fill();
  // Detalle central
  ctx.strokeStyle = '#1C1316';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(19, -33, 4, 0, Math.PI, true);
  ctx.stroke();
  ctx.restore();

  // Textos descriptivos
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFDFD';
  ctx.font = 'bold 22px serif';
  wrapText(ctx, titleText, 184, 80, W - 250, 30);

  ctx.fillStyle = '#B59F9F';
  ctx.font = '15px serif';
  wrapText(ctx, idea.description, 184, 132, W - 250, 22);

  ctx.fillStyle = '#3C282D';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('válido en cualquier momento · con amor eterno 🌸', W - 28, H - 26);

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `validez-cita-${titleText.toLowerCase().replace(/\s+/g, '-').slice(0, 25)}.png`;
  link.click();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
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
  const [confetti, setConfetti] = useState<ConfettiPetal[]>([]);
  // Sistema de pool: índices restantes por salir
  const [pool, setPool] = useState<number[]>([]);
  // Tras ver todos: modo de selección manual
  const [seenAll, setSeenAll] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Obtiene el próximo índice del pool (sin repetición) y actualiza el pool. */
  const drawFromPool = useCallback((currentPool: number[]): { nextIndex: number; newPool: number[] } => {
    let workPool = currentPool.length > 0 ? [...currentPool] : options.map((_, i) => i);

    const randomPos = Math.floor(Math.random() * workPool.length);
    const nextIndex = workPool[randomPos];
    workPool.splice(randomPos, 1);

    return { nextIndex, newPool: workPool };
  }, [options]);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setConfetti([]);
    setShowManual(false);

    let count = 0;
    const totalSteps = 25 + Math.floor(Math.random() * 8);

    // Animación rápida: muestra opciones al azar (solo visual, no quita del pool)
    intervalRef.current = setInterval(() => {
      setSelected(options[Math.floor(Math.random() * options.length)]);
      count++;
      if (count >= totalSteps) {
        clearInterval(intervalRef.current!);

        // El resultado real sí viene del pool
        const { nextIndex, newPool } = drawFromPool(pool);
        const final = options[nextIndex];

        const allSeen = newPool.length === 0;
        setPool(newPool);
        setSelected(final);
        setSpinning(false);
        setSpinCount((n) => n + 1);
        if (allSeen) setSeenAll(true);

        // Lluvia de confeti orgánica en forma de pétalos cayendo
        const petalColors = ['#E8A598', '#FFD4E2', '#FFFDFD', '#543641'];
        const particles = Array.from({ length: 40 }, (_, i) => ({
          id: Date.now() + i,
          left: Math.random() * 100,
          size: 7 + Math.random() * 8,
          color: petalColors[Math.floor(Math.random() * petalColors.length)],
          delay: Math.random() * 0.3,
          duration: 2.4 + Math.random() * 1.4,
        }));
        setConfetti(particles);
      }
    }, 90);
  }, [spinning, options, pool, drawFromPool]);

  const resetPool = () => {
    setPool([]);
    setSeenAll(false);
    setShowManual(false);
  };

  return (
    <div className="space-y-8 max-w-md mx-auto relative select-none">
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map((p) => (
            <div
              key={p.id}
              className="absolute top-0 animate-confetti"
              style={{
                left: `${p.left}%`,
                backgroundColor: p.color,
                width: `${p.size}px`,
                height: `${p.size * 1.4}px`,
                borderRadius: '60% 0 60% 60%',
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Tarjeta resultado */}
      <div className="min-h-[130px] flex flex-col items-center justify-center px-2">
        {spinning ? (
          <div className="flex flex-col items-center gap-3">
            <span className="text-2xl text-[#E8A598] inline-block animate-spin">
              ✦
            </span>
            <p className="text-xs font-serif italic text-[#8C7565]">
              Buscando nuestro próximo destino...
            </p>
          </div>
        ) : selected ? (
          <div key={`${selected.title}-${spinCount}`} className="space-y-2.5 text-center">
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#FFFDFD]">
              {selected.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#B59F9F] font-sans font-light leading-relaxed">
              {selected.description}
            </p>
            {/* Indicador de progreso del pool */}
            <p className="text-[9px] font-mono text-[#62464D] tracking-wide pt-1">
              {seenAll
                ? '✦ Ya exploraste todas las ideas ✦'
                : `${options.length - pool.length} / ${options.length} ideas exploradas`}
            </p>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-[#62464D] font-serif italic text-center">
            A veces, los planes improvisados guardan los mejores recuerdos.
          </p>
        )}
      </div>

      {/* Botones principales */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        {!seenAll ? (
          <button
            onClick={spin}
            disabled={spinning}
            className={`w-full sm:w-auto py-3.5 px-8 rounded-full font-sans font-light text-xs tracking-wide transition-all duration-500 border ${
              spinning
                ? 'bg-transparent border-[#2D1C22] text-[#4E313C] cursor-not-allowed'
                : 'bg-[#E8A598]/5 border-[#E8A598]/20 text-[#E8A598] hover:bg-[#E8A598]/10 hover:border-[#E8A598]/50'
            }`}
          >
            {spinning ? 'Garantizando sorpresas...' : spinCount === 0 ? 'Descubrir una idea' : 'Girar de nuevo ✦'}
          </button>
        ) : (
          /* Tras ver todas: botón de reinicio + selección manual */
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-xs font-serif italic text-[#8C7565] text-center">
              ¡Viste todas las ideas! ¿Quieres una en particular?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
              <button
                onClick={resetPool}
                className="w-full sm:w-auto py-3 px-6 rounded-full font-sans font-light text-xs tracking-wide border border-[#E8A598]/20 text-[#E8A598] hover:bg-[#E8A598]/10 transition-all duration-300"
              >
                Volver a girar ✦
              </button>
              <button
                onClick={() => setShowManual((v) => !v)}
                className="w-full sm:w-auto py-3 px-6 rounded-full font-sans font-light text-xs tracking-wide border border-[#2D1C22] text-[#8C7565] hover:border-[#8C7565] hover:text-[#FFFDFD] transition-all duration-300"
              >
                {showManual ? 'Cerrar lista' : 'Elegir manualmente'}
              </button>
            </div>

            {/* Lista de selección manual */}
            {showManual && (
              <div className="w-full mt-2 space-y-2">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelected(opt);
                      setSpinCount((n) => n + 1);
                      setShowManual(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                      selected?.title === opt.title
                        ? 'border-[#E8A598]/40 bg-[#E8A598]/8 text-[#FFFDFD]'
                        : 'border-[#2D1C22] text-[#B59F9F] hover:border-[#4E313C] hover:text-[#EDE7E5]'
                    }`}
                  >
                    <span className="text-sm font-serif">{opt.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selected && !spinning && (
          <button
            onClick={() => downloadCoupon(selected)}
            className="w-full sm:w-auto py-3.5 px-6 rounded-full font-sans font-light text-xs tracking-wide transition-all duration-300 border border-[#2D1C22] text-[#8C7565] hover:border-[#8C7565] hover:text-[#FFFDFD] flex items-center justify-center gap-2"
          >
            Guardar boleto ilustrado
          </button>
        )}
      </div>
    </div>
  );
}
