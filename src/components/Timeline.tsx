import { useMemo, useState } from 'react';
import type { TimelineMilestone } from '../config';

interface TimelineProps {
  milestones: TimelineMilestone[];
  anniversaryDate: string;
}

interface PositionedMilestone extends TimelineMilestone {
  position: number;
  isPast: boolean;
  year: number;
  month: number;
}

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
    const totalSpan = Math.max(now - firstMs, 1) * 1.15;

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

    // Más separación para evitar choque de textos
    const minGap = 1 / 5.5;
    for (let i = 1; i < withPosition.length; i++) {
      const prev = withPosition[i - 1];
      const curr = withPosition[i];
      if (curr.position - prev.position < minGap) {
        curr.position = Math.min(0.92, prev.position + minGap);
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

      {/* VERSIÓN ESCRITORIO: Línea horizontal */}
      <div className="hidden md:flex items-start w-full max-w-4xl px-6 gap-4">
        
        {/* COLUMNA IZQUIERDA: Línea de tiempo + nodos */}
        <div className="flex-1 relative" style={{ minHeight: 120 }}>
          
          {/* Contenedor de la línea horizontal */}
          <div className="relative w-full" style={{ height: 40 }}>
            
            {/* SVG: | -----> (línea continua, neón, con marcador de inicio y flecha rellena) */}
            <svg 
              className="absolute left-0 top-0 w-full h-full" 
              viewBox="0 0 1000 40" 
              preserveAspectRatio="none" 
              aria-hidden="true"
            >
              <defs>
                <filter id="timeline-glow" x="-50%" y="-300%" width="200%" height="700%">
                  <feGaussianBlur stdDeviation="2.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g filter="url(#timeline-glow)">
                {/* | marcador de inicio */}
                <line x1="6" y1="12" x2="6" y2="28" stroke="#E8A598" strokeWidth="3" strokeLinecap="round" />
                {/* línea continua y visible */}
                <line x1="10" y1="20" x2="960" y2="20" stroke="#E8A598" strokeWidth="2.5" strokeLinecap="round" />
                {/* ▶ flecha rellena al final */}
                <path d="M 955 11 L 994 20 L 955 29 Z" fill="#E8A598" />
              </g>
            </svg>

            {/* NODOS: círculos alineados al centro de la línea (y=20) */}
            {positioned.map((m, i) => {
              const isActive = activeIndex === i;
              const leftPct = 5 + m.position * 95;
              return (
                <div
                  key={i}
                  className="absolute top-0 left-0 flex flex-col items-center"
                  style={{
                    left: `${leftPct}%`,
                    top: 20,
                    transform: 'translateX(-50%) translateY(-50%)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {/* Círculo del nodo */}
                  <div
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? 14 : m.isPast ? 11 : 9,
                      height: isActive ? 14 : m.isPast ? 11 : 9,
                      backgroundColor: m.isPast
                        ? isActive ? '#E8A598' : '#E8A598'
                        : isActive ? '#4E313C' : '#4E313C',
                      opacity: m.isPast ? (isActive ? 1 : 0.85) : (isActive ? 0.8 : 0.5),
                      border: '2px solid rgba(232,165,152,0.5)',
                      boxShadow: isActive 
                        ? '0 0 12px rgba(232,165,152,0.6)' 
                        : '0 0 6px rgba(232,165,152,0.2)',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* LÍNEAS VERTICALES hacia ABAJO + etiquetas */}
          <div className="relative w-full mt-0" style={{ height: 80 }}>
            {positioned.map((m, i) => {
              const isActive = activeIndex === i;
              const leftPct = 5 + m.position * 95;
              return (
                <div
                  key={i}
                  className="absolute top-0 flex flex-col items-center"
                  style={{
                    left: `${leftPct}%`,
                    transform: 'translateX(-50%)',
                    width: 130,
                  }}
                >
                  {/* Línea vertical discontinua (puntos) hacia ABAJO desde el nodo hasta la fecha */}
                  <div
                    className="transition-all duration-300"
                    style={{
                      width: 0,
                      height: isActive ? 20 : 14,
                      borderLeft: `2px dotted ${m.isPast ? 'rgba(232,165,152,0.75)' : 'rgba(78,49,60,0.55)'}`,
                    }}
                  />
                  {/* Fecha */}
                  <span className={`mt-2 text-[10px] font-mono tracking-wide uppercase transition-colors duration-300 ${isActive ? 'text-[#E8A598]' : 'text-[#8C7565]'}`}>
                    {m.year}/{m.month}
                  </span>
                  {/* Label */}
                  <span className={`text-[11px] font-serif italic text-center leading-snug transition-colors duration-300 ${isActive ? 'text-[#FFFDFD]' : 'text-[#B59F9F]'}`}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DERECHA: solo el texto, alineado a la misma altura que la flecha */}
        <div className="flex items-center justify-center" style={{ width: 90, height: 40, flexShrink: 0 }}>
          <span
            className="text-[9px] font-mono tracking-[0.15em] text-[#E8A598] uppercase whitespace-nowrap"
            style={{ textShadow: '0 0 6px rgba(232,165,152,0.55)' }}
          >
            continuará...
          </span>
        </div>
      </div>

      {/*  VERSIÓN MÓVIL: Línea vertical */}
      <div className="md:hidden w-full max-w-xs px-4">
        <div className="flex gap-3">
          
          {/* COLUMNA IZQUIERDA: Línea vertical + nodos */}
          <div className="flex flex-col items-center relative" style={{ width: 24 }}>
            
            {/* SVG: — | | | | ▼ (línea vertical continua, neón, flecha rellena) */}
            <svg 
              width="24" 
              height="100%" 
              viewBox="0 0 24 200" 
              preserveAspectRatio="none" 
              aria-hidden="true"
              className="absolute top-0 left-0"
              style={{ height: '100%' }}
            >
              <defs>
                <filter id="timeline-glow-mobile" x="-300%" y="-50%" width="700%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g filter="url(#timeline-glow-mobile)">
                {/* — marcador de inicio */}
                <line x1="4" y1="6" x2="20" y2="6" stroke="#E8A598" strokeWidth="3" strokeLinecap="round" />
                {/* línea vertical continua y visible */}
                <line x1="12" y1="10" x2="12" y2="175" stroke="#E8A598" strokeWidth="2.5" strokeLinecap="round" />
                {/* ▼ flecha rellena apuntando abajo */}
                <path d="M 5 170 L 12 196 L 19 170 Z" fill="#E8A598" />
              </g>
            </svg>

            {/* Nodos alineados a la línea vertical */}
            <div className="relative w-full flex flex-col items-center" style={{ paddingTop: 8 }}>
              {positioned.map((m, i) => (
                <div key={i} className="flex flex-col items-center w-full" style={{ marginBottom: i < positioned.length - 1 ? 32 : 0 }}>
                  {/* Círculo centrado en la línea (x=12) */}
                  <div
                    className="rounded-full"
                    style={{
                      width: m.isPast ? 11 : 9,
                      height: m.isPast ? 11 : 9,
                      backgroundColor: m.isPast ? '#E8A598' : '#4E313C',
                      opacity: m.isPast ? 0.85 : 0.5,
                      border: '2px solid rgba(232,165,152,0.4)',
                      boxShadow: m.isPast ? '0 0 6px rgba(232,165,152,0.3)' : 'none',
                      marginLeft: 0, // centrado en el flex container
                    }}
                  />
                  {/* Línea vertical hacia ABAJO hasta el texto (espaciado por el marginBottom del contenedor) */}
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: Textos de los hitos */}
          <div className="flex-1 flex flex-col">
            {positioned.map((m, i) => (
              <div key={i} className="flex flex-col" style={{ marginBottom: i < positioned.length - 1 ? 24 : 0 }}>
                <span className="text-[9px] font-mono tracking-wide text-[#8C7565] uppercase">{m.year}/{m.month}</span>
                <span className="text-xs font-serif italic text-[#EDE7E5]/90 leading-snug">{m.label}</span>
              </div>
            ))}
            
            {/* "continuará" al final, solo el texto, sin icono extra */}
            <div className="mt-2">
              <span
                className="text-[9px] font-mono tracking-[0.15em] text-[#E8A598] uppercase"
                style={{ textShadow: '0 0 6px rgba(232,165,152,0.55)' }}
              >
                continuará...
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] sm:text-[11px] text-[#62464D] font-mono tracking-wide text-center max-w-sm px-6">
        Esta línea seguirá creciendo con nosotros, hito tras hito, mientras dure nuestra historia.
      </p>
    </div>
  );
}