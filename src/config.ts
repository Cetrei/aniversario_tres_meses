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

export interface CoupleConfig {
  /** Link al repo de GitHub, se muestra en el footer. Dejar vacío para ocultarlo. */
  githubRepoUrl: string;
  sakuraTree: SakuraTreeConfig;
  names: Names;
  /** ISO string — fecha de inicio de la relación */
  anniversaryDate: string;
  loveLetter: LoveLetter;
  photos: PhotoEntry[];
  buseta: BusetaLayout;
  dateIdeas: DateIdea[];
}

export const CONFIG: CoupleConfig = {
  githubRepoUrl: "https://github.com/Cetrei/tercer_aniversario_-3",

  sakuraTree: {
    // Tamaño de los pétalos que caen (radio base en px)
    fallingPetalSize: 2.5,
    // Radio base de las flores en la copa (unidades internas)
    flowerRadius: 5,
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
    totalFlowerSeeds: 5000,
    // Proporciones del árbol maduro
    trunkInitialLength: 145,
    trunkInitialWidth: 24,
    rootInitialLength: 160,
    rootInitialWidth: 26,
    // Imagen del árbol en su máximo desarrollo (dejar vacío si no hay)
    treeMaxImage: "",
  },

  names: {
    from: "Joanfer",
    to: "Mamor 💗",
  },

  anniversaryDate: "1960-04-01T00:00:00",

"loveLetter": {
    "place": "San José, 1 de julio de 2026",
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
      caption: "Ese dia descubri que la arean y sal de mar sabe mejor en compañia y que el mar quiere mi culito🥀",
    },
    {
      url: "/images/CuandoNosDormimosRiquisimo.webp",
      displayName: "Dormidos riquísimo",
      caption: "El sueño más dulce que he tenido con compañía, siendo atacado por hormigas, moscas y bajo la lluvia, de todas formas cai",
    },
    {
      url: "/images/Cumplinedo20ConMamor.webp",
      displayName: "Cumpleaños 20 con mamor",
      caption: "Veinte, y ya sé exactamente con quién quiero celebrar el resto de mis cumpleaños",
    },
    {
      url: "/images/LaCitaEnElParque.webp",
      displayName: "La cita en el parque",
      caption: "Mi favorita, me senti muy chineado y especiaal, me invitaste a comer cositas deliciosas que para otros podrian parecer simples, nunca lo olvidare",
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
      caption: "Llegaste a mi universidad y ya nada fue lo mismo.",
    },
    {
      url: "/images/PrimerFotitoDeLaManita.webp",
      displayName: "Primer fotito de la manita",
      caption: "La primera foto de nuestras manos entrelazadas. La primera de muchas.",
    },
    {
      url: "/images/PrimerFotoAzteca.webp",
      displayName: "Primer foto Azteca",
      caption: "La primera foto oficial. Ya se notaba que algo especial empezaba.",
    },
    {
      url: "/images/SuperBesitoSabana.webp",
      displayName: "Super besito Sabana",
      caption: "Un beso en la Sabana que vale más que cualquier monumento.",
    },
    {
      url: "/images/YoBesandoAlAire.webp",
      displayName: "Yo besando al aire",
      caption: "Mandándote besos incluso cuando no estás. Siempre.",
    },
    {
      url: "/images/YoDormidito.webp",
      displayName: "Yo dormidito",
      caption: "Por fin me viste dormir con esa paz que solo tú me das.",
      objectPosition: "90% center",
    },
  ],

  buseta: {
    pilot: {
      name: "Joanfer",
      icon: "🧑‍💻",
      role: "Conductor",
      desc: "Concentrado en el camino, pero mirándote constantemente de reojo por el retrovisor. La playlist perfecta ya estaba lista.",
    },
    copilot: {
      name: "Jimena",
      icon: "🎨",
      role: "Directora de Ruta",
      desc: "Eligiendo la música perfecta y dibujando paisajes imaginarios en el vidrio empañado. El mapa dice que girar aquí.",
    },
    rows: [
      [
        { name: "Conejito", icon: "🐰", role: "Pasajero Curioso", desc: "Asomado completamente por la ventana, con las orejas flotando al viento de la carretera. Es feliz así." },
        { name: "Perrito", icon: "🐶", role: "Explorador", desc: "Intentando atrapar las gotas de lluvia del vidrio y moviendo la cola al ritmo de la música." },
        { name: "Nutria A", icon: "🦦", role: "Compañera de Sueño", desc: "Tomada de la mano de su hermana, durmiendo pacíficamente en el asiento más cómodo." },
      ],
      [
        { name: "Nutria B", icon: "🦦", role: "Compañera de Sueño", desc: "Tomada de la mano de su hermana, durmiendo pacíficamente. Las dos son una sola bolita de felicidad." },
        { name: "Gatito", icon: "🐱", role: "Pasajero Mimado", desc: "Acurrucado sobre el abrigo abandonado en el asiento, ronroneando suavemente al ritmo del motor." },
        { name: "Erizo", icon: "🦔", role: "Pequeño Viajero", desc: "Hecho una bolita dentro de una taza de café vacía, disfrutando de la calidez del viaje." },
      ],
      [
        { name: "Patito", icon: "🦆", role: "Observador", desc: "Siguiendo el movimiento del limpiaparabrisas con muchísima atención y seriedad profesional." },
        { name: "Koala", icon: "🐨", role: "Abrazador Oficial", desc: "Sujeto firmemente al tubo del pasamanos, dormido en un largo viaje de carretera sin soltarse." },
        { name: "Carpinchito", icon: "🦫", role: "El Conciliador", desc: "Echado a lo ancho del pasillo con un pequeño sombrero de conductor, transmitiendo paz absoluta." },
      ],
    ],
    back: [
      { name: "Alpaquita A", icon: "🦙", role: "Nube de Viaje", desc: "Asomando su largo cuello desde el asiento de atrás, esponjosa y llenando de abrigo toda la buseta." },
      { name: "Alpaquita B", icon: "🦙", role: "Nube de Viaje", desc: "La hermana esponjosa, acurrucada al lado, con sus ojos curiosos siguiendo cada paisaje que pasa." },
      { name: "Conejo Gris", icon: "🐇", role: "Soñador del Fondo", desc: "Al fondo del todo, mirando hacia atrás por la luneta, despidiéndose de cada pueblo que dejamos atrás." },
      { name: "Tortuga", icon: "🐢", role: "Filósofa del Viaje", desc: "Con toda la paciencia del mundo, apoyada contra la ventana trasera. Para ella el destino nunca tiene prisa." },
    ],
  },

  // Cupones de cita
  dateIdeas: [
    {
      title: "🦖 Cita de plastilina",
      description: "Cada uno busca o decide unos animales/personames/lo que sea para hacer con plastilina y aambos hacemos nuestra version y les tomamos foto para el recuerdo",
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
};
