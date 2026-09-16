"use client";

import { motion } from "motion/react";
import { Seal } from "@/components/mark/Seal";
import { useReducedMotion } from "@/lib/motion-pref";

const TITLE = ["下", "一", "颗", "字"];

export function Hero({ lit, total }: { lit: number; total: number }) {
  const reduced = useReducedMotion();

  return (
    <section className="fold relative min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(22,18,14,0.16),transparent_68%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(181,122,40,0.2),transparent_70%)] blur-2xl" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-[1400px] grid-cols-1 items-end gap-8 px-5 pb-10 pt-28 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:px-10 md:pb-16">
        <div className="relative mx-auto w-[min(78vw,28rem)] md:mx-0 md:w-[min(100%,32rem)]">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.92, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Seal className="w-full drop-shadow-[0_20px_40px_rgba(22,18,14,0.12)]" />
          </motion.div>
        </div>

        <div className="relative pb-6 md:pb-0 md:pl-8">
          <p className="text-[11px] tracking-[0.42em] text-gold-deep">墨金编辑室 · 行程</p>
          <h1 className="mt-7 font-serif leading-[0.92] tracking-tight text-ink">
            <span className="flex flex-wrap gap-x-1 text-[clamp(3.4rem,9vw,7.4rem)]">
              {TITLE.map((char, index) => (
                <motion.span
                  key={char}
                  className="inline-block"
                  initial={reduced ? false : { y: 56, opacity: 0, rotate: -6 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.18 + index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
            <motion.span
              className="mt-3 block max-w-xl font-serif text-[clamp(1.6rem,3.4vw,2.5rem)] leading-snug text-ink-soft"
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.7 }}
            >
              已经在盒子里。
            </motion.span>
          </h1>
          <motion.p
            className="mt-10 max-w-md font-serif text-2xl leading-snug text-ink"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
          >
            它伸手。
            <br />
            不是它在想。
          </motion.p>
          <div className="mt-14 flex items-end justify-between gap-6 border-t border-ink/15 pt-6">
            <a href="#llm-intuition" className="text-sm tracking-wide text-gold-deep no-underline">
              翻页，从铅字开始
            </a>
            <p className="folio text-sm text-mist">
              已读 {lit} / {total}
            </p>
          </div>
        </div>
      </div>

      <p className="spine pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 text-[11px] text-mist md:block">
        从零到一 · 不要工具清单
      </p>
    </section>
  );
}
