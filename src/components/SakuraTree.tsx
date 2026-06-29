import { Fragment, useEffect, useRef, useState } from 'react';
import type { SakuraTreeConfig } from '../config';

interface SakuraTreeProps {
  /** Fecha ISO en la que inició la relación. Define cuánto ha crecido el árbol. */
  startDate: string;
  /** Configuración del árbol proveniente de config.ts */
  treeConfig: SakuraTreeConfig;
}

interface SkeletonSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cpx: number;
  cpy: number;
  width: number;
  depth: number;
  /** Fracción de madurez (0-1) en la que este segmento empieza a aparecer. */
  birth: number;
}

interface FlowerSeed {
  x: number;
  y: number;
  radius: number;
  birth: number;
  swayPhase: number;
  swaySpeed: number;
  warmth: number;
}

interface FallingPetal {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  swayPhase: number;
  swaySpeed: number;
}

interface TreeStructure {
  branches: SkeletonSegment[];
  roots: SkeletonSegment[];
  flowers: FlowerSeed[];
  bounds: { left: number; right: number; top: number; bottom: number };
}

interface ElapsedTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CanvasMetrics {
  width: number;
  height: number;
  dpr: number;
  scale: number;
}

// Las constantes de estructura se reciben desde config.ts a través de SakuraTreeProps.
// Estos valores se leen en tiempo de montaje desde treeConfig.

const COUNTER_UNITS: { key: keyof ElapsedTime; label: string }[] = [
  { key: 'days', label: 'Días' },
  { key: 'hours', label: 'Horas' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Seg' },
];

/** Generador pseudoaleatorio determinista: misma semilla, mismo resultado siempre. */
function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Devuelve dos valores independientes de madurez:
 *
 * branchGrowth (0–1): controla la copa, el tronco y las flores.
 *   - Día 1       → 0.55  (copa y tronco joven claramente visible)
 *   - 3 meses    → 0.65  (arbolito bonito con flores)
 *   - 1 año      → 0.72
 *   - 5 años     → 0.82
 *   - 50 años    → 0.97  (enorme, copa densa)
 *
 * rootGrowth (0–1): controla las raíces, aparecen mucho más tarde.
 *   - Día 1       → 0.00  (invisibles)
 *   - 3 meses    → 0.00  (invisibles)
 *   - 1 año      → 0.04  (apenas asoman)
 *   - 5 años     → 0.30  (raíces visibles)
 *   - 20 años    → 0.65  (raíces profundas)
 *   - 50 años    → 0.88  (sistema espectacular)
 */
function calculateGrowths(startDate: string): { branchGrowth: number; rootGrowth: number } {
  const elapsedHours = Math.max(0, (Date.now() - new Date(startDate).getTime()) / 3_600_000);
  const elapsedYears = elapsedHours / 8_760;

  // Copa: crece rápido al principio (curva logarítmica suavizada)
  // Ancla: 0 horas → 0.55, 50 años → ~0.97
  const BRANCH_BASE = 0.55;
  const BRANCH_RANGE = 0.42;
  const BRANCH_HALF_LIFE_YEARS = 12; // mitad del rango en ~12 años
  const branchSlow = elapsedYears / (elapsedYears + BRANCH_HALF_LIFE_YEARS);
  const branchGrowth = clamp(BRANCH_BASE + BRANCH_RANGE * branchSlow, 0, 1);

  // Raíces: empiezan a aparecer al año, media vida ~15 años
  const ROOT_DELAY_YEARS = 1.0; // umbral: antes de este tiempo growth=0
  const ROOT_HALF_LIFE_YEARS = 15;
  const yearsIntoRoots = Math.max(0, elapsedYears - ROOT_DELAY_YEARS);
  const rootGrowth = clamp(yearsIntoRoots / (yearsIntoRoots + ROOT_HALF_LIFE_YEARS), 0, 1);

  return { branchGrowth, rootGrowth };
}

/**
 * Cuántos pétalos deben caer ahora.
 * Con petalUnit='minute': 1 pétalo por minuto de relación (limitado por maxFallingPetals).
 * Con petalUnit='hour':   1 pétalo por hora.
 */
function calculateActivePetals(startDate: string, petalUnit: 'minute' | 'hour', maxFallingPetals: number): number {
  const totalMs = Math.max(0, Date.now() - new Date(startDate).getTime());
  const units = petalUnit === 'minute'
    ? Math.floor(totalMs / 60_000)
    : Math.floor(totalMs / 3_600_000);
  return clamp(units, 1, maxFallingPetals);
}

function calculateElapsedTime(startDate: string): ElapsedTime {
  const totalMs = Math.max(0, Date.now() - new Date(startDate).getTime());
  return {
    days: Math.floor(totalMs / 86_400_000),
    hours: Math.floor((totalMs % 86_400_000) / 3_600_000),
    minutes: Math.floor((totalMs % 3_600_000) / 60_000),
    seconds: Math.floor((totalMs % 60_000) / 1_000),
  };
}

/**
 * Genera raíces que salen horizontalmente desde la base del tronco,
 * sin tronco central invertido. Cada raíz principal arranca con un
 * ángulo casi horizontal y se curva hacia abajo progresivamente.
 */
function growRoots(params: {
  maxDepth: number;
  initialLength: number;
  initialWidth: number;
  seedOffset: number;
}): { segments: SkeletonSegment[]; tips: { x: number; y: number }[] } {
  const { maxDepth, initialLength, initialWidth, seedOffset } = params;
  const segments: SkeletonSegment[] = [];
  const tips: { x: number; y: number }[] = [];
  let seed = seedOffset;

  // Número de raíces principales que salen de la base
  const ROOT_COUNT = 5;

  function growBranch(x: number, y: number, angleDeg: number, length: number, width: number, depth: number, parentBirth: number): void {
    const angleRad = (angleDeg * Math.PI) / 180;
    // direction -1 = crece hacia abajo
    const x2 = x + Math.cos(angleRad) * length;
    const y2 = y + Math.sin(angleRad) * length;

    const jitter = (seededRandom(seed++) - 0.5) * width * 1.4;
    const cpx = (x + x2) / 2 + jitter;
    const cpy = (y + y2) / 2 + seededRandom(seed++) * width * 0.6;
    const birth = depth === 0 ? 0 : clamp(parentBirth + 0.05 + seededRandom(seed++) * 0.07, 0, 0.93);

    segments.push({ x1: x, y1: y, x2, y2, cpx, cpy, width, depth, birth });

    if (depth >= maxDepth || length < 5) {
      tips.push({ x: x2, y: y2 });
      return;
    }

    // Cada bifurcación añade más ángulo hacia abajo
    const spreadDown = 18 + depth * 4 + seededRandom(seed++) * 10;
    const lengthRatio = 0.68 - depth * 0.01;
    const widthRatio = 0.62;
    const spawnsThird = depth < 2 && seededRandom(seed++) > 0.55;

    if (spawnsThird) {
      growBranch(x2, y2, angleDeg + seededRandom(seed++) * 8, length * lengthRatio * 0.88, width * widthRatio, depth + 1, birth);
    }
    growBranch(x2, y2, angleDeg - spreadDown * 0.4, length * lengthRatio, width * widthRatio, depth + 1, birth);
    growBranch(x2, y2, angleDeg + spreadDown, length * lengthRatio, width * widthRatio, depth + 1, birth);
  }

  for (let i = 0; i < ROOT_COUNT; i++) {
    // Distribuye las raíces: izquierda, derecha, y algunas intermedias
    // Ángulos: ~15° a ~80° desde la horizontal, alternando lados
    const side = i % 2 === 0 ? 1 : -1;
    const baseAngle = 20 + (Math.floor(i / 2)) * 22 + seededRandom(seedOffset + i * 37) * 10;
    const startAngle = side > 0 ? baseAngle : 180 - baseAngle;
    const rootSeed = seedOffset + i * 500;
    seed = rootSeed;
    growBranch(0, 0, startAngle, initialLength * (0.85 + seededRandom(rootSeed) * 0.3), initialWidth * (0.7 + seededRandom(rootSeed + 1) * 0.3), 0, 0);
  }

  return { segments, tips };
}

/** Genera las ramas del árbol hacia arriba con ramificación fractal. */
function growBranches(params: {
  maxDepth: number;
  initialLength: number;
  initialWidth: number;
  seedOffset: number;
}): { segments: SkeletonSegment[]; tips: { x: number; y: number }[] } {
  const { maxDepth, initialLength, initialWidth, seedOffset } = params;
  const segments: SkeletonSegment[] = [];
  const tips: { x: number; y: number }[] = [];
  let seed = seedOffset;

  function grow(x: number, y: number, angleDeg: number, length: number, width: number, depth: number, parentBirth: number): void {
    const angleRad = (angleDeg * Math.PI) / 180;
    const x2 = x + Math.cos(angleRad) * length;
    const y2 = y - Math.sin(angleRad) * length;

    const jitter = (seededRandom(seed++) - 0.5) * width * 1.6;
    const cpx = (x + x2) / 2 + jitter;
    const cpy = (y + y2) / 2 + (seededRandom(seed++) - 0.5) * width * 0.8;
    const birth = depth === 0 ? 0 : clamp(parentBirth + 0.04 + seededRandom(seed++) * 0.06, 0, 0.93);

    segments.push({ x1: x, y1: y, x2, y2, cpx, cpy, width, depth, birth });

    if (depth >= maxDepth || length < 6) {
      tips.push({ x: x2, y: y2 });
      return;
    }

    const spread = 16 + depth * 2.6 + seededRandom(seed++) * 8;
    const lengthRatio = 0.74 - depth * 0.01;
    const widthRatio = 0.68;
    const spawnsThird = depth < 2 && seededRandom(seed++) > 0.5;

    if (spawnsThird) {
      grow(x2, y2, angleDeg, length * lengthRatio * 0.92, width * widthRatio, depth + 1, birth);
    }
    grow(x2, y2, angleDeg - spread, length * lengthRatio, width * widthRatio, depth + 1, birth);
    grow(x2, y2, angleDeg + spread, length * lengthRatio, width * widthRatio, depth + 1, birth);
  }

  grow(0, 0, 90, initialLength, initialWidth, 0, 0);
  return { segments, tips };
}
function growFlowers(branches: SkeletonSegment[], tips: { x: number; y: number }[], targetCount: number, seedOffset: number): FlowerSeed[] {
  const outerBranches = branches.filter((branch) => branch.depth >= 3);
  const pool = outerBranches.length > 0 ? outerBranches : branches;
  const flowers: FlowerSeed[] = [];

  for (let i = 0; i < targetCount; i++) {
    const seed = seedOffset + i;
    const placeOnTip = i % 3 === 0 && tips.length > 0;

    let x: number;
    let y: number;
    if (placeOnTip) {
      const tip = tips[i % tips.length];
      x = tip.x + (seededRandom(seed * 2) - 0.5) * 24;
      y = tip.y + (seededRandom(seed * 3) - 0.5) * 24;
    } else {
      const branch = pool[i % pool.length];
      const along = seededRandom(seed * 4);
      x = lerp(branch.x1, branch.x2, along) + (seededRandom(seed * 5) - 0.5) * 18;
      y = lerp(branch.y1, branch.y2, along) + (seededRandom(seed * 6) - 0.5) * 18;
    }

    flowers.push({
      x,
      y,
      radius: 3 + seededRandom(seed * 7) * 4.5,
      birth: clamp(0.55 + seededRandom(seed * 8) * 0.27, 0, 0.82),
      swayPhase: seededRandom(seed * 9) * Math.PI * 2,
      swaySpeed: 0.3 + seededRandom(seed * 10) * 0.35,
      warmth: seededRandom(seed * 11),
    });
  }

  return flowers;
}

/** Construye la estructura fractal completa (madura) una sola vez: ramas, raíces, flores y su bounding box. */
function buildTreeStructure(cfg: SakuraTreeConfig): TreeStructure {
  const trunk = growBranches({ maxDepth: cfg.maxBranchDepth, initialLength: cfg.trunkInitialLength, initialWidth: cfg.trunkInitialWidth, seedOffset: 17 });
  const roots = growRoots({ maxDepth: cfg.maxRootDepth, initialLength: cfg.rootInitialLength, initialWidth: cfg.rootInitialWidth, seedOffset: 941 });
  const flowers = growFlowers(trunk.segments, trunk.tips, cfg.totalFlowerSeeds, 311);

  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;

  for (const segment of [...trunk.segments, ...roots.segments]) {
    left = Math.min(left, segment.x1, segment.x2, segment.cpx);
    right = Math.max(right, segment.x1, segment.x2, segment.cpx);
    top = Math.min(top, segment.y1, segment.y2, segment.cpy);
    bottom = Math.max(bottom, segment.y1, segment.y2, segment.cpy);
  }
  for (const flower of flowers) {
    left = Math.min(left, flower.x - flower.radius);
    right = Math.max(right, flower.x + flower.radius);
    top = Math.min(top, flower.y - flower.radius);
  }

  return { branches: trunk.segments, roots: roots.segments, flowers, bounds: { left, right, top, bottom } };
}

/** Calcula la escala máxima segura para que el árbol maduro completo nunca se corte, sin importar la resolución. */
function computeFitScale(canvasWidth: number, canvasHeight: number, bounds: TreeStructure['bounds']): number {
  const widthSpan = Math.max(Math.abs(bounds.left), Math.abs(bounds.right), 1);
  const topSpan = Math.max(Math.abs(bounds.top), 1);
  const bottomSpan = Math.max(Math.abs(bounds.bottom), 1);

  const scaleForWidth = (canvasWidth * 0.46) / widthSpan;
  const scaleForCanopy = (canvasHeight * 0.42) / topSpan;
  const scaleForRoots = (canvasHeight * 0.4) / bottomSpan;

  return Math.min(scaleForWidth, scaleForCanopy, scaleForRoots);
}

/** Cielo de atardecer estático en la mitad superior y tierra oscura en la mitad inferior. */
function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const horizonY = height / 2;

  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, '#1A1220');
  sky.addColorStop(0.45, '#3B2330');
  sky.addColorStop(0.78, '#7A4450');
  sky.addColorStop(1, '#D08C72');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizonY);

  const sunGlow = ctx.createRadialGradient(width / 2, horizonY, 0, width / 2, horizonY, width * 0.55);
  sunGlow.addColorStop(0, 'rgba(255, 214, 186, 0.32)');
  sunGlow.addColorStop(1, 'rgba(255, 214, 186, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, width, horizonY);

  for (let i = 0; i < 22; i++) {
    const x = seededRandom(i * 13.7) * width;
    const y = seededRandom(i * 5.3 + 1) * horizonY * 0.55;
    const radius = 0.5 + seededRandom(i * 7.1) * 1;
    ctx.fillStyle = `rgba(255, 250, 245, ${0.15 + seededRandom(i * 3.3) * 0.25})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const earth = ctx.createLinearGradient(0, horizonY, 0, height);
  earth.addColorStop(0, '#221318');
  earth.addColorStop(0.45, '#170E12');
  earth.addColorStop(1, '#0A0608');
  ctx.fillStyle = earth;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  for (let i = 0; i < 40; i++) {
    const x = seededRandom(i * 9.1 + 50) * width;
    const y = horizonY + seededRandom(i * 4.7 + 60) * (height - horizonY);
    const radius = 0.6 + seededRandom(i * 6.3) * 1.4;
    ctx.fillStyle = `rgba(0, 0, 0, ${0.12 + seededRandom(i * 2.1) * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Línea recta del césped, justo en el centro del canvas, con pequeñas briznas sutiles. */
function drawGrassLine(ctx: CanvasRenderingContext2D, width: number, horizonY: number): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(110, 130, 80, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(width, horizonY);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(110, 130, 80, 0.35)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 7) {
    const bladeHeight = 2 + seededRandom(x * 0.37) * 3;
    ctx.beginPath();
    ctx.moveTo(x, horizonY);
    ctx.lineTo(x + (seededRandom(x * 0.13) - 0.5) * 2, horizonY - bladeHeight);
    ctx.stroke();
  }
  ctx.restore();
}

/** Resplandor cálido bajo las raíces más profundas: la energía acumulada por el tiempo juntos. */
function drawRootGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, growth: number): void {
  const alpha = 0.05 + growth * 0.22;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, Math.max(radius, 1));
  glow.addColorStop(0, `rgba(232, 165, 152, ${alpha})`);
  glow.addColorStop(1, 'rgba(232, 165, 152, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(radius, 1), 0, Math.PI * 2);
  ctx.fill();
}

/** Dibuja ramas o raíces revelando solo los segmentos cuya "fecha de nacimiento" ya fue alcanzada por la madurez actual. */
function drawSkeleton(ctx: CanvasRenderingContext2D, segments: SkeletonSegment[], growth: number, isRoot: boolean, maxDepth: number): void {
  // El grosor escala de forma muy pronunciada con el growth:
  // - Copa joven (growth=0.55): tronco fino pero visible
  // - Copa vieja (growth=0.97): tronco enorme, imponente
  // Usamos una curva cuadrática para que el efecto sea exagerado a alto growth.
  const t = (growth - 0.5) / 0.5; // renormaliza 0.5–1.0 → 0–1
  const thicknessBoost = 0.22 + Math.pow(Math.max(0, t), 1.6) * 2.8;
  const transitionWidth = 0.10;

  for (const segment of segments) {
    if (growth < segment.birth) continue;

    const localProgress = clamp((growth - segment.birth) / transitionWidth, 0, 1);
    const endX = segment.x1 + (segment.x2 - segment.x1) * localProgress;
    const endY = segment.y1 + (segment.y2 - segment.y1) * localProgress;
    const cpX = segment.x1 + (segment.cpx - segment.x1) * localProgress;
    const cpY = segment.y1 + (segment.cpy - segment.y1) * localProgress;

    const depthRatio = segment.depth / maxDepth;
    ctx.strokeStyle = isRoot
      ? `rgb(${Math.round(46 + depthRatio * 18)}, ${Math.round(30 + depthRatio * 14)}, ${Math.round(26 + depthRatio * 10)})`
      : `rgb(${Math.round(88 + depthRatio * 32)}, ${Math.round(62 + depthRatio * 20)}, ${Math.round(46 + depthRatio * 12)})`;
    ctx.lineWidth = Math.max(0.6, segment.width * (1 - depthRatio * 0.45) * thicknessBoost);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(segment.x1, segment.y1);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();
  }
}

/** Pétalos en flor sobre las ramas: nacen diminutos y crecen hasta su tamaño real, con un balanceo apenas perceptible. */
function drawFlowers(ctx: CanvasRenderingContext2D, flowers: FlowerSeed[], growth: number, time: number): void {
  const transitionWidth = 0.18;

  for (const flower of flowers) {
    if (growth < flower.birth) continue;

    const localProgress = clamp((growth - flower.birth) / transitionWidth, 0, 1);
    const currentRadius = flower.radius * localProgress;
    if (currentRadius <= 0) continue;

    const swayX = Math.sin(time * flower.swaySpeed + flower.swayPhase) * 1.4;
    const swayY = Math.cos(time * flower.swaySpeed * 0.8 + flower.swayPhase) * 0.8;

    ctx.save();
    ctx.translate(flower.x + swayX, flower.y + swayY);
    ctx.rotate(flower.swayPhase);
    ctx.globalAlpha = 0.75 + flower.warmth * 0.2;

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(currentRadius, 0.01));
    gradient.addColorStop(0, 'rgba(255, 241, 244, 1)');
    gradient.addColorStop(0.65, 'rgba(244, 160, 178, 0.95)');
    gradient.addColorStop(1, 'rgba(225, 110, 138, 0)');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-currentRadius, -currentRadius, -currentRadius, currentRadius / 2, 0, currentRadius);
    ctx.bezierCurveTo(currentRadius, currentRadius / 2, currentRadius, -currentRadius, 0, 0);
    ctx.fill();
    ctx.restore();
  }
}

function createFallingPetal(width: number, height: number, seed: number): FallingPetal {
  // Nace en la zona de la copa: entre el 5% y el 45% superior del canvas
  const spawnY = height * (0.05 + seededRandom(seed * 2) * 0.40);
  return {
    x: width * (0.15 + seededRandom(seed) * 0.70),
    y: spawnY,
    vy: 18 + seededRandom(seed * 3) * 20,
    vx: -8 + seededRandom(seed * 4) * 16,
    size: 2.5 + seededRandom(seed * 5) * 3,
    rotation: seededRandom(seed * 6) * Math.PI * 2,
    rotationSpeed: -1.2 + seededRandom(seed * 7) * 2.4,
    swayPhase: seededRandom(seed * 8) * Math.PI * 2,
    swaySpeed: 0.5 + seededRandom(seed * 9) * 0.6,
  };
}

/** Actualiza y dibuja los pétalos cayendo desde la copa, que se desvanecen antes de tocar el suelo. */
function updateAndDrawPetals(
  ctx: CanvasRenderingContext2D,
  petals: FallingPetal[],
  activeCount: number,
  width: number,
  height: number,
  deltaSeconds: number,
  time: number
): void {
  // El horizonte (suelo) está en la mitad del canvas.
  // Los pétalos solo caen hasta ahí y se desvanecen en los últimos 30% de su recorrido.
  const horizonY = height / 2;
  // Zona de fade: empieza a los 70% del camino hacia el horizonte
  const fadeStartY = horizonY * 0.70;
  const fadeRange = horizonY - fadeStartY;

  for (let i = 0; i < activeCount; i++) {
    const petal = petals[i];
    petal.y += petal.vy * deltaSeconds;
    petal.x += (petal.vx + Math.sin(time * petal.swaySpeed + petal.swayPhase) * 10) * deltaSeconds;
    petal.rotation += petal.rotationSpeed * deltaSeconds;

    // Reaparece en la copa cuando llega al horizonte o sale lateralmente
    const reachedGround = petal.y >= horizonY;
    const leftViewport = petal.x < -20 || petal.x > width + 20;
    if (reachedGround || leftViewport) {
      const respawned = createFallingPetal(width, height, Math.random() * 10_000);
      petal.x = respawned.x;
      petal.y = respawned.y;
      petal.vy = respawned.vy;
      petal.vx = respawned.vx;
      petal.size = respawned.size;
      petal.rotation = respawned.rotation;
      petal.rotationSpeed = respawned.rotationSpeed;
      petal.swayPhase = respawned.swayPhase;
      petal.swaySpeed = respawned.swaySpeed;
      continue;
    }

    // Fade: 1.0 por encima de fadeStartY, 0.0 en horizonY
    const fadeAlpha = petal.y < fadeStartY
      ? 1.0
      : 1.0 - clamp((petal.y - fadeStartY) / fadeRange, 0, 1);

    ctx.save();
    ctx.globalAlpha = 0.75 * fadeAlpha;
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);
    ctx.fillStyle = 'rgba(244, 168, 184, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 0, petal.size, petal.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function SakuraTree({ startDate, treeConfig }: SakuraTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const structureRef = useRef<TreeStructure>(buildTreeStructure(treeConfig));
  const petalsRef = useRef<FallingPetal[]>(
    Array.from({ length: treeConfig.maxFallingPetals }, (_, i) => createFallingPetal(400, 400, i + 1))
  );
  const metricsRef = useRef<CanvasMetrics>({ width: 0, height: 0, dpr: 1, scale: 1 });
  const lastTimestampRef = useRef<number | null>(null);
  const clockRef = useRef(0);

  const [elapsed, setElapsed] = useState<ElapsedTime>(() => calculateElapsedTime(startDate));

  // Reloj en tiempo real para el contador visible (Días, Horas, Minutos, Segundos)
  useEffect(() => {
    const intervalId = setInterval(() => setElapsed(calculateElapsedTime(startDate)), 1000);
    return () => clearInterval(intervalId);
  }, [startDate]);

  // Ajusta el tamaño físico del canvas cuando el contenedor cambia de tamaño (responsivo de verdad)
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      metricsRef.current = {
        width,
        height,
        dpr,
        scale: computeFitScale(width, height, structureRef.current.bounds),
      };
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Bucle principal: dibuja el árbol según la madurez real y anima los pétalos con el viento vía requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const renderFrame = (timestamp: number) => {
      const deltaSeconds = lastTimestampRef.current === null ? 0 : Math.min(0.05, (timestamp - lastTimestampRef.current) / 1000);
      lastTimestampRef.current = timestamp;
      clockRef.current += deltaSeconds;

      const { width, height, dpr, scale } = metricsRef.current;
      if (width === 0 || height === 0) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const { branchGrowth, rootGrowth } = calculateGrowths(startDate);
      const horizonY = height / 2;
      const centerX = width / 2;
      const structure = structureRef.current;

      drawBackground(ctx, width, height);
      drawGrassLine(ctx, width, horizonY);

      ctx.save();
      ctx.translate(centerX, horizonY);
      ctx.scale(scale, scale);

      // Raíces: solo se dibujan si rootGrowth > 0 (invisibles los primeros ~12 meses)
      if (rootGrowth > 0) {
        const deepestRootY = structure.roots.reduce((deepest, segment) => Math.max(deepest, segment.y2), 40);
        drawRootGlow(ctx, 0, deepestRootY * 0.85, deepestRootY * 0.7, rootGrowth);
        drawSkeleton(ctx, structure.roots, rootGrowth, true, treeConfig.maxRootDepth);
      }
      drawSkeleton(ctx, structure.branches, branchGrowth, false, treeConfig.maxBranchDepth);
      drawFlowers(ctx, structure.flowers, branchGrowth, clockRef.current);

      ctx.restore();

      const activePetalCount = calculateActivePetals(startDate, treeConfig.petalUnit, treeConfig.maxFallingPetals);
      updateAndDrawPetals(ctx, petalsRef.current, activePetalCount, width, height, deltaSeconds, clockRef.current);

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [startDate]);

  return (
    <div ref={containerRef} className="relative w-full max-w-[420px] aspect-[4/5] mx-auto select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block rounded-xl overflow-hidden" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#FFFDFD] shadow-[0_10px_34px_rgba(0,0,0,0.4)]">
        {COUNTER_UNITS.map((unit, index) => (
          <Fragment key={unit.key}>
            {index > 0 && <span className="w-px h-6 sm:h-7 bg-[#E3D9D6]" />}
            <div className="flex flex-col items-center min-w-[26px] sm:min-w-[32px]">
              <span className="font-mono font-bold text-base sm:text-lg text-[#2D1C22] tabular-nums leading-none">
                {String(elapsed[unit.key]).padStart(2, '0')}
              </span>
              <span className="text-[6px] sm:text-[7px] font-mono uppercase tracking-widest text-[#8C7565] mt-0.5">
                {unit.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
