"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TOKENS = ["猫", "坐在", "垫子", "上。", "它", "很", "暖和。"];

/** Pedagogical weights, not a real attention head. Rows = query, cols = key. */
const WEIGHTS: number[][] = [
  [0.62, 0.08, 0.12, 0.05, 0.04, 0.04, 0.05],
  [0.18, 0.44, 0.22, 0.06, 0.03, 0.03, 0.04],
  [0.14, 0.16, 0.52, 0.08, 0.03, 0.03, 0.04],
  [0.08, 0.22, 0.28, 0.3, 0.04, 0.04, 0.04],
  [0.48, 0.08, 0.1, 0.04, 0.18, 0.06, 0.06],
  [0.06, 0.06, 0.08, 0.05, 0.12, 0.42, 0.21],
  [0.22, 0.08, 0.28, 0.06, 0.1, 0.08, 0.18],
];

const CELL = 44;
const LABEL = 44;

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
    ctx.font = "12px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < n; i += 1) {
      ctx.fillStyle = i === query ? "#f3eee4" : "#8a8578";
      ctx.fillText(TOKENS[i], LABEL + i * CELL + CELL / 2, 18);
      ctx.fillText(TOKENS[i], 22, LABEL + i * CELL + CELL / 2);
    }

    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        const value = WEIGHTS[row]?.[col] ?? 0;
        const active = row === query;
        const alpha = 0.1 + value * (active ? 0.9 : 0.38);
        ctx.fillStyle = `rgba(155, 140, 255, ${alpha})`;
        const x = LABEL + col * CELL + 2;
        const y = LABEL + row * CELL + 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, CELL - 4, CELL - 4, 6);
        } else {
          ctx.rect(x, y, CELL - 4, CELL - 4);
        }
        ctx.fill();
        if (active) {
          ctx.fillStyle = "#f3eee4";
          ctx.fillText(value.toFixed(2), x + (CELL - 4) / 2, y + (CELL - 4) / 2);
        }
      }
    }

    ctx.strokeStyle = "rgba(243, 238, 228, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(LABEL, LABEL + query * CELL, n * CELL, CELL);
  }, [query, width, height, n]);

  return (
    <canvas
      ref={ref}
      className="mt-3 max-w-full cursor-pointer"
      role="img"
      aria-label="示意注意力权重矩阵，点击某一行选择查询词"
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
    <section className="my-8 rounded-2xl border border-violet/25 bg-violet/5 p-5" id="attention-toy">
      <p className="text-xs tracking-[0.22em] text-violet uppercase">示意注意热力</p>
      <p className="mt-2 text-sm leading-7 text-mist">
        点选一个「正在生成」的词，或点击热力矩阵的某一行。颜色越亮，这一步分给该位置的权重越高。这是手写的教学矩阵，不是真实模型的注意力头。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {TOKENS.map((token, index) => (
          <button
            key={`${token}-${index}`}
            type="button"
            onClick={() => setQuery(index)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              query === index ? "bg-ivory text-void" : "border border-ivory/20 text-mist"
            }`}
          >
            {token}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-mute">查询词：{TOKENS[query]} · 行是查询，列是被看向的位置</p>
      <div className="overflow-x-auto">
        <HeatmapCanvas query={query} onPickRow={setQuery} />
      </div>
      <ul className="mt-5 space-y-2">
        {ranked.map((item) => (
          <li key={item.index} className="flex items-center gap-3">
            <span className="w-14 shrink-0 font-mono text-xs text-mist">{TOKENS[item.index]}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-ivory/10">
              <span
                className="block h-full rounded-full bg-violet"
                style={{ width: `${item.value * 100}%` }}
              />
            </span>
            <span className="w-10 text-right font-mono text-[11px] text-mute">
              {Math.round(item.value * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
