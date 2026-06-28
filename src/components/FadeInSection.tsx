import { useEffect, useRef, ReactNode } from "react";

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function FadeInSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const translateMap: Record<string, string> = {
    up: "translateY(28px)",
    down: "translateY(-28px)",
    left: "translateX(28px)",
    right: "translateX(-28px)",
    none: "none",
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Initial hidden state
    el.style.opacity = "0";
    el.style.transform = translateMap[direction] ?? "translateY(28px)";
    el.style.transition = `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reveal: fade in from offset position
            el.style.opacity = "1";
            el.style.transform = "translate(0, 0)";
            // Don't unobserve — keep watching so we can re-hide on exit
          } else {
            // Only re-hide if scrolled out from the BOTTOM (going back up past it)
            // Check: if element is above the viewport top, don't re-hide
            const rect = el.getBoundingClientRect();
            if (rect.bottom > 0) {
              // Still partially visible or below viewport — don't hide
              return;
            }
            // Element is fully above viewport: reset to allow re-trigger if they scroll back
            // (optional — uncomment for loop animation)
            // el.style.opacity = "0";
            // el.style.transform = translateMap[direction] ?? "translateY(28px)";
          }
        });
      },
      {
        // Trigger as soon as ANY pixel is visible — no centering required
        threshold: 0,
        // Small negative margin to avoid triggering on elements just barely off-screen
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}