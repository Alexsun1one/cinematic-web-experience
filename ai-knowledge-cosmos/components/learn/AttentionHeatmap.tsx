"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TOKENS = ["猫", "坐在", "垫子", "上。", "它", "很", "暖和。"];

const WEIGHTS: number[][] = [
  [0.62, 0.08, 0.12, 0.05, 0.04, 0.04, 0.05],
  [0.18, 0.44, 0.22, 0.06, 0.03, 0.03, 0.04],
  [0.14, 0.16, 0.52, 0.08, 0.03, 0.03, 0.04],
  [0.08, 0.22, 0.28, 0.3, 0.04, 0.04, 0.04],
  [0.48, 0.08, 0.1, 0.04, 0.18, 0.06, 0.06],
  [0.06, 0.06, 0.08, 0.05, 0.12, 0.42, 0.21],
  [0.22, 0.08, 0.28, 0.06, 0.1, 0.08, 0.18],
];

const CELL = 42;
const LABEL = 42;

function HeatmapCanvas({
  query,
  onPickRow,
}: {
  query: number;
  onPickRow: (index: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const n = TOKENS.length;
  const width = LABEL + n * CELL + 8;
  const height = LABEL + n * CELL + 8;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = "12px 'Noto Serif SC', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < n; i += 1) {
      ctx.fillStyle = i === query ? "#1a1612" : "#6e675c";
      ctx.fillText(TOKENS[i], LABEL + i * CELL + CELL / 2, 16);
      ctx.fillText(TOKENS[i], 20, LABEL + i * CELL + CELL / 2);
    }

    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        const value = WEIGHTS[row]?.[col] ?? 0;
        const active = row === query;
        const alpha = 0.08 + value * (active ? 0.92 : 0.28);
        ctx.fillStyle = `rgba(184, 137, 58, ${alpha})`;
        const x = LABEL + col * CELL + 2;
        const y = LABEL + row * CELL + 2;
        ctx.fillRect(x, y, CELL - 4, CELL - 4);
        if (active) {
          ctx.fillStyle = "#1a1612";
          ctx.fillText(value.toFixed(2), x + (CELL - 4) / 2, y + (CELL - 4) / 2);
        }
      }
    }
    ctx.strokeStyle = "#1a1612";
    ctx.strokeRect(LABEL, LABEL + query * CELL, n * CELL, CELL);
  }, [query, width, height, n]);

  return (
    <canvas
      ref={ref}
      className="mt-3 max-w-full cursor-pointer"
      role="img"
      aria-label="示意注意力权重矩阵"
      onClick={(event) => {
        const canvas = ref.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scale = height / rect.height;
        const localY = (event.clientY - rect.top) * scale;
        const row = Math.floor((localY - LABEL) / CELL);
        if (row >= 0 && row < n) onPickRow(row);
      }}
    />
  );
}

export function AttentionHeatmap() {
  const [query, setQuery] = useState(4);
  const row = WEIGHTS[query] ?? WEIGHTS[0];
  const ranked = useMemo(
    () =>
      row
        .map((value, index) => ({ value, index }))
        .sort((a, b) => b.value - a.value),
    [row],
  );

  return (
    <section className="toy" id="attention-toy">
      <p className="font-serif text-gold">示意 · 灯照在哪</p>
      <p className="mt-2 text-sm leading-7 text-mist">
        点一个「正在写下」的词。亮的是这一步分出去的份额。手写矩阵，不是真实注意力头。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {TOKENS.map((token, index) => (
          <button
            key={`${token}-${index}`}
            type="button"
            onClick={() => setQuery(index)}
            className={`border px-3 py-1.5 text-sm ${
              query === index ? "border-gold bg-gold text-night" : "border-ink/15"
            }`}
          >
            {token}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-mist">查询词：{TOKENS[query]}</p>
      <div className="overflow-x-auto">
        <HeatmapCanvas query={query} onPickRow={setQuery} />
      </div>
      <ul className="mt-5 space-y-2">
        {ranked.map((item) => (
          <li key={item.index} className="flex items-center gap-3">
            <span className="w-14 shrink-0 font-mono text-xs">{TOKENS[item.index]}</span>
            <span className="h-1.5 flex-1 bg-ink/10">
              <span className="block h-full bg-gold" style={{ width: `${item.value * 100}%` }} />
            </span>
            <span className="w-10 text-right font-mono text-[11px] text-mist">{Math.round(item.value * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
