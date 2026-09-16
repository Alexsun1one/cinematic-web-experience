"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COSMOS_EDGES, COSMOS_NODES, colorHex, getNode, neighborsOf } from "@/lib/cosmos";

function project(position: [number, number, number]) {
  return {
    x: 480 + position[0] * 58 + position[2] * 12,
    y: 340 - position[1] * 70 - position[2] * 36,
  };
}

export function KnowledgeAtlas() {
  const [active, setActive] = useState<string>("core");
  const node = getNode(active) ?? COSMOS_NODES[0];
  const neighbors = neighborsOf(node.id);
  const points = useMemo(
    () => new Map(COSMOS_NODES.map((item) => [item.id, project(item.position)] as const)),
    [],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
      <svg
        viewBox="0 0 960 680"
        className="panel w-full rounded-[2rem] bg-ink/80"
        role="img"
        aria-label="可检视知识星图"
      >
        {COSMOS_EDGES.map(([a, b]) => {
          const from = points.get(a);
          const to = points.get(b);
          if (!from || !to) return null;
          const lit = a === active || b === active;
          return (
            <line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={lit ? colorHex[node.color] : "#c9c3b6"}
              strokeOpacity={lit ? 0.7 : 0.18}
            />
          );
        })}
        {COSMOS_NODES.map((item) => {
          const point = points.get(item.id);
          if (!point) return null;
          const selected = item.id === active;
          const radius = item.kind === "core" ? 16 : item.kind === "lesson" ? 11 : 7;
          return (
            <g
              key={item.id}
              className="cursor-pointer"
              onClick={() => setActive(item.id)}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={selected ? radius + 4 : radius}
                fill={colorHex[item.color]}
                opacity={selected ? 1 : 0.82}
              />
              <text
                x={point.x}
                y={point.y + radius + 16}
                textAnchor="middle"
                fill="#f3eee4"
                fontSize={item.kind === "essay" ? 11 : 13}
              >
                {item.title}
              </text>
            </g>
          );
        })}
      </svg>
      <aside className="panel rounded-[2rem] p-7">
        <p className="text-xs tracking-[0.24em] text-mute uppercase">
          {node.kind === "lesson" ? `Stage ${node.stage}` : node.english}
        </p>
        <h2 className="mt-3 font-serif text-3xl text-ivory">{node.title}</h2>
        <p className="mt-4 leading-8 text-mist">{node.summary}</p>
        <Link href={node.href} className="mt-6 inline-flex rounded-full bg-ivory px-4 py-2 text-sm text-void no-underline">
          打开内容
        </Link>
        <div className="mt-8">
          <p className="text-xs tracking-[0.2em] text-mute uppercase">相邻节点</p>
          <ul className="mt-3 space-y-2">
            {neighbors.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="text-left text-sm text-teal"
                  onClick={() => setActive(item.id)}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
