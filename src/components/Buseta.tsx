import { useState } from 'react';
import { BusetaLayout, PassengerEntry } from '../config';

interface BusetaProps {
  buseta: BusetaLayout;
}

function PassengerSeat({
  passenger,
  isSelected,
  onSelect,
  size = 'md',
}: {
  passenger: PassengerEntry;
  isSelected: boolean;
  onSelect: () => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'text-2xl w-10 h-10',
    md: 'text-3xl w-12 h-12',
    lg: 'text-4xl w-14 h-14',
  };

  return (
    <button
      onClick={onSelect}
      title={passenger.name}
      aria-label={`${passenger.name} — ${passenger.role}`}
      className={`
        flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-500 p-1
        ${isSelected
          ? 'scale-110 opacity-100 drop-shadow-[0_0_16px_rgba(232,165,152,0.6)]'
          : 'opacity-40 hover:opacity-75 hover:scale-105'}
      `}
    >
      {passenger.image ? (
        <img
          src={passenger.image}
          alt={passenger.name}
          className={`${sizeClasses[size]} object-cover rounded-full`}
        />
      ) : (
        <span className={`${sizeClasses[size]} flex items-center justify-center leading-none`}>
          {passenger.icon}
        </span>
      )}
      <span className="text-[8px] font-mono tracking-wider text-[#B59F9F] uppercase leading-none">
        {passenger.name.split(' ')[0]}
      </span>
    </button>
  );
}

export default function Buseta({ buseta }: BusetaProps) {
  const [selected, setSelected] = useState<PassengerEntry>(buseta.pilot);

  return (
    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
      {/* Plano de la buseta */}
      <div className="flex justify-center">
        <div
          className="relative rounded-3xl border border-[#2D1C22] bg-[#1A0F13] p-4 shadow-2xl"
          style={{ minWidth: 240, maxWidth: 300 }}
          aria-label="Plano de la buseta"
        >
          {/* Frente */}
          <div className="flex items-center justify-center mb-3 pb-3 border-b border-[#2D1C22]">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full border-2 border-[#3C282D] flex items-center justify-center">
                <span className="text-xs text-[#62464D]">🚌</span>
              </div>
              <span className="text-[7px] font-mono tracking-widest text-[#62464D] uppercase">Frente</span>
            </div>
          </div>

          {/* Fila pilotos */}
          <div className="flex justify-between items-center mb-2 px-1">
            <PassengerSeat
              passenger={buseta.pilot}
              isSelected={selected.name === buseta.pilot.name}
              onSelect={() => setSelected(buseta.pilot)}
              size="md"
            />
            <div className="flex flex-col items-center gap-1 opacity-20">
              <div className="w-8 h-8 rounded-full border border-[#3C282D]" />
              <span className="text-[6px] font-mono text-[#62464D]">VOLANTE</span>
            </div>
            <PassengerSeat
              passenger={buseta.copilot}
              isSelected={selected.name === buseta.copilot.name}
              onSelect={() => setSelected(buseta.copilot)}
              size="md"
            />
          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#2D1C22] to-transparent mb-3" />

          {/* Filas 1-3: 2 izquierda + pasillo + 1 derecha */}
          {buseta.rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center mb-2">
              <div className="flex gap-1">
                <PassengerSeat
                  passenger={row[0]}
                  isSelected={selected.name === row[0].name}
                  onSelect={() => setSelected(row[0])}
                  size="sm"
                />
                <PassengerSeat
                  passenger={row[1]}
                  isSelected={selected.name === row[1].name}
                  onSelect={() => setSelected(row[1])}
                  size="sm"
                />
              </div>
              <div className="flex-1 mx-1" />
              <PassengerSeat
                passenger={row[2]}
                isSelected={selected.name === row[2].name}
                onSelect={() => setSelected(row[2])}
                size="sm"
              />
            </div>
          ))}

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#2D1C22] to-transparent mt-1 mb-3" />

          {/* Fondo: 4 contiguos */}
          <div className="flex justify-center gap-1">
            {buseta.back.map((passenger) => (
              <PassengerSeat
                key={passenger.name}
                passenger={passenger}
                isSelected={selected.name === passenger.name}
                onSelect={() => setSelected(passenger)}
                size="sm"
              />
            ))}
          </div>

          <div className="mt-3 text-center">
            <span className="text-[7px] font-mono tracking-widest text-[#3C282D] uppercase">
              15 Asientos · Nuestra vida en movimiento
            </span>
          </div>
        </div>
      </div>

      {/* Descripción del pasajero */}
      <div className="space-y-6">
        <div
          key={selected.name}
          className="space-y-4 text-center md:text-left animate-fade-in-up"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            {selected.image ? (
              <img
                src={selected.image}
                alt={selected.name}
                className="w-16 h-16 object-cover rounded-full ring-2 ring-[#E8A598]/30"
              />
            ) : (
              <span className="text-5xl leading-none">{selected.icon}</span>
            )}
            <div>
              <span className="text-xs font-mono italic text-[#8C7565] block">
                {selected.role}
              </span>
              <h4 className="text-3xl font-serif font-bold text-[#FFFDFD] mt-1">
                {selected.name}
              </h4>
            </div>
          </div>
          <p className="text-lg text-[#B59F9F] leading-relaxed font-serif italic">
            "{selected.desc}"
          </p>
        </div>
      </div>
    </div>
  );
}
