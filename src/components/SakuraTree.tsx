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
  /** Indice del sprite pre-renderizado a usar (variedad visual sin costo extra por frame). */
  spriteIndex: number;
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

const COUNTER_UNITS: { key: keyof ElapsedTime; label: string }[] = [
  { key: 'days', label: 'Días' },
  { key: 'hours', label: 'Horas' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Seg' },
];

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

function calculateGrowths(startDate: string): { branchGrowth: number; rootGrowth: number } {
  const elapsedHours = Math.max(0, (Date.now() - new Date(startDate).getTime()) / 3_600_000);
  const elapsedYears = elapsedHours / 8_760;

  const BRANCH_BASE = 0.55;
  const BRANCH_RANGE = 0.42;
  const BRANCH_HALF_LIFE_YEARS = 12;
  const branchSlow = elapsedYears / (elapsedYears + BRANCH_HALF_LIFE_YEARS);
  const branchGrowth = clamp(BRANCH_BASE + BRANCH_RANGE * branchSlow, 0, 1);

  const ROOT_DELAY_YEARS = 1.0;
  const ROOT_HALF_LIFE_YEARS = 15;
  const yearsIntoRoots = Math.max(0, elapsedYears - ROOT_DELAY_YEARS);
  const rootGrowth = clamp(yearsIntoRoots / (yearsIntoRoots + ROOT_HALF_LIFE_YEARS), 0, 1);

  return { branchGrowth, rootGrowth };
}

function calculateActivePetals(startDate: string, petalUnit: 'minute' | 'hour', maxFallingPetals: number): number {
  const totalMs = Math.max(0, Date.now() - new Date(startDate).getTime());
  const units = petalUnit === 'minute'
    ? Math.floor(totalMs / 60_000)
    : Math.floor(totalMs / 3_600_000);
  const fiftyYearsUnits = petalUnit === 'minute' ? 50 * 365 * 24 * 60 : 50 * 365 * 24;
  const normalized = Math.pow(Math.min(units / fiftyYearsUnits, 1), 1 / 3);
  return clamp(Math.floor(normalized * maxFallingPetals), 1, maxFallingPetals);
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
 * Genera un sistema de raíces orgánico y viejo inspirado en la imagen de referencia.
 * Crea alas horizontales superficiales pesadas y un bulbo central denso y retorcido.
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

  // Incrementamos a 10 cables principales para generar la densidad masiva de la imagen
  const ROOT_COUNT = 10;

  function growBranch(
    x: number, y: number,
    angleDeg: number,
    length: number, width: number,
    depth: number, parentBirth: number,
    localSeed: number
  ): void {
    let s = localSeed;

    // Alta tortuosidad: ondulación sinoidal determinista para simular nudos en madera vieja
    const wave = Math.sin(depth * 2.5 + seededRandom(s++) * Math.PI) * 14;
    const adjustedAngle = angleDeg + wave;

    const angleRad = (adjustedAngle * Math.PI) / 180;
    const x2 = x + Math.cos(angleRad) * length;
    const y2 = y + Math.abs(Math.sin(angleRad)) * length; // Forzar crecimiento subterráneo

    // Desplazamiento orgánico agresivo en los puntos de control intermedios (Gnarling)
    const jitterX = (seededRandom(s++) - 0.5) * width * 2.2;
    const jitterY = (seededRandom(s++) - 0.2) * width * 1.6;
    const cpx = (x + x2) / 2 + jitterX;
    const cpy = (y + y2) / 2 + jitterY + width * 0.4;

    const birth = depth === 0 ? 0 : clamp(parentBirth + 0.05 + seededRandom(s++) * 0.05, 0, 0.95);

    segments.push({ x1: x, y1: y, x2, y2, cpx, cpy, width, depth, birth });

    if (depth >= maxDepth || length < 5) {
      tips.push({ x: x2, y: y2 });
      return;
    }

    const lengthRatio = 0.75 - depth * 0.012;
    const widthRatio = 0.72; // Mantiene las raíces robustas y corpóreas
    const isLateral = Math.abs(90 - angleDeg) > 50;

    // Ángulos base entrelazados
    let childAngle1 = adjustedAngle + (14 + seededRandom(s++) * 16);
    let childAngle2 = adjustedAngle - (14 + seededRandom(s++) * 16);

    // Efecto de Vasija/Bulbo: El núcleo se ensancha externamente a medida que baja
    if (!isLateral && depth > 1) {
      childAngle1 += x2 > 0 ? 6 : -6;
      childAngle2 += x2 > 0 ? -6 : 6;
    }

    // Control de ramificación densa
    const branchThresh = depth < 3 ? 0.32 : 0.58;

    if (seededRandom(s++) > branchThresh) {
      growBranch(x2, y2, childAngle1, length * lengthRatio, width * widthRatio, depth + 1, birth, s * 7 + i7);
      growBranch(x2, y2, childAngle2, length * lengthRatio * 0.9, width * widthRatio, depth + 1, birth, s * 13 + i13);
    } else {
      const singleAngle = adjustedAngle + (seededRandom(s++) - 0.5) * 18;
      growBranch(x2, y2, singleAngle, length * lengthRatio * 1.05, width * widthRatio * 0.9, depth + 1, birth, s * 5 + i5);
    }

    // Filamentos verticales internos (reproduce la densa masa del centro de la imagen)
    if (depth < 4 && seededRandom(s++) > 0.76) {
      const dropAngle = 90 + (seededRandom(s++) - 0.5) * 25;
      growBranch(x2, y2, dropAngle, length * lengthRatio * 0.65, width * widthRatio * 0.45, depth + 1, birth, s * 19 + i19);
    }
  }

  // Identificadores fijos para semillas de soporte interno
  const i7 = 7, i13 = 13, i5 = 5, i19 = 19;

  for (let i = 0; i < ROOT_COUNT; i++) {
    const rootSeed = seedOffset + i * 1100;
    let startAngle = 90;
    let startWidth = initialWidth * (0.85 + seededRandom(rootSeed) * 0.35);
    let startLength = initialLength * (0.95 + seededRandom(rootSeed + 1) * 0.25);

    if (i === 0 || i === 1) {
      // 1. Grandes alas horizontales superficiales justo debajo del césped
      startAngle = i === 0 ? 6 + seededRandom(rootSeed) * 12 : 174 - seededRandom(rootSeed) * 12;
      startWidth *= 1.4; // Súper masivas en la base del tronco
      startLength *= 1.15;
    } else {
      // 2. Núcleo en forma de bulbo que cae de forma distribuida
      const progress = (i - 2) / (ROOT_COUNT - 3);
      startAngle = 38 + progress * 104 + (seededRandom(rootSeed) - 0.5) * 12;
    }

    growBranch(0, 0, startAngle, startLength, startWidth, 0, 0, rootSeed + 500);
  }

  return { segments, tips };
}

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

const FLOWER_SPRITE_VARIANTS = 6;
const FLOWER_SPRITE_SIZE = 48;

function createFlowerSprites(): HTMLCanvasElement[] {
  const size = FLOWER_SPRITE_SIZE;
  const r = size / 2;

  const base = document.createElement('canvas');
  base.width = size;
  base.height = size;
  const baseCtx = base.getContext('2d')!;

  const gradient = baseCtx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, 'rgba(255, 241, 244, 1)');
  gradient.addColorStop(0.65, 'rgba(244, 160, 178, 0.95)');
  gradient.addColorStop(1, 'rgba(225, 110, 138, 0)');
  baseCtx.fillStyle = gradient;

  baseCtx.translate(r, r);
  baseCtx.beginPath();
  baseCtx.moveTo(0, 0);
  baseCtx.bezierCurveTo(-r, -r, -r, r / 2, 0, r);
  baseCtx.bezierCurveTo(r, r / 2, r, -r, 0, 0);
  baseCtx.fill();

  const variants: HTMLCanvasElement[] = [];
  for (let i = 0; i < FLOWER_SPRITE_VARIANTS; i++) {
    const variant = document.createElement('canvas');
    variant.width = size;
    variant.height = size;
    const vCtx = variant.getContext('2d')!;
    vCtx.translate(r, r);
    vCtx.rotate((i / FLOWER_SPRITE_VARIANTS) * Math.PI * 2);
    vCtx.translate(-r, -r);
    vCtx.drawImage(base, 0, 0);
    variants.push(variant);
  }

  return variants;
}

function growFlowers(branches: SkeletonSegment[], tips: { x: number; y: number }[], targetCount: number, seedOffset: number, flowerRadius: number): FlowerSeed[] {
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
      radius: flowerRadius + seededRandom(seed * 7) * flowerRadius * 1.5,
      birth: clamp(0.56 + seededRandom(seed * 8) * 0.22, 0, 0.78),
      swayPhase: seededRandom(seed * 9) * Math.PI * 2,
      swaySpeed: 0.3 + seededRandom(seed * 10) * 0.35,
      warmth: seededRandom(seed * 11),
      spriteIndex: Math.floor(seededRandom(seed * 13) * FLOWER_SPRITE_VARIANTS),
    });
  }

  return flowers;
}

function buildTreeStructure(cfg: SakuraTreeConfig): TreeStructure {
  const trunk = growBranches({ maxDepth: cfg.maxBranchDepth, initialLength: cfg.trunkInitialLength, initialWidth: cfg.trunkInitialWidth, seedOffset: 17 });
  const roots = growRoots({ maxDepth: cfg.maxRootDepth, initialLength: cfg.rootInitialLength, initialWidth: cfg.rootInitialWidth, seedOffset: 941 });
  const flowers = growFlowers(trunk.segments, trunk.tips, cfg.totalFlowerSeeds, 311, cfg.flowerRadius);

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

function computeFitScale(canvasWidth: number, canvasHeight: number, bounds: TreeStructure['bounds']): number {
  const widthSpan = Math.max(Math.abs(bounds.left), Math.abs(bounds.right), 1);
  const topSpan = Math.max(Math.abs(bounds.top), 1);
  const bottomSpan = Math.max(Math.abs(bounds.bottom), 1);

  const scaleForWidth = (canvasWidth * 0.46) / widthSpan;
  const scaleForCanopy = (canvasHeight * 0.42) / topSpan;
  const scaleForRoots = (canvasHeight * 0.4) / bottomSpan;

  return Math.min(scaleForWidth, scaleForCanopy, scaleForRoots);
}

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

function drawSkeleton(ctx: CanvasRenderingContext2D, segments: SkeletonSegment[], growth: number, isRoot: boolean, maxDepth: number): void {
  const t = (growth - 0.5) / 0.5;
  const thicknessBoost = isRoot
    ? 0.18 + Math.pow(Math.max(0, t), 1.8) * 1.6
    : 0.22 + Math.pow(Math.max(0, t), 1.6) * 2.8;
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

function drawFlowers(ctx: CanvasRenderingContext2D, flowers: FlowerSeed[], growth: number, time: number, sprites: HTMLCanvasElement[]): void {
  const transitionWidth = 0.18;

  for (const flower of flowers) {
    if (growth < flower.birth) continue;

    const localProgress = clamp((growth - flower.birth) / transitionWidth, 0, 1);
    const currentRadius = flower.radius * localProgress;
    if (currentRadius <= 0) continue;

    const swayX = Math.sin(time * flower.swaySpeed + flower.swayPhase) * 1.4;
    const swayY = Math.cos(time * flower.swaySpeed * 0.8 + flower.swayPhase) * 0.8;

    const diameter = currentRadius * 2;
    ctx.globalAlpha = 0.75 + flower.warmth * 0.2;
    ctx.drawImage(
      sprites[flower.spriteIndex],
      flower.x + swayX - currentRadius,
      flower.y + swayY - currentRadius,
      diameter,
      diameter
    );
  }

  ctx.globalAlpha = 1;
}

function createFallingPetal(width: number, height: number, seed: number, petalSize: number, spawnFraction: number): FallingPetal {
  const maxSpawn = Math.min(spawnFraction + 0.35, 0.48);
  const spawnY = height * (spawnFraction + seededRandom(seed * 2) * (maxSpawn - spawnFraction));
  const sizeVariance = petalSize * 0.6 + seededRandom(seed * 5) * petalSize * 0.8;
  return {
    x: width * (0.15 + seededRandom(seed) * 0.70),
    y: spawnY,
    vy: 18 + seededRandom(seed * 3) * 20,
    vx: -8 + seededRandom(seed * 4) * 16,
    size: sizeVariance,
    rotation: seededRandom(seed * 6) * Math.PI * 2,
    rotationSpeed: -1.2 + seededRandom(seed * 7) * 2.4,
    swayPhase: seededRandom(seed * 8) * Math.PI * 2,
    swaySpeed: 0.5 + seededRandom(seed * 9) * 0.6,
  };
}

function updateAndDrawPetals(
  ctx: CanvasRenderingContext2D,
  petals: FallingPetal[],
  activeCount: number,
  width: number,
  height: number,
  deltaSeconds: number,
  time: number,
  petalSize: number,
  spawnFraction: number
): void {
  const horizonY = height / 2;
  const fadeStartY = horizonY * 0.70;
  const fadeRange = horizonY - fadeStartY;

  for (let i = 0; i < activeCount; i++) {
    const petal = petals[i];
    petal.y += petal.vy * deltaSeconds;
    petal.x += (petal.vx + Math.sin(time * petal.swaySpeed + petal.swayPhase) * 10) * deltaSeconds;
    petal.rotation += petal.rotationSpeed * deltaSeconds;

    const reachedGround = petal.y >= horizonY;
    const leftViewport = petal.x < -20 || petal.x > width + 20;
    if (reachedGround || leftViewport) {
      const respawned = createFallingPetal(width, height, Math.random() * 10_000, petalSize, spawnFraction);
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
    Array.from({ length: treeConfig.maxFallingPetals }, (_, i) =>
      createFallingPetal(400, 400, i + 1, treeConfig.fallingPetalSize, treeConfig.petalSpawnHeightFraction)
    )
  );
  const metricsRef = useRef<CanvasMetrics>({ width: 0, height: 0, dpr: 1, scale: 1 });
  const lastTimestampRef = useRef<number | null>(null);
  const clockRef = useRef(0);

  const [elapsed, setElapsed] = useState<ElapsedTime>(() => calculateElapsedTime(startDate));
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => setElapsed(calculateElapsedTime(startDate)), 1000);
    return () => clearInterval(intervalId);
  }, [startDate]);

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

  // Bucle principal optimizado: Inicializa sprites y gestiona el IntersectionObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const container = containerRef.current;
    if (!canvas || !ctx || !container) return;

    // Instanciamos los sprites una única vez para toda la vida útil del montaje
    const flowerSprites = createFlowerSprites();
    let isRunning = false;

    const renderFrame = (timestamp: number) => {
      if (!isRunning) return;

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

      if (rootGrowth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(-width / scale, 0, (width / scale) * 2, height / scale);
        ctx.clip();
        const deepestRootY = structure.roots.reduce((deepest, segment) => Math.max(deepest, segment.y2), 40);
        drawRootGlow(ctx, 0, deepestRootY * 0.85, deepestRootY * 0.7, rootGrowth);
        drawSkeleton(ctx, structure.roots, rootGrowth, true, treeConfig.maxRootDepth);
        ctx.restore();
      }
      
      drawSkeleton(ctx, structure.branches, branchGrowth, false, treeConfig.maxBranchDepth);
      
      // FIX CRÍTICO: Pasamos los sprites instanciados como 5to argumento
      drawFlowers(ctx, structure.flowers, branchGrowth, clockRef.current, flowerSprites);

      ctx.restore();

      const activePetalCount = calculateActivePetals(startDate, treeConfig.petalUnit, treeConfig.maxFallingPetals);
      updateAndDrawPetals(ctx, petalsRef.current, activePetalCount, width, height, deltaSeconds, clockRef.current, treeConfig.fallingPetalSize, treeConfig.petalSpawnHeightFraction);

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        lastTimestampRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(renderFrame);
      }
    };

    const stopLoop = () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    // Pausa el canvas por completo en el teléfono cuando no se está viendo el árbol
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { rootMargin: '150px' }
    );

    const startTimer = setTimeout(() => {
      observer.observe(container);
    }, 80);

    return () => {
      clearTimeout(startTimer);
      observer.disconnect();
      stopLoop();
    };
  }, [startDate, treeConfig]);

  return (
    <div ref={containerRef} className="relative w-full max-w-[420px] aspect-[4/5] mx-auto select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block rounded-xl overflow-hidden" />

      <button
        type="button"
        onClick={() => setShowInfo((v) => !v)}
        aria-label="Información sobre el árbol"
        className="absolute top-3 left-3 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[#E8A598] border border-[#E8A598]/30 bg-[#130D0F]/60 hover:bg-[#E8A598]/15 hover:border-[#E8A598]/60 transition-all duration-300 backdrop-blur-sm text-xs font-mono font-bold shadow-lg"
      >
        !
      </button>

      <button
        type="button"
        onClick={() => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          // Composite: clone canvas y pinta el contador de días encima antes de exportar
          const exportCanvas = document.createElement('canvas');
          exportCanvas.width = canvas.width;
          exportCanvas.height = canvas.height;
          const exportCtx = exportCanvas.getContext('2d')!;

          // Copia el frame actual
          exportCtx.drawImage(canvas, 0, 0);

          // Calcula días y prepara texto
          const dpr = metricsRef.current.dpr;
          const days = elapsed.days;
          const daysLabel = days === 1 ? 'día juntos' : 'días juntos';
          const line1 = String(days).padStart(3, '0');
          const line2 = daysLabel.toUpperCase();

          // Escala para DPR
          const px = (n: number) => Math.round(n * dpr);

          // Posición: esquina inferior izquierda (sobre las raíces)
          const padX = px(14);
          const padY = px(14);
          const boxW = px(80);
          const boxH = px(40);
          const x = padX;
          const y = canvas.height - padY - boxH;

          // Fondo semitransparente
          exportCtx.save();
          exportCtx.globalAlpha = 0.62;
          exportCtx.fillStyle = '#130D0F';
          const radius = px(8);
          exportCtx.beginPath();
          exportCtx.moveTo(x + radius, y);
          exportCtx.lineTo(x + boxW - radius, y);
          exportCtx.quadraticCurveTo(x + boxW, y, x + boxW, y + radius);
          exportCtx.lineTo(x + boxW, y + boxH - radius);
          exportCtx.quadraticCurveTo(x + boxW, y + boxH, x + boxW - radius, y + boxH);
          exportCtx.lineTo(x + radius, y + boxH);
          exportCtx.quadraticCurveTo(x, y + boxH, x, y + boxH - radius);
          exportCtx.lineTo(x, y + radius);
          exportCtx.quadraticCurveTo(x, y, x + radius, y);
          exportCtx.closePath();
          exportCtx.fill();
          exportCtx.globalAlpha = 1;

          // Número grande de días
          exportCtx.font = `bold ${px(18)}px monospace`;
          exportCtx.fillStyle = '#FFFDFD';
          exportCtx.textAlign = 'center';
          exportCtx.textBaseline = 'middle';
          exportCtx.fillText(line1, x + boxW / 2, y + boxH * 0.38);

          // Etiqueta pequeña
          exportCtx.font = `${px(6)}px monospace`;
          exportCtx.fillStyle = '#E8A598';
          exportCtx.letterSpacing = `${px(1)}px`;
          exportCtx.fillText(line2, x + boxW / 2, y + boxH * 0.72);

          exportCtx.restore();

          const link = document.createElement('a');
          link.href = exportCanvas.toDataURL('image/png');
          link.download = 'nuestro_arbol_sakura.png';
          link.click();
        }}
        aria-label="Guardar árbol como imagen"
        className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[#E8A598] border border-[#E8A598]/30 bg-[#130D0F]/60 hover:bg-[#E8A598]/15 hover:border-[#E8A598]/60 transition-all duration-300 backdrop-blur-sm shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
      </button>

      {showInfo && (
        <div
          className="absolute top-12 left-3 z-30 rounded-2xl p-4 max-w-[84%] shadow-2xl"
          style={{
            background: 'rgba(19, 13, 15, 0.82)',
            border: '1px solid rgba(232, 165, 152, 0.18)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <button
            type="button"
            onClick={() => setShowInfo(false)}
            aria-label="Cerrar"
            className="absolute top-2 right-2.5 text-[#8C7565] hover:text-[#E8A598] text-xs transition-colors duration-200"
          >
            ✕
          </button>

          <p className="text-[10px] font-mono tracking-widest text-[#E8A598] uppercase mb-2">
            Sobre el árbol
          </p>
          <p className="text-[11px] sm:text-xs text-[#C9BFB8] font-serif font-light leading-relaxed">
            Este árbol sakura crece contigo. Sus ramas, raíces y pétalos aparecen y se expanden
            conforme el tiempo de nuestra relación avanza. Cuanto más pase, más frondoso y
            espectacular será. Hoy apenas florece… pero tiene toda la eternidad por delante.
          </p>

          {treeConfig.treeMaxImage && (
            <div className="mt-3">
              <p className="text-[9px] font-mono tracking-widest text-[#62464D] uppercase mb-1.5">
                Así lucirá cuando madure
              </p>
              <img
                src={treeConfig.treeMaxImage}
                alt="Árbol en su máximo desarrollo"
                className="w-full rounded-xl object-cover opacity-85"
                style={{ maxHeight: 200 }}
              />
            </div>
          )}
        </div>
      )}

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