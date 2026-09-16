import Link from "next/link";
import type { ReactNode } from "react";
import { VisitBeacon } from "@/components/learn/VisitBeacon";

export function ArticleShell({
  kicker,
  title,
  summary,
  meta,
  children,
  prev,
  next,
  visitSlug,
}: {
  kicker: string;
  title: string;
  summary: string;
  meta: string;
  children: ReactNode;
  prev?: { href: string; label: string } | null;
  next?: { href: string; label: string } | null;
  visitSlug?: string;
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 pt-24 pb-16">
      {visitSlug ? <VisitBeacon slug={visitSlug} /> : null}
      <p className="text-xs tracking-[0.28em] text-teal uppercase">{kicker}</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-ivory md:text-5xl">
        {title}
      </h1>
      <p className="mt-5 text-lg leading-8 text-mist">{summary}</p>
      <p className="mt-4 text-sm text-mute">{meta}</p>
      <div className="prose-cosmos mt-10">{children}</div>
      <nav className="mt-16 grid gap-4 border-t border-ivory/10 pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={prev.href} className="panel rounded-2xl p-4 no-underline">
            <p className="text-xs text-mute">上一站</p>
            <p className="mt-2 text-ivory">{prev.label}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.href} className="panel rounded-2xl p-4 text-right no-underline">
            <p className="text-xs text-mute">下一站</p>
            <p className="mt-2 text-ivory">{next.label}</p>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
