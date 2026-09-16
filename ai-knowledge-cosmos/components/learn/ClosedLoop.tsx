"use client";

import { useState } from "react";

const SLOTS = [
  { key: "q", label: "问题", hint: "我要在周五前写出能给经理看的周报草稿。" },
  { key: "ok", label: "成功标准", hint: "三条，每条能指回一件本周事实。" },
  { key: "try", label: "一次尝试", hint: "把三件事实贴进去，限制它不准发明。" },
  { key: "check", label: "一次检验", hint: "逐条对照纪要。对不上的标「待补」。" },
  { key: "next", label: "一次迭代", hint: "只改失败的那一条，别重写全文。" },
] as const;

export function ClosedLoop() {
  const [filled, setFilled] = useState<Record<string, boolean>>({});
  const done = SLOTS.filter((slot) => filled[slot.key]).length;

  return (
    <section className="toy">
      <p className="font-serif text-acid">示意 · 五块砖</p>
      <p className="mt-2 text-sm leading-7 text-fog">
        点亮一格，表示你真的写过。不要追求完美提示词。目标是把「帮我看看」跑完一圈。已点 {done} / 5
      </p>
      <ol className="mt-5 space-y-2">
        {SLOTS.map((slot) => (
          <li key={slot.key}>
            <button
              type="button"
              onClick={() => setFilled((prev) => ({ ...prev, [slot.key]: !prev[slot.key] }))}
              className={`flex w-full items-start gap-3 border px-3 py-3 text-left ${
                filled[slot.key] ? "border-acid bg-acid/15" : "border-bone/15"
              }`}
            >
              <span className="font-serif text-acid">{filled[slot.key] ? "●" : "○"}</span>
              <span>
                <span className="font-serif">{slot.label}</span>
                <span className="mt-1 block text-sm text-fog">{slot.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
