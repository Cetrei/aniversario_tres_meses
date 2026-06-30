import { useState, useEffect, useRef, useCallback } from 'react';
import { CONFIG } from './config';
import FadeInSection from './components/FadeInSection';
import Timeline from './components/Timeline';
import SakuraTree from './components/SakuraTree';
import SmileSlider from './components/SmileSlider';
import Buseta from './components/Buseta';
import Gallery from './components/Gallery';
import DateRoulette from './components/DateRoulette';

// HELPERS
function getMonthsElapsed(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) {
    months--;
  } else if (now.getDate() === start.getDate() && now.getHours() < start.getHours()) {
    months--;
  } else if (now.getDate() === start.getDate() && now.getHours() === start.getHours() && now.getMinutes() < start.getMinutes()) {
    months--;
  }
  return months;
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

function getTimeUntil3Months(startDate: string): { days: number; hours: number; minutes: number; seconds: number; totalMs: number; hasReached: boolean } {
  const start = new Date(startDate);
  const target = new Date(start);
  target.setMonth(target.getMonth() + 3);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, hasReached: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, totalMs: diff, hasReached: false };
}

function getNextMilestone(startDate: string): { daysLeft: number; nextLabel: string } {
  const start = new Date(startDate);
  const now = new Date();
  const monthsElapsed = getMonthsElapsed(startDate);
  const nextMonths = monthsElapsed + 1;
  const nextDate = new Date(start);
  nextDate.setMonth(nextDate.getMonth() + nextMonths);
  const diffMs = nextDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  let nextLabel: string;
  if (nextMonths < 12) {
    nextLabel = `${nextMonths} ${nextMonths === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.floor(nextMonths / 12);
    const rem = nextMonths % 12;
    if (rem === 0) {
      nextLabel = `${years} ${years === 1 ? 'año' : 'años'}`;
    } else {
      nextLabel = `${years} ${years === 1 ? 'año' : 'años'} y ${rem} ${rem === 1 ? 'mes' : 'meses'}`;
    }
  }
  return { daysLeft, nextLabel };
}

function getTimeOfDayGreeting(cfg: typeof CONFIG): string | null {
  if (!cfg.greetings.enabled) return null;
  const hour = new Date().getHours();
  let template: string;
  if (hour >= 5 && hour < 12) {
    template = cfg.greetings.morning;
  } else if (hour >= 12 && hour < 19) {
    template = cfg.greetings.afternoon;
  } else {
    template = cfg.greetings.night;
  }
  return template.replace('{name}', cfg.names.to);
}

function WaitingScreen({ startDate }: { startDate: string }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeUntil3Months(startDate));
  const [showReloadPrompt, setShowReloadPrompt] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = getTimeUntil3Months(startDate);
      setTimeLeft(updated);
      if (updated.hasReached && !showReloadPrompt) {
        setShowReloadPrompt(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startDate, showReloadPrompt]);

  const handleReload = () => { window.location.reload(); };
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0608]">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(232,165,152,0.06) 0%, transparent 70%)',
      }} />
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-md">
        <div className="mb-8 opacity-30">
          <svg width="48" height="48" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16,2 C16,2 18,9 16,16 C14,9 16,2 16,2Z" fill="#E8A598" />
            <path d="M16,30 C16,30 14,23 16,16 C18,23 16,30 16,30Z" fill="#E8A598" />
            <path d="M2,16 C2,16 9,14 16,16 C9,18 2,16 2,16Z" fill="#E8A598" />
            <path d="M30,16 C30,16 23,18 16,16 C23,14 30,16 30,16Z" fill="#E8A598" />
            <circle cx="16" cy="16" r="3" fill="#FFFDFD" opacity="0.6" />
          </svg>
        </div>
        {!showReloadPrompt ? (
          <>
            <p className="text-3xl sm:text-5xl font-serif font-light text-[#FFFDFD] tracking-tight leading-tight mb-2">Aún no es momento</p>
            <p className="text-lg sm:text-xl font-serif italic text-[#E8A598] tracking-tight leading-tight mb-8">Tienes que esperar a que cumplamos 3 meses juntos</p>
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              {[{ value: timeLeft.days, label: 'Días' }, { value: timeLeft.hours, label: 'Horas' }, { value: timeLeft.minutes, label: 'Min' }, { value: timeLeft.seconds, label: 'Seg' }].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#1C1216] border border-[#4E313C]/30 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-mono font-light text-[#FFFDFD]">{pad(item.value)}</span>
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-[#62464D] uppercase mt-2">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#62464D] font-mono tracking-wide max-w-xs leading-relaxed">te hice esta sorpresa con mucho cariño. Vuelve cuando el tiempo esté completo.</p>
          </>
        ) : (
          <>
            <p className="text-3xl sm:text-5xl font-serif font-light text-[#FFFDFD] tracking-tight leading-tight mb-2">¡Llegó el momento!</p>
            <p className="text-lg sm:text-xl font-serif italic text-[#E8A598] tracking-tight leading-tight mb-8">Ya cumplimos 3 meses juntos</p>
            <button onClick={handleReload} className="px-8 py-3 rounded-full bg-[#E8A598]/10 border border-[#E8A598]/30 text-[#E8A598] font-serif text-sm tracking-wide hover:bg-[#E8A598]/20 hover:border-[#E8A598]/50 transition-all duration-300 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
              Recargar página
            </button>
            <p className="text-[10px] text-[#62464D] font-mono tracking-wide mt-4">Presiona el botón para descubrir la sorpresa</p>
          </>
        )}
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2" style={{ opacity: 0.25 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16,2 C16,2 18,9 16,16 C14,9 16,2 16,2Z" fill="#E8A598" />
          <path d="M16,30 C16,30 14,23 16,16 C18,23 16,30 16,30Z" fill="#E8A598" />
          <path d="M2,16 C2,16 9,14 16,16 C9,18 2,16 2,16Z" fill="#E8A598" />
          <path d="M30,16 C30,16 23,18 16,16 C23,14 30,16 30,16Z" fill="#E8A598" />
          <circle cx="16" cy="16" r="3" fill="#FFFDFD" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

function TreeConstellation() {
  const stars = [
    { cx: 12, cy: 8, r: 2.0, o: 0.35 }, { cx: 28, cy: 15, r: 1.5, o: 0.25 },
    { cx: 45, cy: 5, r: 2.5, o: 0.40 }, { cx: 62, cy: 18, r: 1.8, o: 0.30 },
    { cx: 78, cy: 7, r: 2.2, o: 0.38 }, { cx: 88, cy: 22, r: 1.4, o: 0.22 },
    { cx: 18, cy: 35, r: 1.8, o: 0.28 }, { cx: 55, cy: 30, r: 1.2, o: 0.20 },
    { cx: 82, cy: 38, r: 2.3, o: 0.32 }, { cx: 35, cy: 42, r: 1.6, o: 0.26 },
    { cx: 68, cy: 45, r: 1.9, o: 0.30 }, { cx: 8, cy: 48, r: 1.7, o: 0.27 },
    { cx: 92, cy: 12, r: 1.3, o: 0.21 }, { cx: 5, cy: 25, r: 1.4, o: 0.23 },
    { cx: 95, cy: 32, r: 1.8, o: 0.28 }, { cx: 22, cy: 2, r: 1.1, o: 0.18 },
    { cx: 72, cy: 28, r: 1.6, o: 0.25 }, { cx: 42, cy: 20, r: 2.1, o: 0.35 },
    { cx: 85, cy: 44, r: 1.3, o: 0.22 }, { cx: 15, cy: 40, r: 1.7, o: 0.27 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 55% 50% at 50% 40%, rgba(232,165,152,0.12) 0%, rgba(120,60,75,0.05) 50%, transparent 75%)',
      }} />
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} aria-hidden="true">
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.cx}%`} cy={`${s.cy}%`} r={s.r}
            fill={`rgba(232,165,152,${s.o})`}
            className="hidden md:block"
            style={{ animation: `twinkle ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite alternate` }}
          />
        ))}
        {stars.slice(0, 10).map((s, i) => (
          <circle key={`m-${i}`} cx={`${s.cx}%`} cy={`${s.cy}%`} r={s.r}
            fill={`rgba(232,165,152,${s.o * 0.7})`}
            className="md:hidden"
          />
        ))}
      </svg>
    </div>
  );
}

function LetterPaperGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      zIndex: 1,
      background: 'radial-gradient(ellipse 55% 65% at 50% 45%, rgba(255,200,160,0.30) 0%, rgba(220, 140, 100, 0.06) 40%, rgba(160, 89, 70, 0.03) 65%, transparent 85%)',
    }} />
  );
}

function GalleryPetals() {
  type PetalEntry = {
    pos: 'left' | 'right';
    x: string;
    y: string;
    w: number;
    rot: number;
    o: number;
    mobileOnly?: boolean;
  };
  const petals: PetalEntry[] = [
    { pos: 'left',  x: '2%', y: '15%', w: 22, rot:  25, o: 0.45 },
    { pos: 'left',  x: '6%', y: '35%', w: 18, rot: -15, o: 0.38 },
    { pos: 'left',  x: '3%', y: '55%', w: 24, rot:  40, o: 0.42 },
    { pos: 'left',  x: '8%', y: '75%', w: 20, rot: -30, o: 0.35 },
    { pos: 'left',  x: '4%', y: '90%', w: 16, rot:  12, o: 0.40 },
    { pos: 'right', x: '2%', y: '12%', w: 20, rot: -20, o: 0.42 },
    { pos: 'right', x: '6%', y: '32%', w: 26, rot:  15, o: 0.35 },
    { pos: 'right', x: '3%', y: '52%', w: 18, rot: -40, o: 0.45 },
    { pos: 'right', x: '8%', y: '72%', w: 22, rot:  30, o: 0.38 },
    { pos: 'right', x: '4%', y: '88%', w: 19, rot: -10, o: 0.40 },
    { pos: 'left',  x: '1%', y: '30%', w: 13, rot:  20, o: 0.28, mobileOnly: true },
    { pos: 'left',  x: '1%', y: '65%', w: 11, rot: -10, o: 0.25, mobileOnly: true },
    { pos: 'right', x: '1%', y: '35%', w: 13, rot: -20, o: 0.28, mobileOnly: true },
    { pos: 'right', x: '1%', y: '70%', w: 11, rot:  10, o: 0.25, mobileOnly: true },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} aria-hidden="true">
      {petals.map((p, i) => (
        <div
          key={i}
          className={p.mobileOnly ? 'sm:hidden' : 'hidden sm:block'}
          style={{
            position: 'absolute',
            [p.pos]: p.x,
            top: p.y,
            width: p.w,
            height: Math.round(p.w * 0.6),
            background: '#E8A598',
            borderRadius: '50%',
            transform: `translateY(-50%) rotate(${p.rot}deg)`,
            opacity: p.o,
          }}
        />
      ))}
    </div>
  );
}

// ============ UTILIDAD DE SONIDO ============
function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), duration * 1000 + 100);
  } catch (e) {}
}

function playStepSound(stepIndex: number) {
  if (stepIndex === 0) playTone(880, 0.25, 'sine', 0.25);
  else if (stepIndex === 1) playTone(660, 0.35, 'sine', 0.25);
  else if (stepIndex === 2) {
    playTone(523, 0.3, 'sine', 0.2);
    setTimeout(() => playTone(659, 0.3, 'sine', 0.2), 150);
    setTimeout(() => playTone(784, 0.4, 'sine', 0.25), 300);
    setTimeout(() => playTone(1047, 0.6, 'sine', 0.2), 500);
  }
}

function playUnlockSound() {
  playTone(523, 0.2, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.2, 'sine', 0.2), 100);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 200);
  setTimeout(() => playTone(1047, 0.5, 'sine', 0.25), 300);
  setTimeout(() => playTone(1319, 0.8, 'sine', 0.2), 500);
}

function LetterSeal({ cfg, onUnlock }: { cfg: typeof CONFIG; onUnlock: () => void }) {
  const [angle, setAngle] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const draggingRef = useRef(false);
  const sealRef = useRef<HTMLDivElement | null>(null);
  const unlockedRef = useRef(false);
  const holdStartRef = useRef<number | null>(null);
  const delayStartRef = useRef<number | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const steps = cfg.easterEgg.sealSteps;

  const angleFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = sealRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - cy, clientX - cx);
    let deg = (rad * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return deg;
  }, []);

  const normalizeAngle = (a: number) => ((a % 360) + 360) % 360;

  const angleDiff = (a: number, b: number) => {
    let diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    if (diff > 180) diff = 360 - diff;
    return diff;
  };

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    holdStartRef.current = null;
    delayStartRef.current = null;
    setStepProgress(0);
  }, []);

  const completeStep = useCallback((stepIndex: number) => {
    playStepSound(stepIndex);
    setCompletedSteps(prev => [...prev, stepIndex]);
    setShowHint(steps[stepIndex].hintText || null);
    setTimeout(() => setShowHint(null), 3000);
    
    if (stepIndex === steps.length - 1) {
      unlockedRef.current = true;
      playUnlockSound();
      setTimeout(() => onUnlock(), 800);
    } else {
      setCurrentStep(stepIndex + 1);
    }
  }, [steps, onUnlock]);

  const checkStep = useCallback((currentAngle: number) => {
    if (!cfg.easterEgg.enabled || unlockedRef.current) return;
    if (currentStep >= steps.length) return;

    const step = steps[currentStep];
    const diff = angleDiff(currentAngle, step.targetAngle);

    if (diff <= step.toleranceDeg) {
      if (delayStartRef.current === null && holdStartRef.current === null) {
        delayStartRef.current = Date.now();
        delayTimerRef.current = setTimeout(() => {
          delayStartRef.current = null;
          holdStartRef.current = Date.now();
          holdTimerRef.current = setInterval(() => {
            const elapsed = (Date.now() - (holdStartRef.current || 0)) / 1000;
            const progress = Math.min(100, (elapsed / step.holdSeconds) * 100);
            setStepProgress(progress);
            
            if (elapsed >= step.holdSeconds) {
              clearHoldTimer();
              completeStep(currentStep);
            }
          }, 50);
        }, 1500);
      }
    } else {
      clearHoldTimer();
    }
  }, [cfg.easterEgg.enabled, steps, currentStep, clearHoldTimer, completeStep]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!draggingRef.current) return;
    const deg = angleFromPointer(clientX, clientY);
    setAngle(deg);
    checkStep(deg);
  }, [angleFromPointer, checkStep]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const stopDrag = () => { 
      draggingRef.current = false; 
      clearHoldTimer();
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchend', stopDrag);
      clearHoldTimer();
    };
  }, [handleMove, clearHoldTimer]);

  const startDrag = () => { 
    if (!hasInteracted) setHasInteracted(true);
    draggingRef.current = true; 
    clearHoldTimer();
  };

  const stepLabels = ["J₁", "J₂", "J&J"];
  const stepColors = ["#E8A598", "#B39DDB", "#FFFDFD"];

  return (
    <div className="flex flex-col items-center mt-5">
      {/* Solo visible después del primer toque */}
      {hasInteracted && (
        <>
          {/* Indicadores de pasos */}
          <div className="flex items-center gap-2 mb-3">
            {steps.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-5 h-5 rounded-full border flex items-center justify-center text-[8px] font-mono transition-all duration-300"
                  style={{
                    borderColor: completedSteps.includes(i) ? stepColors[i] : 'rgba(100,54,71,0.4)',
                    backgroundColor: completedSteps.includes(i) ? `${stepColors[i]}20` : 'transparent',
                    color: completedSteps.includes(i) ? stepColors[i] : '#62464D',
                  }}
                >
                  {stepLabels[i]}
                </div>
                {i < steps.length - 1 && (
                  <div 
                    className="w-4 h-[1px] transition-all duration-500"
                    style={{
                      backgroundColor: completedSteps.includes(i) ? stepColors[i] : 'rgba(78,49,60,0.3)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Barra de progreso del hold actual */}
          {currentStep < steps.length && !unlockedRef.current && (
            <div className="w-10 h-[2px] bg-[#4E313C]/30 rounded-full mb-2 overflow-hidden relative">
              {delayStartRef.current !== null && holdStartRef.current === null && (
                <div 
                className="absolute inset-0 rounded-full"
                style={{ 
                  backgroundColor: stepColors[currentStep],
                  opacity: 0.15,
                  animation: 'subtle-pulse 1.5s ease-in-out infinite',
                }}
              />
              )}
              <div 
                className="h-full rounded-full transition-all duration-100"
                style={{ 
                  width: `${stepProgress}%`,
                  backgroundColor: stepColors[currentStep],
                  opacity: 0.7,
                }}
              />
            </div>
          )}

          {/* Pista flotante al completar paso */}
          {showHint && (
            <div className="text-[9px] font-mono tracking-wider text-[#E8A598]/80 mb-2 animate-pulse">
              {showHint}
            </div>
          )}
        </>
      )}

      {/* Sello circular — siempre visible */}
      <div
        ref={sealRef}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        className="w-10 h-10 rounded-full border flex items-center justify-center select-none relative"
        style={{
          borderColor: unlockedRef.current ? 'rgba(232,165,152,0.6)' : 'rgb(100, 54, 71)',
          opacity: 0.7,
          transform: `rotate(${angle}deg)`,
          cursor: cfg.easterEgg.enabled ? 'grab' : 'default',
          touchAction: 'none',
          boxShadow: unlockedRef.current ? '0 0 15px rgba(232,165,152,0.3)' : 'none',
        }}>
        <span className="text-[9px] font-mono tracking-widest" style={{ color: 'rgb(122, 108, 113)' }}>J & J</span>
        {/* Punto indicador de dirección — solo después del primer toque */}
        {hasInteracted && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
            style={{ 
              backgroundColor: stepColors[currentStep] || '#E8A598',
              opacity: 0.8,
            }}
          />
        )}
      </div>

      {/* Texto guía — solo después del primer toque */}
      {hasInteracted && !unlockedRef.current && currentStep < steps.length && (
        <p className="text-[7px] font-mono tracking-widest text-[#62464D]/60 mt-2 uppercase">
          {currentStep === 0 && "En veces recordar el inicio es la clave"}
          {currentStep === 1 && "¿Recuerdas cuándo todo floreció?"}
          {currentStep === 2 && "Nuestra futura familia de locos son sabios"}
        </p>
      )}
      
      {unlockedRef.current && (
        setTimeout(() => {
          <p className="text-[8px] font-mono tracking-widest text-[#E8A598] mt-2 uppercase animate-pulse">
            ✨ Secreto desbloqueado ✨
          </p>
        }, 2500)
      )}
    </div>
  );
}

function RouletteShimmer() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 1 }} aria-hidden="true">
      <circle cx="50%" cy="50%" r="38%" fill="none" stroke="rgba(78,49,60,0.25)" strokeWidth="1.5" strokeDasharray="10 8"
        className="hidden sm:block" style={{ animation: 'spin-slow 20s linear infinite' }} />
      <circle cx="50%" cy="50%" r="30%" fill="none" stroke="rgba(232,165,152,0.18)" strokeWidth="1" strokeDasharray="6 10"
        className="hidden sm:block" style={{ animation: 'spin-slow-reverse 25s linear infinite' }} />
      <circle cx="50%" cy="50%" r="35%" fill="none" stroke="rgba(78,49,60,0.22)" strokeWidth="1.5" strokeDasharray="8 6"
        className="sm:hidden" style={{ animation: 'spin-slow 20s linear infinite' }} />
    </svg>
  );
}

function SmileSliderDecor() {
  const dots = [
    { cx: '8%',   cy: '18%', r: 3.5, o: 0.15 },
    { cx: '10%',  cy: '36%', r: 2.0, o: 0.11 },
    { cx: '7%',   cy: '54%', r: 4.5, o: 0.13 },
    { cx: '11%',  cy: '70%', r: 2.5, o: 0.12 },
    { cx: '9%',   cy: '84%', r: 3.0, o: 0.14 },
    { cx: '16%',  cy: '26%', r: 2.0, o: 0.08 },
    { cx: '17%',  cy: '46%', r: 3.0, o: 0.10 },
    { cx: '15%',  cy: '64%', r: 2.0, o: 0.08 },
    { cx: '17%',  cy: '78%', r: 2.5, o: 0.09 },
    { cx: '92%',  cy: '18%', r: 3.5, o: 0.15 },
    { cx: '90%',  cy: '36%', r: 2.0, o: 0.11 },
    { cx: '93%',  cy: '54%', r: 4.5, o: 0.13 },
    { cx: '89%',  cy: '70%', r: 2.5, o: 0.12 },
    { cx: '91%',  cy: '84%', r: 3.0, o: 0.14 },
    { cx: '84%',  cy: '26%', r: 2.0, o: 0.08 },
    { cx: '83%',  cy: '46%', r: 3.0, o: 0.10 },
    { cx: '85%',  cy: '64%', r: 2.0, o: 0.08 },
    { cx: '83%',  cy: '78%', r: 2.5, o: 0.09 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block"
      style={{ zIndex: 1 }} aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={`rgba(232,165,152,${d.o})`} />
      ))}
    </svg>
  );
}

function BusetaDecor() {
  const SidePath = ({ flip }: { flip?: boolean }) => (
    <svg
      className="absolute top-0 h-full"
      style={{ [flip ? 'right' : 'left']: '6%', ...(flip ? { transform: 'scaleX(-1)' } : {}) }}
      width="52"
      viewBox="0 0 52 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line x1="26" y1="120" x2="26" y2="880"
        stroke="rgba(78,49,60,0.18)" strokeWidth="1"
        strokeDasharray="2 18" strokeLinecap="round" />
      {[220, 370, 500, 630, 780].map((y, i) => (
        <rect key={i} x={22.5} y={y - 4.5} width={7} height={7}
          fill="rgba(78,49,60,0.22)" transform={`rotate(45 26 ${y})`} rx="0.5" />
      ))}
      <circle cx="26" cy="120" r="2.5" fill="rgba(78,49,60,0.20)" />
      <circle cx="26" cy="880" r="2.5" fill="rgba(78,49,60,0.20)" />
    </svg>
  );
  return (
    <div className="absolute inset-0 pointer-events-none hidden sm:block" style={{ zIndex: 1 }}>
      <SidePath />
      <SidePath flip />
    </div>
  );
} 

// PISTAS ESCONDIDAS
function HiddenHint({ hint }: { hint: { text: string; style: string } }) {
  if (hint.style === 'micro') {
    return (
      <span className="text-[6px] font-mono tracking-[0.4em] text-[#4E313C]/40 uppercase select-none" aria-hidden="true">
        {hint.text}
      </span>
    );
  }
  if (hint.style === 'coords') {
    return (
      <span className="text-[8px] font-mono tracking-widest text-[#62464D]/50 uppercase select-none" aria-hidden="true">
        {hint.text}
      </span>
    );
  }
  if (hint.style === 'symbol') {
    return (
      <span className="text-[9px] font-mono tracking-[0.3em] text-[#62464D]/45 uppercase select-none" aria-hidden="true">
        {hint.text}
      </span>
    );
  }
  if (hint.style === 'acrostic') {
    return (
      <span className="text-[10px] font-serif italic text-[#62464D]/40 select-none" aria-hidden="true">
        {hint.text}
      </span>
    );
  }
  // subtle
  return (
    <span className="text-[8px] font-mono tracking-widest text-[#62464D]/35 uppercase select-none" aria-hidden="true">
      {hint.text}
    </span>
  );
}

// Helper para obtener pistas por ubicación
function getHintsForLocation(location: string, hints: typeof CONFIG.hiddenHints) {
  return hints.filter(h => h.location === location);
}

const INTRO_STEPS = [
  { text: "Usa audifonos", sub: "💌", duration: 1200 },
  { text: 'Para ti.', sub: null, duration: 1400 },
  { text: 'Que eres', sub: 'mi lugar favorito.', duration: 1600 },
  { text: getMonthNumber(getMonthsElapsed(CONFIG.anniversaryDate)) + ' meses', sub: 'de lo mejor.', duration: 1600 },
  { text: 'Mi marinovia', sub: 'la más especial y hermosa.', duration: 2000 },
  { text: null, sub: null, duration: 800 },
];

function CinematicIntro({ onReveal, onDone, introTransitionMs }: { onReveal: () => void; onDone: () => void; introTransitionMs: number }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);

  useEffect(() => {
    if (step >= INTRO_STEPS.length) {
      const revealTimer = setTimeout(() => {
        setLeaving(true);
        onReveal();
        setTimeout(onDone, introTransitionMs);
      }, 200);
      return () => clearTimeout(revealTimer);
    }
    const { duration } = INTRO_STEPS[step];
    setVisible(true);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setStep((s) => s + 1), 500);
    }, duration);
    return () => clearTimeout(hideTimer);
  }, [step, onDone, onReveal, introTransitionMs]);

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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0608]"
      style={{
        transition: `opacity ${introTransitionMs}ms cubic-bezier(0.4,0,0.2,1), transform ${introTransitionMs}ms cubic-bezier(0.4,0,0.2,1)`,
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: leaving ? 'none' : 'all',
      }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(232,165,152,0.06) 0%, transparent 70%)',
      }} />
      {current && (current.text || current.sub) && (
        <div className="text-center px-8 select-none" style={{
          transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        }}>
          {current.text && <p className="text-3xl sm:text-5xl font-serif font-light text-[#FFFDFD] tracking-tight leading-tight">{current.text}</p>}
          {current.sub && <p className="text-3xl sm:text-5xl font-serif italic text-[#E8A598] tracking-tight leading-tight mt-1">{current.sub}</p>}
        </div>
      )}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2" style={{ opacity: 0.25 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16,2 C16,2 18,9 16,16 C14,9 16,2 16,2Z" fill="#E8A598" />
          <path d="M16,30 C16,30 14,23 16,16 C18,23 16,30 16,30Z" fill="#E8A598" />
          <path d="M2,16 C2,16 9,14 16,16 C9,18 2,16 2,16Z" fill="#E8A598" />
          <path d="M30,16 C30,16 23,18 16,16 C23,14 30,16 30,16Z" fill="#E8A598" />
          <circle cx="16" cy="16" r="3" fill="#FFFDFD" opacity="0.6" />
        </svg>
      </div>
      <button type="button" onClick={handleSkip} aria-label="Saltar introducción"
        className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 text-[9px] font-mono tracking-[0.25em] uppercase text-white/20 hover:text-white/55 transition-colors duration-500 select-none"
        style={{ opacity: skipVisible && !leaving ? 1 : 0, transition: 'opacity 0.8s ease, color 0.3s ease' }}>
        Saltar →
      </button>
    </div>
  );
}

function GreetingPopup({ text, shrink, targetTop }: { text: string; shrink: boolean; targetTop: number | null }) {
  const top = targetTop ?? 84;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pointer-events-none px-8" aria-hidden="true">
      <div
        className="relative text-center select-none"
        style={{
          marginTop: shrink ? `${top}px` : '42vh',
          transition: 'margin-top 900ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <p
          className="font-serif font-light text-[#E8A598] whitespace-nowrap"
          style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            opacity: shrink ? 0 : 1,
            transform: shrink ? 'scale(0.55)' : 'scale(1)',
            transition: 'opacity 500ms ease, transform 900ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {text}
        </p>
        <p
          className="absolute inset-0 flex items-center justify-center font-mono tracking-[0.3em] text-[#E8A598]/80 uppercase whitespace-nowrap"
          style={{
            fontSize: '10px',
            opacity: shrink ? 1 : 0,
            transition: 'opacity 500ms ease 350ms',
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function AmbientLights() {
  return (
    <>
      <div className="fixed top-[-8%] right-[-8%] w-[65vw] h-[65vw] rounded-full pointer-events-none z-0 ambient-blob-1"
        style={{ background: 'radial-gradient(circle, rgba(59,31,39,0.22) 0%, transparent 70%)' }} />
      <div className="fixed top-[45%] left-[-18%] w-[55vw] h-[55vw] rounded-full pointer-events-none z-0 ambient-blob-2"
        style={{ background: 'radial-gradient(circle, rgba(232,165,152,0.09) 0%, transparent 70%)' }} />
    </>
  );
}

function BackgroundMusicPlayer({ cfg }: { cfg: typeof CONFIG }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [triedAutoplay, setTriedAutoplay] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = cfg.backgroundMusic.volume;
    }
  }, [cfg.backgroundMusic.volume]);

  useEffect(() => {
    if (!cfg.backgroundMusic.autoplay || triedAutoplay) return;
    setTriedAutoplay(true);
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [cfg.backgroundMusic.autoplay, triedAutoplay]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  if (!cfg.backgroundMusic.enabled || !cfg.backgroundMusic.src) return null;

  return (
    <>
      <audio ref={audioRef} src={cfg.backgroundMusic.src} loop preload="auto" />
      <button type="button" onClick={toggle} aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        className="fixed bottom-4 left-4 z-50 flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
        {isPlaying ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 5v14l11-7z" />
          </svg>
        )}
      </button>
    </>
  );
}

function SideDecoration({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <div className="fixed top-0 h-full w-[120px] pointer-events-none z-10 hidden xl:block" style={{ [isLeft ? 'left' : 'right']: 0 }}>
      <div className="absolute top-0 h-full w-[1px]" style={{
        [isLeft ? 'right' : 'left']: '28px',
        background: 'linear-gradient(to bottom, transparent 5%, rgba(78,49,60,0.18) 20%, rgba(78,49,60,0.25) 50%, rgba(78,49,60,0.18) 80%, transparent 95%)',
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
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
        <path d={isLeft ? 'M28 395 Q18 430 22 460 M22 430 Q10 420 8 408 M22 445 Q12 445 9 435' : 'M92 395 Q102 430 98 460 M98 430 Q110 420 112 408 M98 445 Q108 445 111 435'}
          stroke="rgba(78,49,60,0.22)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
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

function NextMilestoneSection({ anniversaryDate }: { anniversaryDate: string }) {
  const { daysLeft, nextLabel } = getNextMilestone(anniversaryDate);
  if (daysLeft <= 0) return null;
  return (
    <section className="w-full min-h-[42vh] sm:min-h-[38vh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden py-10">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 45% 50% at 50% 50%, rgba(232,165,152,0.08) 0%, transparent 70%)' }} />
      <FadeInSection direction="up" delay={0}>
        <div className="flex flex-col items-center gap-2.5 px-8 sm:px-10 py-6 rounded-2xl border border-[#4E313C]/30 bg-[#1C1216]/40 backdrop-blur-sm">
          <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true" style={{ opacity: 0.55 }}>
            <path d="M16,2 C16,2 18,9 16,16 C14,9 16,2 16,2Z" fill="#E8A598" />
            <path d="M16,30 C16,30 14,23 16,16 C18,23 16,30 16,30Z" fill="#E8A598" />
            <path d="M2,16 C2,16 9,14 16,16 C9,18 2,16 2,16Z" fill="#E8A598" />
            <path d="M30,16 C30,16 23,18 16,16 C23,14 30,16 30,16Z" fill="#E8A598" />
            <circle cx="16" cy="16" r="3" fill="#FFFDFD" opacity="0.6" />
          </svg>
          <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase">Próximo capítulo</span>
          <p className="text-3xl sm:text-4xl font-serif font-bold text-[#FFFDFD] leading-none">{daysLeft}</p>
          <p className="text-xs sm:text-sm font-serif italic text-[#E8A598]">
            {daysLeft === 1 ? 'día' : 'días'} para los {nextLabel}
          </p>
        </div>
      </FadeInSection>
    </section>
  );
}

function downloadLetter(cfg: typeof CONFIG) {
  const lc = cfg.loveLetter;
  const W = 700;
  const lineH = 22;
  const paddingX = 48;
  const bodyMaxW = W - paddingX * 2;

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.font = '14px serif';
  const wrappedBody: string[] = [];
  for (const para of lc.body) {
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (tempCtx.measureText(test).width > bodyMaxW) {
        if (line) wrappedBody.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) wrappedBody.push(line);
    wrappedBody.push('');
  }

  const headerLines = 7;
  const footerLines = 3;
  const sealPad = cfg.decorations.letterSeal ? lineH * 4 : 0;
  const H = (headerLines + wrappedBody.length + footerLines + 3) * lineH + 96 + sealPad;
  const canvasH = Math.max(H, 480);

  function renderToCanvas(sigImg: HTMLImageElement | null) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d')!;

    const bg = ctx.createLinearGradient(0, 0, W * 0.4, canvasH);
    bg.addColorStop(0, '#1C1216');
    bg.addColorStop(1, '#160E12');
    ctx.fillStyle = bg;
    ctx.roundRect(0, 0, W, canvasH, 16);
    ctx.fill();

    ctx.strokeStyle = 'rgba(78,49,60,0.5)';
    ctx.lineWidth = 1;
    ctx.roundRect(0.5, 0.5, W - 1, canvasH - 1, 16);
    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = 0.22;
    const tScale = 1.15;
    ctx.translate(W - 90 * tScale, 0);
    ctx.scale(tScale, tScale);
    const tp = (d: string, fill: string, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.fillStyle = fill;
      ctx.fill(new Path2D(d));
      ctx.restore();
    };
    const ts = (d: string, stroke: string, lw: number, lc2: CanvasLineCap = 'round') => {
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.lineCap = lc2;
      ctx.stroke(new Path2D(d));
      ctx.restore();
    };
    ts('M30 108 Q28 80 26 58', '#7B5EA7', 1.2);
    tp('M26 80 Q14 72 12 60 Q22 66 26 78Z', '#7B5EA7', 0.6);
    tp('M26 58 C20 50 18 38 26 30 C28 38 28 50 26 58Z', '#B39DDB');
    tp('M26 58 C32 50 34 38 26 30 C24 38 24 50 26 58Z', '#9575CD');
    tp('M26 58 C22 52 22 44 26 38 C30 44 30 52 26 58Z', '#CE93D8', 0.7);
    ts('M48 108 Q46 75 44 50', '#7B5EA7', 1.4);
    tp('M44 78 Q34 68 32 54 Q42 62 44 76Z', '#7B5EA7', 0.55);
    tp('M44 50 C36 40 34 25 44 15 C47 25 47 40 44 50Z', '#B39DDB');
    tp('M44 50 C52 40 54 25 44 15 C41 25 41 40 44 50Z', '#9575CD');
    tp('M44 50 C39 43 39 33 44 25 C49 33 49 43 44 50Z', '#CE93D8', 0.7);
    ts('M66 108 Q65 82 63 62', '#7B5EA7', 1.2);
    tp('M63 84 Q73 74 74 60 Q64 68 63 82Z', '#7B5EA7', 0.6);
    tp('M63 62 C57 54 55 42 63 34 C65 42 65 54 63 62Z', '#B39DDB');
    tp('M63 62 C69 54 71 42 63 34 C61 42 61 54 63 62Z', '#9575CD');
    tp('M63 62 C59 56 59 48 63 42 C67 48 67 56 63 62Z', '#CE93D8', 0.7);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.translate(0, canvasH - 75);
    ts('M20 74 Q19 55 18 40', '#7B5EA7', 1.2);
    tp('M18 58 Q8 50 7 38 Q16 44 18 56Z', '#7B5EA7', 0.6);
    tp('M18 40 C12 32 10 20 18 12 C20 20 20 32 18 40Z', '#B39DDB');
    tp('M18 40 C24 32 26 20 18 12 C16 20 16 32 18 40Z', '#9575CD');
    tp('M18 40 C14 34 14 26 18 20 C22 26 22 34 18 40Z', '#CE93D8', 0.7);
    ts('M36 74 Q35 58 34 45', '#7B5EA7', 1.0);
    tp('M34 60 Q42 52 43 42 Q35 48 34 58Z', '#7B5EA7', 0.5);
    tp('M34 45 C29 38 28 28 34 21 C36 28 36 38 34 45Z', '#B39DDB', 0.85);
    tp('M34 45 C39 38 40 28 34 21 C32 28 32 38 34 45Z', '#9575CD', 0.85);
    ctx.restore();

    let y = 44;
    const cx = W / 2;

    ctx.font = '10px monospace';
    ctx.fillStyle = '#62464D';
    ctx.textAlign = 'right';
    ctx.fillText(lc.place.toUpperCase(), W - paddingX, y);
    y += lineH * 1.8;

    ctx.font = '10px monospace';
    ctx.fillStyle = '#8C7565';
    ctx.textAlign = 'left';
    ctx.fillText('PARA:', paddingX, y);
    y += lineH * 0.9;
    ctx.font = 'italic 20px serif';
    ctx.fillStyle = '#E8A598';
    ctx.fillText(lc.to, paddingX, y);
    y += lineH * 1.6;

    ctx.font = '600 14px serif';
    ctx.fillStyle = '#EDE7E5';
    ctx.textAlign = 'left';
    ctx.fillText(lc.greeting, paddingX, y);
    y += lineH * 1.4;

    ctx.font = '14px serif';
    ctx.fillStyle = '#C9BFB8';
    for (const line of wrappedBody) {
      if (line === '') { y += lineH * 0.5; continue; }
      ctx.fillText(line, paddingX, y);
      y += lineH;
    }
    y += lineH;

    ctx.font = 'italic 12px serif';
    ctx.fillStyle = '#8C7565';
    ctx.fillText(lc.farewell, paddingX, y);
    y += lineH * 1.2;

    ctx.font = '600 18px serif';
    ctx.fillStyle = '#E8A598';
    ctx.fillText(lc.signature, paddingX, y);

    if (sigImg) {
      const sigH = 72;
      const sigW = Math.round((sigImg.naturalWidth / sigImg.naturalHeight) * sigH);
      ctx.globalAlpha = 0.9;
      ctx.drawImage(sigImg, W - paddingX - sigW, y - sigH + 10, sigW, sigH);
      ctx.globalAlpha = 1;
    }

    y += lineH * 2;
    ctx.fillStyle = '#4E313C';
    ctx.fillRect(cx - 30, y, 60, 1);

    if (cfg.decorations.letterSeal) {
      y += lineH * 1.8;
      const sealR = 16;
      ctx.save();
      ctx.globalAlpha = 0.70;
      ctx.strokeStyle = 'rgb(100,54,71)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, y + sealR, sealR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.60;
      ctx.font = '8px monospace';
      ctx.fillStyle = 'rgb(180,160,165)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('J & J', cx, y + sealR);
      ctx.restore();
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'carta_de_amor.png';
    link.click();
  }

  if (lc.signatureImage) {
    const img = new Image();
    img.onload = () => renderToCanvas(img);
    img.onerror = () => renderToCanvas(null);
    img.src = lc.signatureImage;
  } else {
    renderToCanvas(null);
  }
}

function navigateToSecret() {
  window.location.hash = '#secreto';
}

function navigateToLetter() {
  window.location.hash = '#letter';
}

function navigateHome() {
  window.location.hash = '';
}

function useIsSecretRoute(): boolean {
  const [isSecret, setIsSecret] = useState(() => window.location.hash === '#secreto');
  useEffect(() => {
    const onHashChange = () => setIsSecret(window.location.hash === '#secreto');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return isSecret;
}

// ============ PÁGINA SECRETA ============
// Ahora regresa a la sección de la carta en lugar de solo limpiar el hash
function SecretPage({ cfg }: { cfg: typeof CONFIG }) {
  const handleReturn = () => {
    navigateHome();
    // Scroll a la sección de la carta después de que el hash se limpie
    setTimeout(() => {
      const letterSection = document.getElementById('letter-section');
      if (letterSection) {
        letterSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0608] overflow-y-auto px-6 py-12">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 55% 45% at 50% 40%, rgba(232,165,152,0.10) 0%, transparent 70%)',
      }} />
      <div className="relative z-10 flex flex-col items-center text-center max-w-md gap-6">
        <div className="opacity-60">
          <svg width="40" height="40" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16,2 C16,2 18,9 16,16 C14,9 16,2 16,2Z" fill="#E8A598" />
            <path d="M16,30 C16,30 14,23 16,16 C18,23 16,30 16,30Z" fill="#E8A598" />
            <path d="M2,16 C2,16 9,14 16,16 C9,18 2,16 2,16Z" fill="#E8A598" />
            <path d="M30,16 C30,16 23,18 16,16 C23,14 30,16 30,16Z" fill="#E8A598" />
            <circle cx="16" cy="16" r="3" fill="#FFFDFD" opacity="0.6" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#FFFDFD] tracking-tight leading-tight">
          {cfg.easterEgg.surpriseTitle}
        </h1>

        {cfg.easterEgg.surpriseImage && (
          <img src={cfg.easterEgg.surpriseImage} alt="Sorpresa especial"
            className="max-w-xs w-full rounded-xl border border-[#4E313C]/30 shadow-2xl shadow-black/50" />
        )}

        <div className="space-y-3 text-[#C9BFB8] font-serif text-sm leading-relaxed font-light">
          {cfg.easterEgg.surpriseMessage.map((paragraph, i) => (<p key={i}>{paragraph}</p>))}
        </div>

        <button type="button" onClick={handleReturn}
          className="mt-2 px-8 py-3 rounded-full bg-[#E8A598]/10 border border-[#E8A598]/30 text-[#E8A598] font-serif text-sm tracking-wide hover:bg-[#E8A598]/20 hover:border-[#E8A598]/50 transition-all duration-300 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Volver a la carta
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [showGreetingPopup, setShowGreetingPopup] = useState(false);
  const [greetingShrink, setGreetingShrink] = useState(false);
  const [greetingDocked, setGreetingDocked] = useState(false);
  const [dockTargetTop, setDockTargetTop] = useState<number | null>(null);
  const dockAnchorRef = useRef<HTMLParagraphElement>(null);
  const isSecretRoute = useIsSecretRoute();

  const monthsElapsed = getMonthsElapsed(CONFIG.anniversaryDate);
  const hasReached3Months = monthsElapsed >= 3;
  const greetingText = CONFIG.greetings.enabled ? getTimeOfDayGreeting(CONFIG) : null;
  const heroReady = !greetingText || greetingDocked;

  useEffect(() => {
    function measure() {
      if (dockAnchorRef.current) {
        setDockTargetTop(dockAnchorRef.current.getBoundingClientRect().top);
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (!introComplete || !greetingText) return;
    setShowGreetingPopup(true);
    const shrinkTimer = setTimeout(() => setGreetingShrink(true), 1300);
    const dockTimer = setTimeout(() => {
      setShowGreetingPopup(false);
      setGreetingDocked(true);
    }, 1300 + 900);
    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(dockTimer);
    };
  }, [introComplete, greetingText]);

  if (!hasReached3Months) {
    return <WaitingScreen startDate={CONFIG.anniversaryDate} />;
  }

  if (isSecretRoute) {
    return <SecretPage cfg={CONFIG} />;
  }

  const scrollBlocked = !introComplete || !!(greetingText && !greetingDocked);

  return (
    <>
      {scrollBlocked && (
        <div 
          className="fixed inset-0 z-[60]"
          style={{ 
            overscrollBehavior: 'none',
            touchAction: 'none',
          }}
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        />
      )}

      {!introComplete && (
        <CinematicIntro
          onReveal={() => setContentVisible(true)}
          onDone={() => setIntroComplete(true)}
          introTransitionMs={CONFIG.timing.introTransitionMs}
        />
      )}

      {showGreetingPopup && greetingText && (
        <GreetingPopup text={greetingText} shrink={greetingShrink} targetTop={dockTargetTop} />
      )}

      <div className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory scroll-smooth bg-[#130D0F] text-[#EDE7E5] font-serif hide-scrollbar relative"
        style={{
          transition: `opacity ${CONFIG.timing.introTransitionMs + 100}ms cubic-bezier(0.4,0,0.2,1)`,
          opacity: contentVisible ? 1 : 0,
        }}>
        <AmbientLights />
        <BackgroundMusicPlayer cfg={CONFIG} />
        <SideDecoration side="left" />
        <SideDecoration side="right" />

        {CONFIG.githubRepoUrl && (
          <a href={CONFIG.githubRepoUrl} target="_blank" rel="noopener noreferrer"
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/10 transition-all duration-300 text-[10px] font-mono tracking-wider backdrop-blur-sm"
            aria-label="Ver código fuente en GitHub">
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

        {/* SECCIÓN 0: Hero */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 52%, rgba(232,165,152,0.10) 0%, transparent 65%)' }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {[{ cx: '12%', cy: '22%', r: 2.5, o: 0.13 }, { cx: '85%', cy: '18%', r: 3.5, o: 0.10 },
              { cx: '7%', cy: '72%', r: 2, o: 0.11 }, { cx: '91%', cy: '67%', r: 3, o: 0.12 },
              { cx: '50%', cy: '89%', r: 2, o: 0.09 }, { cx: '28%', cy: '11%', r: 1.5, o: 0.08 },
              { cx: '72%', cy: '84%', r: 2.5, o: 0.10 }].map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={`rgba(232,165,152,${p.o})`} />
            ))}
          </svg>

          <div className="relative z-10 flex flex-col items-center text-center gap-5 max-w-lg">
            {greetingText && (
              <p
                ref={dockAnchorRef}
                className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] text-[#E8A598]/80 uppercase"
                style={{ opacity: greetingDocked ? 1 : 0, transition: 'opacity 500ms ease' }}
              >
                {greetingText}
              </p>
            )}
            <div
              className="flex flex-col items-center gap-5"
              style={{
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? 'translateY(0)' : 'translateY(18px)',
                transition: 'opacity 700ms cubic-bezier(0.4,0,0.2,1), transform 700ms cubic-bezier(0.4,0,0.2,1)',
                pointerEvents: heroReady ? 'auto' : 'none',
              }}
            >
            <FadeInSection direction="up" delay={100}>
              <span className="text-[9px] font-mono tracking-[0.35em] text-[#62464D] uppercase block">
                {new Date(CONFIG.anniversaryDate).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </FadeInSection>

            <FadeInSection direction="up" delay={260}>
              <div className="space-y-1 relative">
                <p className="text-[#E8A598] text-sm sm:text-base italic font-light tracking-wide">Felices</p>
                <h1 className="text-7xl sm:text-9xl font-serif font-bold text-[#FFFDFD] leading-none tracking-tighter">
                  {getMonthNumber(getMonthsElapsed(CONFIG.anniversaryDate))}
                </h1>
                <p className="text-2xl sm:text-3xl font-serif font-light text-[#E8A598] tracking-wide">
                  {getMonthLabel(getMonthsElapsed(CONFIG.anniversaryDate))}
                </p>
              </div>
            </FadeInSection>

            <FadeInSection direction="up" delay={480}>
              <p className="text-[#B59F9F] font-serif font-light text-sm sm:text-base leading-relaxed max-w-sm">
                Que se sienten como toda una vida,y a la vez como si apenas empezáramos.
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
          </div>
          
          {/* Pista escondida en hero */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
            {getHintsForLocation('hero', CONFIG.hiddenHints).map((h, i) => (
              <HiddenHint key={i} hint={h} />
            ))}
          </div>
        </section>

        {/* Timeline */}
        {CONFIG.decorations.coverTimeline && (
          <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(232,165,152,0.07) 0%, transparent 70%)' }} />
            <FadeInSection direction="up" delay={0} className="w-full flex justify-center">
              <Timeline milestones={CONFIG.timelineMilestones} anniversaryDate={CONFIG.anniversaryDate} />
            </FadeInSection>
          </section>
        )}

        {/* SECCIÓN 1: Árbol Sakura */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-start shrink-0 snap-start snap-always px-4 relative overflow-hidden pt-16 sm:pt-20">
          {CONFIG.decorations.treeConstellation && <TreeConstellation/>}
          <div className="w-full max-w-xl flex flex-col items-center gap-y-4 sm:gap-y-20 h-full relative z-10">
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
          
          {/* Pista escondida en árbol */}
          <div className="absolute bottom-70 right-5 -translate-x-1/2">
            {getHintsForLocation('tree', CONFIG.hiddenHints).map((h, i) => (
              <HiddenHint key={i} hint={h} />
            ))}
          </div>
        </section>

        {/* SmileSlider */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          {CONFIG.decorations.smileSliderDecor && <SmileSliderDecor />}
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
          
          {/* Pista escondida en smile slider */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            {getHintsForLocation('smile', CONFIG.hiddenHints).map((h, i) => (
              <HiddenHint key={i} hint={h} />
            ))}
          </div>
        </section>

        {/* Buseta */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          {CONFIG.decorations.busetaDecor && <BusetaDecor />}
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
          
          {/* Pista escondida en buseta */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            {getHintsForLocation('buseta', CONFIG.hiddenHints).map((h, i) => (
              <HiddenHint key={i} hint={h} />
            ))}
          </div>
        </section>

        {/* Galería */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 65% 50% at 50% 58%, rgba(232,165,152,0.16) 0%, rgba(120,60,75,0.08) 50%, transparent 75%),' +
                'radial-gradient(ellipse 35% 25% at 18% 28%, rgba(181,159,159,0.10) 0%, transparent 60%)',
            }} />
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(78,49,60,0.08) 0%, transparent 100%)' }} />
          
          {CONFIG.decorations.galleryPetals && <GalleryPetals />}

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
            <FadeInSection direction="up" delay={180} className="w-full flex justify-center min-h-0 items-center relative z-20">
              <Gallery photos={CONFIG.photos} />
            </FadeInSection>
          </div>
          
          {/* Pista escondida en galería */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            {getHintsForLocation('gallery', CONFIG.hiddenHints).map((h, i) => (
              <HiddenHint key={i} hint={h} />
            ))}
          </div>
        </section>

        {/* Carta */}
        <section id="letter-section" className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              opacity: 0.045,
            }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 35%, rgba(19,13,15,0.6) 100%)' }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(78,49,60,0.05) 30px, rgba(78,49,60,0.05) 31px)' }} />
          {CONFIG.decorations.letterPaperGlow && <LetterPaperGlow />}

          <FadeInSection direction="up" delay={0} className="w-full max-w-xl relative z-10">
            <div className="relative rounded-2xl px-6 sm:px-10 py-8 shadow-2xl shadow-black/60"
              style={{
                background: 'linear-gradient(145deg, rgba(28,18,22,0.97) 0%, rgba(22,14,18,0.99) 100%)',
                border: '1px solid rgba(78,49,60,0.35)',
              }}>
              <button type="button" onClick={() => downloadLetter(CONFIG)} aria-label="Guardar carta como imagen"
                className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[#8C7565] border border-[#4E313C]/40 bg-[#130D0F]/50 hover:text-[#E8A598] hover:border-[#E8A598]/40 hover:bg-[#E8A598]/08 transition-all duration-300 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              </button>
              <svg aria-hidden="true" className="absolute top-0 right-0 pointer-events-none" width="90" height="110" viewBox="0 0 90 110" style={{ opacity: 0.22 }}>
                <path d="M30 108 Q28 80 26 58" stroke="#7B5EA7" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                <path d="M26 80 Q14 72 12 60 Q22 66 26 78Z" fill="#7B5EA7" opacity="0.6"/>
                <path d="M26 58 C20 50 18 38 26 30 C28 38 28 50 26 58Z" fill="#B39DDB"/>
                <path d="M26 58 C32 50 34 38 26 30 C24 38 24 50 26 58Z" fill="#9575CD"/>
                <path d="M26 58 C22 52 22 44 26 38 C30 44 30 52 26 58Z" fill="#CE93D8" opacity="0.7"/>
                <path d="M48 108 Q46 75 44 50" stroke="#7B5EA7" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                <path d="M44 78 Q34 68 32 54 Q42 62 44 76Z" fill="#7B5EA7" opacity="0.55"/>
                <path d="M44 50 C36 40 34 25 44 15 C47 25 47 40 44 50Z" fill="#B39DDB"/>
                <path d="M44 50 C52 40 54 25 44 15 C41 25 41 40 44 50Z" fill="#9575CD"/>
                <path d="M44 50 C39 43 39 33 44 25 C49 33 49 43 44 50Z" fill="#CE93D8" opacity="0.7"/>
                <path d="M66 108 Q65 82 63 62" stroke="#7B5EA7" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                <path d="M63 84 Q73 74 74 60 Q64 68 63 82Z" fill="#7B5EA7" opacity="0.6"/>
                <path d="M63 62 C57 54 55 42 63 34 C65 42 65 54 63 62Z" fill="#B39DDB"/>
                <path d="M63 62 C69 54 71 42 63 34 C61 42 61 54 63 62Z" fill="#9575CD"/>
                <path d="M63 62 C59 56 59 48 63 42 C67 48 67 56 63 62Z" fill="#CE93D8" opacity="0.7"/>
              </svg>
              <svg aria-hidden="true" className="absolute bottom-0 left-0 pointer-events-none" width="55" height="75" viewBox="0 0 55 75" style={{ opacity: 0.18 }}>
                <path d="M20 74 Q19 55 18 40" stroke="#7B5EA7" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                <path d="M18 58 Q8 50 7 38 Q16 44 18 56Z" fill="#7B5EA7" opacity="0.6"/>
                <path d="M18 40 C12 32 10 20 18 12 C20 20 20 32 18 40Z" fill="#B39DDB"/>
                <path d="M18 40 C24 32 26 20 18 12 C16 20 16 32 18 40Z" fill="#9575CD"/>
                <path d="M18 40 C14 34 14 26 18 20 C22 26 22 34 18 40Z" fill="#CE93D8" opacity="0.7"/>
                <path d="M36 74 Q35 58 34 45" stroke="#7B5EA7" strokeWidth="1" fill="none" strokeLinecap="round"/>
                <path d="M34 60 Q42 52 43 42 Q35 48 34 58Z" fill="#7B5EA7" opacity="0.5"/>
                <path d="M34 45 C29 38 28 28 34 21 C36 28 36 38 34 45Z" fill="#B39DDB" opacity="0.85"/>
                <path d="M34 45 C39 38 40 28 34 21 C32 28 32 38 34 45Z" fill="#9575CD" opacity="0.85"/>
              </svg>

              <FadeInSection direction="right" delay={80}>
                <p className="text-[9px] font-mono tracking-widest text-[#62464D] uppercase text-right mb-5">{CONFIG.loveLetter.place}</p>
              </FadeInSection>
              <FadeInSection direction="left" delay={160}>
                <p className="text-[10px] font-mono tracking-widest text-[#8C7565] uppercase mb-1">Para:</p>
                <p className="font-serif text-lg text-[#E8A598] italic mb-5">{CONFIG.loveLetter.to}</p>
              </FadeInSection>
              <FadeInSection direction="up" delay={240}>
                <p className="font-serif text-sm text-[#EDE7E5] font-medium mb-4">{CONFIG.loveLetter.greeting}</p>
              </FadeInSection>
              <FadeInSection direction="up" delay={320}>
                <div className="space-y-3 text-[#C9BFB8] font-serif text-xs sm:text-[13px] leading-relaxed font-light max-h-[28vh] overflow-y-auto pr-3 letter-scrollbar">
                  {CONFIG.loveLetter.body.map((paragraph, i) => (<p key={i}>{paragraph}</p>))}
                </div>
              </FadeInSection>
              <FadeInSection direction="up" delay={420}>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-serif text-xs text-[#8C7565] italic">{CONFIG.loveLetter.farewell}</p>
                    <p className="font-serif text-base text-[#E8A598] font-semibold mt-1">{CONFIG.loveLetter.signature}</p>
                  </div>
                  {CONFIG.loveLetter.signatureImage && (
                    <img src={CONFIG.loveLetter.signatureImage} alt="Firma ilustrada" className="h-16 sm:h-20 w-auto object-contain opacity-90 drop-shadow-[0_0_8px_rgba(232,165,152,0.15)]" />
                  )}
                </div>
              </FadeInSection>
              
              {/* Pista escondida en carta */}
              <div className="mt-3 flex justify-center">
                {getHintsForLocation('letter', CONFIG.hiddenHints).map((h, i) => (
                  <HiddenHint key={i} hint={h} />
                ))}
              </div>
              
              {CONFIG.decorations.letterSeal && (
                <LetterSeal cfg={CONFIG} onUnlock={() => navigateToSecret()} />
              )}
            </div>
          </FadeInSection>
        </section>

        {/* Ruleta */}
        <section className="w-full h-[100dvh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 text-center relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {[{ x: '12%', y: '18%', size: 22, rot: 15, o: 0.08 }, { x: '85%', y: '22%', size: 18, rot: -20, o: 0.07 },
              { x: '6%', y: '75%', size: 26, rot: 10, o: 0.06 }, { x: '90%', y: '70%', size: 20, rot: -12, o: 0.07 },
              { x: '45%', y: '85%', size: 15, rot: 5, o: 0.06 }, { x: '55%', y: '10%', size: 17, rot: -8, o: 0.07 }].map((p, i) => (
              <g key={i} transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`} opacity={p.o}>
                <path d={`M0,${-p.size} C${-p.size * 0.6},${-p.size * 0.6} ${-p.size * 0.6},${p.size * 0.4} 0,${p.size} C${p.size * 0.6},${p.size * 0.4} ${p.size * 0.6},${-p.size * 0.6} 0,${-p.size}Z`} fill="#E8A598" />
              </g>
            ))}
            {[{ cx: '25%', cy: '45%', r: 60 }, { cx: '75%', cy: '55%', r: 45 }].map((c, i) => (
              <circle key={i} cx={c.cx} cy={c.cy} r={c.r} stroke="rgba(78,49,60,0.15)" strokeWidth="1" fill="none" />
            ))}
          </svg>
          {CONFIG.decorations.rouletteShimmer && <RouletteShimmer />}

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
          
          {/* Pista escondida en ruleta */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            {getHintsForLocation('roulette', CONFIG.hiddenHints).map((h, i) => (
              <HiddenHint key={i} hint={h} />
            ))}
          </div>
        </section>

        <section className="w-full min-h-[42vh] sm:min-h-[38vh] flex flex-col items-center justify-center shrink-0 snap-start snap-always px-4 relative overflow-hidden py-10">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 45% 50% at 50% 50%, rgba(232,165,152,0.08) 0%, transparent 70%)' }} />
          <FadeInSection direction="up" delay={0}>
            <div className="flex flex-col items-center gap-2.5 px-8 sm:px-10 py-6 rounded-2xl border border-[#4E313C]/30 bg-[#1C1216]/40 backdrop-blur-sm">
              <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true" style={{ opacity: 0.55 }}>
                <path d="M16,2 C16,2 18,9 16,16 C14,9 16,2 16,2Z" fill="#E8A598" />
                <path d="M16,30 C16,30 14,23 16,16 C18,23 16,30 16,30Z" fill="#E8A598" />
                <path d="M2,16 C2,16 9,14 16,16 C9,18 2,16 2,16Z" fill="#E8A598" />
                <path d="M30,16 C30,16 23,18 16,16 C23,14 30,16 30,16Z" fill="#E8A598" />
                <circle cx="16" cy="16" r="3" fill="#FFFDFD" opacity="0.6" />
              </svg>
              <span className="text-[8px] font-mono tracking-widest text-[#62464D] uppercase">Próximo capítulo</span>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-[#FFFDFD] leading-none">{(() => {
                const { daysLeft, nextLabel } = getNextMilestone(CONFIG.anniversaryDate);
                return daysLeft;
              })()}</p>
              <p className="text-xs sm:text-sm font-serif italic text-[#E8A598]">
                {(() => {
                  const { daysLeft, nextLabel } = getNextMilestone(CONFIG.anniversaryDate);
                  return `${daysLeft === 1 ? 'día' : 'días'} para los ${nextLabel}`;
                })()}
              </p>
            </div>
          </FadeInSection>
          {/* Pista escondida en milestone */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            {getHintsForLocation('milestone', CONFIG.hiddenHints).map((h, i) => (
              <HiddenHint key={i} hint={h} />
            ))}
          </div>
        </section>

        <footer className="w-full min-h-[64px] flex flex-col items-center justify-center text-center gap-1.5 shrink-0 snap-start snap-always bg-[#130D0F] py-3"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <p className="text-[8px] text-[#6E4752] tracking-widest uppercase font-mono font-light">
            © {new Date().getFullYear()} {CONFIG.names.from} y {CONFIG.names.to}
          </p>
          {CONFIG.easterEgg.enabled && CONFIG.easterEgg.hintText && (
            <p className="text-[7px] text-[#4E313C]/70 tracking-widest uppercase font-mono font-light max-w-xs px-6 mt-0.5">
              {CONFIG.easterEgg.hintText}
            </p>
          )}
          {/* Pista escondida en footer */}
          <div className="mt-1">
            {getHintsForLocation('footer', CONFIG.hiddenHints).map((h, i) => (
              <HiddenHint key={i} hint={h} />
            ))}
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes bob-down {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-4px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        @keyframes subtle-pulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.1; }
        }
      `}</style>
    </>
  );
}