"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CHAPTERS } from "@/lib/journey";

const ROOM_W = 88;
const ROOM_H = 72;
const GAP = 18;
const START_X = 70;
const Y = 110;

export function FloorPlan() {
  const chapters = useMemo(() => CHAPTERS.filter((chapter) => chapter.slug), []);
  const [active, setActive] = useState(chapters[0]?.id ?? "llm-intuition");
  const current = chapters.find((chapter) => chapter.id === active) ?? chapters[0];

  const rooms = chapters.map((chapter, index) => ({
    ...chapter,
    x: START_X + index * (ROOM_W + GAP),
    y: Y,
  }));
  const corridorW = rooms.length * ROOM_W + (rooms.length - 1) * GAP + 80;
  const viewW = Math.max(980, corridorW + 80);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.55fr_0.8fr]">
      <svg
        viewBox={`0 0 ${viewW} 320`}
        className="w-full bg-hall"
        role="img"
        aria-label="夜览馆平面图"
        style={{ boxShadow: "inset 0 0 0 1px rgba(214,255,58,0.18)" }}
      >
        <text x="24" y="36" fill="#d6ff3a" fontSize="11" fontFamily="JetBrains Mono, monospace" letterSpacing="3">
          夜览馆 · 一层平面
        </text>
        <text x="24" y="54" fill="#9c9a90" fontSize="10" fontFamily="Noto Sans SC, sans-serif">
          1 : 走廊  ·  北↑
        </text>
        <polygon points={`${viewW - 36},28 ${viewW - 28},12 ${viewW - 20},28`} fill="#d6ff3a" />
        <text x={viewW - 36} y="44" fill="#9c9a90" fontSize="9">
          N
        </text>
        <rect x="24" y="78" width="36" height="136" fill="#090908" stroke="#d6ff3a" strokeWidth="1" />
        <text x="32" y="168" fill="#d6ff3a" fontSize="11" transform="rotate(-90 42 150)">
          门厅
        </text>
        <line
          x1="42"
          y1={Y + ROOM_H / 2}
          x2={rooms[rooms.length - 1].x + ROOM_W + 20}
          y2={Y + ROOM_H / 2}
          stroke="#d6ff3a"
          strokeOpacity="0.22"
          strokeWidth="10"
        />
        <line
          x1="42"
          y1={Y + ROOM_H / 2}
          x2={rooms[0].x}
          y2={Y + ROOM_H / 2}
          stroke="#d6ff3a"
          strokeDasharray="6 7"
          strokeWidth="1.4"
        />
        <circle cx="42" cy={Y + ROOM_H / 2} r="5" fill="#d6ff3a" />
        <text x="42" y={Y + ROOM_H / 2 - 12} textAnchor="middle" fill="#d6ff3a" fontSize="9" fontFamily="Noto Sans SC, sans-serif">
          您在此处
        </text>
        {rooms.map((room) => {
          const selected = room.id === active;
          return (
            <g key={room.id} className="cursor-pointer" onClick={() => setActive(room.id)}>
              <rect
                x={room.x}
                y={room.y}
                width={ROOM_W}
                height={ROOM_H}
                fill={selected ? "#d6ff3a" : "#171714"}
                stroke="#d6ff3a"
                strokeWidth={selected ? 1.6 : 1}
              />
              <text
                x={room.x + ROOM_W / 2}
                y={room.y + 32}
                textAnchor="middle"
                fill={selected ? "#090908" : "#eeece4"}
                fontSize="20"
                fontFamily="Noto Serif SC, serif"
              >
                {room.numeral}
              </text>
              <text
                x={room.x + ROOM_W / 2}
                y={room.y + 52}
                textAnchor="middle"
                fill={selected ? "#090908" : "#9c9a90"}
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                {room.index}
              </text>
            </g>
          );
        })}
        <rect
          x={rooms[rooms.length - 1].x + ROOM_W + 18}
          y="78"
          width="36"
          height="136"
          fill="#090908"
          stroke="#d6ff3a"
          strokeWidth="1"
        />
        <text
          x={rooms[rooms.length - 1].x + ROOM_W + 36}
          y="150"
          fill="#d6ff3a"
          fontSize="11"
          textAnchor="middle"
          transform={`rotate(-90 ${rooms[rooms.length - 1].x + ROOM_W + 36} 150)`}
        >
          出口
        </text>
        <line x1="24" y1="292" x2="124" y2="292" stroke="#d6ff3a" strokeWidth="1" />
        <text x="24" y="308" fill="#9c9a90" fontSize="10" fontFamily="JetBrains Mono, monospace">
          10m
        </text>
        <circle cx="160" cy="289" r="3.5" fill="#d6ff3a" />
        <text x="170" y="293" fill="#9c9a90" fontSize="10">
          当前位置
        </text>
        <rect x="248" y="280" width="16" height="12" fill="#171714" stroke="#d6ff3a" />
        <text x="270" y="293" fill="#9c9a90" fontSize="10">
          展厅
        </text>
        <text x="320" y="293" fill="#9c9a90" fontSize="10">
          点房间看墙文
        </text>
      </svg>
      <aside className="plate">
        <p className="text-[10px] tracking-[0.4em] text-acid">展厅 {current.index}</p>
        <p className="mt-3 font-serif text-5xl text-acid">{current.numeral}</p>
        <h2 className="mt-4 font-serif text-3xl text-bone">{current.title}</h2>
        <p className="mt-4 leading-8 text-fog">{current.wall}</p>
        <p className="mt-3 text-sm leading-7 text-fog">{current.metaphor}</p>
        {current.slug ? (
          <Link href={`/learn/${current.slug}`} className="mt-6 inline-block text-[12px] tracking-[0.28em] text-acid no-underline">
            从此厅进入展墙 →
          </Link>
        ) : null}
      </aside>
    </div>
  );
}
