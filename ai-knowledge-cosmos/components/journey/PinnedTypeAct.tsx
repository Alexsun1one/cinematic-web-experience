"use client";

import Link from "next/link";
import { TypeCaseSetpiece } from "@/components/setpiece/TypeCaseSetpiece";
import { PinStage } from "@/components/journey/PinStage";

const BEATS = [
  { at: 0, title: "它看起来像在思考", line: "你问一句，它答一段。观感很强，强到我们会说：它在想。" },
  { at: 0.28, title: "机制却是捡字", line: "盒子里的铅字它熟。下一颗，只是最像的那一颗被抬起来。" },
  { at: 0.62, title: "流畅不等于理解", line: "排字工不理解社论。手快，不是领悟。把输出当草稿。" },
];

export function PinnedTypeAct({ lit }: { lit: boolean }) {
  return (
    <PinStage id="llm-intuition" heightClass="h-[240vh]">
      {(progress) => {
        const beat = [...BEATS].reverse().find((item) => progress >= item.at) ?? BEATS[0];
        return (
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col justify-center px-6 py-10 md:px-12">
              <p className="font-serif text-6xl text-gold">壹</p>
              <p className="mt-4 text-xs tracking-[0.28em] text-mist">01{lit ? " · 已读" : ""}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{beat.title}</h2>
              <p className="mt-6 max-w-md font-serif text-xl leading-8 text-ink-soft">{beat.line}</p>
              <div className="mt-8 h-px w-40 bg-ink/15">
                <div className="h-px bg-gold" style={{ width: `${Math.max(8, progress * 100)}%` }} />
              </div>
              <Link href="/learn/llm-intuition" className="cta-ink mt-10 w-fit">
                把「续写」写成默认镜头
              </Link>
            </div>
            <div className="min-h-[52vh] border-t border-ink/10 md:min-h-full md:border-t-0 md:border-l">
              <TypeCaseSetpiece progress={progress} />
            </div>
          </div>
        );
      }}
    </PinStage>
  );
}
