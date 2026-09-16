"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export function usePinProgress() {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    function measure() {
      if (!node) return;
      const total = node.offsetHeight - window.innerHeight;
      const scrolled = -node.getBoundingClientRect().top;
      const next = total <= 0 ? 0 : Math.min(1, Math.max(0, scrolled / total));
      setProgress(next);
    }
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return { ref, progress };
}

export function PinStage({
  id,
  heightClass = "h-[220vh]",
  children,
}: {
  id: string;
  heightClass?: string;
  children: (progress: number) => ReactNode;
}) {
  const { ref, progress } = usePinProgress();
  return (
    <section id={id} ref={ref} className={`relative ${heightClass}`}>
      <div className="sticky top-0 flex min-h-[100svh] items-stretch pt-16">{children(progress)}</div>
    </section>
  );
}
