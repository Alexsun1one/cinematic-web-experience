"use client";

import Link from "next/link";
import { LampSetpiece } from "@/components/setpiece/LampSetpiece";
import { PinStage } from "@/components/journey/PinStage";

export function PinnedLampAct({ lit }: { lit: boolean }) {
  return (
    <PinStage id="attention" heightClass="h-[230vh]">
      {(progress) => (
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="min-h-[52vh] md:min-h-full">
            <LampSetpiece progress={progress} />
          </div>
          <div className="flex flex-col justify-center border-t border-ink/10 px-6 py-10 md:border-t-0 md:border-l md:px-12">
            <p className="font-serif text-6xl text-gold">捌</p>
            <p className="mt-4 text-xs tracking-[0.28em] text-mist">08{lit ? " · 已读" : ""}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">灯罩一转</h2>
            <p className="mt-6 max-w-md font-serif text-xl leading-8 text-ink-soft">
              注意是锥光，不是洞察。往下滚，灯从「猫」转到「它」。权重大了，并不等于它懂了。
            </p>
            <div className="mt-8 h-px w-48 bg-ink/15">
              <div className="h-px bg-gold" style={{ width: `${Math.max(8, progress * 100)}%` }} />
            </div>
            <Link href="/learn/attention" className="cta-ink mt-10 w-fit">
              转动那盏灯
            </Link>
          </div>
        </div>
      )}
    </PinStage>
  );
}
