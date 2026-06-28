import React, { useState, useEffect, useRef } from 'react';

// 1. CONFIGURACIÓN EMOCIONAL Y PERSONAL
const COUPLE_CONFIG = {
  programmerName: "Gabriel",
  designerName: "Sofía",
  anniversaryDate: "2026-03-28T00:00:00", // Tu aniversario

  loveLetter: [
    "Hay algo profundamente hermoso en la forma en que decidimos entrelazar nuestras vidas. Sin prisas, sin pretensiones, simplemente dejando que la complicidad hiciera su trabajo en cada conversación y en cada silencio compartido.",
    "Llevamos apenas tres meses, pero se sienten repletos de pequeñas certezas. Se sienten en la calidez de tu mano cuando caminamos sin rumbo, en la manera en que tus ojos iluminan los detalles que nadie más nota, y en ese plan absurdamente tierno de meter toda nuestra vida futura en una buseta.",
    "Este espacio es un reflejo de nosotros: inmensamente suave por dentro. Gracias por ser mi lugar seguro, mi mejor coincidencia y la persona con la que quiero seguir recorriendo el camino."
  ],

  photos: [
    { url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80", caption: "El primer día que nos reímos hasta que nos dolió la panza" },
    { url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80", caption: "Esa mirada tuya que detiene cualquier prisa" },
    { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80", caption: "Cuando nos quedamos en silencio simplemente contemplando" },
    { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", caption: "El atardecer dorado en el que prometimos volver" },
    { url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80", caption: "Caminando lento mientras el frío nos acercaba" },
    { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", caption: "Esa mañana con olor a café y risas bajas" },
    { url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80", caption: "Señalando el horizonte donde queremos construir" },
    { url: "https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=800&q=80", caption: "Nuestra colina del viento y los sueños pequeños" },
    { url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80", caption: "Flores que me recuerdan la forma en que sonríes" },
    { url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80", caption: "Detalles diminutos que hacen inmenso un día cualquiera" },
    { url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80", caption: "La paz de estar simplemente resguardados bajo la sombra" },
    { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", caption: "Aquel parque secreto que ahora nos pertenece" },
    { url: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=800&q=80", caption: "El destello del sol en tus manos mientras hablabas" },
    { url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80", caption: "Nuestros pasos marcando una misma dirección" },
    { url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=800&q=80", caption: "Por los primeros tres meses de este viaje increíble" }
  ],

  busetaPassengers: [
    { seat: "Al Volante", name: "Gabriel", icon: "🧑‍💻", role: "Conductor", desc: "Concentrado en el camino, pero mirándote constantemente de reojo por el retrovisor." },
    { seat: "Copiloto", name: "Sofía", icon: "🎨", role: "Directora de Ruta", desc: "Eligiendo la música perfecta y dibujando paisajes imaginarios en el vidrio empañado." },
    { seat: "Junto a la Ventana", name: "Conejito", icon: "🐰", role: "Pasajero Curioso", desc: "Asomado completamente por la ventana, con las orejas flotando al viento de la carretera." },
    { seat: "Explorando", name: "Perrito", icon: "🐶", role: "Explorador", desc: "Intentando atrapar las gotas de lluvia del vidrio y moviendo la cola al ritmo de la música." },
    { seat: "Dormidas Acurrucadas", name: "Nutrias", icon: "🦦", role: "Compañeras de Sueño", desc: "Dos nutrias tomadas de la mano, durmiendo pacíficamente en el asiento más cómodo." },
    { seat: "Sobre tu abrigo", name: "Gatito", icon: "🐱", role: "Pasajero Mimado", desc: "Acurrucado en un rincón sobre tu abrigo, ronroneando suavemente con el motor." },
    { seat: "En un rinconcito", name: "Erizo", icon: "🦔", role: "Pequeño Viajero", desc: "Hecho una bolita dentro de una taza de café vacía, disfrutando de la calidez del viaje." },
    { seat: "Mirando Atento", name: "Patito", icon: "🦆", role: "Observador", desc: "Siguiendo el movimiento del limpiaparabrisas con muchísima atención." },
    { seat: "Abrazado fuerte", name: "Koala", icon: "🐨", role: "Abrazador Oficial", desc: "Sujeto firmemente al tubo del pasamanos, durmiendo un largo viaje de carretera." },
    { seat: "En el pasillo", name: "Carpinchito", icon: "🦫", role: "El Conciliador", desc: "Echado a lo ancho del pasillo con un pequeño sombrero de conductor, transmitiendo paz absoluta a toda la buseta." },
    { seat: "Al fondo del todo", name: "Alpaquita", icon: "🦙", role: "Nube de Viaje", desc: "Asomando su largo cuello desde el asiento de atrás, esponjosa y llenando de abrigo toda la buseta." }
  ],

  dateIdeas: [
    { title: "🍕 Tarde de Acuarelas & Pizza", description: "Colocamos manteles de papel en el suelo, abrimos un buen vino y nos pintamos el uno al otro sin pretensiones." },
    { title: "🌅 Picnic Dorado al Atardecer", description: "Subir a nuestra colina preferida con una manta cómoda, fresas y música que nos traiga paz." },
    { title: "🍵 Ruta de Té & Latte Art", description: "Perdernos en la ciudad buscando cafeterías acogedoras para calificar sus espacios y sus detalles." },
    { title: "🏕️ Noche bajo el Cielo Abierto", description: "Una noche entera durmiendo bajo las estrellas, lejos de las notificaciones, solo nosotros dos conversando despacio." },
    { title: "🍦 Helados & Caminata sin Reloj", description: "Caminar de la mano hasta encontrar sabores extraños de helado y disfrutar del silencio compartido." }
  ]
};

// COMPONENTE PARA FLUJO NATURAL (FADE IN AL HACER SCROLL)
const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -100px 0px", threshold: 0.1 }
    );
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// APLICACIÓN PRINCIPAL
export default function App() {
  const [activeTab, setActiveTab] = useState<'heart' | 'mosaic'>('heart');
  const [smileLevel, setSmileLevel] = useState<number>(50);
  const [selectedPassenger, setSelectedPassenger] = useState<any>(COUPLE_CONFIG.busetaPassengers[0]);
  
  const [polaroidIndex, setPolaroidIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

  const getSmileMessage = (level: number) => {
    if (level < 20) return "A veces el ruido del día es ensordecedor y me llena de estrés...";
    if (level < 45) return "Pero cuando me dedicas esa sonrisa tranquila, el mundo empieza a ir un poco más lento.";
    if (level < 75) return "Con tu risa, todo el ruido se apaga por completo. Me invade una calma profunda.";
    return "Tu alegría es mi paz absoluta. Nada más importa cuando te veo así de feliz.";
  };

  const handleNextPolaroid = () => {
    setSwipeDir('left');
    setTimeout(() => {
      setPolaroidIndex((prev) => (prev + 1) % COUPLE_CONFIG.photos.length);
      setSwipeDir(null);
    }, 400); // Transición más suave y lenta
  };

  return (
    <div className="min-h-screen bg-[#130D0F] text-[#EDE7E5] font-serif selection:bg-[#4E313C] selection:text-rose-200 overflow-x-hidden antialiased relative">
      
      {/* CAPAS ORGÁNICAS DE LUZ (ATARDECER CONTINUO) */}
      <div className="fixed top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-[#3B1F27]/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed top-[40%] left-[-20%] w-[60vw] h-[60vw] bg-[#E8A598]/10 rounded-full blur-[160px] pointer-events-none" />
      
      {/* HEADER MINIMALISTA SIN BORDES DUROS */}
      <header className="absolute top-0 w-full z-50 px-8 py-8 mix-blend-difference">
        <div className="max-w-6xl mx-auto flex flex-col justify-center items-center gap-2">
          <span className="text-xl font-bold tracking-widest text-[#E8A598] uppercase">
            {COUPLE_CONFIG.programmerName} <span className="font-light text-[#B59F9F] mx-2">y</span> {COUPLE_CONFIG.designerName}
          </span>
          <span className="text-[10px] tracking-widest text-[#B59F9F] uppercase font-mono">
            Un diseño en construcción
          </span>
        </div>
      </header>

      <main className="flex flex-col items-center w-full">

        {/* 1. HERO Y EL ÁRBOL DEL TIEMPO (CONTADOR INTERACTIVO) */}
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6">
          <FadeInSection>
            <div className="text-center space-y-6 max-w-3xl mx-auto z-10 relative">
              <span className="text-[#E8A598] text-sm italic font-light tracking-wide">
                Nuestros mundos coincidieron
              </span>
              <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-tight text-[#FFFDFD]">
                Y desde entonces, <br />
                <span className="text-[#E8A598] italic font-normal">todo no hace más que florecer</span>
              </h1>
              <p className="text-[#B59F9F] text-base font-sans font-light max-w-xl mx-auto">
                Cada día que pasa a tu lado es una nueva hoja en esta historia que sigue creciendo de manera natural y hermosa.
              </p>
            </div>
          </FadeInSection>

          {/* El Contador Interactivo (Árbol) */}
          <FadeInSection delay={300}>
            <div className="w-full max-w-4xl mx-auto mt-12 h-[500px] relative flex flex-col items-center justify-end">
              <GrowingTreeCanvas targetDate={COUPLE_CONFIG.anniversaryDate} />
            </div>
          </FadeInSection>
        </section>

        {/* ESPACIO NEGATIVO SUAVE */}
        <div className="h-32 w-full" />

        {/* 2. EL PULSO DE TU RISA (PAZ Y ALEGRÍA) */}
        <section className="relative w-full max-w-4xl mx-auto px-6 py-24 flex flex-col items-center text-center">
          <FadeInSection>
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-bold text-[#FFFDFD]">El Refugio de tu Risa</h2>
              <p className="text-[#B59F9F] font-sans font-light text-lg">
                Mi cabeza suele ir a mil por hora, como una tormenta. Pero he descubierto que tienes el poder de calmar el océano entero. Desliza la línea y mira cómo encuentro paz en ti:
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="w-full mt-16 space-y-12">
              <div className="space-y-4 max-w-md mx-auto">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={smileLevel}
                  onChange={(e) => setSmileLevel(Number(e.target.value))}
                  className="w-full h-0.5 bg-[#3C282D] rounded-full appearance-none cursor-pointer accent-[#E8A598] focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#8C7565] tracking-widest">
                  <span>DÍA AGITADO</span>
                  <span>TU SONRISA</span>
                  <span>TU RISA ABIERTA</span>
                </div>
              </div>

              {/* ONDA DE PAZ INTERACTIVA (SVG) */}
              <div className="w-full h-[150px] relative flex items-center justify-center">
                <PeacefulWave smileLevel={smileLevel} />
              </div>

              <div className="max-w-xl mx-auto">
                <p className="text-xl sm:text-2xl font-serif italic text-[#E8A598] tracking-wide leading-relaxed transition-all duration-500">
                  "{getSmileMessage(smileLevel)}"
                </p>
              </div>
            </div>
          </FadeInSection>
        </section>

        <div className="h-32 w-full" />

        {/* 3. LA BUSETA ORGÁNICA */}
        <section className="relative w-full max-w-5xl mx-auto px-6 py-24">
          <FadeInSection>
            <div className="text-center space-y-6 max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-5xl font-bold text-[#FFFDFD]">Nuestra Escapada Favorita</h2>
              <p className="text-[#B59F9F] font-sans font-light text-lg">
                No necesitamos un destino lujoso. Nuestro viaje ideal es al fondo de una buseta, compartiendo música y planeando la vida con toda nuestra futura familia de animales. Haz clic en ellos:
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* GRID FLOTANTE DE PASAJEROS (Sin bordes obvios) */}
            <FadeInSection delay={100}>
              <div className="grid grid-cols-3 gap-6 relative">
                {/* Asientos delanteros (Nosotros) */}
                <div className="col-span-3 flex justify-center gap-12 mb-4">
                  <button 
                    onClick={() => setSelectedPassenger(COUPLE_CONFIG.busetaPassengers[0])}
                    className={`flex flex-col items-center gap-2 transition-all duration-500 ${selectedPassenger?.name === "Gabriel" ? 'scale-110 opacity-100' : 'opacity-50 hover:opacity-80'}`}
                  >
                    <span className="text-4xl drop-shadow-[0_0_15px_rgba(232,165,152,0.3)]">🧑‍💻</span>
                    <span className="text-xs font-mono text-[#E8A598]">Gabi</span>
                  </button>
                  <button 
                    onClick={() => setSelectedPassenger(COUPLE_CONFIG.busetaPassengers[1])}
                    className={`flex flex-col items-center gap-2 transition-all duration-500 ${selectedPassenger?.name === "Sofía" ? 'scale-110 opacity-100' : 'opacity-50 hover:opacity-80'}`}
                  >
                    <span className="text-4xl drop-shadow-[0_0_15px_rgba(232,165,152,0.3)]">🎨</span>
                    <span className="text-xs font-mono text-[#E8A598]">Sofi</span>
                  </button>
                </div>
                
                {/* Los 9 animalitos esparcidos */}
                {COUPLE_CONFIG.busetaPassengers.slice(2).map((passenger, index) => {
                  const isSelected = selectedPassenger?.name === passenger.name;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedPassenger(passenger)}
                      className={`flex flex-col items-center justify-center transition-all duration-500 ${isSelected ? 'scale-110 opacity-100 translate-y-[-5px]' : 'opacity-40 hover:opacity-70'}`}
                    >
                      <span className="text-3xl mb-2">{passenger.icon}</span>
                      <span className="text-[10px] font-sans tracking-widest text-[#B59F9F] uppercase">{passenger.name}</span>
                    </button>
                  );
                })}
              </div>
            </FadeInSection>

            {/* RELATO DEL PASAJERO */}
            <FadeInSection delay={300}>
              <div className="space-y-6">
                {selectedPassenger ? (
                  <div className="space-y-4 animate-fade-in text-center md:text-left">
                    <span className="text-sm font-sans italic text-[#8C7565]">
                      En su lugar: {selectedPassenger.seat}
                    </span>
                    <h4 className="text-4xl font-bold text-[#FFFDFD]">{selectedPassenger.name}</h4>
                    <p className="text-lg text-[#B59F9F] leading-relaxed font-serif">
                      "{selectedPassenger.desc}"
                    </p>
                  </div>
                ) : (
                  <p className="text-[#62464D] italic font-sans text-center">Toca a alguien para ver qué hace durante el viaje.</p>
                )}
              </div>
            </FadeInSection>
          </div>
        </section>

        <div className="h-32 w-full" />

        {/* 4. ÁLBUM DE RECUERDOS (ESTILO PELÍCULA FLOTANTE) */}
        <section className="relative w-full overflow-hidden py-24 flex flex-col items-center">
          <FadeInSection>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-[#FFFDFD]">Nuestros Retazos</h2>
              <p className="text-[#B59F9F] font-sans font-light">Toca la fotografía para revelar el siguiente instante que guardamos juntos.</p>
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="h-[500px] w-full max-w-sm mx-auto flex items-center justify-center relative perspective-[1000px]">
              {COUPLE_CONFIG.photos.map((photo, index) => {
                const isCurrent = index === polaroidIndex;
                const isNext = index === (polaroidIndex + 1) % COUPLE_CONFIG.photos.length;
                const isAfterNext = index === (polaroidIndex + 2) % COUPLE_CONFIG.photos.length;

                if (!isCurrent && !isNext && !isAfterNext) return null;

                let zIndex = 10;
                let transform = "";
                let opacity = 1;

                if (isCurrent) {
                  zIndex = 30;
                  transform = swipeDir === 'left' ? 'translateX(-120%) rotate(-25deg) scale(0.8)' : 'translateX(0) rotate(-2deg)';
                  opacity = swipeDir === 'left' ? 0 : 1;
                } else if (isNext) {
                  zIndex = 20;
                  transform = 'translateY(15px) rotate(4deg) scale(0.95)';
                  opacity = 0.8;
                } else if (isAfterNext) {
                  zIndex = 10;
                  transform = 'translateY(30px) rotate(-3deg) scale(0.9)';
                  opacity = 0.5;
                }

                return (
                  <div
                    key={index}
                    onClick={isCurrent ? handleNextPolaroid : undefined}
                    className="absolute bg-[#FFFDFD] p-5 pb-10 rounded-sm shadow-2xl w-[300px] cursor-pointer select-none transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{
                      transform,
                      zIndex,
                      opacity,
                    }}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-[#130D0F] relative">
                      <img 
                        src={photo.url} 
                        alt={photo.caption} 
                        className="object-cover w-full h-full pointer-events-none grayscale-[15%] hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-orange-900/10 mix-blend-overlay" />
                    </div>
                    <div className="mt-6 text-center space-y-2">
                      <p className="italic text-sm text-[#28191E] font-serif leading-relaxed px-2">
                        "{photo.caption}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeInSection>
        </section>

        <div className="h-20 w-full" />

        {/* 5. CARTA ÍNTIMA Y RULETA COMBINADAS EN EL FOOTER DEL PAISAJE */}
        <section className="relative w-full max-w-3xl mx-auto px-6 py-24 text-center space-y-32">
          
          <FadeInSection>
            <div className="space-y-12">
              <h2 className="text-3xl font-serif text-[#E8A598] italic font-light">Una nota al margen...</h2>
              <div className="space-y-8 text-[#EDE7E5] font-serif text-lg leading-loose font-light">
                {COUPLE_CONFIG.loveLetter.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <p className="text-[#8C7565] italic text-sm mt-8">
                Escrito con todo el amor del mundo, para ti.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="space-y-10 pt-16 border-t border-[#2D1C22]/50">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-[#FFFDFD]">Dejemos que el destino decida</h3>
                <p className="text-[#B59F9F] font-sans font-light">
                  Haz clic y veamos qué memoria hermosa construimos este fin de semana.
                </p>
              </div>
              <DateRoulette options={COUPLE_CONFIG.dateIdeas} />
            </div>
          </FadeInSection>

        </section>

      </main>

      {/* FOOTER MUY SUTIL */}
      <footer className="w-full py-12 text-center text-[10px] text-[#62464D] tracking-widest uppercase font-mono font-light">
        © {new Date().getFullYear()} {COUPLE_CONFIG.programmerName} y {COUPLE_CONFIG.designerName}.<br/>Un diseño infinito.
      </footer>
    </div>
  );
}

// COMPONENTE: ONDA DE PAZ (LAUGH HEARTBEAT)
function PeacefulWave({ smileLevel }: { smileLevel: number }) {
  // A medida que sonríe más (smileLevel -> 100):
  // Frecuencia baja (ondas más largas), amplitud se suaviza, el color se vuelve más cálido y brillante.
  const frequency = 0.05 - (smileLevel / 100) * 0.03; // Más bajo = más ancho/pacífico
  const amplitude = 30 - (smileLevel / 100) * 15; // Más bajo = más suave
  const turbulence = 10 - (smileLevel / 100) * 10; // 0 en smileLevel 100 (sin ruido)

  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // La velocidad de la animación también se hace más lenta y pacífica al sonreír
    const speed = 2 - (smileLevel / 100) * 1.5; 
    let animationFrame: number;
    const animate = () => {
      setOffset(prev => prev + speed);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [smileLevel]);

  // Generamos los puntos del SVG dinámicamente
  const width = 600;
  const points = [];
  for (let x = 0; x <= width; x += 5) {
    let y = 75; // Centro vertical
    // Onda senoidal base
    y += Math.sin((x + offset) * frequency) * amplitude;
    
    // Ruido aleatorio (ansiedad/estrés) que desaparece cuando sonríe
    if (turbulence > 0) {
      y += (Math.random() - 0.5) * turbulence;
    }
    points.push(`${x},${y}`);
  }
  const pathData = `M ${points.join(' L ')}`;

  const strokeColor = smileLevel > 80 ? '#F43F5E' : '#E8A598';
  const glowOpacity = smileLevel / 100;

  return (
    <svg className="w-full h-full max-w-xl overflow-visible" viewBox="0 0 600 150">
      {/* Resplandor pacífico de fondo que aparece al sonreír */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={glowOpacity * 0.2}
        style={{ filter: 'blur(8px)', transition: 'stroke 1s ease, opacity 1s ease' }}
      />
      {/* Línea principal */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke 1s ease' }}
      />
    </svg>
  );
}

// COMPONENTE: ÁRBOL DEL TIEMPO (CONTADOR CRECIENDO)
function GrowingTreeCanvas({ targetDate }: { targetDate: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [days, setDays] = useState(0);
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    const calculateDays = () => {
      const difference = +new Date() - +new Date(targetDate);
      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const m = Math.floor((difference / 1000 / 60) % 60);
        setDays(d);
        setTimeText(`${d} días, ${h} horas y ${m} minutos`);
      }
    };
    calculateDays();
    const interval = setInterval(calculateDays, 1000 * 60); // Actualiza cada minuto para texto
    return () => clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || days === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || 800;
    let height = canvas.height = 400;

    let time = 0;
    let animationFrameId: number;

    const drawTree = (x: number, y: number, len: number, angle: number, branchWidth: number, currentLevel: number, maxLevels: number, wind: number) => {
      ctx.beginPath();
      ctx.save();
      
      // Color del tronco y ramas (Tono oscuro cálido)
      ctx.strokeStyle = `rgba(140, 117, 101, ${0.8 + currentLevel * 0.1})`;
      ctx.fillStyle = `rgba(140, 117, 101, ${0.8 + currentLevel * 0.1})`;
      ctx.lineWidth = branchWidth;
      
      ctx.translate(x, y);
      // El viento afecta más a las ramas finas (niveles altos)
      const currentWind = currentLevel > 1 ? wind * (currentLevel * 0.2) : 0;
      ctx.rotate(angle * Math.PI / 180 + currentWind);
      
      ctx.moveTo(0, 0);
      // Dibuja la rama hacia arriba (y negativo)
      ctx.lineTo(0, -len);
      ctx.stroke();

      // Si llegamos a la punta, dibujamos hojas (basadas en los días)
      if (currentLevel >= maxLevels) {
        // La cantidad de hojas y su tamaño dependen de los días juntos (limitado para no saturar)
        const leafDensity = Math.min(days / 15, 6); 
        
        for (let i = 0; i < leafDensity; i++) {
          ctx.beginPath();
          // Color de las hojas: Rosa pálido / Oro rosa
          const alpha = 0.6 + Math.random() * 0.4;
          ctx.fillStyle = i % 2 === 0 ? `rgba(232, 165, 152, ${alpha})` : `rgba(244, 63, 94, ${alpha * 0.8})`;
          
          const leafX = (Math.random() - 0.5) * 20;
          const leafY = -len + (Math.random() - 0.5) * 20;
          const leafSize = 2 + Math.random() * 3;
          
          ctx.arc(leafX, leafY, leafSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return;
      }

      // Ramificación recursiva
      // Usamos el tiempo (días) para determinar la complejidad del árbol
      const nextLevels = maxLevels;
      drawTree(0, -len, len * 0.75, angle + 15, branchWidth * 0.7, currentLevel + 1, nextLevels, wind);
      drawTree(0, -len, len * 0.75, angle - 15, branchWidth * 0.7, currentLevel + 1, nextLevels, wind);
      
      // Rama extra en el medio ocasionalmente para más densidad si hay muchos días
      if (days > 45 && currentLevel === 2) {
        drawTree(0, -len, len * 0.6, angle + (Math.random() * 10 - 5), branchWidth * 0.6, currentLevel + 1, nextLevels, wind);
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Animación de viento suave usando un seno basado en el tiempo
      time += 0.015;
      const wind = Math.sin(time) * 0.05;

      // Determinamos el crecimiento (profundidad fractal) según los días
      // 0-30 días: nivel 4, 30-60: nivel 5, >60: nivel 6
      const maxDepth = days < 30 ? 4 : days < 60 ? 5 : 6;
      const initialBranchLen = height * 0.25;

      // Dibujar desde abajo al centro
      drawTree(width / 2, height, initialBranchLen, 0, 10, 1, maxDepth, wind);

      // Dibujar partículas (luciérnagas/polen) flotando alrededor
      ctx.fillStyle = 'rgba(232, 165, 152, 0.4)';
      for (let i = 0; i < 15; i++) {
        const px = (Math.sin(time + i) * width/3) + width/2;
        const py = height - (time * 20 + i * 50) % height;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI*2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = 400;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [days]);

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      <canvas ref={canvasRef} className="w-full max-w-2xl block" />
      <div className="absolute bottom-4 text-center">
        <span className="text-xl sm:text-2xl font-serif italic text-[#E8A598] font-light">
          {timeText}
        </span>
        <div className="text-[10px] tracking-widest text-[#62464D] uppercase font-mono mt-1">
          Raíces Creciendo
        </div>
      </div>
    </div>
  );
}

// COMPONENTE: RULETA DE CITAS SUAVE Y ORGÁNICA
function DateRoulette({ options }: { options: any[] }) {
  const [spinning, setSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  
  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setSelectedOption(null);

    let counter = 0;
    const intervalTime = 120;
    const totalSteps = 20;

    const interval = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * options.length);
      setSelectedOption(options[tempIndex]);
      counter++;

      if (counter >= totalSteps) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, intervalTime);
  };

  return (
    <div className="space-y-12 max-w-md mx-auto">
      {/* ESPACIO DE REVELACIÓN TRANQUILO */}
      <div className="min-h-[120px] flex flex-col items-center justify-center">
        {spinning ? (
          <div className="space-y-4 transition-opacity duration-500 opacity-100">
            <span className="text-2xl animate-spin inline-block text-[#E8A598]">✨</span>
            <p className="text-xs font-serif italic text-[#B59F9F]">Buscando nuestra próxima memoria...</p>
          </div>
        ) : selectedOption ? (
          <div className="space-y-3 animate-fade-in transition-opacity duration-700">
            <h4 className="text-2xl font-bold text-[#FFFDFD]">{selectedOption.title}</h4>
            <p className="text-sm text-[#B59F9F] font-sans font-light leading-relaxed">
              {selectedOption.description}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#62464D] font-serif italic">
            A veces, lo mejor es dejarse sorprender.
          </p>
        )}
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className={`w-full py-4 px-8 rounded-full font-sans font-light transition-all duration-700 ease-out border ${
          spinning 
            ? 'bg-transparent border-[#2D1C22] text-[#62464D] cursor-not-allowed'
            : 'bg-[#E8A598]/5 border-[#E8A598]/30 text-[#E8A598] hover:bg-[#E8A598]/10 hover:border-[#E8A598]/50'
        }`}
      >
        {spinning ? "Girando la brújula..." : "Descubrir nuestro siguiente plan"}
      </button>
    </div>
  );
}