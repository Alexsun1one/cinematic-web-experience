"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion-pref";

export function RouteWipe() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    const node = document.getElementById("hall-wipe");
    if (!node) return;
    node.classList.remove("is-on");
    void node.offsetWidth;
    node.classList.add("is-on");
  }, [pathname, reduced]);

  return (
    <div id="hall-wipe" className="hall-wipe" aria-hidden="true">
      <span className="hall-wipe-slit" />
    </div>
  );
}
