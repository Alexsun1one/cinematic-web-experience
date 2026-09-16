"use client";

import Link from "next/link";
import { AttentionHeatmap } from "@/components/learn/AttentionHeatmap";
import { ClosedLoop } from "@/components/learn/ClosedLoop";
import { FactCheckToy } from "@/components/learn/FactCheckToy";
import { PromptCompare } from "@/components/learn/PromptCompare";
import { StampGate } from "@/components/learn/StampGate";
import { ToolLoop } from "@/components/learn/ToolLoop";
import { TokenWall } from "@/components/gallery/TokenWall";
import { LampSetpiece } from "@/components/setpiece/LampSetpiece";
import { TypeCaseSetpiece } from "@/components/setpiece/TypeCaseSetpiece";
import type { Chapter } from "@/lib/journey";

function Exhibit({ chapter, progress }: { chapter: Chapter; progress: number }) {
  if (chapter.setpiece === "typecase") return <TypeCaseSetpiece progress={progress} />;
  if (chapter.setpiece === "lamp") return <LampSetpiece progress={progress} />;
  if (chapter.toy === "tokens") return <TokenWall />;
  if (chapter.toy === "prompt") return <PromptCompare />;
  if (chapter.toy === "stamp") return <StampGate />;
  if (chapter.toy === "loop") return <ToolLoop />;
  if (chapter.toy === "checklist") return <ClosedLoop />;
  if (chapter.toy === "facts") return <FactCheckToy />;
  if (chapter.toy === "attention") return <AttentionHeatmap />;
  return null;
}

export function Chamber({
  chapter,
  visited,
  local,
  slot,
}: {
  chapter: Chapter;
  visited: boolean;
  local: number;
  slot: number;
}) {
  return (
    <section data-chamber={slot} className="chamber relative isolate h-svh w-screen shrink-0 overflow-hidden bg-hall">
      <div className="spot" aria-hidden="true" />
      <div className="chamber-edge-left pointer-events-none absolute inset-y-0 left-0 w-12" aria-hidden="true" />
      <div className="chamber-edge-right pointer-events-none absolute inset-y-0 right-0 w-10" aria-hidden="true" />
      <p className="chamber-numeral pointer-events-none absolute top-1/2 left-[-3vw] -translate-y-1/2 select-none font-serif leading-none text-acid/10">
        {chapter.numeral}
      </p>

      <div className="relative z-10 grid h-full items-stretch gap-6 px-[5vw] pt-20 pb-10 md:grid-cols-[minmax(22rem,1fr)_minmax(0,1.15fr)]">
        <div className="chamber-copy flex flex-col justify-between">
          <div>
            <p className="text-[10px] tracking-[0.42em] text-acid">
              展厅 {chapter.index}
              {visited ? " · 已入" : ""}
            </p>
            <h2 className="mt-5 max-w-lg font-serif text-[2.15rem] leading-[1.15] text-bone md:text-[2.7rem]">{chapter.title}</h2>
            <p className="mt-8 max-w-sm font-serif text-2xl leading-snug text-bone/90">{chapter.wall}</p>
            <p className="mt-5 max-w-sm text-base leading-8 text-fog">{chapter.metaphor}</p>
          </div>
          <div className="chamber-plate plate mt-8 w-[min(100%,20rem)]">
            <p className="flex items-center justify-between text-[11px] tracking-[0.28em] text-acid">
              <span>{chapter.plate}</span>
              <span className="h-1 w-1 rounded-full bg-acid" />
            </p>
            <p className="mt-2 text-sm leading-6 text-fog">{chapter.hook}</p>
            {chapter.slug ? (
              <Link href={`/learn/${chapter.slug}`} className="hall-link mt-5 inline-block text-[12px] tracking-[0.28em] text-acid no-underline">
                {chapter.cta} →
              </Link>
            ) : null}
          </div>
        </div>

        <div className="chamber-stage flex min-h-0 flex-col justify-end">
          <div className="vitrine min-h-[22rem] flex-1 overflow-hidden md:min-h-0">
            <Exhibit chapter={chapter} progress={local} />
          </div>
          <div className="pedestal" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
