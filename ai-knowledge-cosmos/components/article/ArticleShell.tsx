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
    <article className="relative w-full pb-20">
      {magazine ? <ReadingProgress /> : null}
      {visitSlug ? <VisitBeacon slug={visitSlug} /> : null}
      <header className="relative min-h-[78vh] overflow-hidden px-5 pt-28 pb-16 md:px-12">
        {numeral ? (
          <p className="pointer-events-none absolute top-10 -left-4 select-none font-serif text-[min(70vh,58vw)] leading-none text-acid/12">
            {numeral}
          </p>
        ) : (
          <p className="pointer-events-none absolute top-8 -left-2 select-none font-serif text-[min(48vh,40vw)] leading-none text-acid/12">
            刊
          </p>
        )}
        <div className="relative z-10 max-w-3xl">
          <p className="text-[10px] tracking-[0.36em] text-acid">{kicker}</p>
          <h1 className="mt-6 font-serif text-[clamp(2.4rem,7vw,5.6rem)] leading-[1.05] tracking-tight text-bone">
            {title}
          </h1>
          <p className="mt-8 max-w-xl font-serif text-2xl leading-snug text-bone/90">{summary}</p>
          <p className="mt-6 text-sm text-fog">{magazine ? `${site.author} · ${meta}` : meta}</p>
        </div>
      </header>
      <div className="workbench px-5 py-12 md:px-12">
        <div className={`prose-wall mx-auto max-w-2xl ${magazine ? "prose-zine" : ""}`}>{children}</div>
        <nav className="mx-auto mt-16 grid max-w-2xl gap-px bg-acid/20 sm:grid-cols-2">
          {prev ? (
            <Link href={prev.href} className="bg-void p-5 no-underline hover:bg-hall">
              <p className="text-xs tracking-wide text-fog">{magazine ? "上一篇" : "上一厅"}</p>
              <p className="mt-2 font-serif text-xl text-bone">{prev.label}</p>
            </Link>
          ) : (
            <span className="bg-void" />
          )}
          {next ? (
            <Link href={next.href} className="bg-void p-5 text-right no-underline hover:bg-hall">
              <p className="text-xs tracking-wide text-fog">{magazine ? "下一篇" : "下一厅"}</p>
              <p className="mt-2 font-serif text-xl text-bone">{next.label}</p>
            </Link>
          ) : null}
        </nav>
      </div>
    </article>
  );
}
