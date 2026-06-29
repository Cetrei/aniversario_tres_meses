import { CONFIG } from './config';
import FadeInSection from './components/FadeInSection';
import SakuraTree from './components/SakuraTree';
import SmileSlider from './components/SmileSlider';
import Buseta from './components/Buseta';
import Gallery from './components/Gallery';
import DateRoulette from './components/DateRoulette';

function AmbientLights() {
  return (
    <>
      <div
        className="fixed top-[-8%] right-[-8%] w-[65vw] h-[65vw] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(59,31,39,0.22) 0%, transparent 70%)', filter: 'blur(120px)' }}
      />
      <div
        className="fixed top-[45%] left-[-18%] w-[55vw] h-[55vw] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(232,165,152,0.09) 0%, transparent 70%)', filter: 'blur(140px)' }}
      />
    </>
  );
}

export default function App() {
  return (
    /* TRANSICIÓN SUAVE Y CONTROL DE SNAP PROFESIONAL */
    <div className="w-full h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-[#130D0F] text-[#EDE7E5] font-serif hide-scrollbar relative">
      <AmbientLights />

      <header className="absolute top-0 w-full z-40 py-4">
        <div className="max-w-6xl mx-auto flex flex-col justify-center items-center gap-1">
          <span className="text-sm sm:text-base font-serif font-bold tracking-widest text-[#E8A598] uppercase">
            {CONFIG.names.from} <span className="font-light text-[#B59F9F] mx-1">y</span> {CONFIG.names.to}
          </span>
          <span className="text-[8px] tracking-widest text-[#62464D] uppercase font-mono">Nuestra Historia</span>
        </div>
      </header>

      {/* SECCIÓN 1: Héroe + Árbol Orgánico en Crecimiento */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
        <div className="w-full max-w-xl max-h-[82vh] flex flex-col items-center justify-between gap-y-4 mt-8">
          <FadeInSection direction="up">
            <div className="text-center space-y-1">
              <span className="text-[#E8A598] text-xs italic font-light tracking-wide block">Nuestros mundos coincidieron...</span>
              <h1 className="text-2xl sm:text-4xl font-serif font-semibold tracking-tight text-[#FFFDFD]">
                Y desde entonces, <em className="text-[#E8A598] font-normal">todo florece</em>
              </h1>
            </div>
          </FadeInSection>
          
          <div className="w-full flex justify-center items-center min-h-0 flex-1">
            <SakuraTree anniversaryDate={CONFIG.anniversaryDate} />
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: El Refugio de tu Risa */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
        <div className="w-full max-w-xl max-h-[82vh] flex flex-col items-center justify-center gap-y-6">
          <FadeInSection direction="up">
            <div className="space-y-1 text-center">
              <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Interactivo · Desliza</span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">El Refugio de tu Risa</h2>
            </div>
          </FadeInSection>
          <div className="w-full min-h-0">
            <SmileSlider />
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: La Buseta */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
        <div className="w-full max-w-2xl max-h-[85vh] flex flex-col items-center justify-center gap-y-4">
          <FadeInSection direction="up">
            <div className="text-center space-y-1">
              <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Interactivo</span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">Nuestra Escapada Favorita</h2>
            </div>
          </FadeInSection>
          <div className="w-full min-h-0">
            <Buseta buseta={CONFIG.buseta} />
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: Galería Retazos (Calce corregido) */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
        <div className="w-full max-w-lg max-h-[82vh] flex flex-col items-center justify-center gap-y-2">
          <FadeInSection direction="up">
            <div className="text-center space-y-1">
              <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Galería</span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">Nuestros Retazos</h2>
            </div>
          </FadeInSection>
          <div className="w-full flex justify-center min-h-0 items-center">
            <Gallery photos={CONFIG.photos} />
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: Carta de Amor */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-6 text-center relative overflow-hidden">
        <div className="w-full max-w-xl max-h-[75vh] flex flex-col justify-center space-y-4">
          <h2 className="text-lg sm:text-xl font-serif text-[#E8A598] italic font-light">Una nota al margen...</h2>
          <div className="space-y-4 text-[#EDE7E5] font-serif text-xs sm:text-sm leading-relaxed font-light text-left max-h-[45vh] overflow-y-auto pr-2 hide-scrollbar">
            {CONFIG.loveLetter.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: Ruleta de Citas */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 text-center relative overflow-hidden">
        <div className="w-full max-w-md max-h-[80vh] flex flex-col justify-center items-center gap-y-4">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FFFDFD]">Dejemos que el destino decida</h3>
          <div className="w-full min-h-0">
            <DateRoulette options={CONFIG.dateIdeas} />
          </div>
        </div>
      </section>

      <footer className="w-full py-4 text-center shrink-0 snap-end bg-[#130D0F]">
        <p className="text-[8px] text-[#3C282D] tracking-widest uppercase font-mono font-light">
          © {new Date().getFullYear()} {CONFIG.names.from} y {CONFIG.names.to}
        </p>
      </footer>
    </div>
  );
}