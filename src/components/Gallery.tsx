import { useState, useRef } from 'react';
import { PhotoEntry } from '../config';

interface GalleryProps {
  photos: PhotoEntry[];
}

function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none" aria-hidden="true">
      <div
        className="absolute w-64 h-64 rounded-full opacity-20 animate-blob-drift"
        style={{
          background: 'radial-gradient(circle, rgba(232,165,152,0.8) 0%, transparent 70%)',
          top: '10%', left: '5%', filter: 'blur(40px)', animationDuration: '14s',
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full opacity-15 animate-blob-drift"
        style={{
          background: 'radial-gradient(circle, rgba(180,80,100,0.7) 0%, transparent 70%)',
          bottom: '5%', right: '0%', filter: 'blur(50px)',
          animationDuration: '18s', animationDelay: '-6s',
        }}
      />
      <div
        className="absolute w-48 h-48 rounded-full opacity-10 animate-blob-drift"
        style={{
          background: 'radial-gradient(circle, rgba(255,240,235,0.9) 0%, transparent 70%)',
          top: '50%', right: '15%', filter: 'blur(35px)',
          animationDuration: '11s', animationDelay: '-3s',
        }}
      />
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-drift"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: i % 2 === 0 ? 'rgba(232,165,152,1)' : 'rgba(255,210,200,1)',
            opacity: 0.08 + (i % 4) * 0.06,
            left: `${5 + (i * 6.5) % 90}%`,
            top: `${10 + (i * 7.1) % 80}%`,
            filter: 'blur(1px)',
            animationDuration: `${8 + (i % 6) * 2}s`,
            animationDelay: `${-(i * 1.3)}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Gallery({ photos }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<'left' | null>(null);
  const touchStartX = useRef<number | null>(null);

  const handleNext = () => {
    if (swipeDir) return;
    setSwipeDir('left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
      setSwipeDir(null);
    }, 450);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) handleNext();
    touchStartX.current = null;
  };

  return (
    <div className="relative w-full overflow-hidden py-16 flex flex-col items-center" style={{ minHeight: 580 }}>
      <AmbientBackground />

      <div
        className="relative w-[280px] sm:w-[300px] cursor-pointer select-none"
        // altura dinámica: imagen cuadrada (280/300px) + padding polaroid + caption
        style={{ height: 420 }}
        onClick={handleNext}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        aria-label="Ver siguiente foto"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNext(); }}
      >
        {photos.map((photo, index) => {
          const isCurrent = index === currentIndex;
          const isNext = index === (currentIndex + 1) % photos.length;
          const isAfterNext = index === (currentIndex + 2) % photos.length;

          if (!isCurrent && !isNext && !isAfterNext) return null;

          let transform = '';
          let zIndex = 10;
          let opacity = 1;

          if (isCurrent) {
            transform = swipeDir === 'left'
              ? 'translateX(-130%) rotate(-28deg) scale(0.75)'
              : 'translateX(0) rotate(-2deg)';
            zIndex = 30;
            opacity = swipeDir === 'left' ? 0 : 1;
          } else if (isNext) {
            transform = 'translateY(10px) rotate(3.5deg) scale(0.96)';
            zIndex = 20;
            opacity = 0.85;
          } else {
            transform = 'translateY(20px) rotate(-2deg) scale(0.91)';
            zIndex = 10;
            opacity = 0.5;
          }

          return (
            <div
              key={photo.url}
              className="absolute inset-0 bg-[#FFFDFD] rounded-sm shadow-2xl"
              style={{
                transform, zIndex, opacity,
                padding: '14px',
                paddingBottom: '52px',
                transition: 'transform 0.55s cubic-bezier(0.23,1,0.32,1), opacity 0.55s ease',
              }}
            >
              {/*
                Imagen perfectamente cuadrada: usamos un wrapper con padding-top 100%
                y position absolute para que SIEMPRE sea cuadrada sin importar
                las dimensiones originales de la foto.
              */}
              <div className="relative w-full" style={{ paddingTop: '100%' }}>
                <img
                  src={photo.url}
                  alt={photo.displayName}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ filter: 'grayscale(8%)', objectPosition: photo.objectPosition ?? 'center center' }}
                  loading="lazy"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-[#3B1F27] opacity-[0.06] mix-blend-multiply pointer-events-none" />
              </div>

              <div className="mt-4 text-center px-1">
                <p className="italic text-xs text-[#28191E] font-serif leading-snug line-clamp-2">
                  "{photo.caption}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots de navegación */}
      <div className="relative z-10 flex flex-wrap justify-center gap-1.5 mt-6 max-w-xs">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Ir a foto ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-4 h-1.5 bg-[#E8A598]'
                : 'w-1.5 h-1.5 bg-[#2D1C22] hover:bg-[#62464D]'
            }`}
          />
        ))}
      </div>

      <p className="relative z-10 text-[10px] font-mono tracking-widest text-[#62464D] mt-3 uppercase">
        {currentIndex + 1} / {photos.length} — Toca para el siguiente instante
      </p>
    </div>
  );
}
