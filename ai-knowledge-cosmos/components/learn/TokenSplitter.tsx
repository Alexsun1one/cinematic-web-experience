"use client";

import { useMemo, useState } from "react";

function splitToy(text: string) {
  const pieces: { text: string; kind: "cjk" | "word" | "num" | "punct" }[] = [];
  const source = text.slice(0, 160);
  const matcher =
    /[\u3400-\u9fff]|[A-Za-z]+(?:'[A-Za-z]+)?|\d+(?:\.\d+)?|[^\sA-Za-z0-9\u3400-\u9fff]+|\s+/g;
  const found = source.match(matcher) ?? [];
  for (const chunk of found) {
    if (/^\s+$/.test(chunk)) continue;
    if (/^[\u3400-\u9fff]$/.test(chunk)) pieces.push({ text: chunk, kind: "cjk" });
    else if (/^\d/.test(chunk)) pieces.push({ text: chunk, kind: "num" });
    else if (/^[A-Za-z]/.test(chunk)) {
      if (chunk.length <= 4) pieces.push({ text: chunk, kind: "word" });
      else {
        for (let i = 0; i < chunk.length; i += 4) {
          pieces.push({ text: chunk.slice(i, i + 4), kind: "word" });
        }
      }
    } else pieces.push({ text: chunk, kind: "punct" });
  }
  return pieces;
}

export function TokenSplitter() {
  const [text, setText] = useState("帮我看看这份周报，再写三个下一步。Next week 再对齐。");
  const tokens = useMemo(() => splitToy(text), [text]);

  return (
    <section className="toy">
      <p className="font-serif text-acid">示意 · 切砖</p>
      <p className="mt-2 text-sm leading-7 text-fog">
        不是真实 tokenizer。中文常按字，英文长词会被锯开——机器的尺子和人不一样。
      </p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        className="mt-4 w-full resize-none border border-bone/15 bg-void px-3 py-2 text-sm leading-7 text-bone outline-none focus:border-acid"
      />
      <p className="mt-3 font-mono text-xs text-fog">约 {tokens.length} 块</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tokens.map((token, index) => (
          <span
            key={`${token.text}-${index}`}
            className={`border px-1.5 py-0.5 font-mono text-[12px] ${
              token.kind === "cjk"
                ? "border-acid/50 bg-acid/10"
                : token.kind === "word"
                  ? "border-bone/20"
                  : "border-bone/10 text-fog"
            }`}
          >
            {token.text}
          </span>
        ))}
      </div>
    </section>
  );
}
