
export interface PhotoEntry {
  /** Ruta relativa a /public, p.ej. /images/foto.webp */
  url: string;
  /** Nombre corto para alt text */
  displayName: string;
  /** Frase que aparece bajo la polaroid */
  caption: string;
  /**
   * Controla qué zona de la imagen se muestra dentro del recuadre cuadrado.
   * Valores CSS válidos: "center center" | "top center" | "90% center" | etc.
   * Default: "center center"
   */
  objectPosition?: string;
}

export interface PassengerEntry {
  name: string;
  /**
   * Emoji que se muestra si no hay imagen.
   * Si se proporciona `image`, esta propiedad se ignora.
   */
  icon?: string;
  /**
   * Ruta relativa a /public (opcional). Tiene prioridad sobre `icon`.
   * Puede ser emoji o ruta a foto .webp/.jpg/.png.
   */
  image?: string;
  desc: string;
  role: string;
}

export interface BusetaLayout {
  pilot: PassengerEntry;
  copilot: PassengerEntry;
  /** 3 filas × 3 asientos: [izq_a, izq_b, der] */
  rows: [PassengerEntry, PassengerEntry, PassengerEntry][];
  /** 4 asientos del fondo */
  back: [PassengerEntry, PassengerEntry, PassengerEntry, PassengerEntry];
}

export interface DateIdea {
  title: string;
  description: string;
}

export interface Names {
  from: string;
  to: string;
}

export interface LoveLetter {
  /** e.g. "San José, 1 de julio de 2026" */
  place: string;
  /** A quién va dirigida */
  to: string;
  /** Saludo inicial, e.g. "Mi Jimena bonita," */
  greeting: string;
  /** Párrafos del cuerpo principal */
  body: string[];
  /** Frase de despedida, e.g. "Con todo mi amor," */
  farewell: string;
  /** Firma — normalmente el nombre de quien escribe */
  signature: string;
  /** Ruta a /public de la imagen que aparece junto a la firma (e.g. dos ositos) */
  signatureImage?: string;
}

export interface SakuraTreeConfig {
  /**
   * Tamaño base de los pétalos que caen (radio máximo en px del canvas).
   * El tamaño real varía entre petalSize * 0.6 y petalSize * 1.4 para dar variedad.
   * Rango útil: 2–6. Default: 3.5.
   */
  fallingPetalSize: number;

  /**
   * Radio base de las flores en la copa (en unidades internas del canvas).
   * Las flores individuales varên entre flowerRadius y flowerRadius * 2.5.
   * Rango útil: 2–8. Default: 4.
   */
  flowerRadius: number;

  /**
   * Desde qué altura del canvas caen los pétalos, como fracción de la altura total.
   * 0.0 = borde superior, 0.5 = horizonte (mitad del canvas).
   * El rango de spawn es entre este valor y este valor + 0.35.
   * Rango útil: 0.02–0.20. Default: 0.05.
   */
  petalSpawnHeightFraction: number;

  /**
   * Unidad de tiempo para los pétalos cayendo.
   * 'minute' → 1 pétalo por cada minuto de relación acumulado.
   * 'hour'   → 1 pétalo por cada hora de relación acumulada.
   * Cambia cuántos pétalos se ven hoy y cuántos se verán en el futuro.
   */
  petalUnit: 'minute' | 'hour';

  /**
   * Máximo absoluto de pétalos cayendo simultáneamente (techo del árbol de 50+ años).
   * El árbol de hoy mostrará solo una fracción pequeña de este número.
   * Rango útil: 80–200. Default: 120.
   */
  maxFallingPetals: number;

  /**
   * Profundidad máxima de ramificación de las ramas (copa).
   * Más profundidad = árbol más detallado y frondoso al madurar.
   * Rango útil: 7–11. Default: 9.
   */
  maxBranchDepth: number;

  /**
   * Profundidad máxima de las raíces.
   * Las raíces NO son visibles en los primeros años; aparecen gradualmente
   * a partir de los ~2 años y alcanzan su máximo a los ~20 años.
   * Rango útil: 5–8. Default: 7.
   */
  maxRootDepth: number;

  /**
   * Número total de semillas de flores en la copa.
   * Más flores = follaje más denso al madurar.
   * Rango útil: 200–500. Default: 350.
   */
  totalFlowerSeeds: number;

  /**
   * Longitud inicial del tronco (en unidades del canvas interno).
   * El tronco maduro es notablemente más grueso y alto que el joven.
   * Rango útil: 110–180. Default: 145.
   */
  trunkInitialLength: number;

  /**
   * Grosor inicial del tronco (del árbol completamente maduro).
   * El grosor a cualquier edad = trunkInitialWidth * (0.18 + growth * 0.82).
   * Rango útil: 18–30. Default: 24.
   */
  trunkInitialWidth: number;

  /**
   * Ruta relativa a /public de una imagen que muestra el árbol en su máximo desarrollo.
   * Se muestra en el panel de información del árbol (botón "!").
   * Ejemplo: "/images/arbol_maduro.webp". Dejar vacío ("") si no hay imagen.
   */
  treeMaxImage: string;

  /**
   * Longitud inicial de las raíces del árbol maduro.
   * Rango útil: 100–180. Default: 140.
   */
  rootInitialLength: number;

  /**
   * Grosor inicial de las raíces del árbol maduro.
   * Rango útil: 14–26. Default: 20.
   */
  rootInitialWidth: number;
}

export interface TimingConfig {
  /**
   * Duración en ms de la transición de salida de la intro (fade + scale).
   * Rango útil: 500–2000. Default: 1000.
   */
  introTransitionMs: number;
  /**
   * Duración en ms de la animación de "girando" de la ruleta antes de mostrar el resultado.
   * Controla cuántos pasos visuales rápidos se muestran antes de revelar la idea.
   * Rango útil: 800–3500. Default: 2250 (~25 pasos × 90ms).
   */
  rouletteSpinMs: number;
}

export interface TimelineMilestone {
  /** Fecha ISO del hito. El primero idealmente coincide con `anniversaryDate`. */
  date: string;
  /** Etiqueta corta (1-3 palabras), se muestra en font-mono diminuto. */
  label: string;
}

export interface GreetingsConfig {
  /** Mostrar el saludo personalizado según la hora del día (Sección 0). */
  enabled: boolean;
  /** Saludo mostrado entre las 5:00 y 11:59. Usa {name} para insertar el nombre destinatario. */
  morning: string;
  /** Saludo mostrado entre las 12:00 y 18:59. Usa {name} para insertar el nombre destinatario. */
  afternoon: string;
  /** Saludo mostrado entre las 19:00 y 4:59. Usa {name} para insertar el nombre destinatario. */
  night: string;
}

export interface BackgroundMusicConfig {
  /** Activa el reproductor de música de fondo (botón flotante). */
  enabled: boolean;
  /** Ruta relativa a /public del archivo de audio, p.ej. /audio/musica.mp3 */
  src: string;
  /** Volumen inicial, 0.0–1.0. Default: 0.35. */
  volume: number;
  /** Si empieza a sonar automáticamente al revelar el contenido (algunos navegadores lo bloquean si no hay interacción previa). Default: false. */
  autoplay: boolean;
}

export interface SealStep {
  /** Ángulo objetivo en grados (0-360) para este paso */
  targetAngle: number;
  /** Tiempo en segundos que debe mantenerse en ese ángulo para completar el paso */
  holdSeconds: number;
  /** Tolerancia en grados alrededor del ángulo objetivo */
  toleranceDeg: number;
  /** Texto de pista que aparece al completar este paso (null para no mostrar) */
  hintText?: string;
}

export interface EasterEggConfig {
  /** Activa el easter egg del sello de la carta (Sección 5). */
  enabled: boolean;
  /**
   * Secuencia de pasos para desbloquear el easter egg.
   * Cada paso requiere mantener el sello en un ángulo específico durante un tiempo.
   */
  sealSteps: SealStep[];
  /** Pista sutil que se muestra en el footer, lejos del sello. */
  hintText: string;
  /** Título de la página secreta. */
  surpriseTitle: string;
  /** Mensaje(s) de la página secreta, uno o varios párrafos. */
  surpriseMessage: string[];
  /** Ruta relativa a /public de la foto especial que se muestra en la página secreta. Vacío para omitirla. */
  surpriseImage: string;
  /** Ruta a sonido de paso completado (dejar vacío para tono generado). */
  stepSound?: string;
  /** Ruta a sonido de desbloqueo final (dejar vacío para tono generado). */
  unlockSound?: string;
}

export interface HiddenHint {
  /** ID único de la pista */
  id: string;
  /** Texto de la pista */
  text: string;
  /** Sección donde aparece: 'hero' | 'tree' | 'smile' | 'buseta' | 'gallery' | 'letter' | 'roulette' | 'milestone' | 'footer' */
  location: string;
  /** Estilo de ocultamiento: 'subtle' (texto normal que parece decorativo), 'micro' (texto microscópico), 'acrostic' (primera letra de cada palabra forma algo), 'coords' (coordenadas/ángulos) */
  style: 'subtle' | 'micro' | 'acrostic' | 'coords' | 'symbol';
}

export interface DecorationsConfig {
  /** Sección dedicada a la línea de tiempo de la relación, ubicada antes del árbol Sakura. Pensada para crecer con el tiempo a medida que se agregan hitos. */
  coverTimeline: boolean;
  /** Capa de estrellas + glow rosado detrás del canvas del árbol (Sección 1). El parpadeo de las estrellas solo se anima en escritorio (md+); en móvil quedan fijas. */
  treeConstellation: boolean;
  /** Glow cálido tipo lámpara detrás de la carta, fuera del card (Sección 5). */
  letterPaperGlow: boolean;
  /** Pétalos estáticos en las esquinas de la galería (Sección 4). Menos pétalos en móvil, set completo en sm+. */
  galleryPetals: boolean;
  /** Sello/monograma circular al pie de la carta — tanto en pantalla como en el PNG descargado (Sección 5). */
  letterSeal: boolean;
  /** Anillos concéntricos animados detrás de la ruleta (Sección 6). Un solo anillo en móvil, dos en sm+. */
  rouletteShimmer: boolean;
  /** Puntos suaves flotantes a los costados del "Refugio de tu Risa" (Sección 2). Ocultos en móvil. */
  smileSliderDecor: boolean;
  /** Ruta punteada con nodos de diamante a los costados de "Nuestra Escapada Favorita" (Sección 3). Oculta en móvil. */
  busetaDecor: boolean;
}

export interface CoupleConfig {
  /** Link al repo de GitHub, se muestra en el footer. Dejar vacío para ocultarlo. */
  githubRepoUrl: string;
  /** Configuración de duraciones de animaciones */
  timing: TimingConfig;
  sakuraTree: SakuraTreeConfig;
  names: Names;
  /** ISO string — fecha de inicio de la relación */
  anniversaryDate: string;
  loveLetter: LoveLetter;
  photos: PhotoEntry[];
  buseta: BusetaLayout;
  dateIdeas: DateIdea[];
  /**
   * Frases que aparecen mientras la ruleta gira (se eligen al azar).
   * Si está vacío usa el texto por defecto.
   */
  rouletteSpinPhrases: string[];
  /** Hitos para la línea de tiempo de la portada. Se ignora si coverTimeline está desactivado. */
  timelineMilestones: TimelineMilestone[];
  /** Saludo personalizado según la hora del día. */
  greetings: GreetingsConfig;
  /** Música de fondo en loop. */
  backgroundMusic: BackgroundMusicConfig;
  /** Easter egg del sello de la carta. */
  easterEgg: EasterEggConfig;
  /** Toggle de decoraciones visuales por sección */
  decorations: DecorationsConfig;
  /** Pistas escondidas por toda la página que guían al acertijo del sello */
  hiddenHints: HiddenHint[];
}

export const CONFIG: CoupleConfig = {
  githubRepoUrl: "https://github.com/Cetrei/aniversario_tres_meses",

  timing: {
    // Duración de la transición de salida de la intro en ms
    introTransitionMs: 1000,
    // Cuánto dura el giro de la ruleta antes de revelar el resultado (en ms)
    rouletteSpinMs: 2250,
  },

  rouletteSpinPhrases: [
    "Buscando nuestro próximo destino...",
    "Invocando 3 capybaras magicos...",
    "Preguntándole a las estrellas...",
    "Eligiendo la aventura jaguar perfecta...",
    "Los jaguares estan decidiendo..."
  ],

  sakuraTree: {
    // Tamaño de los pétalos que caen (radio base en px)
    fallingPetalSize: 1.5,
    // Radio base de las flores en la copa (unidades internas)
    flowerRadius: 12,
    // Altura desde donde caen los pétalos (0.0=top, 0.5=horizonte)
    petalSpawnHeightFraction: 0.2,
    // 'minute' = 1 pétalo por minuto | 'hour' = 1 pétalo por hora de relación
    petalUnit: 'hour',
    // Techo de pétalos cayendo (se alcanza a los 50+ años)
    maxFallingPetals: 120,
    // Ramas de la copa
    maxBranchDepth: 9,
    // Raíces profundas (invisibles hoy, espectaculares a futuro)
    maxRootDepth: 8,
    // Flores en la copa del árbol maduro
    // (bajado de 5000 a 1500: mismo aspecto frondoso pero sin generar miles
    // de gradientes radiales por frame, que era el principal causante de la
    // lentitud en móvil)
    totalFlowerSeeds: 5000,
    // Proporciones del árbol maduro
    trunkInitialLength: 200,
    trunkInitialWidth: 24,
    rootInitialLength: 160,
    rootInitialWidth: 26,
    // Imagen del árbol en su máximo desarrollo (dejar vacío si no hay)
    treeMaxImage: "/images/ArbolAlMaximo.webp",
  },

  names: {
    from: "Joanfer",
    to: "Mamor 💗",
  },

  anniversaryDate: "2026-04-01T00:00:00",

"loveLetter": {
    "place": "San José, 28 de junio de 2026",
    "to": "Jimena",
    "greeting": "Mi Enana Preciosa,",
    "body": [
      "Hay algo profundamente hermoso en la forma en que decidimos entrelazar nuestras vidas. Sin prisas, sin pretensiones, simplemente dejando que la complicidad hiciera su trabajo. Llevamos apenas tres meses juntos, pero nunca en mi vida había sentido tantas cosas y tan fuerte por alguien; de hecho, en vez de tres meses, yo diría que ya han sido tres vidas a tu lado. Te amo más que a nada en este mundo y me llena de emoción todo lo que viene para nosotros.",
      "Adoro y me encanta la relación que hemos construido, tan llena de amor, respeto, confianza, comunicación y felicidad. Me fascina pasar casi todos los días contigo, le guste a quien le guste. Eres mi mejor amiga, mi compañera, mi novia, mi esposa, mi hermana... eres absolutamente todo para mí y siempre seguirá siendo así. Por eso te dedico este regalo especial, usando mis talentos y lo que sé hacer (programar) para demostrarte lo mucho que te amo.",
      "Deseo con todo mi corazón pasar el resto de nuestras vidas juntos, formar una familia, tener miles de aventuras y llegar a la vejez felices de mirar atrás y ver todo lo que vivimos. En este universo no existe una mujer como tu, eres demasiado especial para mí; tu corazón noble, la forma en que me amás y cómo me hacés sentir me dan la certeza de que somos almas gemelas y que tu y nadie más, eres amor de mi vida.",
      "Siempre te amaré, incluso después de mi muerte. Con más razón me gusta creer en el cielo, porque la sola idea de tener que despedirme de ti algún día... es simplemente insoportable. Gracias por ser mi lugar seguro, mi mejor coincidencia, mi todo, y la persona con la que quiero seguir recorriendo el camino.",
      "Este espacio es un reflejo de nosotros: inmensamente suave por dentro."
    ],
    "farewell": "Con todo mi amor para mamor,",
    "signature": "Joanfer",
    "signatureImage": "/images/firma.webp"
  },

  photos: [
    {
      url: "/images/CitaAsiaticaEnLaSabana.webp",
      displayName: "Cita asiática en la Sabana",
      caption: "Una cita muy especial para mí, me permitió conocer algo que te encanta y probarlo, al descubrir que a mí también se me hizo super hermoso poder compartirlo contigo",
    },
    {
      url: "/images/ComiendoEnLaPlaya.webp",
      displayName: "Comiendo en la playa",
      caption: "Ese dia descubri que la aarena y sal de mar sabe mejor en compañia y que el mar quiere mi culito🥀",
    },
    {
      url: "/images/CuandoNosDormimosRiquisimo.webp",
      displayName: "Dormidos riquísimo",
      caption: "El sueño más dulce que he tenido con compañía, siendo atacado por hormigas, moscas y bajo la lluvia. Aun asi cai redondo",
    },
    {
      url: "/images/Cumplinedo20ConMamor.webp",
      displayName: "Cumpleaños 20 con mamor",
      caption: "Veinte, y ya sé exactamente con quién quiero celebrar el resto de mis cumpleaños",
    },
    {
      url: "/images/LaCitaEnElParque.webp",
      displayName: "La cita en el parque",
      caption: "Mi favorita, me senti muy chineado y especial, me invitaste a comer cositas deliciosas que para otros podrian parecer simples, nunca lo olvidare",
    },
    {
      url: "/images/LaGranPuta.webp",
      displayName: "Una de tus tantas reacciones",
      caption: "Me rei mucho al verte trabada, lo expresiva que eres es de lo que más amo de ti, me traes alegria y carcajadas con tu forma de ser",
    },
    {
      url: "/images/ManitoJaguarRodando.webp",
      displayName: "Manito Jaguar rodando",
      caption: "Gorditos y bonitos, me dejaste super llenito ese dia, me hizo notar lo mucho que me cuidas y tu emocion por verme disfrutarlo fue 💗",
    },
    {
      url: "/images/Mimidazzz.webp",
      displayName: "Mimidazzz",
      caption: "Dormida, con esa paz que me contagias hasta en sueños",
    },
    {
      url: "/images/OjitosVoid.webp",
      displayName: "Ojitos void",
      caption: "La mirada que tanto amas y quieres de foto de perfil, es increible lo feliz que me hace tener una foto absurda como esa contigo",
    },
    {
      url: "/images/PrimeraSalidaFamiliarSinedoMamor.webp",
      displayName: "Primera salida familiar",
      caption: "Me encanto poder apreciar lo hermoso que es tenerte ahora a mi lado al convivir con mi familia, todo es mucho mejor y nunca lo imagine",
    },
    {
      url: "/images/PrimerasVisitasALaUNA.webp",
      displayName: "Primeras visitas a la UNA",
      caption: "Saber que hasta la universidad es un buen lugar para tener encuentros maritales contigo, me llena mi corazon de pollo, todo lugar es perfecto a tu lado",
    },
    {
      url: "/images/PrimerFotitoDeLaManita.webp",
      displayName: "Primer fotito de la manita",
      caption: "La primera foto de nuestras manos entrelazadas. La primera de muchas, ese sentimiento de cercania y amor al cruzar nuestos dedos, es inexplicable",
    },
    {
      url: "/images/PrimerFotoAzteca.webp",
      displayName: "Primer foto Azteca",
      caption: "La primera foto aesteril siendo marinovios, viendo esa foto ya se nota que somos tal para cual",
    },
    {
      url: "/images/SuperBesitoSabana.webp",
      displayName: "Super besito Sabana",
      caption: "Un beso con mamor en uno de los momentos más especiales a tu lado, explorar algo que te gusta tanto como la comida asiatica fue divino",
    },
    {
      url: "/images/YoBesandoAlAire.webp",
      displayName: "Yo besando al aire",
      caption: "Aunque no sepa posar en las fotos, ni para una de besito, quiero salir en cada una de las que tomes de ahora en adelante",
    },
    {
      url: "/images/YoDormidito.webp",
      displayName: "Yo dormidito",
      caption: "Por fin me viste dormir con esa paz que solo tú me das",
      objectPosition: "20% center",
    },
  ],

  buseta: {
    pilot: {
      name: "Joanfer",
      icon: "🧑‍💻",
      role: "Conductor",
      desc: "Concentrado en el camino o eso me gustaria decir, viendote fijamente y disfrutando de la mejor copilota",
    },
    copilot: {
      name: "Jimena",
      icon: "🎨",
      role: "Directora de Ruta",
      desc: "Eligiendo la música perfecta, cuidando que no nos perdamos y vigilando que Tajin no salte por la ventana",
    },
    rows: [
      [
        { 
          name: "Crudo", icon: "🐶", 
          image: "/images/crudo.webp", 
          role: "Pasajero Curioso", 
          desc: "Usando sus privilegios de color para ir en la ventana con la lengua afuera, soboreando el camino." 
        },
        { name: "Tostado", icon: "🐶", 
          image: "/images/tostado.webp", 
          role: "Tercer al mando",
          desc: "Probablmente la mitad del viaje pasaria intentando ir al frente para poner su musica, normal al tener 2 hermanos locos al lado"
        },
        { name: "Quemado", icon: "🐶",
          image: "/images/quemado.webp",  
          role: "Bello durmiente", 
          desc: "Opuesto a su hermano Crudo, simplemente quiere dormir y que nadie lo moleste" 
        },
      ],
      [
        { name: "Bachichon", icon: "🐕‍🦺",
          role: "Comelo todo", 
          image: "/images/bachichon.webp",  
          desc: "Nuestro perro salchicha super gordo, en honor a Luna y todos los salchichones del planeta"
        },
        { name: "Naranjita", icon: "🐱", 
          image: "/images/naranjita.webp",  
          role: "Pasajero Mimado, en veces", 
          desc: "Nuestro gato naranja para hacerle pelea al golden y a tu querido esposo"
        },
        { name: "Yeti", icon: "🦮", 
          image: "/images/yeti.webp",  
          role: "Jugueton", 
          desc: "Si, le puse mi apodo para hacerle honor a mi energia 🤪, necesitamos un golden que alegre la buseta"
        },
      ],
      [
        { name: "Chihuaha 1", icon: "🦠", 
          image: "/images/ch1.webp",  
          role: "Alarma", 
          desc: "Un pequeña boca llena de cosas para decir, o ni idea de porque los enanitos ladran tanto" },
        { name: "Chihuaha 2", icon: "🦠", 
          image: "/images/ch2.webp",  
          role: "Abrazador Oficial",
          desc: "Contrario a su hermano, un bolita de pelo calmada que solo quiere amor, comprension y ternura" },
        { name: "", icon: "", role: "", desc: "Nunca viene mal un asiento vacio, para el husky tal vez?" },
      ],
    ],
    back: [
      { name: "Tajin", icon: "🦙", 
        image: "/images/tajin.webp",
        role: "Terreneitor", 
        desc: "Como vamos a meter un pony? ni idea, mejor dejarle dos asientos por si acaso pero sera la estrella" },
      { name: "Culito de tajin", icon: "", role: "Infestar el bus", desc: "La unica competencia de tu marinovio en ver quien se pudre primero" },
      { name: "CapybArberto", icon: "🦫", 
        image: "/images/capybara.webp",
        role: "El calmado y amigo de Tajin",
        desc: "Al fondo del todo, vigilando que el pueblo no se revele contra los lideres jaguar, siempre montando a Tajin" },
      { name: "Tortuga", icon: "🐢", 
        image: "/images/tortuga.webp",
        role: "Filósofa del Viaje", 
        desc: "Una tortuga para que amarre, de fijo le daria sabiduria al resto del zoologico" },
    ],
  },

  // Cupones de cita
  dateIdeas: [
    {
      title: "🦖 Cita de plastilina",
      description: "Cada uno busca o decide unos animales/personajes/lo que sea para hacer con plastilina y aambos hacemos nuestra version y les tomamos foto para el recuerdo",
    },
    {
      title: "🌅 Picnic en el aeropuerto al atardecer",
      description: "Ver los aviones despegar mientras el sol se va. Llevar algo rico, nos tiramos en el zacate (ya que me prohiben decir cesped) y disfrutamos el uno del otro.",
    },
    {
      title: "🎨 Pintar algo juntos",
      description: "Aunque quede horrible, sobretodo mi parte. O precisamente por eso, hacemos algo conjunto o cada uno pinta sin que el otro vea. ¿O porque no ambas?",
    },
    {
      title: "🚌 Ir a un mirador en bus",
      description: "La aventura empieza desde que salimos. Buscamos el mirador, nos perdemos y tras por fin llegar; admirar esa vista que hace que valga todo el camino.",
    },
    {
      title: "🍳 Cocinar algo que ninguno sepa hacer",
      description: "Elegir una receta desconocida para los dos e intentarlo juntos sin morir apuñalados o por intoxicacion, creo que mejor tu cortas todo.",
    },
  ],

  timelineMilestones: [
    { date: "2019-03-01", label: "Nos conocimos la primera vez" },
    { date: "2022-04-01", label: "Empezamos a hablar" },
    { date: "2024-01-02", label: "Nos distanciamos" },
    { date: "2025-04-01", label: "Empezamos a acercanos otra vez" },
    { date: "2026-04-1", label: "Nos convertimos en marinovios" },
  ],

  decorations: {
    coverTimeline: true,
    treeConstellation: true,
    letterPaperGlow: true,
    galleryPetals: true,
    letterSeal: true,
    rouletteShimmer: true,
    smileSliderDecor: true,
    busetaDecor: true,
  },

  greetings: {
    enabled: true,
    morning: "Buenos días, {name}",
    afternoon: "Buenas tardes, {name}",
    night: "Buenas noches, {name}",
  },

  backgroundMusic: {
    enabled: true,
    src: "/audio/musica.mp3",
    volume: 0.05,
    autoplay: true,
  },
  

  easterEgg: {
    enabled: true,
    // Secuencia de 3 pasos:
    sealSteps: [
      { targetAngle: 27, holdSeconds: 2, toleranceDeg: 4, hintText: "La primera llegó el 27 del 2..." },
      { targetAngle: 3, holdSeconds: 5, toleranceDeg: 4, hintText: "El segundo llegó el 3 del 5..." },
      { targetAngle: 180, holdSeconds: 2, toleranceDeg: 4, hintText: "Ahora al revés, como loquitos 🙃" },
    ],
    hintText: "Busca el secreto que escondi, pude girar y nos representa 🔎",
    surpriseTitle: "Tu premio: el secreto que somos nosotros",
    "surpriseMessage": [
    "Sabía que tarde o temprano ibas a romper este código. Eres demasiado curiosa, inteligente y observadora para dejarlo sin resolver. Llegar hasta aquí no fue cualquier cosa, así que bienvenida a tu premio, mi Jaguarcita: el secreto más profundo y sincero que guardo sobre nosotros dos.",
    "El sello de lo nuestro no empieza el día que aceptaste ser mi novia. Empieza el 27 de febrero y el 3 de mayo, los días en que tú y yo nacimos. Porque para mí, nuestra historia no comenzó cuando dijiste que sí, sino mucho antes: el día en que cada uno llegó a este mundo a esperar, sin saberlo, encontrarse con el otro. Creo de verdad que somos almas gemelas, y que el amor de mi vida ya existía mucho antes de conocerla.",
    "¿Notaste que las dos primeras J están de cabeza? No es un error. Somos un par de loquitos sanando, creciendo y aprendiendo juntos, a veces patas arriba, casi siempre en caos... pero en ese caos, nos entendemos como nadie más lo hace. Esas 'J' al revés me recuerdan a cuando empezamos a hablar en el cole; desde ahí me tenías loco. Cada momento contigo era especial: ir a llenar las botellas de agua, hablar en media clase aunque nos regañaran, o estar sentados en la mesa con los demás sabiendo que, aunque hubiera mucha gente alrededor, mi interés y mis ojos estaban puestos únicamente en ti.",
    "Eres tan hermosa, magnífica y especial, que jamás creí tener una oportunidad, y cuando nos alejamos después de confesarte lo que sentía, me dolió el alma. En mi primer año de universidad intenté distraerme, obligarme a no pensarte, pero era imposible: veía tu rostro en cada esquina y pasaba las noches llorando. Ese arrepentimiento, sumado a problemas que me guardé y por los que nunca lloré, me llevaron a un punto crítico y muy oscuro donde quise hacerme daño. Pero en medio del pánico de mis propios pensamientos, fuiste tú quien me salvó sin darte cuenta. Pensar en ti, en tu sonrisa y en tu voz fue lo que me motivó a aferrarme a la luz, a llamar a mis amigos para calmarme y a dar los pasos necesarios para superarme. Te convertiste en mi inspiración para VIVIR.",
    "Tras tocar ese fondo, entendí que la vida es muy corta para no luchar por lo que uno ama. Empecé a sanar, a encontrar paz y a entender que soy un buen hombre; que Joanfer es suficiente. Y con ese valor, decidí entregar mi corazón al desnudo ante ti. Fui con ese regalo elaborado a mano y te dije las cosas cara a cara, aun pensando que te gustaba alguien más. No lo hice para cerrar una etapa, sino porque sabía que mi corazón solo late por ti. Si me hubieras dicho que no, estoy seguro de que me habría quedado solo el resto de mi vida; no por drama ni despecho, sino porque nadie más me da esta paz, nadie más me inspira y nadie me hace latir el corazón como tú, mi mamorsh.",
    "Por eso ahora que lo nuestro es real, mi marinovia, mi amor por ti es más sólido que cualquier montaña. Es incondicional; tu mera existencia en este planeta ya es suficiente para mí. Amar es cuidar, escuchar, entender y, sobre todo, regocijarse en la existencia del otro. Cuando te digo que no veo un futuro sin ti, no lo digo de forma trágica (ahí terminaría debajo de un puente en todo caso...), lo digo porque un futuro donde no estés simplemente no tiene sentido. Solo tengo una vida, y quiero que sea tuya y de nadie más, mamoshi.",
    "Como sabes, soy un hombre creyente, y esto es fundamental para mí. No creo en Jesús por una necesidad de llenar vacíos; creo en Él porque sé que la evidencia histórica apunta a su existencia y porque, a través de su sacrificio, todo calza a la perfección: la moral, el sentido de la justicia y el amor mismo. Su sacrificio le da un valor infinito a la vida de cada persona y genera orden en medio de este universo de caos. Por eso me da tanta paz saber que nos conviene que haya una vida después de esta, mi princesa, porque un amor tan inmenso como el nuestro merece ser vivido por toda la eternidad.",
    "Mientras lees esto, mi microbio, yo estoy aquí, conteniendo mis propias lágrimas por la emoción tan inmensa de tener a mi lado a la persona que tanto amé en secreto. Por el niño del colegio que solo te miraba a ti, por el joven que recordó tu sonrisa para sobrevivir a su noche más oscura, y por el hombre que hoy te ama con cada fibra de su ser... te pregunto con el alma al desnudo: ¿me darías tu vida?"
  ],
    surpriseImage: "/images/secreto.webp",
  },

  // Pistas escondidas por toda la página
  // Cada una apunta sutilmente a las fechas de cumpleaños o al acertijo
  hiddenHints: [
    // Hero - coordenadas sutiles
    { id: "hero-1", text: "27° al norte, 2 segundos de espera", location: "hero", style: "coords" },
     // Árbol - acróstico con las fechas
    //{ id: "tree-1", text: "Vemos como todo florece en .Febrero. hasta que llega .Abril.", location: "tree", style: "acrostic" },
    // Smile slider - símbolos
    { id: "smile-1", text: "↻ El primero marca el rumbo - ⌛ El segundo marca la espera.", location: "smile", style: "symbol" },
    // Buseta - micro texto
    { id: "buseta-1", text: "Una familia patas arriba ↻", location: "buseta", style: "micro" },
    // Galería - coordenadas en caption-like
    { id: "gallery-1", text: "Nuestro amor florece en ↻Marzo. y resplandece en ⌛Agosto.", location: "gallery", style: "subtle" },
    // Carta - acróstico visible
    { id: "letter-1", text: "La historia comienza con quien nació primero", location: "letter", style: "acrostic" },
    // Ruleta - símbolos de ángulos
    { id: "roulette-1", text: "3 es un numero grandioso, no crees?", location: "roulette", style: "symbol" },
    // Milestone - micro
    { id: "milestone-1", text: "Gira el sello sin soltarlo conforme a los cumpleaños", location: "milestone", style: "micro" },
    // Footer - ya tiene el hint principal del easter egg
  ],
};