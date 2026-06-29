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
    <div className="w-full h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-[#130D0F] text-[#EDE7E5] font-serif hide-scrollbar relative">
      <AmbientLights />

      {/* EL LINK DE GITHUB VUELVE A SU LUGAR */}
      {CONFIG.githubRepoUrl && (
        <a
          href={CONFIG.githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/10 transition-all duration-300 text-[10px] font-mono tracking-wider backdrop-blur-sm"
          aria-label="Ver código fuente en GitHub"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="hidden sm:inline">código fuente</span>
        </a>
      )}

      <header className="absolute top-0 w-full z-40 py-6">
        <div className="max-w-6xl mx-auto flex flex-col justify-center items-center gap-1">
          <span className="text-sm sm:text-base font-serif font-bold tracking-widest text-[#E8A598] uppercase">
            {CONFIG.names.from} <span className="font-light text-[#B59F9F] mx-1">y</span> {CONFIG.names.to}
          </span>
          <span className="text-[8px] tracking-widest text-[#62464D] uppercase font-mono">Nuestra Historia</span>
        </div>
      </header>

      {/* SECCIÓN 1: Árbol */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
        <div className="w-full max-w-xl max-h-[82vh] flex flex-col items-center justify-between gap-y-4 mt-8">
          <FadeInSection direction="up">
            <div className="text-center space-y-1 relative z-10">
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

      {/* SECCIÓN 2: SmileSlider (TEXTOS ORIGINALES RESTAURADOS) */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
        <div className="w-full max-w-xl max-h-[82vh] flex flex-col items-center justify-center gap-y-6">
          <FadeInSection direction="up">
            <div className="space-y-1 text-center">
              <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Interactivo · Desliza</span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">El Refugio de tu Risa</h2>
              <p className="text-[#B59F9F] font-sans font-light text-xs sm:text-sm pt-2 max-w-md mx-auto">
                Mi cabeza suele ir a mil por hora. Pero he descubierto que tienes el poder de calmar el océano entero. Mira cómo encuentro paz en ti:
              </p>
            </div>
          </FadeInSection>
          <div className="w-full min-h-0">
            <SmileSlider />
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: Buseta (TEXTOS ORIGINALES RESTAURADOS) */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
        <div className="w-full max-w-2xl max-h-[85vh] flex flex-col items-center justify-center gap-y-4">
          <FadeInSection direction="up">
            <div className="text-center space-y-1">
              <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Interactivo · Toca a cada pasajero</span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">Nuestra Escapada Favorita</h2>
              <p className="text-[#B59F9F] font-sans font-light text-xs sm:text-sm pt-2 max-w-lg mx-auto">
                No necesitamos un destino lujoso. Nuestro viaje ideal es al fondo de una buseta, compartiendo música y planeando el futuro con nuestra familia de animales.
              </p>
            </div>
          </FadeInSection>
          <div className="w-full min-h-0">
            <Buseta buseta={CONFIG.buseta} />
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: Galería (TEXTO EXPLICATIVO RESTAURADO) */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
        <div className="w-full max-w-lg max-h-[82vh] flex flex-col items-center justify-center gap-y-2">
          <FadeInSection direction="up">
            <div className="text-center space-y-1">
              <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Galería · Toca para revelar</span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">Nuestros Retazos</h2>
              <p className="text-[#B59F9F] font-sans font-light text-xs pt-1 max-w-sm mx-auto">
                Instantes guardados con cuidado. Toca la fotografía para revelar el siguiente.
              </p>
            </div>
          </FadeInSection>
          <div className="w-full flex justify-center min-h-0 items-center">
            <Gallery photos={CONFIG.photos} />
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: Carta */}
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

      {/* SECCIÓN 6: Ruleta */}
      <section className="w-full h-screen flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 text-center relative overflow-hidden">
        <div className="w-full max-w-md max-h-[80vh] flex flex-col justify-center items-center gap-y-4">
          <FadeInSection direction="up">
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Cupón de cita · Gira las veces que quieras</span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FFFDFD]">Dejemos que el destino decida</h3>
            </div>
          </FadeInSection>
          <div className="w-full min-h-0 mt-2">
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