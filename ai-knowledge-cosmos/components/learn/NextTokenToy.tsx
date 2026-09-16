"use client";

import { useState } from "react";

const PREFIX = "今晚月色";
const CHOICES = [
  { word: "很好", weight: 0.46, note: "最常见的续法，像已经亮起的那一颗。" },
  { word: "不错", weight: 0.28, note: "稍退一步的礼貌。" },
  { word: "很差", weight: 0.08, note: "语法通，但和「月色」的常见搭配拧着。" },
  { word: "像霜", weight: 0.18, note: "更文学，训练里也见过。" },
];

export function NextTokenToy() {
  const [picked, setPicked] = useState<string | null>(null);
  const choice = CHOICES.find((item) => item.word === picked);

  return (
    <section className="toy">
      <p className="font-serif text-acid">示意 · 下一颗字</p>
      <p className="mt-2 text-sm leading-7 text-fog">
        点一枚候选。这不是真实模型，是为了让你看见：它在选「像」，不是在观赏月亮。
      </p>
      <p className="mt-5 font-serif text-2xl text-bone">
        {PREFIX}
        <span className="text-acid">{picked ? ` ${picked}` : " ▍"}</span>
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {CHOICES.map((item) => (
          <button
            key={item.word}
            type="button"
            onClick={() => setPicked(item.word)}
            className={`border px-3 py-1.5 text-sm ${
              picked === item.word ? "border-acid bg-acid text-void" : "border-bone/15 text-fog"
            }`}
          >
            {item.word}
            <span className="ml-2 font-mono text-[11px] opacity-70">{Math.round(item.weight * 100)}%</span>
          </button>
        ))}
      </div>
      {choice ? <p className="mt-4 text-sm leading-7 text-fog">{choice.note}</p> : null}
    </section>
  );
}
