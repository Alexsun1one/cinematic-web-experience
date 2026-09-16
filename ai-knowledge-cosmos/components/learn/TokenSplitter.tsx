"use client";

import { useMemo, useState } from "react";

function splitToy(text: string) {
  const pieces: { text: string; kind: "cjk" | "word" | "num" | "punct" | "space" }[] = [];
  const source = text.slice(0, 180);
  const matcher =
    /[\u3400-\u9fff]|[A-Za-z]+(?:'[A-Za-z]+)?|\d+(?:\.\d+)?|[^\sA-Za-z0-9\u3400-\u9fff]+|\s+/g;
  const found = source.match(matcher) ?? [];
  for (const chunk of found) {
    if (/^\s+$/.test(chunk)) {
      pieces.push({ text: chunk, kind: "space" });
    } else if (/^[\u3400-\u9fff]$/.test(chunk)) {
      pieces.push({ text: chunk, kind: "cjk" });
    } else if (/^\d/.test(chunk)) {
      pieces.push({ text: chunk, kind: "num" });
    } else if (/^[A-Za-z]/.test(chunk)) {
      if (chunk.length <= 4) {
        pieces.push({ text: chunk, kind: "word" });
      } else {
        for (let i = 0; i < chunk.length; i += 4) {
          pieces.push({ text: chunk.slice(i, i + 4), kind: "word" });
        }
      }
    } else {
      pieces.push({ text: chunk, kind: "punct" });
    }
  }
  return pieces.filter((piece) => piece.kind !== "space" || piece.text.includes("\n"));
}

const palette: Record<string, string> = {
  cjk: "border-teal/40 bg-teal/10 text-teal",
  word: "border-blue/40 bg-blue/10 text-blue",
  num: "border-amber/40 bg-amber/10 text-amber",
  punct: "border-violet/40 bg-violet/10 text-violet",
  space: "border-ivory/10 text-mute",
};

export function TokenSplitter() {
  const [text, setText] = useState("帮我看看这份周报，再写三个下一步。Next week 再对齐。");
  const tokens = useMemo(() => splitToy(text), [text]);
  const count = tokens.filter((token) => token.kind !== "space").length;

  return (
    <section className="my-8 rounded-2xl border border-blue/25 bg-blue/5 p-5">
      <p className="text-xs tracking-[0.22em] text-blue uppercase">示意切分玩具</p>
      <p className="mt-2 text-sm leading-7 text-mist">
        不是真实 tokenizer。中文常按字、英文长词会被捏碎——用来建立「机器的尺子和人不一样」的手感。
      </p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        className="mt-4 w-full resize-none rounded-xl border border-ivory/10 bg-void/60 px-3 py-2 text-sm leading-7 text-ivory outline-none focus:border-blue/50"
      />
      <p className="mt-3 text-xs text-mute">示意砖块约 {count} 枚</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tokens.map((token, index) => (
          <span
            key={`${token.text}-${index}`}
            className={`rounded-md border px-1.5 py-0.5 font-mono text-[12px] ${palette[token.kind]}`}
          >
            {token.text === " " ? "·" : token.text}
          </span>
        ))}
      </div>
    </section>
  );
}
