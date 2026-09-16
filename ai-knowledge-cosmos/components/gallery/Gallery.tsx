"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Chamber } from "@/components/gallery/Chamber";
import { Entrance } from "@/components/gallery/Entrance";
import { ExitHall } from "@/components/gallery/ExitHall";
import { GalleryRail } from "@/components/gallery/GalleryRail";
import { CHAPTERS } from "@/lib/journey";
import { inertiaScroll } from "@/lib/inertia-scroll";
import { useReducedMotion } from "@/lib/motion-pref";
import { getVisited, getVisitedServer, subscribeVisited } from "@/lib/progress";

const LESSONS = CHAPTERS.filter((chapter) => chapter.slug);
export const GALLERY_COUNT = LESSONS.length + 2;

function dwellMap(progress: number, count: number) {
  const x = progress * (count - 1);
  const index = Math.min(count - 2, Math.floor(x));
  const t = x - index;
  let local: number;
  if (t < 0.14) local = (t / 0.14) * 0.08;
  else if (t > 0.86) local = 0.92 + ((t - 0.86) / 0.14) * 0.08;
  else local = 0.08 + ((t - 0.14) / 0.72) * 0.84;
  return index + local;
}

export function Gallery() {
  const visited = useSyncExternalStore(subscribeVisited, getVisited, getVisitedServer);
  const reduced = useReducedMotion();
  const target = useRef(0);
  const track = useRef<HTMLDivElement>(null);
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
    let published = current;
    function tick() {
      const diff = target.current - current;
      const catchup = Math.min(1, 0.2 + Math.abs(diff) * 0.62);
      if (Math.abs(diff) < 0.0004) {
        current = target.current;
        if (track.current) {
          track.current.style.transform = `translate3d(${-current * 100}vw, 0, 0)`;
        }
        if (current !== published) {
          published = current;
          setAlong(current);
        }
        frame = 0;
        return;
      }
      current += diff * catchup;
      if (track.current) {
        track.current.style.transform = `translate3d(${-current * 100}vw, 0, 0)`;
      }
      if (Math.abs(current - published) > 0.012) {
        published = current;
        setAlong(current);
      }
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
    const top = (index / (GALLERY_COUNT - 1)) * max;
    if (reduced) window.scrollTo(0, top);
    else inertiaScroll(top, 1080);
  }

  useEffect(() => {
    if (reduced) return;
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        jump(Math.min(GALLERY_COUNT - 1, active + 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        jump(Math.max(0, active - 1));
      } else if (event.key === "Home") {
        event.preventDefault();
        jump(0);
      } else if (event.key === "End") {
        event.preventDefault();
        jump(GALLERY_COUNT - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, reduced]);

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
        const presence = Math.max(0, 1 - Math.abs(along - slot) * 1.15);
        const leaving = Math.max(0, Math.min(1, (along - slot) * 1.6));
        return (
          <Chamber
            key={chapter.id}
            chapter={chapter}
            visited={Boolean(chapter.slug && visited.includes(chapter.slug))}
            local={local}
            presence={presence}
            leaving={leaving}
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
    <main style={{ height: `${GALLERY_COUNT * 140}vh` }}>
      <div className="fixed inset-0 overflow-hidden">
        <div
          ref={track}
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
