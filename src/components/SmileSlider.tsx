import { useState, useEffect, useRef } from 'react';

const SMILE_MESSAGES: { threshold: number; text: string }[] = [
  { threshold: 0,   text: 'A veces el ruido del día es ensordecedor y me llena de estrés...' },
  { threshold: 20,  text: 'Pero empiezo a pensar en ti y todo el entorno se suaviza poco a poco.' },
  { threshold: 40,  text: 'Cuando me dedicas esa sonrisa tranquila, el mundo empieza a ir un poco más lento.' },
  { threshold: 60,  text: 'Con tu risa, todo el ruido se apaga por completo. Me invade una calma profunda.' },
  { threshold: 80,  text: 'Tu alegría es mi paz absoluta. Nada más importa cuando te veo así de feliz.' },
  { threshold: 100, text: 'Tu risa abierta detiene el tiempo por completo; eres mi hogar seguro y eterno.' },
];

function getSmileMessage(level: number): string {
  let msg = SMILE_MESSAGES[0].text;
  for (const entry of SMILE_MESSAGES) {
    if (level >= entry.threshold) msg = entry.text;
  }
  return msg;
}

const TICK_POSITIONS = [0, 20, 45, 75, 100];

function PeacefulWave({ smileLevel }: { smileLevel: number }) {
  const offsetRef = useRef(0);
  const pathMainRef = useRef<SVGPathElement>(null);
  const pathGlowRef = useRef<SVGPathElement>(null);
  const animRef = useRef<number>(0);
  const smileRef = useRef(smileLevel);

  useEffect(() => {
    smileRef.current = smileLevel;
  }, [smileLevel]);

  useEffect(() => {
    const loop = () => {
      const level = smileRef.current;
      const t = level / 100;
      const frequency = 0.055 - t * 0.038;
      const amplitude = 32 - t * 18;
      const noiseAmp = (1 - t) * 14;
      const speed = 2.8 - t * 2.1;

      offsetRef.current += speed;

      const width = 600;
      const cx = 75;
      const points: string[] = [];

      for (let x = 0; x <= width; x += 4) {
        let y = cx;
        y += Math.sin((x + offsetRef.current) * frequency) * amplitude;
        y += Math.sin((x * 2.3 + offsetRef.current * 1.7) * frequency) * (noiseAmp * 0.5);
        if (noiseAmp > 0) y += (Math.random() - 0.5) * noiseAmp;
        points.push(`${x},${y}`);
      }

      const d = `M ${points.join(' L ')}`;
      if (pathMainRef.current) pathMainRef.current.setAttribute('d', d);
      if (pathGlowRef.current) pathGlowRef.current.setAttribute('d', d);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const r = Math.round(232 + (244 - 232) * (smileLevel / 100));
  const g = Math.round(165 - (165 - 63) * (smileLevel / 100));
  const b = Math.round(152 - (152 - 94) * (smileLevel / 100));
  const strokeColor = `rgb(${r},${g},${b})`;
  const glowOpacity = 0.05 + (smileLevel / 100) * 0.25;
  const strokeWidth = 2 + (smileLevel / 100) * 1.5;

  return (
    <svg
      className="w-full h-full max-w-xl overflow-visible"
      viewBox="0 0 600 150"
      aria-hidden="true"
    >
      <path
        ref={pathGlowRef}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth * 8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={glowOpacity}
        style={{ filter: 'blur(10px)', transition: 'stroke 1.2s ease, opacity 1.2s ease' }}
      />
      <path
        ref={pathMainRef}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke 1.2s ease, stroke-width 1.2s ease' }}
      />
    </svg>
  );
}

export default function SmileSlider() {
  const [smileLevel, setSmileLevel] = useState(0);
  const message = getSmileMessage(smileLevel);

  const fillStyle = {
    width: `${smileLevel}%`,
  };

  return (
    <div className="w-full mt-16 space-y-12">
      <div className="space-y-4 max-w-md mx-auto relative">
        <div className="relative w-full h-8 flex items-center">
          <div className="absolute w-full h-[2px] bg-[#2D1C22] rounded-full" />
          <div
            className="absolute h-[2px] bg-gradient-to-r from-[#62464D] to-[#E8A598] rounded-full pointer-events-none"
            style={fillStyle}
          />
          {TICK_POSITIONS.map((pos) => (
            <div
              key={pos}
              className="absolute w-[1px] h-[8px] bg-[#3C282D] rounded-full pointer-events-none"
              style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
            />
          ))}
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={smileLevel}
            onChange={(e) => setSmileLevel(Number(e.target.value))}
            className="slider-custom absolute w-full z-10"
            aria-label="Nivel de la sonrisa"
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-[#8C7565] tracking-widest">
          <span>DÍA AGITADO</span>
          <span>TU SONRISA</span>
          <span>TU RISA ABIERTA</span>
        </div>
      </div>

      <div className="w-full h-[150px] relative flex items-center justify-center">
        <PeacefulWave smileLevel={smileLevel} />
      </div>

      <div className="max-w-xl mx-auto min-h-[80px] flex items-center justify-center">
        <p
          key={message}
          className="text-xl sm:text-2xl font-serif italic text-[#E8A598] tracking-wide leading-relaxed animate-fade-in-up text-center"
        >
          "{message}"
        </p>
      </div>
    </div>
  );
}