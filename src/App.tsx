import { CONFIG } from './config';
import FadeInSection from './components/FadeInSection';
import SakuraTree from './components/SakuraTree';
import SmileSlider from './components/SmileSlider';
import Buseta from './components/Buseta';
import Gallery from './components/Gallery';
import DateRoulette from './components/DateRoulette';

// ─── Luces ambientales globales (fixed, detrás de todo) ───────
function AmbientLights() {
  return (
    <>
      <div
        className="fixed top-[-8%] right-[-8%] w-[65vw] h-[65vw] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,31,39,0.22) 0%, transparent 70%)',
          filter: 'blur(120px)',
        }}
      />
      <div
        className="fixed top-[45%] left-[-18%] w-[55vw] h-[55vw] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(232,165,152,0.09) 0%, transparent 70%)',
          filter: 'blur(140px)',
        }}
      />
      <div
        className="fixed bottom-[10%] right-[5%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(180,80,100,0.07) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </>
  );
}

function SectionGap() {
  return <div className="h-24 sm:h-32 w-full" />;
}

function SubtleDivider() {
  return (
    <div className="w-full max-w-xs mx-auto flex items-center gap-4 my-4">
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#2D1C22]" />
      <span className="text-[#3C282D] text-xs">✦</span>
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#2D1C22]" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#130D0F] text-[#EDE7E5] font-serif overflow-x-hidden antialiased relative">
      <AmbientLights />

      {/* GitHub link — esquina inferior derecha, fijo */}
      {CONFIG.githubRepoUrl && (
        <a
          href={CONFIG.githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/10 transition-all duration-300 text-[10px] font-mono tracking-wider backdrop-blur-sm"
          aria-label="Ver código fuente en GitHub"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="hidden sm:inline">código fuente</span>
        </a>
      )}

      {/* Header */}
      <header className="absolute top-0 w-full z-50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col justify-center items-center gap-2">
          <span className="text-lg sm:text-xl font-serif font-bold tracking-widest text-[#E8A598] uppercase">
            {CONFIG.names.from}{' '}
            <span className="font-light text-[#B59F9F] mx-2">y</span>{' '}
            {CONFIG.names.to}
          </span>
          <span className="text-[9px] tracking-widest text-[#62464D] uppercase font-mono">
            Un diseño en construcción
          </span>
        </div>
      </header>

      <main className="flex flex-col items-center w-full">

        {/* 1. Hero + Árbol de Sakura */}
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-6">
          <FadeInSection>
            <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
              <span className="text-[#E8A598] text-sm italic font-light tracking-wide block">
                Nuestros mundos coincidieron
              </span>
              <h1 className="text-4xl sm:text-6xl font-serif font-semibold tracking-tight leading-tight text-[#FFFDFD]">
                Y desde entonces,{' '}
                <br />
                <em className="text-[#E8A598] font-normal">
                  todo no hace más que florecer
                </em>
              </h1>
              <p className="text-[#B59F9F] text-base font-sans font-light max-w-xl mx-auto">
                Cada día que pasa a tu lado es una nueva hoja en esta historia que sigue creciendo de manera natural y hermosa.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={350} className="w-full max-w-3xl mx-auto mt-14">
            <SakuraTree anniversaryDate={CONFIG.anniversaryDate} />
          </FadeInSection>
        </section>

        <SectionGap />

        {/* 2. El Refugio de tu Risa */}
        <section className="relative w-full max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          <FadeInSection>
            <div className="space-y-6 max-w-2xl">
              <span className="text-[9px] font-mono tracking-widest text-[#62464D] uppercase block">
                Interactivo · Desliza
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#FFFDFD]">
                El Refugio de tu Risa
              </h2>
              <p className="text-[#B59F9F] font-sans font-light text-base sm:text-lg">
                Mi cabeza suele ir a mil por hora, como una tormenta. Pero he descubierto que tienes el poder de calmar el océano entero. Desliza la línea y mira cómo encuentro paz en ti:
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={200} className="w-full">
            <SmileSlider />
          </FadeInSection>
        </section>

        <SectionGap />
        <SubtleDivider />
        <SectionGap />

        {/* 3. La Buseta */}
        <section className="relative w-full max-w-5xl mx-auto px-6 py-16">
          <FadeInSection>
            <div className="text-center space-y-6 max-w-2xl mx-auto mb-16">
              <span className="text-[9px] font-mono tracking-widest text-[#62464D] uppercase block">
                Interactivo · Toca a cada pasajero
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#FFFDFD]">
                Nuestra Escapada Favorita
              </h2>
              <p className="text-[#B59F9F] font-sans font-light text-base sm:text-lg">
                No necesitamos un destino lujoso. Nuestro viaje ideal es al fondo de una buseta, compartiendo música y planeando la vida con toda nuestra futura familia de animales.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={150}>
            <Buseta buseta={CONFIG.buseta} />
          </FadeInSection>
        </section>

        <SectionGap />
        <SubtleDivider />
        <SectionGap />

        {/* 4. Galería */}
        <section className="relative w-full max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
          <FadeInSection>
            <div className="text-center space-y-4 mb-12">
              <span className="text-[9px] font-mono tracking-widest text-[#62464D] uppercase block">
                Galería · Toca para revelar
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#FFFDFD]">
                Nuestros Retazos
              </h2>
              <p className="text-[#B59F9F] font-sans font-light text-base">
                Instantes guardados con cuidado. Toca la fotografía para revelar el siguiente.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={200} className="w-full flex flex-col items-center">
            <Gallery photos={CONFIG.photos} />
          </FadeInSection>
        </section>

        <SectionGap />

        {/* 5. Carta + Ruleta */}
        <section className="relative w-full max-w-3xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-24">

          <FadeInSection className="w-full">
            <div className="space-y-10">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#E8A598] italic font-light">
                Una nota al margen...
              </h2>
              <div className="space-y-8 text-[#EDE7E5] font-serif text-base sm:text-lg leading-loose font-light text-left">
                {CONFIG.loveLetter.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <p className="text-[#62464D] italic text-sm mt-6">
                Escrito con todo el amor del mundo, para ti.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={200} className="w-full">
            <div className="space-y-10 pt-16 border-t border-[#2D1C22]/40">
              <div className="space-y-4">
                <span className="text-[9px] font-mono tracking-widest text-[#62464D] uppercase block">
                  Cupón de cita · Gira las veces que quieras
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">
                  Dejemos que el destino decida
                </h3>
                <p className="text-[#B59F9F] font-sans font-light text-sm">
                  Tira hasta encontrar la que más te guste — y guárdala como cupón en tu dispositivo.
                </p>
              </div>
              <DateRoulette options={CONFIG.dateIdeas} />
            </div>
          </FadeInSection>

        </section>

      </main>

      <footer className="w-full py-12 text-center">
        <p className="text-[9px] text-[#3C282D] tracking-widest uppercase font-mono font-light">
          © {new Date().getFullYear()} {CONFIG.names.from} y {CONFIG.names.to}
          <br />
          <span className="text-[#2D1C22]">Un diseño infinito · 🌸</span>
        </p>
      </footer>
    </div>
  );
}
