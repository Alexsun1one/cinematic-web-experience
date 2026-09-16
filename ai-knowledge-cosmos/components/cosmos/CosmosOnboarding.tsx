"use client";

import { useSyncExternalStore } from "react";

const KEY = "cosmos-onboard-v1";
const EVENT = "cosmos-onboard";

/** Match SSR: treat as dismissed until the client store hydrates. */
let cached = true;

function readDismissed() {
  return cached;
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const sync = () => {
    cached = window.localStorage.getItem(KEY) === "1";
    onChange();
  };
  window.addEventListener(EVENT, sync);
  const frame = requestAnimationFrame(sync);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener(EVENT, sync);
  };
}

function dismiss() {
  cached = true;
  window.localStorage.setItem(KEY, "1");
  window.dispatchEvent(new Event(EVENT));
}

export function CosmosOnboarding() {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, readDismissed);
  if (dismissed) return null;

  return (
    <div className="pointer-events-auto mt-5 max-w-sm rounded-2xl border border-teal/25 bg-void/75 p-4 backdrop-blur-md">
      <p className="text-xs tracking-[0.22em] text-teal uppercase">前五秒</p>
      <ul className="mt-2 space-y-1.5 text-sm leading-6 text-mist">
        <li>拖曳空白处：旋转宇宙</li>
        <li>点击星体或 1–8：聚焦课程</li>
        <li>Esc 复位 · + / − 缩放</li>
      </ul>
      <button
        type="button"
        className="mt-3 rounded-full bg-ivory px-3 py-1 text-xs text-void"
        onClick={dismiss}
      >
        知道了
      </button>
    </div>
  );
}
