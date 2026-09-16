"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Chamber } from "@/components/gallery/Chamber";
import { Entrance } from "@/components/gallery/Entrance";
import { ExitHall } from "@/components/gallery/ExitHall";
import { GalleryRail } from "@/components/gallery/GalleryRail";
import { CHAPTERS } from "@/lib/journey";
import { useReducedMotion } from "@/lib/motion-pref";
import { getVisited, getVisitedServer, subscribeVisited } from "@/lib/progress";

const LESSONS = CHAPTERS.filter((chapter) => chapter.slug);
const COUNT = LESSONS.length + 2;

export function Gallery() {
  const visited = useSyncExternalStore(subscribeVisited, getVisited, getVisitedServer);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const lit = visited.filter((slug) => LESSONS.some((chapter) => chapter.slug === slug)).length;

  useEffect(() => {
    if (reduced) return;
    function measure() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max)));
    }
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [reduced]);

  const along = progress * (COUNT - 1);
  const active = Math.round(along);

  function jump(index: number) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (index / (COUNT - 1)) * max, behavior: "smooth" });
  }

  const rooms = (
    <>
      <Entrance lit={lit} total={LESSONS.length} shift={Math.min(1, along)} />
      {LESSONS.map((chapter, index) => {
        const local = Math.min(1, Math.max(0, along - index));
        return (
          <Chamber
            key={chapter.id}
            chapter={chapter}
            visited={Boolean(chapter.slug && visited.includes(chapter.slug))}
            local={local}
          />
        );
      })}
      <ExitHall />
    </>
  );

  if (reduced) {
    return <main className="flex flex-col">{rooms}</main>;
  }

  return (
    <main style={{ height: `${COUNT * 100}vh` }}>
      <div className="fixed inset-0 overflow-hidden">
        <div
          className="flex h-full will-change-transform"
          style={{
            width: `${COUNT * 100}vw`,
            transform: `translate3d(${-progress * (COUNT - 1) * 100}vw, 0, 0)`,
          }}
        >
          {rooms}
        </div>
      </div>
      <GalleryRail active={active} count={COUNT} onJump={jump} />
    </main>
  );
}
