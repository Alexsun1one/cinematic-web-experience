"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { AttentionHeatmap } from "@/components/learn/AttentionHeatmap";
import { ClosedLoop } from "@/components/learn/ClosedLoop";
import { FactCheckToy } from "@/components/learn/FactCheckToy";
import { NextTokenToy } from "@/components/learn/NextTokenToy";
import { PromptCompare } from "@/components/learn/PromptCompare";
import { StampGate } from "@/components/learn/StampGate";
import { ToolLoop } from "@/components/learn/ToolLoop";
import { Hero } from "@/components/journey/Hero";
import { PinnedLampAct } from "@/components/journey/PinnedLampAct";
import { PinnedTokenAct } from "@/components/journey/PinnedTokenAct";
import { PinnedTypeAct } from "@/components/journey/PinnedTypeAct";
import { CHAPTERS, type Chapter } from "@/lib/journey";
import { getVisited, getVisitedServer, subscribeVisited } from "@/lib/progress";

function Toy({ kind }: { kind: Chapter["toy"] }) {
  if (kind === "next-token") return <NextTokenToy />;
  if (kind === "prompt") return <PromptCompare />;
  if (kind === "stamp") return <StampGate />;
  if (kind === "loop") return <ToolLoop />;
  if (kind === "checklist") return <ClosedLoop />;
  if (kind === "facts") return <FactCheckToy />;
  if (kind === "attention") return <AttentionHeatmap />;
  return null;
}

function Act({ chapter, visited }: { chapter: Chapter; visited: string[] }) {
  const lit = chapter.slug ? visited.includes(chapter.slug) : false;

  return (
    <article id={chapter.id} className="fold scroll-mt-24 border-t border-ink/10">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-24 md:grid-cols-[8rem_minmax(0,40rem)_minmax(0,1fr)] md:px-12 md:py-32">
        <p className="font-serif text-7xl leading-none text-gold">{chapter.numeral}</p>
        <div>
          <p className="text-xs tracking-[0.3em] text-mist">
            {chapter.index}
            {lit ? " · 已读" : ""}
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-[2.7rem]">{chapter.title}</h2>
          <p className="mt-8 font-serif text-xl leading-8 text-ink">{chapter.hook}</p>
          <p className="mt-5 text-lg leading-8 text-mist">{chapter.metaphor}</p>
          {chapter.slug ? (
            <Link href={`/learn/${chapter.slug}`} className="cta-ink mt-10">
              {chapter.cta}
            </Link>
          ) : null}
        </div>
        <div>
          <p className="text-lg leading-9 text-ink-soft">{chapter.body}</p>
          <Toy kind={chapter.toy} />
        </div>
      </div>
    </article>
  );
}

export function Journey() {
  const visited = useSyncExternalStore(subscribeVisited, getVisited, getVisitedServer);
  const lessons = CHAPTERS.filter((chapter) => chapter.slug);
  const rest = lessons.filter(
    (chapter) => chapter.id !== "llm-intuition" && chapter.id !== "tokens" && chapter.id !== "attention",
  );
  const lit = visited.filter((slug) => lessons.some((chapter) => chapter.slug === slug)).length;

  return (
    <main>
      <Hero lit={lit} total={lessons.length} />

      <nav aria-label="章节" className="sticky top-[52px] z-30 border-y border-ink/10 bg-paper/92 backdrop-blur">
        <ol className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-2 md:px-12">
          {lessons.map((chapter) => (
            <li key={chapter.id}>
              <a href={`#${chapter.id}`} className="font-serif text-lg text-gold no-underline hover:text-ink">
                {chapter.numeral}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <PinnedTypeAct lit={visited.includes("llm-intuition")} />
      <PinnedTokenAct lit={visited.includes("tokens")} />
      {rest.map((chapter) => (
        <Act key={chapter.id} chapter={chapter} visited={visited} />
      ))}
      <PinnedLampAct lit={visited.includes("attention")} />

      <section className="border-t border-ink/10 bg-night px-6 py-28 text-paper md:px-12">
        <div className="mx-auto max-w-[1400px] grid-cols-2 md:grid">
          <p className="font-serif text-7xl text-gold">终</p>
          <div className="mt-8 md:mt-0">
            <h2 className="font-serif text-4xl leading-tight md:text-5xl">稿子还没合上</h2>
            <p className="mt-6 max-w-xl text-lg leading-9 text-paper/70">
              行程走完，课文还在。刊物是体温，图录是结构。三种翻法，同一条路。
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/learn" className="border border-gold bg-gold px-5 py-2.5 text-sm text-night no-underline">
                课文目录
              </Link>
              <Link href="/blog" className="border border-paper/25 px-5 py-2.5 text-sm text-paper no-underline">
                刊物
              </Link>
              <Link href="/knowledge" className="border border-paper/25 px-5 py-2.5 text-sm text-paper no-underline">
                图录
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
