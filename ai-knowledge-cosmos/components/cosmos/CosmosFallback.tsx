"use client";

import Link from "next/link";
import { colorHex, COSMOS_NODES, lessons } from "@/lib/cosmos";

export function CosmosFallback({
  focused,
  onFocus,
}: {
  focused: string | null;
  onFocus: (id: string | null) => void;
}) {
  const width = 960;
  const height = 620;
  const cx = width / 2;
  const cy = height / 2 + 10;

  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full max-h-[78vh]"
        role="img"
        aria-label="知识宇宙静态星图"
      >
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9b8cff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#05060c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r="210" fill="url(#coreGlow)" />
        {lessons.map((node, index) => {
          const angle = (Math.PI * 2 * index) / lessons.length - Math.PI / 2;
          const x = cx + Math.cos(angle) * 220;
          const y = cy + Math.sin(angle) * 150;
          return (
            <line
              key={node.id}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={colorHex[node.color]}
              strokeOpacity="0.35"
            />
          );
        })}
        <g>
          <circle cx={cx} cy={cy} r="28" fill="#f3eee4" />
          <text x={cx} y={cy + 5} textAnchor="middle" fill="#05060c" fontSize="12">
            理解核
          </text>
        </g>
        {lessons.map((node, index) => {
          const angle = (Math.PI * 2 * index) / lessons.length - Math.PI / 2;
          const x = cx + Math.cos(angle) * 220;
          const y = cy + Math.sin(angle) * 150;
          const active = focused === node.id;
          return (
            <g key={node.id} className="cursor-pointer" onClick={() => onFocus(node.id)}>
              <circle
                cx={x}
                cy={y}
                r={active ? 16 : 12}
                fill={colorHex[node.color]}
                opacity={active ? 1 : 0.85}
              />
              <text
                x={x}
                y={y + 32}
                textAnchor="middle"
                fill="#f3eee4"
                fontSize="13"
              >
                {node.stage} {node.title}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="sr-only">
        {COSMOS_NODES.filter((node) => node.kind === "lesson")
          .map((node) => `${node.title}：${node.summary}`)
          .join(" ")}
      </p>
      <Link href="/knowledge" className="sr-only">
        打开完整星图
      </Link>
    </div>
  );
}
