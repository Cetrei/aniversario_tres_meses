import { useState, useEffect, useRef } from 'react';
import { PhotoEntry } from '../config';

interface GalleryProps {
  photos: PhotoEntry[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1); // 1=izq->der, -1=der->izq
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (index: number, dir?: 1 | -1) => {
    if (transitioning || index === currentIndex) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const resolvedDir = dir ?? (index > currentIndex ? 1 : -1);
    setDirection(resolvedDir);
    setPrevIndex(currentIndex);
    setCurrentIndex(index);
    setTransitioning(true);

    timeoutRef.current = setTimeout(() => {
      setPrevIndex(null);
      setTransitioning(false);
    }, 480);
  };

  const nextPhoto = () => goTo((currentIndex + 1) % photos.length, 1);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const current = photos[currentIndex];
  const prev = prevIndex !== null ? photos[prevIndex] : null;

  // La foto saliente se va en la dirección opuesta a la entrante
  const slideOut = direction === 1 ? '-100%' : '100%';
  const slideIn  = direction === 1 ?  '100%' : '-100%';

  return (
    <div className="w-full max-w-[330px] flex flex-col items-center justify-center select-none">

      <div
        onClick={nextPhoto}
        className="w-full bg-[#F4F1EA] p-4 pb-5 rounded-sm shadow-2xl shadow-black/80 transform rotate-1 hover:rotate-0 transition-all duration-500 cursor-pointer group"
      >
        {/* Contenedor con overflow hidden para que el slide quede dentro del marco */}
        <div className="w-full aspect-square bg-[#E5E2DA] overflow-hidden relative border border-black/5 rounded-sm">

          {/* Foto saliente: sale hacia slideOut */}
          {prev && (
            <img
              key={`prev-${prevIndex}`}
              src={prev.url}
              alt={prev.displayName}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: prev.objectPosition ?? 'center center',
                transform: transitioning ? `translateX(${slideOut})` : 'translateX(0%)',
                transition: transitioning ? 'transform 420ms cubic-bezier(0.4,0,0.2,1)' : 'none',
              }}
            />
          )}

          {/* Foto entrante: entra desde slideIn y llega al centro */}
          <img
            key={`curr-${currentIndex}`}
            src={current.url}
            alt={current.displayName}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105"
            style={{
              objectPosition: current.objectPosition ?? 'center center',
              transform: transitioning ? 'translateX(0%)' : 'translateX(0%)',
              // Al montar empieza desplazada, luego se anima al centro
              animation: transitioning ? `slideInFrom 420ms cubic-bezier(0.4,0,0.2,1) forwards` : 'none',
              // Usamos una variable CSS para pasar el valor dinámico
              ['--slide-from' as string]: slideIn,
              transition: 'transform 700ms cubic-bezier(0.4,0,0.2,1)', // para el hover scale
            }}
          />

          <div className="absolute inset-0 bg-[#3B1F27]/5 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Caption */}
        <div className="mt-4 min-h-[38px] flex items-center justify-center text-center px-1">
          <p
            className="italic text-[11px] sm:text-xs text-[#28191E] font-serif font-medium leading-tight line-clamp-2"
            style={{
              opacity: transitioning ? 0 : 1,
              transition: 'opacity 200ms ease-in-out',
            }}
          >
            "{current.caption}"
          </p>
        </div>
      </div>

      {/* Contador y dots */}
      <div className="mt-4 flex flex-col items-center gap-1.5 w-full text-center">
        <span className="text-[10px] font-mono tracking-widest text-[#62464D] uppercase">
          {currentIndex + 1} / {photos.length} — Toca la foto para avanzar
        </span>
        <div className="flex justify-center gap-1.5 max-w-full flex-wrap">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              aria-label={`Ver imagen ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-4 bg-[#E8A598]' : 'w-1 bg-[#2D1C22]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Keyframe inyectado inline para el slide-in */}
      <style>{`
        @keyframes slideInFrom {
          from { transform: translateX(var(--slide-from)); }
          to   { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}