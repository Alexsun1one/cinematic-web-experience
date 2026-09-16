"use client";

import { useState } from "react";

const modes = {
  wish: {
    label: "愿望句",
    prompt: "帮我用 AI 提升工作效率，写得专业一点。",
    result: "您好！建议您拥抱浪潮、赋能全流程、保持学习……流畅，但没有可执行的下一步。",
  },
  spec: {
    label: "规格句",
    prompt:
      "每周五给产品经理的周报。20 分钟内完成草稿。只用我提供的三件事实；不知道就写「待补」。输出三条，每条=动作+材料+十分钟验收。",
    result:
      "1. 把三次访谈压成「问题 / 证据 / 未决」（验收：每行能指回原话）。\n2. 只根据表写下周两个实验，不发明用户。\n3. 文末留两个「待补」。",
  },
} as const;

export function PromptCompare() {
  const [mode, setMode] = useState<"wish" | "spec">("wish");
  const current = modes[mode];

  return (
    <section className="toy">
      <p className="font-serif text-acid">示意 · 两块铭牌</p>
      <p className="mt-2 text-sm leading-7 text-fog">右边不是真实调用。看的是规格如何把续写从空话里拖出来。</p>
      <div className="mt-4 flex gap-2">
        {(Object.keys(modes) as Array<keyof typeof modes>).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`border px-3 py-1.5 text-sm ${
              mode === key ? "border-acid bg-acid text-void" : "border-bone/15 text-fog"
            }`}
          >
            {modes[key].label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="border border-acid/15 bg-void p-4">
          <p className="text-xs text-fog">你说</p>
          <p className="mt-2 text-sm leading-7">{current.prompt}</p>
        </div>
        <div className="border border-acid/15 bg-void p-4">
          <p className="text-xs text-fog">它可能接着写</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-fog">{current.result}</p>
        </div>
      </div>
    </section>
  );
}
