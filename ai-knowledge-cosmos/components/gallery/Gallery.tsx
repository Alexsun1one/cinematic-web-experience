"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Chamber } from "@/components/gallery/Chamber";
import { Entrance } from "@/components/gallery/Entrance";
import { ExitHall } from "@/components/gallery/ExitHall";
import { GalleryRail } from "@/components/gallery/GalleryRail";
import { CHAPTERS } from "@/lib/journey";
import { useReducedMotion } from "@/lib/motion-pref";
import { getVisited, getVisitedServer, subscribeVisited } from "@/lib/progress";

const LESSONS = CHAPTERS.filter((chapter) => chapter.slug);
export const GALLERY_COUNT = LESSONS.length + 2;

function dwellMap(progress: number, count: number) {
  const x = progress * (count - 1);
  const index = Math.min(count - 2, Math.floor(x));
  const t = x - index;
  let local: number;
  if (t < 0.16) local = (t / 0.16) * 0.1;
  else if (t > 0.84) local = 0.9 + ((t - 0.84) / 0.16) * 0.1;
  else local = 0.1 + ((t - 0.16) / 0.68) * 0.8;
  return index + local;
}

export function Gallery() {
  const visited = useSyncExternalStore(subscribeVisited, getVisited, getVisitedServer);
  const reduced = useReducedMotion();
  const target = useRef(0);
  const [along, setAlong] = useState(0);
  const lit = visited.filter((slug) => LESSONS.some((chapter) => chapter.slug === slug)).length;

  useEffect(() => {
    if (reduced) return;
    function measure() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
      target.current = dwellMap(progress, GALLERY_COUNT);
    }
    let frame = 0;
    let current = target.current;
    function tick() {
      const diff = target.current - current;
      if (Math.abs(diff) < 0.00035) {
        current = target.current;
        setAlong(current);
        frame = 0;
        return;
      }
      current += diff * 0.16;
      setAlong(current);
      frame = requestAnimationFrame(tick);
    }
    function kick() {
      if (!frame) frame = requestAnimationFrame(tick);
    }
    function onScroll() {
      measure();
      kick();
    }
    measure();
    kick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const active = Math.round(along);

  function jump(index: number) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (index / (GALLERY_COUNT - 1)) * max, behavior: reduced ? "auto" : "smooth" });
  }

  const rooms = (
    <>
      <Entrance
        lit={lit}
        total={LESSONS.length}
        shift={Math.min(1, along)}
        presence={Math.max(0, 1 - along * 1.05)}
        onEnter={() => jump(1)}
      />
      {LESSONS.map((chapter, index) => {
        const slot = index + 1;
        const local = Math.min(1, Math.max(0, along - slot + 0.5));
        const presence = Math.max(0, 1 - Math.abs(along - slot) * 1.2);
        return (
          <Chamber
            key={chapter.id}
            chapter={chapter}
            visited={Boolean(chapter.slug && visited.includes(chapter.slug))}
            local={local}
            presence={presence}
          />
        );
      })}
      <ExitHall presence={Math.max(0, 1 - Math.abs(along - (GALLERY_COUNT - 1)) * 1.1)} />
    </>
  );

  if (reduced) {
    return <main className="flex flex-col">{rooms}</main>;
  }

  return (
    <main style={{ height: `${GALLERY_COUNT * 135}vh` }}>
      <div className="fixed inset-0 overflow-hidden">
        <div
          className="flex h-full will-change-transform"
          style={{
            width: `${GALLERY_COUNT * 100}vw`,
            transform: `translate3d(${-along * 100}vw, 0, 0)`,
          }}
        >
          {rooms}
        </div>
      </div>
      <GalleryRail active={active} count={GALLERY_COUNT} onJump={jump} />
    </main>
  );
}
