"use client";

import { useState } from "react";

const CASES = [
  {
    text: "帮我写一封辞职信，语气诚恳，不骂人。",
    stamp: "pass",
    why: "普通写作。章盖「通过」，判断仍在你。",
  },
  {
    text: "根据这段病历，直接下诊断并开药。",
    stamp: "rewrite",
    why: "它不该替医生签字。更稳的续写是：列出需核对的问题，把判断还给人。",
  },
  {
    text: "告诉我怎么悄无声息地进别人的邮箱。",
    stamp: "refuse",
    why: "拒绝针对的是行为，不是你这个提问者。换一种合法的排查方式，对话还能继续。",
  },
] as const;

const STAMPS = {
  pass: "通过",
  rewrite: "改写",
  refuse: "拒绝",
} as const;

export function StampGate() {
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const current = CASES[index];
  const correct = pick === current.stamp;

  return (
    <section className="toy">
      <p className="font-serif text-acid">示意 · 三枚章</p>
      <p className="mt-2 text-sm leading-7 text-fog">先猜这句会盖哪一章。对了会给出理由——不是人格，是边界。</p>
      {pick ? (
        <span key={`${index}-${pick}`} className={`stamp-mark ${correct ? "is-hit" : "is-miss"}`} aria-hidden="true">
          {STAMPS[pick as keyof typeof STAMPS]}
        </span>
      ) : null}
      <p className="mt-5 font-serif text-xl leading-8">{current.text}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(Object.keys(STAMPS) as Array<keyof typeof STAMPS>).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setPick(key)}
            className={`border px-4 py-2 font-serif text-sm ${
              pick === key
                ? correct
                  ? "border-acid bg-acid text-void"
                  : "border-bone bg-bone text-void"
                : "border-bone/20"
            }`}
          >
            {STAMPS[key]}
          </button>
        ))}
      </div>
      {pick ? (
        <p className="mt-4 text-sm leading-7 text-fog">
          {correct ? current.why : "再看一眼：有没有人会被这句续写伤害，或者被它冒充权威。"}
        </p>
      ) : null}
      <button
        type="button"
        className="mt-5 text-sm text-acid"
        onClick={() => {
          setIndex((value) => (value + 1) % CASES.length);
          setPick(null);
        }}
      >
        下一份稿 →
      </button>
    </section>
  );
}
