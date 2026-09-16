"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/motion-pref";

export function Entrance({
  lit,
  total,
  shift = 0,
  presence = 1,
  onEnter,
}: {
  lit: number;
  total: number;
  shift?: number;
  presence?: number;
  onEnter?: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate h-svh w-screen shrink-0 overflow-hidden bg-void">
      <div className="floor-vanish" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 22% 48%, rgba(214,255,58,0.07), transparent 55%), radial-gradient(ellipse 28% 58% at 82% 42%, rgba(214,255,58,0.16), transparent 62%)",
          opacity: 0.55 + presence * 0.45,
        }}
      />
      <div className="hall-grain pointer-events-none absolute inset-0 z-[2]" aria-hidden="true" />

      <motion.p
        className="pointer-events-none absolute top-1/2 left-[-10vw] select-none font-serif font-bold text-bone"
        style={{
          fontSize: "min(94vh, 82vw)",
          lineHeight: 0.72,
          letterSpacing: "-0.08em",
          transform: `translate3d(${shift * -72}px, -48%, 0)`,
          textShadow: "0 0 90px rgba(214,255,58,0.16)",
        }}
        initial={reduced ? false : { opacity: 0, filter: "blur(22px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={reduced ? { duration: 0.01 } : { duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        夜
      </motion.p>

      <div className="door-slit" aria-hidden="true" />
      <button
        type="button"
        aria-label="沿门缝向前走"
        onClick={onEnter}
        className="absolute top-0 right-[calc(18vw-18px)] z-10 h-full w-10 cursor-pointer border-0 bg-transparent p-0"
      />

      <p className="spine pointer-events-none absolute top-1/2 right-[calc(18vw-2.1rem)] hidden -translate-y-1/2 text-[11px] text-acid/80 md:block">
        沿这道缝
      </p>

      <div className="absolute right-[calc(18vw-0.7rem)] bottom-[11vh] z-10 flex flex-col items-center gap-3">
        <button type="button" onClick={onEnter} className="walk-cue" aria-label="向前走入第一厅">
          <span className="text-[10px] tracking-[0.42em]">向前</span>
          <span className="walk-chevrons" aria-hidden="true">
            <span className="walk-chevron" />
            <span className="walk-chevron walk-chevron-lag" />
          </span>
        </button>
      </div>

      <div className="plate absolute bottom-[8vh] left-[5vw] z-10 w-[min(92vw,22rem)]">
        <p className="text-[10px] tracking-[0.48em] text-acid">常设展 · 〇–捌</p>
        <h1 className="mt-3 font-serif text-3xl tracking-[0.2em] text-bone">夜览馆</h1>
        <p className="mt-3 text-sm leading-7 text-fog">当代模型。一条走廊。座上只放一件东西。</p>
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-acid/25 pt-3">
          <p className="font-mono text-[11px] text-acid">滚动即步行</p>
          <p className="folio text-[11px] text-fog">
            已点亮 {lit}/{total}
          </p>
        </div>
      </div>
    </section>
  );
}
