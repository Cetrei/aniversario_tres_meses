import { useState } from 'react';
import { DateIdea } from '../config';

interface DateRouletteProps {
  options: DateIdea[];
}

export default function DateRoulette({ options }: DateRouletteProps) {
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<DateIdea | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setSelected(null);

    let count = 0;
    const totalSteps = 22;
    const interval = setInterval(() => {
      setSelected(options[Math.floor(Math.random() * options.length)]);
      count++;
      if (count >= totalSteps) {
        clearInterval(interval);
        setSelected(options[Math.floor(Math.random() * options.length)]);
        setSpinning(false);
      }
    }, 110);
  };

  return (
    <div className="space-y-10 max-w-md mx-auto">
      <div className="min-h-[120px] flex flex-col items-center justify-center">
        {spinning ? (
          <div className="flex flex-col items-center gap-3">
            <span className="text-2xl animate-spin inline-block text-[#E8A598]">✦</span>
            <p className="text-xs font-serif italic text-[#8C7565]">
              Buscando nuestra próxima memoria...
            </p>
          </div>
        ) : selected ? (
          <div key={selected.title} className="space-y-3 animate-fade-in-up text-center">
            <h4 className="text-2xl font-serif font-bold text-[#FFFDFD]">{selected.title}</h4>
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

      <button
        onClick={spin}
        disabled={spinning}
        className={`w-full py-4 px-8 rounded-full font-sans font-light text-sm tracking-wide transition-all duration-700 ease-out border ${
          spinning
            ? 'bg-transparent border-[#2D1C22] text-[#62464D] cursor-not-allowed'
            : 'bg-[#E8A598]/5 border-[#E8A598]/30 text-[#E8A598] hover:bg-[#E8A598]/10 hover:border-[#E8A598]/60 hover:shadow-[0_0_20px_rgba(232,165,152,0.1)]'
        }`}
      >
        {spinning ? 'Girando la brújula...' : 'Descubrir nuestro siguiente plan'}
      </button>
    </div>
  );
}
