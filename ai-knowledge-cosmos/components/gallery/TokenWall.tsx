"use client";

import { useState } from "react";

const UNITS = [
  { text: "帮", kind: "cjk" as const, note: "一个汉字，常常就是一块砖。" },
  { text: "助", kind: "cjk" as const, note: "你看见词。机器看见另一块独立的砖。" },
  { text: "help", kind: "lat" as const, note: "短词勉强整块过去。" },
  { text: "fulness", kind: "lat" as const, note: "长词会被锯。窗口按锯后的块数收费。" },
  { text: "我", kind: "cjk" as const, note: "中文的「我」很便宜。一枚就够。" },
  { text: "Next", kind: "lat" as const, note: "夹进英文，尺子立刻换手。" },
];

export function TokenWall() {
  const [active, setActive] = useState(0);
  const current = UNITS[active];

  return (
    <div className="relative h-full min-h-[22rem] overflow-hidden px-4 py-6" style={{ perspective: "900px" }}>
      <div
        className="grid h-full grid-cols-3 gap-3"
        style={{ transform: "rotateY(-16deg) rotateX(4deg)", transformOrigin: "left center" }}
      >
        {UNITS.map((unit, index) => (
          <button
            key={`${unit.text}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`grid place-items-center border font-serif transition-transform ${
              index === active
                ? "-translate-y-2 border-acid bg-acid text-void"
                : "border-acid/25 bg-wall/80 text-bone"
            } ${unit.kind === "lat" ? "text-2xl tracking-tight" : "text-5xl"}`}
          >
            {unit.text}
          </button>
        ))}
      </div>
      <p className="relative z-10 mt-5 text-sm leading-7 text-fog">
        点中「{current.text}」。{current.note} 示意，不是真实 tokenizer。
      </p>
    </div>
  );
}
