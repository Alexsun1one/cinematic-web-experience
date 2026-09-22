"use client";

import { useEffect, useState } from "react";
import { chipText, type SeatLive } from "@/lib/seat-live";
import type { PlayMetric, ReplayEvent } from "@/lib/telemetry";

export function StatusBoard({
  seats,
  events,
  metrics,
  now,
}: {
  seats: SeatLive[];
  events: ReplayEvent[];
  metrics: PlayMetric[];
  now: number;
}) {
  const [showThought, setShowThought] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const lastPlay = [...metrics].reverse().find((row) => row.kind === "play" || row.kind === "timeout");
  const lastJevMetric = [...metrics].reverse().find((row) => row.jevMs !== null);
  const lastDecision = [...metrics].reverse().find((row) => row.kind === "decision");
  const lastJevEvent = [...events].reverse().find((event) => event.jevMs !== null && event.jevMs !== undefined);
  const jevMs = lastJevMetric?.jevMs ?? lastJevEvent?.jevMs ?? null;
  const costUsd = lastJevMetric?.costUsd ?? lastJevEvent?.costUsd ?? null;
  const rows = [...events].reverse();

  return (
    <section className="status-board" data-testid="status-board">
      <header>
        <b>状态板</b>
        <button className={`chip-btn tiny ${showThought ? "on" : ""}`} type="button" data-testid="show-thought" onClick={() => setShowThought((value) => !value)}>
          显示思考
        </button>
      </header>
      <p className="status-metrics" data-testid="status-metrics">
        出牌 {lastPlay?.thinkMs ?? "—"}ms · Jev {jevMs ?? "—"}ms · 反应 {lastDecision?.reactionMs ?? lastPlay?.reactionMs ?? "—"}ms
        {costUsd !== null ? ` · $${costUsd}` : ""}
      </p>
      <ol data-testid="status-timeline">
        {rows.length === 0 ? <li className="muted">等待出牌</li> : null}
        {rows.map((event) => {
          const open = showThought || openId === event.id;
          return (
            <li key={event.id} data-testid="status-event">
              <time>{new Date(event.at).toLocaleTimeString()}</time>
              <span>{event.text}</span>
              <small>
                {event.thinkMs !== null && event.thinkMs !== undefined ? `出牌 ${event.thinkMs}ms ` : ""}
                {event.jevMs !== null && event.jevMs !== undefined ? `Jev ${event.jevMs}ms ` : ""}
                {event.reactionMs !== null && event.reactionMs !== undefined ? `反应 ${event.reactionMs}ms ` : ""}
                {event.costUsd !== null && event.costUsd !== undefined ? `$${event.costUsd}` : ""}
              </small>
              {event.thought ? (
                <button className="chip-btn tiny" type="button" data-testid="expand-thought" onClick={() => setOpenId((value) => (value === event.id ? null : event.id))}>
                  {open && !showThought ? "收起思考" : "展开思考"}
                </button>
              ) : null}
              {open && event.thought ? <ThoughtStream text={event.thought} live={showThought} /> : null}
            </li>
          );
        })}
      </ol>
      <p className="sr-only" data-testid="seat-chip-clock">
        {seats.map((seat, index) => chipText(seat, now)).join(" · ")}
      </p>
    </section>
  );
}

function ThoughtStream({ text, live }: { text: string; live: boolean }) {
  const [count, setCount] = useState(live ? 0 : text.length);
  useEffect(() => {
    if (!live) {
      setCount(text.length);
      return;
    }
    setCount(0);
  }, [live, text]);
  useEffect(() => {
    if (!live || count >= text.length) return;
    const timer = window.setTimeout(() => setCount((value) => Math.min(text.length, value + 2)), 28);
    return () => window.clearTimeout(timer);
  }, [live, count, text]);
  return (
    <p className="thought-stream" data-testid="thought-stream">
      {text.slice(0, count)}
    </p>
  );
}
