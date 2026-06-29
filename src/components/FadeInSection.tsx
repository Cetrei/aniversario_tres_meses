import { useEffect, useRef, ReactNode } from "react";

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  triggerOnce?: boolean; // Propiedad para evitar bucles de parpadeo
}

export default function FadeInSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  triggerOnce = true, // Por defecto se congela tras aparecer
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
    el.style.transition = `opacity 0.75s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms, transform 0.75s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "translate(0, 0)";
            if (triggerOnce) {
              observer.unobserve(el); // Detiene la observación permanente para mitigar el glitch
            }
          } else if (!triggerOnce) {
            el.style.opacity = "0";
            el.style.transform = hidden;
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction, triggerOnce]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}