import Link from "next/link";
import type { ReactNode } from "react";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { VisitBeacon } from "@/components/learn/VisitBeacon";
import { site } from "@/lib/site";

export function ArticleShell({
  numeral,
  kicker,
  title,
  summary,
  meta,
  children,
  prev,
  next,
  visitSlug,
  magazine = false,
}: {
  numeral?: string;
  kicker: string;
  title: string;
  summary: string;
  meta: string;
  children: ReactNode;
  prev?: { href: string; label: string } | null;
  next?: { href: string; label: string } | null;
  visitSlug?: string;
  magazine?: boolean;
}) {
  return (
    <article className="relative mx-auto w-full max-w-3xl px-5 pt-28 pb-20">
      {magazine ? <ReadingProgress /> : null}
      {visitSlug ? <VisitBeacon slug={visitSlug} /> : null}
      {numeral ? (
        <p className="pointer-events-none absolute top-16 -left-2 hidden font-serif text-[11rem] leading-none text-gold/25 select-none lg:block">
          {numeral}
        </p>
      ) : null}
      {numeral ? <p className="font-serif text-6xl text-gold lg:hidden">{numeral}</p> : null}
      <p className="mt-8 text-xs tracking-[0.28em] text-mist">{kicker}</p>
      <h1 className="mt-5 font-serif text-[2.6rem] leading-[1.12] tracking-tight text-ink md:text-6xl">{title}</h1>
      <p className="mt-7 max-w-xl font-serif text-2xl leading-snug text-ink">{summary}</p>
      <p className="mt-5 text-sm text-mist">{magazine ? `${site.author} · ${meta}` : meta}</p>
      <div className="mt-8 h-px w-24 bg-gold" />
      <div className={`prose-studio mt-10 ${magazine ? "prose-magazine" : ""}`}>{children}</div>
      <nav className="mt-16 grid gap-px bg-ink/10 sm:grid-cols-2">
        {prev ? (
          <Link href={prev.href} className="bg-paper p-5 no-underline hover:bg-paper-2">
            <p className="text-xs tracking-wide text-mist">{magazine ? "上一篇" : "上一课"}</p>
            <p className="mt-2 font-serif text-xl text-ink">{prev.label}</p>
          </Link>
        ) : (
          <span className="bg-paper" />
        )}
        {next ? (
          <Link href={next.href} className="bg-paper p-5 text-right no-underline hover:bg-paper-2">
            <p className="text-xs tracking-wide text-mist">{magazine ? "下一篇" : "下一课"}</p>
            <p className="mt-2 font-serif text-xl text-ink">{next.label}</p>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
