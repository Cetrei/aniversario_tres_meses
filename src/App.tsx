import { useState, useEffect, useRef } from 'react';
import { CONFIG } from './config';
import FadeInSection from './components/FadeInSection';
import SakuraTree from './components/SakuraTree';
import SmileSlider from './components/SmileSlider';
import Buseta from './components/Buseta';
import Gallery from './components/Gallery';
import DateRoulette from './components/DateRoulette';

// HELPERS
function getMonthsElapsed(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

function getMonthLabel(months: number): string {
  if (months < 12) return months === 1 ? 'mes' : 'meses';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return years === 1 ? 'año' : 'años';
  return `${years} ${years === 1 ? 'año' : 'años'} y ${rem} ${rem === 1 ? 'mes' : 'meses'}`;
}

function getMonthNumber(months: number): string {
  if (months < 12) return String(months);
  const years = Math.floor(months / 12);
  return String(years);
}

// PANTALLA DE INTRO CINEMATOGRÁFICA
// Secuencia de palabras que aparecen y desaparecen antes de revelar el sitio
const INTRO_STEPS = [
  { text: null, sub: null, duration: 1200 },
  { text: 'Para ti.', sub: null, duration: 1400 },
  { text: 'Que eres', sub: 'mi lugar favorito.', duration: 1600 },
  { text: getMonthNumber(getMonthsElapsed(CONFIG.anniversaryDate))+ ' meses', sub: 'de lo mejor.', duration: 1600 },
  { text: 'Mi marinovia', sub: 'la más especial y hermosa.', duration: 2000 },
  { text: null, sub: null, duration: 800 }, // pausa negra
];

function CinematicIntro({ onReveal, onDone, introTransitionMs }: { onReveal: () => void; onDone: () => void; introTransitionMs: number }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);

  useEffect(() => {
    if (step >= INTRO_STEPS.length) {
      // Fade out de toda la pantalla intro, cruzado con la revelación del contenido principal
      const revealTimer = setTimeout(() => {
        setLeaving(true);
        onReveal();
        setTimeout(onDone, introTransitionMs);
      }, 200);
      return () => clearTimeout(revealTimer);
    }

    const { duration } = INTRO_STEPS[step];

    // Fade in
    setVisible(true);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      // Espera el fade-out antes de avanzar al siguiente paso
      setTimeout(() => setStep((s) => s + 1), 500);
    }, duration);

    return () => clearTimeout(hideTimer);
  }, [step, onDone, onReveal]);

  // El botón de saltar aparece tras un breve instante, de forma muy discreta
  useEffect(() => {
    const skipTimer = setTimeout(() => setSkipVisible(true), 900);
    return () => clearTimeout(skipTimer);
  }, []);

  const handleSkip = () => {
    if (leaving) return;
    setLeaving(true);
    onReveal();
    setTimeout(onDone, Math.round(introTransitionMs * 0.7));
  };

  const current = INTRO_STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0608]"
      style={{
        transition: `opacity ${introTransitionMs}ms cubic-bezier(0.4,0,0.2,1), transform ${introTransitionMs}ms cubic-bezier(0.4,0,0.2,1)`,
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: leaving ? 'none' : 'all',
      }}
    >
      {/* Grano de fondo sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      {/* Brillo rosado central muy tenue */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(232,165,152,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Contenido de la intro */}
      {current && (current.text || current.sub) && (
        <div
          className="text-center px-8 select-none"
          style={{
            transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-12px)',
          }}
        >
          {current.text && (
            <p className="text-3xl sm:text-5xl font-serif font-light text-[#FFFDFD] tracking-tight leading-tight">
              {current.text}
            </p>
          )}
          {current.sub && (
            <p className="text-3xl sm:text-5xl font-serif italic text-[#E8A598] tracking-tight leading-tight mt-1">
              {current.sub}
            </p>
          )}
        </div>
      )}

      {/* Flor pequeña que siempre se ve */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        style={{ opacity: 0.25 }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16,2 C16,2 18,9 16,16 C14,9 16,2 16,2Z" fill="#E8A598" />
          <path d="M16,30 C16,30 14,23 16,16 C18,23 16,30 16,30Z" fill="#E8A598" />
          <path d="M2,16 C2,16 9,14 16,16 C9,18 2,16 2,16Z" fill="#E8A598" />
          <path d="M30,16 C30,16 23,18 16,16 C23,14 30,16 30,16Z" fill="#E8A598" />
          <circle cx="16" cy="16" r="3" fill="#FFFDFD" opacity="0.6" />
        </svg>
      </div>

      {/* Botón muy sutil para saltar la introducción */}
      <button
        type="button"
        onClick={handleSkip}
        aria-label="Saltar introducción"
        className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 text-[9px] font-mono tracking-[0.25em] uppercase text-white/20 hover:text-white/55 transition-colors duration-500 select-none"
        style={{
          opacity: skipVisible && !leaving ? 1 : 0,
          transition: 'opacity 0.8s ease, color 0.3s ease',
        }}
      >
        Saltar →
      </button>
    </div>
  );
}

// LUCES AMBIENTALES
function AmbientLights() {
  return (
    <>
      <div
        className="fixed top-[-8%] right-[-8%] w-[65vw] h-[65vw] rounded-full pointer-events-none z-0 ambient-blob-1"
        style={{ background: 'radial-gradient(circle, rgba(59,31,39,0.22) 0%, transparent 70%)' }}
      />
      <div
        className="fixed top-[45%] left-[-18%] w-[55vw] h-[55vw] rounded-full pointer-events-none z-0 ambient-blob-2"
        style={{ background: 'radial-gradient(circle, rgba(232,165,152,0.09) 0%, transparent 70%)' }}
      />
    </>
  );
}

// DECORACIÓN LATERAL (solo xl+)
function SideDecoration({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <div
      className="fixed top-0 h-full w-[120px] pointer-events-none z-10 hidden xl:block"
      style={{ [isLeft ? 'left' : 'right']: 0 }}
    >
      <div
        className="absolute top-0 h-full w-[1px]"
        style={{
          [isLeft ? 'right' : 'left']: '28px',
          background: 'linear-gradient(to bottom, transparent 5%, rgba(78,49,60,0.18) 20%, rgba(78,49,60,0.25) 50%, rgba(78,49,60,0.18) 80%, transparent 95%)',
        }}
      />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 120 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g transform={`translate(${isLeft ? 28 : 92}, 120) rotate(${isLeft ? -15 : 15})`} opacity="0.22">
          <path d="M0,-14 C-8,-8 -8,6 0,14 C8,6 8,-8 0,-14Z" fill="#E8A598" />
          <path d="M-10,-6 C-4,-12 6,-10 10,-2 C4,-8 -6,-8 -10,-6Z" fill="#E8A598" opacity="0.7" />
          <path d="M10,-6 C4,-12 -6,-10 -10,-2 C-4,-8 6,-8 10,-6Z" fill="#E8A598" opacity="0.7" />
          <circle cx="0" cy="0" r="3" fill="#FFFDFD" opacity="0.5" />
        </g>
        <path d={isLeft ? 'M28 134 Q26 180 28 220' : 'M92 134 Q94 180 92 220'} stroke="rgba(78,49,60,0.2)" strokeWidth="1" fill="none" />
        <ellipse cx={isLeft ? 22 : 98} cy="185" rx="6" ry="11" transform={`rotate(${isLeft ? -30 : 30}, ${isLeft ? 22 : 98}, 185)`} fill="rgba(78,49,60,0.18)" />
        <g transform={`translate(${isLeft ? 28 : 92}, 380) rotate(${isLeft ? 25 : -25})`} opacity="0.18">
          <path d="M0,-18 C-10,-10 -10,8 0,18 C10,8 10,-10 0,-18Z" fill="#E8A598" />
          <path d="M-12,-7 C-5,-15 7,-13 12,-3 C5,-10 -7,-10 -12,-7Z" fill="#E8A598" opacity="0.7" />
          <path d="M12,-7 C5,-15 -7,-13 -12,-3 C-5,-10 7,-10 12,-7Z" fill="#E8A598" opacity="0.7" />
          <circle cx="0" cy="0" r="3.5" fill="#FFFDFD" opacity="0.4" />
        </g>
        <path
          d={isLeft ? 'M28 395 Q18 430 22 460 M22 430 Q10 420 8 408 M22 445 Q12 445 9 435' : 'M92 395 Q102 430 98 460 M98 430 Q110 420 112 408 M98 445 Q108 445 111 435'}
          stroke="rgba(78,49,60,0.22)" strokeWidth="1.2" fill="none" strokeLinecap="round"
        />
        <g transform={`translate(${isLeft ? 28 : 92}, 650) rotate(${isLeft ? -10 : 10})`} opacity="0.2">
          <path d="M0,-12 C-7,-7 -7,5 0,12 C7,5 7,-7 0,-12Z" fill="#E8A598" />
          <path d="M-9,-5 C-3,-11 5,-9 9,-2 C3,-7 -5,-7 -9,-5Z" fill="#E8A598" opacity="0.7" />
          <path d="M9,-5 C3,-11 -5,-9 -9,-2 C-3,-7 5,-7 9,-5Z" fill="#E8A598" opacity="0.7" />
          <circle cx="0" cy="0" r="2.5" fill="#FFFDFD" opacity="0.45" />
        </g>
        <path d={isLeft ? 'M28 662 Q26 710 28 745' : 'M92 662 Q94 710 92 745'} stroke="rgba(78,49,60,0.18)" strokeWidth="1" fill="none" />
        <ellipse cx={isLeft ? 22 : 98} cy="712" rx="5" ry="9" transform={`rotate(${isLeft ? -25 : 25}, ${isLeft ? 22 : 98}, 712)`} fill="rgba(78,49,60,0.15)" />
        {[200, 280, 470, 560, 780, 840].map((y, i) => (
          <circle key={i} cx={isLeft ? (i % 2 === 0 ? 20 : 36) : (i % 2 === 0 ? 100 : 84)} cy={y} r="1.5" fill="rgba(232,165,152,0.18)" />
        ))}
      </svg>
    </div>
  );
}

// APP PRINCIPAL
export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  return (
    <>
      {!introComplete && (
        <CinematicIntro
          onReveal={() => setContentVisible(true)}
          onDone={() => setIntroComplete(true)}
          introTransitionMs={CONFIG.timing.introTransitionMs}
        />
      )}

      <div
        className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory scroll-smooth bg-[#130D0F] text-[#EDE7E5] font-serif hide-scrollbar relative"
        style={{
          transition: `opacity ${CONFIG.timing.introTransitionMs + 100}ms cubic-bezier(0.4,0,0.2,1)`,
          opacity: contentVisible ? 1 : 0,
        }}
      >
        <AmbientLights />
        <SideDecoration side="left" />
        <SideDecoration side="right" />

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

        {/* SECCIÓN 0: Intro de la página */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          {/* Brillo central suave */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 52%, rgba(232,165,152,0.10) 0%, transparent 65%)' }}
          />
          {/* Pétalos puntitos decorativos */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {[
              { cx: '12%', cy: '22%', r: 2.5, o: 0.13 },
              { cx: '85%', cy: '18%', r: 3.5, o: 0.10 },
              { cx: '7%',  cy: '72%', r: 2,   o: 0.11 },
              { cx: '91%', cy: '67%', r: 3,   o: 0.12 },
              { cx: '50%', cy: '89%', r: 2,   o: 0.09 },
              { cx: '28%', cy: '11%', r: 1.5, o: 0.08 },
              { cx: '72%', cy: '84%', r: 2.5, o: 0.10 },
            ].map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={`rgba(232,165,152,${p.o})`} />
            ))}
          </svg>

          <div className="relative z-10 flex flex-col items-center text-center gap-5 max-w-lg">
            <FadeInSection direction="up" delay={100}>
              <span className="text-[9px] font-mono tracking-[0.35em] text-[#62464D] uppercase block">
                {new Date(CONFIG.anniversaryDate).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </FadeInSection>

            <FadeInSection direction="up" delay={260}>
              <div className="space-y-1">
                <p className="text-[#E8A598] text-sm sm:text-base italic font-light tracking-wide">Felices</p>
                <h1 className="text-7xl sm:text-9xl font-serif font-bold text-[#FFFDFD] leading-none tracking-tighter">{getMonthNumber(getMonthsElapsed(CONFIG.anniversaryDate))}</h1>
                <p className="text-2xl sm:text-3xl font-serif font-light text-[#E8A598] tracking-wide">{getMonthLabel(getMonthsElapsed(CONFIG.anniversaryDate))}</p>
              </div>
            </FadeInSection>

            <FadeInSection direction="up" delay={480}>
              <p className="text-[#B59F9F] font-serif font-light text-sm sm:text-base leading-relaxed max-w-sm">
                {(() => { const m = getMonthsElapsed(CONFIG.anniversaryDate); const l = getMonthLabel(m); return l.includes('año') ? `${l.charAt(0).toUpperCase() + l.slice(1)} que se sienten como toda una vida,` : `${l.charAt(0).toUpperCase() + l.slice(1)} que se sienten como una vida entera,`; })()}<br className="hidden sm:block" /> y a la vez como si apenas empezáramos.
              </p>
            </FadeInSection>

            <FadeInSection direction="up" delay={700}>
              <div className="flex flex-col items-center gap-2 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#4E313C]" />
                  <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
                    <path d="M16,2 C16,2 18,9 16,16 C14,9 16,2 16,2Z" fill="#E8A598" />
                    <path d="M16,30 C16,30 14,23 16,16 C18,23 16,30 16,30Z" fill="#E8A598" />
                    <path d="M2,16 C2,16 9,14 16,16 C9,18 2,16 2,16Z" fill="#E8A598" />
                    <path d="M30,16 C30,16 23,18 16,16 C23,14 30,16 30,16Z" fill="#E8A598" />
                    <circle cx="16" cy="16" r="3" fill="#FFFDFD" opacity="0.7" />
                  </svg>
                  <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#4E313C]" />
                </div>
                <p className="text-[9px] font-mono tracking-[0.3em] text-[#62464D] uppercase animate-bounce-slow">
                  Desliza para explorar ↓
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* SECCIÓN 1: Árbol Sakura */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-start shrink-0 snap-start snap-always px-4 relative overflow-hidden pt-16 sm:pt-20">
          <div className="w-full max-w-xl flex flex-col items-center gap-y-4 sm:gap-y-20 h-full">
            <FadeInSection direction="down" delay={0}>
              <div className="text-center space-y-1 relative z-10">
                <span className="text-[#E8A598] text-xs italic font-light tracking-wide block">Nuestros mundos coincidieron...</span>
                <h1 className="text-2xl sm:text-4xl font-serif font-semibold tracking-tight text-[#FFFDFD]">
                  Y desde entonces, <em className="text-[#E8A598] font-normal">todo florece</em>
                </h1>
              </div>
            </FadeInSection>
            <FadeInSection direction="up" delay={150} className="w-full flex justify-center items-center min-h-0 flex-1">
              <SakuraTree startDate={CONFIG.anniversaryDate} treeConfig={CONFIG.sakuraTree} />
            </FadeInSection>
          </div>
        </section>

        {/* SECCIÓN 2: SmileSlider */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          <div className="w-full max-w-xl max-h-[82vh] flex flex-col items-center justify-center gap-y-6">
            <FadeInSection direction="down" delay={0}>
              <div className="space-y-1 text-center">
                <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Interactivo · Desliza</span>
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">El Refugio de tu Risa</h2>
                <p className="text-[#B59F9F] font-sans font-light text-xs sm:text-sm pt-2 max-w-md mx-auto">
                  Mi cabeza suele ir a mil por hora. Pero he descubierto que tienes el poder de calmar el océano entero. Arrastra hasta cada divisor y descubre cómo encuentro paz en ti:
                </p>
              </div>
            </FadeInSection>
            <FadeInSection direction="up" delay={180} className="w-full min-h-0">
              <SmileSlider />
            </FadeInSection>
          </div>
        </section>

        {/* SECCIÓN 3: Buseta */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col items-center justify-center gap-y-4">
            <FadeInSection direction="down" delay={0}>
              <div className="text-center space-y-1">
                <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Interactivo · Toca a cada pasajero</span>
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">Nuestra Escapada Favorita</h2>
                <p className="text-[#B59F9F] font-sans font-light text-xs sm:text-sm pt-2 max-w-lg mx-auto">
                  Tal vez fue bromeando, pero me encanto la idea de la buseta, despues de todo no necesitamos un destino lujoso si estamos juntos
                </p>
              </div>
            </FadeInSection>
            <FadeInSection direction="up" delay={200} className="w-full min-h-0">
              <Buseta buseta={CONFIG.buseta} />
            </FadeInSection>
          </div>
        </section>

        {/* SECCIÓN 4: Galería */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          {/* Glow más visible: dos radiales rosadas superpuestas */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 65% 50% at 50% 58%, rgba(232,165,152,0.16) 0%, rgba(120,60,75,0.08) 50%, transparent 75%),' +
                'radial-gradient(ellipse 35% 25% at 18% 28%, rgba(181,159,159,0.10) 0%, transparent 60%)',
            }}
          />
          {/* Borde de luz en el fondo */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(78,49,60,0.08) 0%, transparent 100%)' }}
          />

          <div className="w-full max-w-lg max-h-[82vh] flex flex-col items-center justify-center gap-y-14 sm:gap-y-10 relative z-10">
            <FadeInSection direction="down" delay={0}>
              <div className="text-center space-y-1">
                <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Galería · Toca para revelar</span>
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#FFFDFD]">Nuestros Momentos</h2>
                <p className="text-[#B59F9F] font-sans font-light text-xs pt-1 max-w-sm mx-auto">
                  Instantes guardados con cuidado. Toca la fotografía para revelar el siguiente.
                </p>
              </div>
            </FadeInSection>
            <FadeInSection direction="up" delay={180} className="w-full flex justify-center min-h-0 items-center">
              <Gallery photos={CONFIG.photos} />
            </FadeInSection>
          </div>
        </section>

        {/* SECCIÓN 5: Carta */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          {/* Textura de papel (fractal noise) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              opacity: 0.045,
            }}
          />
          {/* Viñeta perimetral */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 35%, rgba(19,13,15,0.6) 100%)' }}
          />
          {/* Líneas de papel pautado muy sutiles */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(78,49,60,0.05) 30px, rgba(78,49,60,0.05) 31px)' }}
          />

          {/* Tarjeta de carta */}
          <FadeInSection direction="up" delay={0} className="w-full max-w-xl relative z-10">
            <div
              className="relative rounded-2xl px-6 sm:px-10 py-8 shadow-2xl shadow-black/60"
              style={{
                background: 'linear-gradient(145deg, rgba(28,18,22,0.97) 0%, rgba(22,14,18,0.99) 100%)',
                border: '1px solid rgba(78,49,60,0.35)',
              }}
            >
              {/* Tulipanes lilas decorativos — esquina superior derecha */}
              <svg
                aria-hidden="true"
                className="absolute top-0 right-0 pointer-events-none"
                width="90" height="110"
                viewBox="0 0 90 110"
                style={{ opacity: 0.22 }}
              >
                {/* Tallo izquierdo */}
                <path d="M30 108 Q28 80 26 58" stroke="#7B5EA7" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                {/* Hoja izquierda */}
                <path d="M26 80 Q14 72 12 60 Q22 66 26 78Z" fill="#7B5EA7" opacity="0.6"/>
                {/* Tulipán izquierdo */}
                <path d="M26 58 C20 50 18 38 26 30 C28 38 28 50 26 58Z" fill="#B39DDB"/>
                <path d="M26 58 C32 50 34 38 26 30 C24 38 24 50 26 58Z" fill="#9575CD"/>
                <path d="M26 58 C22 52 22 44 26 38 C30 44 30 52 26 58Z" fill="#CE93D8" opacity="0.7"/>
                {/* Tallo central */}
                <path d="M48 108 Q46 75 44 50" stroke="#7B5EA7" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                {/* Hoja central */}
                <path d="M44 78 Q34 68 32 54 Q42 62 44 76Z" fill="#7B5EA7" opacity="0.55"/>
                {/* Tulipán central — más grande */}
                <path d="M44 50 C36 40 34 25 44 15 C47 25 47 40 44 50Z" fill="#B39DDB"/>
                <path d="M44 50 C52 40 54 25 44 15 C41 25 41 40 44 50Z" fill="#9575CD"/>
                <path d="M44 50 C39 43 39 33 44 25 C49 33 49 43 44 50Z" fill="#CE93D8" opacity="0.7"/>
                {/* Tallo derecho */}
                <path d="M66 108 Q65 82 63 62" stroke="#7B5EA7" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                {/* Hoja derecha */}
                <path d="M63 84 Q73 74 74 60 Q64 68 63 82Z" fill="#7B5EA7" opacity="0.6"/>
                {/* Tulipán derecho */}
                <path d="M63 62 C57 54 55 42 63 34 C65 42 65 54 63 62Z" fill="#B39DDB"/>
                <path d="M63 62 C69 54 71 42 63 34 C61 42 61 54 63 62Z" fill="#9575CD"/>
                <path d="M63 62 C59 56 59 48 63 42 C67 48 67 56 63 62Z" fill="#CE93D8" opacity="0.7"/>
              </svg>

              {/* Tulipán pequeño solitario — esquina inferior izquierda */}
              <svg
                aria-hidden="true"
                className="absolute bottom-0 left-0 pointer-events-none"
                width="55" height="75"
                viewBox="0 0 55 75"
                style={{ opacity: 0.18 }}
              >
                <path d="M20 74 Q19 55 18 40" stroke="#7B5EA7" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                <path d="M18 58 Q8 50 7 38 Q16 44 18 56Z" fill="#7B5EA7" opacity="0.6"/>
                <path d="M18 40 C12 32 10 20 18 12 C20 20 20 32 18 40Z" fill="#B39DDB"/>
                <path d="M18 40 C24 32 26 20 18 12 C16 20 16 32 18 40Z" fill="#9575CD"/>
                <path d="M18 40 C14 34 14 26 18 20 C22 26 22 34 18 40Z" fill="#CE93D8" opacity="0.7"/>
                {/* Segundo tallito */}
                <path d="M36 74 Q35 58 34 45" stroke="#7B5EA7" strokeWidth="1" fill="none" strokeLinecap="round"/>
                <path d="M34 60 Q42 52 43 42 Q35 48 34 58Z" fill="#7B5EA7" opacity="0.5"/>
                <path d="M34 45 C29 38 28 28 34 21 C36 28 36 38 34 45Z" fill="#B39DDB" opacity="0.85"/>
                <path d="M34 45 C39 38 40 28 34 21 C32 28 32 38 34 45Z" fill="#9575CD" opacity="0.85"/>
              </svg>

              {/* Lugar y fecha */}
              <FadeInSection direction="right" delay={80}>
                <p className="text-[9px] font-mono tracking-widest text-[#62464D] uppercase text-right mb-5">
                  {CONFIG.loveLetter.place}
                </p>
              </FadeInSection>

              {/* Para: */}
              <FadeInSection direction="left" delay={160}>
                <p className="text-[10px] font-mono tracking-widest text-[#8C7565] uppercase mb-1">Para:</p>
                <p className="font-serif text-lg text-[#E8A598] italic mb-5">{CONFIG.loveLetter.to}</p>
              </FadeInSection>

              {/* Saludo */}
              <FadeInSection direction="up" delay={240}>
                <p className="font-serif text-sm text-[#EDE7E5] font-medium mb-4">{CONFIG.loveLetter.greeting}</p>
              </FadeInSection>

              {/* Cuerpo */}
              <FadeInSection direction="up" delay={320}>
                <div className="space-y-3 text-[#C9BFB8] font-serif text-xs sm:text-[13px] leading-relaxed font-light max-h-[28vh] overflow-y-auto pr-3 letter-scrollbar">
                  {CONFIG.loveLetter.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </FadeInSection>

              {/* Despedida + firma + imagen */}
              <FadeInSection direction="up" delay={420}>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-serif text-xs text-[#8C7565] italic">{CONFIG.loveLetter.farewell}</p>
                    <p className="font-serif text-base text-[#E8A598] font-semibold mt-1">{CONFIG.loveLetter.signature}</p>
                  </div>
                  {CONFIG.loveLetter.signatureImage && (
                    <img
                      src={CONFIG.loveLetter.signatureImage}
                      alt="Firma ilustrada"
                      className="h-16 sm:h-20 w-auto object-contain opacity-90 drop-shadow-[0_0_8px_rgba(232,165,152,0.15)]"
                    />
                  )}
                </div>
              </FadeInSection>
            </div>
          </FadeInSection>
        </section>

        {/* SECCIÓN 6: Ruleta */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 text-center relative overflow-hidden">
          {/* Partículas ornamentales */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {[
              { x: '12%', y: '18%', size: 22, rot: 15, o: 0.08 },
              { x: '85%', y: '22%', size: 18, rot: -20, o: 0.07 },
              { x: '6%',  y: '75%', size: 26, rot: 10, o: 0.06 },
              { x: '90%', y: '70%', size: 20, rot: -12, o: 0.07 },
              { x: '45%', y: '85%', size: 15, rot: 5,  o: 0.06 },
              { x: '55%', y: '10%', size: 17, rot: -8,  o: 0.07 },
            ].map((p, i) => (
              <g key={i} transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`} opacity={p.o}>
                <path d={`M0,${-p.size} C${-p.size * 0.6},${-p.size * 0.6} ${-p.size * 0.6},${p.size * 0.4} 0,${p.size} C${p.size * 0.6},${p.size * 0.4} ${p.size * 0.6},${-p.size * 0.6} 0,${-p.size}Z`} fill="#E8A598" />
              </g>
            ))}
            {[{ cx: '25%', cy: '45%', r: 60 }, { cx: '75%', cy: '55%', r: 45 }].map((c, i) => (
              <circle key={i} cx={c.cx} cy={c.cy} r={c.r} stroke="rgba(78,49,60,0.15)" strokeWidth="1" fill="none" />
            ))}
          </svg>

          <div className="w-full max-w-md max-h-[80vh] flex flex-col justify-center items-center gap-y-4 relative z-10">
            <FadeInSection direction="down" delay={0}>
              <div className="space-y-1">
                <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase block">Cupón de cita · Gira las veces que quieras</span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FFFDFD]">Dejemos que el destino decida</h3>
              </div>
            </FadeInSection>
            <FadeInSection direction="up" delay={180} className="w-full min-h-0 mt-2">
              <DateRoulette
                options={CONFIG.dateIdeas}
                spinPhrases={CONFIG.rouletteSpinPhrases}
                spinDurationMs={CONFIG.timing.rouletteSpinMs}
              />
            </FadeInSection>
          </div>
        </section>

        <footer
          className="w-full min-h-[64px] flex items-center justify-center text-center shrink-0 snap-start snap-always bg-[#130D0F]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <p className="text-[8px] text-[#6E4752] tracking-widest uppercase font-mono font-light">
            © {new Date().getFullYear()} {CONFIG.names.from} y {CONFIG.names.to}
          </p>
        </footer>
      </div>
    </>
  );
}
