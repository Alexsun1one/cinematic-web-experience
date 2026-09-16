"use client";

import { useState } from "react";

const STEPS = [
  { title: "想", detail: "把用户的句子收成一个可执行的意图：查天气，而不是写一首关于天气的诗。" },
  { title: "伸手", detail: "调用工具。你现在该看见：函数名、参数、返回。看不见这一步，就等于把钥匙塞进黑箱。" },
  { title: "看回执", detail: "把工具的原文接回上下文，再续写。回执是错的，后面的流利句子也会错。" },
  { title: "停或再转", detail: "失败就停，写给人类看。成功才允许走进下一圈。不要用更流畅的编造去填空。" },
];

export function ToolLoop() {
  const [step, setStep] = useState(0);

  return (
    <section className="toy">
      <p className="font-serif text-acid">示意 · 伸手的一圈</p>
      <p className="mt-2 text-sm leading-7 text-fog">点下一步。智能体不是灵魂，是这四拍。少一拍，事故半径就藏起来。</p>
      <ol className="mt-5 grid grid-cols-4 gap-2">
        {STEPS.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => setStep(index)}
              className={`w-full border px-2 py-3 font-serif ${
                step === index ? "border-acid bg-acid text-void" : "border-bone/15"
              }`}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm leading-7 text-fog">
        <span className="text-acid">{STEPS[step].title}。</span> {STEPS[step].detail}
      </p>
    </section>
  );
}
