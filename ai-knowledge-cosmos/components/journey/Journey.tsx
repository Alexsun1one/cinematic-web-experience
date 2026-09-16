"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { AttentionHeatmap } from "@/components/learn/AttentionHeatmap";
import { ClosedLoop } from "@/components/learn/ClosedLoop";
import { FactCheckToy } from "@/components/learn/FactCheckToy";
import { NextTokenToy } from "@/components/learn/NextTokenToy";
import { PromptCompare } from "@/components/learn/PromptCompare";
import { StampGate } from "@/components/learn/StampGate";
import { TokenSplitter } from "@/components/learn/TokenSplitter";
import { ToolLoop } from "@/components/learn/ToolLoop";
import { LampSetpiece } from "@/components/setpiece/LampSetpiece";
import { TypeCaseSetpiece } from "@/components/setpiece/TypeCaseSetpiece";
import { CHAPTERS, type Chapter } from "@/lib/journey";
import { getVisited, getVisitedServer, subscribeVisited } from "@/lib/progress";

function Toy({ kind }: { kind: Chapter["toy"] }) {
  if (kind === "next-token") return <NextTokenToy />;
  if (kind === "tokens") return <TokenSplitter />;
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
    <article id={chapter.id} className="scroll-mt-28 border-t border-ink/10">
      <div className="mx-auto max-w-3xl px-5 py-24 md:py-32">
        <p className="font-serif text-6xl leading-none text-gold md:text-7xl">{chapter.numeral}</p>
        <p className="mt-6 text-sm text-mist">
          {chapter.index}
          {lit ? " · 已读过课文" : ""}
        </p>
        <h2 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-5xl">{chapter.title}</h2>
        <p className="mt-8 text-xl leading-9 text-ink-soft">{chapter.hook}</p>
        <p className="mt-6 border-l-2 border-gold pl-5 font-serif text-lg leading-8 text-ink">{chapter.metaphor}</p>
        <p className="mt-6 text-lg leading-9 text-mist">{chapter.body}</p>
        <Toy kind={chapter.toy} />
        {chapter.setpiece === "typecase" ? <TypeCaseSetpiece /> : null}
        {chapter.setpiece === "lamp" ? <LampSetpiece /> : null}
        {chapter.slug ? (
          <Link
            href={`/learn/${chapter.slug}`}
            className="mt-10 inline-flex border border-ink bg-ink px-5 py-2.5 text-sm text-paper no-underline hover:bg-gold hover:text-night"
          >
            {chapter.cta} →
          </Link>
        ) : (
          <a
            href="#llm-intuition"
            className="mt-10 inline-flex border border-gold px-5 py-2.5 text-sm text-gold-deep no-underline"
          >
            {chapter.cta} →
          </a>
        )}
      </div>
    </article>
  );
}

export function Journey() {
  const visited = useSyncExternalStore(subscribeVisited, getVisited, getVisitedServer);
  const [prologue, ...rest] = CHAPTERS;
  const lit = visited.filter((slug) => rest.some((chapter) => chapter.slug === slug)).length;

  return (
    <main>
      <section className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-28 md:px-12 md:pb-24">
        <p className="font-serif text-7xl text-gold md:text-8xl">{prologue.numeral}</p>
        <h1 className="mt-8 max-w-4xl font-serif text-5xl leading-[1.12] tracking-tight text-ink md:text-7xl">
          它不会想。
          <br />
          它会接着写。
        </h1>
        <p className="mt-10 max-w-xl text-lg leading-9 text-ink-soft">{prologue.body}</p>
        <p className="mt-8 max-w-xl font-serif text-xl leading-8 text-ink">{prologue.hook}</p>
        <div className="mt-16 flex flex-wrap items-end justify-between gap-6">
          <a href="#llm-intuition" className="text-sm text-gold-deep no-underline">
            往下翻页，别绕开
          </a>
          <p className="text-sm text-mist">
            课文已读 {lit} / {rest.length}
          </p>
        </div>
      </section>

      <nav aria-label="章节" className="sticky top-[57px] z-30 border-y border-ink/10 bg-paper/95 backdrop-blur">
        <ol className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 py-2 text-sm">
          {rest.map((chapter) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className="flex items-baseline gap-2 whitespace-nowrap px-3 py-1 text-mist no-underline hover:text-ink"
              >
                <span className="font-serif text-lg text-gold">{chapter.numeral}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {rest.map((chapter) => (
        <Act key={chapter.id} chapter={chapter} visited={visited} />
      ))}

      <section className="border-t border-ink/10 bg-night px-5 py-24 text-paper">
        <div className="mx-auto max-w-3xl">
          <p className="font-serif text-gold">终章不是终点</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">把稿子合上之前</h2>
          <p className="mt-6 max-w-xl text-lg leading-9 text-paper/75">
            行程走完，课文还在。刊物是体温，图录是结构。三者是同一条路的三种翻法，不是三个互不相干的产品页。
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/learn" className="border border-gold bg-gold px-5 py-2.5 text-sm text-night no-underline">
              课文目录
            </Link>
            <Link href="/blog" className="border border-paper/30 px-5 py-2.5 text-sm text-paper no-underline">
              打开刊物
            </Link>
            <Link href="/knowledge" className="border border-paper/30 px-5 py-2.5 text-sm text-paper no-underline">
              看图录
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
