"use client";

import { useEffect, useRef, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    function measure() {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      setProgress(max > 0 ? Math.min(1, root.scrollTop / max) : 0);
    }
    function onScroll() {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    }
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-ivory/10">
      <div className="h-full bg-violet" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}
