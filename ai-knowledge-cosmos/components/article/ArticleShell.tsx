import Link from "next/link";
import type { ReactNode } from "react";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { VisitBeacon } from "@/components/learn/VisitBeacon";
import { site } from "@/lib/site";

export function ArticleShell({
  kicker,
  title,
  summary,
  meta,
  children,
  prev,
  next,
  visitSlug,
  variant = "lesson",
}: {
  kicker: string;
  title: string;
  summary: string;
  meta: string;
  children: ReactNode;
  prev?: { href: string; label: string } | null;
  next?: { href: string; label: string } | null;
  visitSlug?: string;
  variant?: "lesson" | "magazine";
}) {
  const magazine = variant === "magazine";

  return (
    <article className="mx-auto w-full max-w-3xl px-5 pt-24 pb-16">
      {magazine ? <ReadingProgress /> : null}
      {visitSlug ? <VisitBeacon slug={visitSlug} /> : null}

      {magazine ? (
        <header className="magazine-hero relative overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink/60 px-6 py-10 md:px-10 md:py-14">
          <p className="text-xs tracking-[0.32em] text-violet uppercase">{kicker}</p>
          <h1 className="mt-5 font-serif text-[2.4rem] leading-[1.15] tracking-tight text-ivory md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl font-serif text-xl leading-9 text-mist">{summary}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ivory/10 pt-5 text-sm text-mute">
            <span className="text-ivory">{site.author}</span>
            <span aria-hidden="true">·</span>
            <span>{meta}</span>
          </div>
        </header>
      ) : (
        <>
          <p className="text-xs tracking-[0.28em] text-teal uppercase">{kicker}</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-ivory md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-mist">{summary}</p>
          <p className="mt-4 text-sm text-mute">{meta}</p>
        </>
      )}

      <div className={`prose-cosmos mt-10 ${magazine ? "prose-magazine" : ""}`}>{children}</div>
      <nav className="mt-16 grid gap-4 border-t border-ivory/10 pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={prev.href} className="panel rounded-2xl p-4 no-underline">
            <p className="text-xs text-mute">{magazine ? "上一篇" : "上一站"}</p>
            <p className="mt-2 text-ivory">{prev.label}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.href} className="panel rounded-2xl p-4 text-right no-underline">
            <p className="text-xs text-mute">{magazine ? "下一篇" : "下一站"}</p>
            <p className="mt-2 text-ivory">{next.label}</p>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
