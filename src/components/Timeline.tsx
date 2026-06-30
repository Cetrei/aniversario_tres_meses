import { useMemo, useState } from 'react';
import type { TimelineMilestone } from '../config';

interface TimelineProps {
  /** Hitos a graficar en la línea de tiempo. */
  milestones: TimelineMilestone[];
  /** Fecha ISO de inicio "oficial" de la relación (ancla visual, aunque no sea el primer hito). */
  anniversaryDate: string;
}

interface PositionedMilestone extends TimelineMilestone {
  /** Posición normalizada (0–1) a lo largo de la línea. */
  position: number;
  isPast: boolean;
  year: number;
  month: number;
}

// Línea de tiempo de la relación: pensada para crecer durante años (mudanzas,
// mascotas, boda, hijos...). Cada hito nuevo en config.ts se acomoda solo en
// su posición proporcional. La línea termina en una flecha que apunta hacia
// adelante, dejando claro que esto es inicio -> futuro, no un recorrido cerrado.
export default function Timeline({ milestones, anniversaryDate }: TimelineProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const positioned = useMemo<PositionedMilestone[]>(() => {
    if (milestones.length === 0) return [];
    const now = Date.now();
    const allDates = [
      ...milestones.map((m) => new Date(m.date).getTime()),
      new Date(anniversaryDate).getTime(),
      now,
    ];
    const firstMs = Math.min(...allDates);
    // Deja un pequeño margen al final para que el último hito no quede pegado
    // a la punta de la flecha ("hoy"), y haya espacio visual hacia el futuro.
    const totalSpan = Math.max(now - firstMs, 1) * 1.12;

    const withPosition = milestones
      .map((m) => {
        const dateMs = new Date(m.date).getTime();
        const position = Math.max(0, Math.min(1, (dateMs - firstMs) / totalSpan));
        return {
          ...m,
          position,
          isPast: dateMs <= now,
          year: new Date(m.date).getFullYear(),
          month: new Date(m.date).getMonth() + 1,
        };
      })
      .sort((a, b) => a.position - b.position);

    // Si en el futuro se agregan muchos hitos cercanos entre sí (mudanza,
    // mascota, boda, hijos...), sus posiciones reales podrían quedar tan
    // pegadas que las etiquetas se superpongan. Aplicamos una separación
    // mínima hacia la derecha, en cascada, sin alterar el orden cronológico.
    const minGap = 1 / 9; // ~9 hitos visibles cómodamente en el ancho disponible
    for (let i = 1; i < withPosition.length; i++) {
      const prev = withPosition[i - 1];
      const curr = withPosition[i];
      if (curr.position - prev.position < minGap) {
        curr.position = Math.min(1, prev.position + minGap);
      }
    }

    return withPosition;
  }, [milestones, anniversaryDate]);

  if (positioned.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-10 sm:gap-14">
      <div className="text-center space-y-1.5">
        <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Nuestra línea de tiempo</span>
        <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#FFFDFD]">Cada capítulo nos trajo hasta aquí</h2>
      </div>

      {/* Versión escritorio: línea con flecha apuntando al futuro, nodos sobre la línea */}
      <div className="hidden md:flex flex-col items-center w-full max-w-4xl px-8">
        <div className="relative w-full" style={{ height: 46 }}>
          {/* Eje de la línea, con punta de flecha apuntando al futuro */}
          <svg className="absolute bottom-0 left-0 w-full" style={{ height: 14 }} viewBox="0 0 1000 14" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="timeline-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4E313C" stopOpacity="0.2" />
                <stop offset="65%" stopColor="#4E313C" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#E8A598" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <line x1="0" y1="7" x2="960" y2="7" stroke="url(#timeline-line)" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />
            <path d="M 958 1 L 996 7 L 958 13" fill="none" stroke="#E8A598" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {positioned.map((m, i) => {
            const isActive = activeIndex === i;
            const leftPct = m.position * 93;
            return (
              <div
                key={i}
                className="absolute bottom-[7px] left-0 flex flex-col items-center"
                style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}
              >
                <button
                  type="button"
                  aria-label={`${m.label}, ${m.year}/${m.month}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(null)}
                  className={`block rounded-full transition-all duration-300 ${
                    m.isPast
                      ? isActive ? 'w-3.5 h-3.5 bg-[#E8A598]' : 'w-2.5 h-2.5 bg-[#E8A598]/60'
                      : isActive ? 'w-3 h-3 bg-[#4E313C]/60 border border-[#E8A598]/40' : 'w-2 h-2 bg-[#4E313C]/40'
                  }`}
                  style={isActive ? { boxShadow: '0 0 10px rgba(232,165,152,0.6)' } : undefined}
                />
                <div
                  className="w-px"
                  style={{
                    height: isActive ? 16 : 12,
                    background: m.isPast ? 'rgba(232,165,152,0.45)' : 'rgba(78,49,60,0.35)',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Etiquetas: todas alineadas en una sola fila debajo de la línea, alineadas a su nodo */}
        <div className="relative w-full mt-3" style={{ height: 56 }}>
          {positioned.map((m, i) => {
            const isActive = activeIndex === i;
            return (
              <div
                key={i}
                className="absolute top-0 flex flex-col items-center transition-opacity duration-300"
                style={{
                  left: `${m.position * 93}%`,
                  transform: 'translateX(-50%)',
                  width: 110,
                  opacity: isActive ? 1 : 0.75,
                }}
              >
                <span className={`text-[10px] font-mono tracking-wide uppercase transition-colors duration-300 ${isActive ? 'text-[#E8A598]' : 'text-[#8C7565]/80'}`}>
                  {m.year}/{m.month}
                </span>
                <span className={`text-[11px] sm:text-xs font-serif italic text-center leading-snug transition-colors duration-300 ${isActive ? 'text-[#FFFDFD]' : 'text-[#B59F9F]/80'}`}>
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>

        <span className="self-end -mt-1 text-[9px] font-mono tracking-[0.2em] text-[#E8A598]/70 uppercase">
          y lo que sigue...
        </span>
      </div>

      {/* Versión móvil: línea vertical compacta con flecha apuntando hacia abajo (futuro) */}
      <div className="md:hidden w-full max-w-xs px-4">
        <div className="relative pl-7">
          <svg className="absolute left-0 top-0 w-3" style={{ height: '100%' }} viewBox="0 0 12 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="timeline-line-mobile" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4E313C" stopOpacity="0.15" />
                <stop offset="75%" stopColor="#4E313C" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#E8A598" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <line x1="6" y1="0" x2="6" y2="96" stroke="url(#timeline-line-mobile)" strokeWidth="1.5" />
            <path d="M 2 92 L 6 99 L 10 92" fill="none" stroke="#E8A598" strokeOpacity="0.85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex flex-col gap-6">
            {positioned.map((m, i) => (
              <div key={i} className="relative flex flex-col">
                <div
                  className={`absolute -left-7 top-0.5 rounded-full ${m.isPast ? 'w-2.5 h-2.5 bg-[#E8A598]/70' : 'w-2 h-2 bg-[#4E313C]/40'}`}
                  style={m.isPast ? { boxShadow: '0 0 8px rgba(232,165,152,0.45)' } : undefined}
                />
                <span className="text-[9px] font-mono tracking-wide text-[#8C7565]/80 uppercase">{m.year}/{m.month}</span>
                <span className="text-xs font-serif italic text-[#EDE7E5]/90 leading-snug">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
        <span className="block text-right mt-3 text-[9px] font-mono tracking-[0.2em] text-[#E8A598]/70 uppercase">
          y lo que sigue...
        </span>
      </div>

      <p className="text-[10px] sm:text-[11px] text-[#62464D] font-mono tracking-wide text-center max-w-sm px-6">
        Esta línea seguirá creciendo con nosotros, hito tras hito, mientras dure nuestra historia.
      </p>
    </div>
  );
}
