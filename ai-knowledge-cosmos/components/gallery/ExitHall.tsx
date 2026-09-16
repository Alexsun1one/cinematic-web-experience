import Link from "next/link";

export function ExitHall({ slot }: { slot: number }) {
  return (
    <section data-chamber={slot} className="chamber relative isolate flex h-svh w-screen shrink-0 items-end overflow-hidden bg-void px-[6vw] py-[10vh]">
      <p className="chamber-numeral pointer-events-none absolute top-1/2 left-[-4vw] -translate-y-1/2 select-none font-serif text-[min(80vh,70vw)] leading-none text-acid/15">
        终
      </p>
      <div className="spot" aria-hidden="true" />
      <div className="chamber-copy relative z-10 max-w-xl">
        <p className="text-[10px] tracking-[0.42em] text-acid">门厅 · 出口</p>
        <h2 className="mt-5 font-serif text-5xl leading-[1.05] text-bone md:text-7xl">灯还亮着。</h2>
        <p className="mt-6 max-w-md text-lg leading-8 text-fog">
          走廊走完，墙上的课文还在。夜刊是体温。平面图是这座馆的骨头。
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/learn" className="cta-ghost">
            展墙目录
          </Link>
          <Link href="/blog" className="cta-ghost">
            夜刊
          </Link>
          <Link href="/knowledge" className="cta-ghost">
            平面
          </Link>
        </div>
      </div>
    </section>
  );
}
