import { useEffect, useRef, ReactNode } from "react";

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  triggerOnce?: boolean;
}

export default function FadeInSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  triggerOnce = true,
}: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const translateMap: Record<string, string> = {
    up: "translateY(24px)",
    down: "translateY(-24px)",
    left: "translateX(24px)",
    right: "translateX(-24px)",
    none: "none",
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const hidden = translateMap[direction] ?? "translateY(24px)";

    el.style.opacity = "0";
    el.style.transform = hidden;
    // Aplica la transición después de un microtask para que el browser
    // registre el estado inicial antes de animar
    el.style.transition = "none";

    // Fuerza un reflow antes de activar la transición
    const activate = () => {
      el.style.transition = `opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms`;
    };
    const activateTimer = setTimeout(activate, 20);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "translate(0, 0)";
            if (triggerOnce) {
              observer.unobserve(el);
            }
          } else if (!triggerOnce) {
            el.style.opacity = "0";
            el.style.transform = hidden;
          }
        });
      },
      {
        // rootMargin generoso hacia abajo: la sección empieza a animarse
        // MIENTRAS aún se está desplazando hacia ella (durante el snap-scroll),
        // no recién cuando ya quedó encajada a la vista. Así se evita el efecto
        // de "aparece con retraso" al llegar a cada sección.
        threshold: 0.01,
        rootMargin: "0px 0px 350px 0px",
      }
    );

    observer.observe(el);
    return () => {
      clearTimeout(activateTimer);
      observer.disconnect();
    };
  }, [delay, direction, triggerOnce]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}