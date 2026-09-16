"use client";

import Link from "next/link";
import { TokenSplitter } from "@/components/learn/TokenSplitter";
import { PinStage } from "@/components/journey/PinStage";

const BRICKS = ["帮", "我", "看", "看", "这", "份", "周", "报", "Next", "week"];

export function PinnedTokenAct({ lit }: { lit: boolean }) {
  return (
    <PinStage id="tokens" heightClass="h-[200vh]">
      {(progress) => {
        const shown = Math.max(1, Math.round(progress * BRICKS.length));
        return (
          <div className="mx-auto flex w-full max-w-[1400px] flex-col justify-center px-6 py-12 md:px-12">
            <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-end">
              <div>
                <p className="font-serif text-6xl text-gold">贰</p>
                <p className="mt-4 text-xs tracking-[0.28em] text-mist">02{lit ? " · 已读" : ""}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">它看见的不是字</h2>
                <p className="mt-6 max-w-md font-serif text-xl leading-8 text-ink-soft">
                  你看见「帮助」。机器可能看见三截编号。往下滚，砖一块块就位——尺子和人不一样。
                </p>
                <Link href="/learn/tokens" className="cta-ink mt-10 w-fit">
                  亲手掰开一句中文
                </Link>
              </div>
              <div>
                <p className="folio mb-4 text-xs text-mist">示意砖 {shown} / {BRICKS.length}</p>
                <div className="flex flex-wrap gap-2">
                  {BRICKS.map((brick, index) => (
                    <span
                      key={`${brick}-${index}`}
                      className="border border-ink bg-paper px-2 py-2 font-serif text-xl transition-transform duration-300"
                      style={{
                        opacity: index < shown ? 1 : 0.18,
                        transform: `translateY(${index < shown ? 0 : 18}px)`,
                      }}
                    >
                      {brick}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 max-w-3xl">
              <TokenSplitter />
            </div>
          </div>
        );
      }}
    </PinStage>
  );
}
