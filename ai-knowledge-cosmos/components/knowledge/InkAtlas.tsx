"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CHAPTERS } from "@/lib/journey";

export function InkAtlas() {
  const chapters = useMemo(() => CHAPTERS.filter((chapter) => chapter.slug), []);
  const [active, setActive] = useState(chapters[0]?.id ?? "llm-intuition");
  const current = chapters.find((chapter) => chapter.id === active) ?? chapters[0];
  const points = useMemo(
    () =>
      chapters.map((chapter, index) => {
        const t = index / Math.max(chapters.length - 1, 1);
        return {
          id: chapter.id,
          x: 80 + t * 720,
          y: 70 + Math.sin(t * Math.PI) * 90 + (index % 2) * 28,
        };
      }),
    [chapters],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
      <svg viewBox="0 0 880 280" className="w-full border border-ink/10 bg-paper-2/40" role="img" aria-label="课程图录">
        <path
          d={points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")}
          fill="none"
          stroke="#b8893a"
          strokeWidth="1.25"
        />
        {points.map((point, index) => {
          const chapter = chapters[index];
          const selected = chapter.id === active;
          return (
            <g key={point.id} className="cursor-pointer" onClick={() => setActive(chapter.id)}>
              <circle cx={point.x} cy={point.y} r={selected ? 9 : 6} fill={selected ? "#b8893a" : "#1a1612"} />
              <text
                x={point.x}
                y={point.y + 28}
                textAnchor="middle"
                fill="#1a1612"
                fontSize="13"
                fontFamily="Noto Serif SC, serif"
              >
                {chapter.numeral}
              </text>
            </g>
          );
        })}
      </svg>
      <aside className="border-t border-ink/15 pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
        <p className="font-serif text-5xl text-gold">{current.numeral}</p>
        <h2 className="mt-4 font-serif text-3xl">{current.title}</h2>
        <p className="mt-4 leading-8 text-ink-soft">{current.metaphor}</p>
        <p className="mt-3 text-sm leading-7 text-mist">{current.body}</p>
        {current.slug ? (
          <Link
            href={`/learn/${current.slug}`}
            className="mt-6 inline-flex border border-ink bg-ink px-4 py-2 text-sm text-paper no-underline"
          >
            打开课文
          </Link>
        ) : null}
      </aside>
    </div>
  );
}
