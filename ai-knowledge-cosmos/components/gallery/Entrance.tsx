"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/motion-pref";

export function Entrance({
  lit,
  total,
  shift = 0,
}: {
  lit: number;
  total: number;
  shift?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate h-svh w-screen shrink-0 overflow-hidden bg-void">
      <div className="floor-vanish" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 22% 48%, rgba(214,255,58,0.08), transparent 55%), radial-gradient(ellipse 30% 50% at 78% 40%, rgba(214,255,58,0.12), transparent 60%)",
        }}
      />

      <motion.p
        className="pointer-events-none absolute top-1/2 left-[-10vw] select-none font-serif font-bold text-bone"
        style={{
          fontSize: "min(94vh, 82vw)",
          lineHeight: 0.72,
          letterSpacing: "-0.08em",
          transform: `translate3d(${shift * -80}px, -48%, 0)`,
          textShadow: "0 0 80px rgba(214,255,58,0.12)",
        }}
        initial={reduced ? false : { opacity: 0, filter: "blur(18px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        夜
      </motion.p>

      <div className="door-slit" aria-hidden="true" />

      <p className="spine pointer-events-none absolute top-1/2 right-6 hidden -translate-y-1/2 text-[11px] text-fog md:block">
        滚动即步行
      </p>

      <div className="plate absolute bottom-[8vh] left-[5vw] z-10 w-[min(92vw,22rem)]">
        <p className="text-[10px] tracking-[0.48em] text-acid">常设展 · 〇–捌</p>
        <h1 className="mt-3 font-serif text-3xl tracking-[0.2em] text-bone">夜览馆</h1>
        <p className="mt-3 text-sm leading-7 text-fog">当代模型。一条走廊。座上只放一件东西。</p>
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-acid/25 pt-3">
          <p className="font-mono text-[11px] text-acid">向前走</p>
          <p className="folio text-[11px] text-fog">
            已点亮 {lit}/{total}
          </p>
        </div>
      </div>
    </section>
  );
}
