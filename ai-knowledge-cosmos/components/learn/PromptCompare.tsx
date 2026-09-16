"use client";

import { useState } from "react";

const modes = {
  wish: {
    label: "愿望句",
    prompt: "帮我用 AI 提升工作效率，写得专业一点。",
    result:
      "您好！作为效率专家，我建议您拥抱人工智能浪潮，赋能全流程，打造卓越生产力。您可以尝试多使用工具、保持学习、优化心态……（流畅，但没有可执行的下一步。）",
  },
  spec: {
    label: "规格句",
    prompt:
      "场景：每周五写给产品经理的周报。目标：20 分钟内完成草稿。约束：只用我提供的三件事实；不知道就写「待补」。输出：三条，每条=动作+材料+十分钟验收。",
    result:
      "1. 把本周三次用户访谈纪要压成「问题 / 证据 / 未决」表（材料：纪要原文；验收：表里每行都能指回一句原话）。\n2. 只根据表写下周两个实验，不发明新用户画像。\n3. 文末列出两个「待补」空位，留给你填数字。",
  },
} as const;

export function PromptCompare() {
  const [mode, setMode] = useState<"wish" | "spec">("wish");
  const current = modes[mode];

  return (
    <section className="my-8 rounded-2xl border border-violet/25 bg-violet/5 p-5">
      <p className="text-xs tracking-[0.22em] text-violet uppercase">对照玩具 · 示意输出</p>
      <p className="mt-2 text-sm leading-7 text-mist">
        同一任务，两种写法。右边不是真实模型调用，是为了让你看见「规格如何改变续写方向」。
      </p>
      <div className="mt-4 flex gap-2">
        {(Object.keys(modes) as Array<keyof typeof modes>).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              mode === key ? "bg-ivory text-void" : "border border-ivory/20 text-mist"
            }`}
          >
            {modes[key].label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-ivory/10 bg-void/50 p-4">
          <p className="text-xs text-mute">你说</p>
          <p className="mt-2 text-sm leading-7 text-ivory">{current.prompt}</p>
        </div>
        <div className="rounded-xl border border-ivory/10 bg-void/50 p-4">
          <p className="text-xs text-mute">模型可能续写成</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-mist">{current.result}</p>
        </div>
      </div>
    </section>
  );
}
