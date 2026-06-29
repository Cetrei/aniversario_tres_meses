import { useState } from 'react';
import { PhotoEntry } from '../config';

interface GalleryProps {
  photos: PhotoEntry[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div className="w-full max-w-[330px] flex flex-col items-center justify-center select-none">
      
      {/* MARCO MARFIL POLAROID COMPACTADO */}
      <div
        onClick={nextPhoto}
        className="w-full bg-[#F4F1EA] p-4 pb-5 rounded-sm shadow-2xl shadow-black/80 transform rotate-1 hover:rotate-0 transition-all duration-500 cursor-pointer group"
      >
        {/* Contenedor Cuadrado de la Imagen */}
        <div className="w-full aspect-square bg-[#E5E2DA] overflow-hidden relative border border-black/5 rounded-sm">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.displayName}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            style={{ objectPosition: currentPhoto.objectPosition ?? 'center center' }}
            loading="eager"
          />
          <div className="absolute inset-0 bg-[#3B1F27]/5 mix-blend-multiply" />
        </div>

        {/* DESCRIPCIÓN PERFECTAMENTE CENTRADA Y ALINEADA */}
        <div className="mt-4 min-h-[38px] flex items-center justify-center text-center px-1">
          <p className="italic text-[11px] sm:text-xs text-[#28191E] font-serif font-medium leading-tight line-clamp-2">
            "{currentPhoto.caption}"
          </p>
        </div>
      </div>

      {/* CONTADOR CORREGIDO (NUNCA SE CAE NI SE CORTA) */}
      <div className="mt-4 flex flex-col items-center gap-1.5 w-full text-center">
        <span className="text-[10px] font-mono tracking-widest text-[#62464D] uppercase">
          {currentIndex + 1} / {photos.length} — Toca la foto para avanzar
        </span>

        {/* Indicadores de bolitas */}
        <div className="flex justify-center gap-1.5 max-w-full flex-wrap">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-4 bg-[#E8A598]' : 'w-1 bg-[#2D1C22]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}