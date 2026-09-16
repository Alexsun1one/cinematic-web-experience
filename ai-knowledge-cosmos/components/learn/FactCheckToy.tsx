"use client";

import { useState } from "react";

const lines = [
  { text: "Transformer 论文发表于 2017 年。", kind: "fact" as const },
  { text: "这个方案一定能让转化率翻倍。", kind: "style" as const },
  { text: "你们上周三的会议纪要第 2 条写了预算上限。", kind: "check" as const },
  { text: "作为行业领先的智能助手，我将为您全面赋能。", kind: "style" as const },
];

const labels = {
  fact: "可核对",
  style: "文风 / 空话",
  check: "必须去查",
};

export function FactCheckToy() {
  const [picks, setPicks] = useState<Record<number, string>>({});

  return (
    <section className="toy">
      <p className="font-serif text-gold">示意 · 三个抽屉</p>
      <p className="mt-2 text-sm leading-7 text-mist">给每句找去处。对了留下，错了再试。训练的是停下来的肌肉。</p>
      <ul className="mt-4 space-y-3">
        {lines.map((line, index) => {
          const pick = picks[index];
          const correct = pick === line.kind;
          return (
            <li key={line.text} className="border border-ink/10 p-3">
              <p className="text-sm leading-7">{line.text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPicks((prev) => ({ ...prev, [index]: key }))}
                    className={`border px-3 py-1 text-xs ${
                      pick === key
                        ? correct
                          ? "border-gold bg-gold text-night"
                          : "border-ink bg-ink text-paper"
                        : "border-ink/20 text-mist"
                    }`}
                  >
                    {labels[key]}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
