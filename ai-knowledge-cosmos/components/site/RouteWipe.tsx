"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion-pref";

const WIPE_MS = 360;

export function RouteWipe() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const stack = useRef<string[]>([pathname]);
  const playing = useRef(false);
  const wipe = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  function kick(back: boolean) {
    const node = wipe.current;
    if (!node || reduced) return;
    window.clearTimeout(timer.current);
    node.classList.remove("is-on", "is-back");
    if (back) node.classList.add("is-back");
    void node.offsetWidth;
    node.classList.add("is-on");
    playing.current = true;
    timer.current = window.setTimeout(() => {
      node.classList.remove("is-on", "is-back");
      playing.current = false;
    }, WIPE_MS);
  }

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;
      const link = (event.target as HTMLElement | null)?.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (/^https?:/i.test(href)) return;
      kick(false);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reduced]);

  useEffect(() => {
    const prev = stack.current[stack.current.length - 1];
    if (pathname === prev) return;
    const back = stack.current.length > 1 && stack.current[stack.current.length - 2] === pathname;
    if (back) stack.current.pop();
    else stack.current.push(pathname);
    if (playing.current) return;
    kick(back);
  }, [pathname, reduced]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div ref={wipe} className="hall-wipe" aria-hidden="true">
      <span className="hall-wipe-veil" />
      <span className="hall-wipe-slit" />
    </div>
  );
}
