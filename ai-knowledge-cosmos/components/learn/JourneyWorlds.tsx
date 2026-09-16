"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { colorHex, type NodeColor } from "@/lib/cosmos";
import { getVisited, getVisitedServer, subscribeVisited } from "@/lib/progress";
import type { LessonMeta } from "@/lib/content";

export function JourneyWorlds({ lessons }: { lessons: LessonMeta[] }) {
  const visited = useSyncExternalStore(subscribeVisited, getVisited, getVisitedServer);

  const lit = visited.filter((slug) => lessons.some((lesson) => lesson.slug === slug)).length;
  const ratio = lessons.length ? lit / lessons.length : 0;

  return (
    <section className="panel mb-12 overflow-hidden rounded-[2rem] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.24em] text-teal uppercase">Worlds 0 → 1</p>
          <h2 className="mt-2 font-serif text-3xl text-ivory">八座世界，一座星图</h2>
        </div>
        <p className="text-sm text-mist">
          已点亮 <span className="text-ivory">{lit}</span> / {lessons.length}
        </p>
      </div>
      <div className="mt-5 h-px bg-ivory/10">
        <div className="h-px bg-teal transition-[width] duration-500" style={{ width: `${Math.max(ratio * 100, 3)}%` }} />
      </div>
      <ol className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {lessons.map((lesson) => {
          const litNode = visited.includes(lesson.slug);
          const accent = colorHex[lesson.color as NodeColor] ?? colorHex.teal;
          return (
            <li key={lesson.slug}>
              <Link href={`/learn/${lesson.slug}`} className="group flex flex-col items-center no-underline">
                <span
                  className="grid h-12 w-12 place-items-center rounded-full border text-sm transition-transform group-hover:scale-105"
                  style={{
                    borderColor: accent,
                    background: litNode ? accent : "transparent",
                    color: litNode ? "#05060c" : accent,
                    boxShadow: litNode ? `0 0 18px ${accent}55` : undefined,
                  }}
                >
                  {lesson.stage}
                </span>
                <span className="mt-3 text-center text-xs leading-5 text-mist">{lesson.constellation}</span>
                <span className="mt-1 text-center text-[11px] text-mute">{litNode ? "已抵达" : "未点亮"}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
