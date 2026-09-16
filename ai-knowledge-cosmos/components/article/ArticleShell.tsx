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
    <article className="mx-auto w-full max-w-3xl px-5 pt-28 pb-20">
      {magazine ? <ReadingProgress /> : null}
      {visitSlug ? <VisitBeacon slug={visitSlug} /> : null}
      {numeral ? <p className="font-serif text-6xl text-gold">{numeral}</p> : null}
      <p className="mt-6 text-sm text-mist">{kicker}</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-ink md:text-5xl">{title}</h1>
      <p className="mt-6 font-serif text-xl leading-9 text-ink-soft">{summary}</p>
      <p className="mt-4 text-sm text-mist">
        {magazine ? `${site.author} · ${meta}` : meta}
      </p>
      <div className={`prose-studio mt-10 ${magazine ? "prose-magazine" : ""}`}>{children}</div>
      <nav className="mt-16 grid gap-4 border-t border-ink/10 pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={prev.href} className="border border-ink/10 p-4 no-underline">
            <p className="text-xs text-mist">{magazine ? "上一篇" : "上一课"}</p>
            <p className="mt-2 text-ink">{prev.label}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.href} className="border border-ink/10 p-4 text-right no-underline">
            <p className="text-xs text-mist">{magazine ? "下一篇" : "下一课"}</p>
            <p className="mt-2 text-ink">{next.label}</p>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
