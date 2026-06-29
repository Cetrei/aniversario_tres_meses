import { useState, useEffect, useRef, useMemo } from 'react';
import { PhotoEntry } from '../config';

interface GalleryProps {
  photos: PhotoEntry[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calcula cuál es la foto que viene en la base profunda del mazo
  const nextIndex = useMemo(() => {
    if (!photos || photos.length === 0) return 0;
    return (currentIndex + 1) % photos.length;
  }, [currentIndex, photos?.length]);

  const nextPhoto = () => {
    if (!photos || photos.length <= 1 || exitingIndex !== null) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // 1. Guardamos la foto de arriba en el estado de "vuelo/descarte"
    setExitingIndex(currentIndex);
    // 2. Pasamos la cima estable de la pila a la siguiente foto INMEDIATAMENTE
    setCurrentIndex(nextIndex);

    // 3. Limpiamos el rastro de la foto vieja cuando termine su animación física (600ms)
    timeoutRef.current = setTimeout(() => {
      setExitingIndex(null);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!photos || photos.length === 0) return null;

  // Genera una rotación fija según el índice de la foto para que la pila se vea orgánica
  const getStackStyle = (index: number, isTop: boolean) => {
    const seededRandom = Math.sin(index + 8) * 10000;
    const rotation = (seededRandom - Math.floor(seededRandom) - 0.5) * 7; // Entre -3.5° y 3.5°
    return {
      transform: `rotate(${rotation}deg)`,
      zIndex: isTop ? 20 : 10,
      '--start-rot': `${rotation}deg`,
    } as React.CSSProperties;
  };

  return (
    <div className="w-full max-w-[330px] flex flex-col items-center justify-center select-none">
      
      {/* Contenedor principal con perspectiva 3D habilitada */}
      <div 
        onClick={nextPhoto}
        className="relative w-full aspect-[3/3.8] cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        
        {/* 1. POLAROID DEL FONDO: Se asoma sutilmente abajo de todo en la pila */}
        {photos.length > 1 && (
          <div
            key={`back-${nextIndex}`}
            className="absolute inset-0 bg-[#F4F1EA] p-4 pb-5 rounded-sm shadow-xl border border-black/5 flex flex-col pointer-events-none"
            style={getStackStyle(nextIndex, false)}
          >
            <div className="w-full aspect-square bg-[#E5E2DA] overflow-hidden relative border border-black/5 rounded-sm">
              <img
                src={photos[nextIndex].url}
                alt={photos[nextIndex].displayName}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: photos[nextIndex].objectPosition ?? 'center center' }}
              />
              <div className="absolute inset-0 bg-[#3B1F27]/5 mix-blend-multiply pointer-events-none" />
            </div>
            <div className="mt-4 flex-1 flex items-center justify-center text-center px-1">
              <p className="italic text-[11px] sm:text-xs text-[#28191E] font-serif font-medium leading-tight line-clamp-2">
                "{photos[nextIndex].caption}"
              </p>
            </div>
          </div>
        )}

        {/* 2. POLAROID ACTUAL: Ahora SIEMPRE se queda renderizada a nivel zIndex: 20.
            Al cambiar el currentIndex, se convierte instantáneamente en la foto que se revela abajo. */}
        <div
          key={`curr-${currentIndex}`}
          className={`absolute inset-0 bg-[#F4F1EA] p-4 pb-5 rounded-sm shadow-2xl border border-black/5 flex flex-col transition-all duration-500 group ${
            exitingIndex === null ? 'hover:rotate-0' : ''
          }`}
          style={getStackStyle(currentIndex, true)}
        >
          <div className="w-full aspect-square bg-[#E5E2DA] overflow-hidden relative border border-black/5 rounded-sm">
            <img
              src={photos[currentIndex].url}
              alt={photos[currentIndex].displayName}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
                exitingIndex === null ? 'group-hover:scale-105' : ''
              }`}
              style={{ objectPosition: photos[currentIndex].objectPosition ?? 'center center' }}
            />
            <div className="absolute inset-0 bg-[#3B1F27]/5 mix-blend-multiply pointer-events-none" />
          </div>
          <div className="mt-4 flex-1 flex items-center justify-center text-center px-1">
            <p className="italic text-[11px] sm:text-xs text-[#28191E] font-serif font-medium leading-tight line-clamp-4">
              "{photos[currentIndex].caption}"
            </p>
          </div>
        </div>

        {/* 3. POLAROID SALIENTE: Se superpone a nivel zIndex: 30 solo cuando vuela hacia afuera */}
        {exitingIndex !== null && (
          <div
            key={`exit-${exitingIndex}`}
            className="absolute inset-0 bg-[#F4F1EA] p-4 pb-5 rounded-sm shadow-2xl border border-black/5 flex flex-col animate-polaroid-flight pointer-events-none"
            style={{ ...getStackStyle(exitingIndex, false), zIndex: 30 }}
          >
            <div className="w-full aspect-square bg-[#E5E2DA] overflow-hidden relative border border-black/5 rounded-sm">
              <img
                src={photos[exitingIndex].url}
                alt={photos[exitingIndex].displayName}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: photos[exitingIndex].objectPosition ?? 'center center' }}
              />
              <div className="absolute inset-0 bg-[#3B1F27]/5 mix-blend-multiply pointer-events-none" />
            </div>
            <div className="mt-4 flex-1 flex items-center justify-center text-center px-1">
              <p className="italic text-[11px] sm:text-xs text-[#28191E] font-serif font-medium leading-tight line-clamp-2">
                "{photos[exitingIndex].caption}"
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Contador e indicadores inferiores interactivos */}
      <div className="mt-6 flex flex-col items-center gap-1.5 w-full text-center">
        <span className="text-[10px] font-mono tracking-widest text-[#62464D] uppercase">
          {currentIndex + 1} / {photos.length} — Navega manualmente tocando los puntos
        </span>
        <div className="flex justify-center gap-1.5 max-w-full flex-wrap">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (exitingIndex === null && i !== currentIndex) {
                  setExitingIndex(currentIndex);
                  setCurrentIndex(i);
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  timeoutRef.current = setTimeout(() => setExitingIndex(null), 600);
                }
              }}
              aria-label={`Ver imagen ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-4 bg-[#E8A598]' : 'w-1 bg-[#2D1C22]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animación fluida de descarte */}
      <style>{`
        @keyframes polaroidSpread {
          0% {
            transform: translate(0, 0) rotate(var(--start-rot, 0deg)) rotateX(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(160px, -45px) rotate(24deg) rotateX(35deg);
            opacity: 0;
          }
        }
        .animate-polaroid-flight {
          animation: polaroidSpread 600ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </div>
  );
}