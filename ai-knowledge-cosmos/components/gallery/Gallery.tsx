"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Chamber } from "@/components/gallery/Chamber";
import { Entrance } from "@/components/gallery/Entrance";
import { ExitHall } from "@/components/gallery/ExitHall";
import { GalleryRail } from "@/components/gallery/GalleryRail";
import { dwellMap, paintCorridor } from "@/lib/corridor";
import { CHAPTERS } from "@/lib/journey";
import { cancelInertia, inertiaScroll } from "@/lib/inertia-scroll";
import { useReducedMotion } from "@/lib/motion-pref";
import { getVisited, getVisitedServer, subscribeVisited } from "@/lib/progress";

const LESSONS = CHAPTERS.filter((chapter) => chapter.slug);
export const GALLERY_COUNT = LESSONS.length + 2;

export function Gallery() {
  const visited = useSyncExternalStore(subscribeVisited, getVisited, getVisitedServer);
  const reduced = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const alongRef = useRef(0);
  const activeRef = useRef(0);
  const [along, setAlong] = useState(0);
  const [active, setActive] = useState(0);
  const lit = visited.filter((slug) => LESSONS.some((chapter) => chapter.slug === slug)).length;

  const jump = useCallback(
    (index: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const top = (index / (GALLERY_COUNT - 1)) * max;
      if (reduced) window.scrollTo(0, top);
      else inertiaScroll(top, 620);
    },
    [reduced],
  );

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let current = alongRef.current;
    let published = current;
    let last = performance.now();

    function measure() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
      return dwellMap(progress, GALLERY_COUNT);
    }

    function tick(now: number) {
      const dt = Math.min(0.048, Math.max(0.008, (now - last) / 1000));
      last = now;
      const target = measure();
      const diff = target - current;
      const velocity = diff / dt;
      const lambda = 32 + Math.min(20, Math.abs(velocity) * 0.1);
      if (Math.abs(diff) < 0.0015) current = target;
      else current += diff * (1 - Math.exp(-lambda * dt));

      const node = track.current;
      if (node) {
        node.style.transform = `translate3d(${-current * 100}vw, 0, 0)`;
        paintCorridor(node, current, velocity);
      }

      alongRef.current = current;
      const nextActive = Math.round(current);
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
      if (Math.abs(current - published) > 0.045) {
        published = current;
        setAlong(current);
      }
      if (current === target) {
        if (current !== published) {
          published = current;
          setAlong(current);
        }
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    function kick() {
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }

    function onScroll() {
      kick();
    }

    kick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const index = activeRef.current;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        jump(Math.min(GALLERY_COUNT - 1, index + 1));
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        jump(Math.max(0, index - 1));
      } else if (event.key === "Home") {
        event.preventDefault();
        jump(0);
      } else if (event.key === "End") {
        event.preventDefault();
        jump(GALLERY_COUNT - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", cancelInertia, { passive: true });
    window.addEventListener("touchstart", cancelInertia, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", cancelInertia);
      window.removeEventListener("touchstart", cancelInertia);
    };
  }, [jump, reduced]);

  const rooms = (
    <>
      <Entrance lit={lit} total={LESSONS.length} onEnter={() => jump(1)} />
      {LESSONS.map((chapter, index) => {
        const slot = index + 1;
        const local = Math.min(1, Math.max(0, along - slot + 0.5));
        return (
          <Chamber
            key={chapter.id}
            chapter={chapter}
            visited={Boolean(chapter.slug && visited.includes(chapter.slug))}
            local={local}
            slot={slot}
          />
        );
      })}
      <ExitHall slot={GALLERY_COUNT - 1} />
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
          style={{ width: `${GALLERY_COUNT * 100}vw` }}
        >
          {rooms}
        </div>
      </div>
      <GalleryRail active={active} count={GALLERY_COUNT} onJump={jump} />
    </main>
  );
}
