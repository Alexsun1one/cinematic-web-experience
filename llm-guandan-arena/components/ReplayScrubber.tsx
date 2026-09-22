"use client";

import { useEffect, useState } from "react";
import { tenantHeaders } from "@/lib/tenant-client";
import type { PlayMetric, ReplayEvent } from "@/lib/telemetry";

interface ReplayPayload {
  code: string;
  status: string;
  startLevel: string;
  levels: { ns: string; ew: string } | null;
  aceFails: { ns: number; ew: number } | null;
  rounds: { round: number; outcome: string; delta: number }[];
  events: ReplayEvent[];
  metrics: PlayMetric[];
  error?: string;
}

export function ReplayScrubber({ code }: { code: string }) {
  const upper = code.toUpperCase();
  const [data, setData] = useState<ReplayPayload | null>(null);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [thoughtOpen, setThoughtOpen] = useState(false);

  useEffect(() => {
    let gone = false;
    void fetch(`/api/rooms/${upper}/replay`, { headers: tenantHeaders() })
      .then(async (response) => {
        const body = (await response.json()) as ReplayPayload;
        if (!response.ok) throw new Error(body.error || "没有这场复盘");
        if (!gone) {
          setData(body);
          setIndex(Math.max(0, (body.events?.length ?? 1) - 1));
        }
      })
      .catch((cause: unknown) => {
        if (!gone) setError(cause instanceof Error ? cause.message : "没有这场复盘");
      });
    return () => {
      gone = true;
    };
  }, [upper]);

  useEffect(() => {
    if (!playing || !data) return;
    if (index >= data.events.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex((value) => value + 1), 700);
    return () => window.clearTimeout(timer);
  }, [playing, index, data]);

  if (error) {
    return (
      <main className="hall hall-ia">
        <p>{error}</p>
        <a className="chip-btn" href="/">大厅</a>
      </main>
    );
  }
  if (!data) return <main className="room quiet">读取复盘…</main>;

  const events = data.events ?? [];
  const cursor = events[index] ?? null;
  const seen = events.slice(0, index + 1);

  return (
    <main className="hall hall-ia" data-testid="replay">
      <header className="tenant-bar">
        <a className="chip-btn tiny" href={`/room/${data.code}`}>回房间</a>
        <strong>复盘 {data.code}</strong>
        <span>
          {data.levels ? `南北 ${data.levels.ns} · 东西 ${data.levels.ew}` : data.startLevel} · 打A失败 南北{data.aceFails?.ns ?? 0} 东西{data.aceFails?.ew ?? 0}
        </span>
      </header>
      <section className="hall-table replay-stage">
        <div className="replay-now" data-testid="replay-now">
          <em>{cursor ? new Date(cursor.at).toLocaleTimeString() : "—"}</em>
          <b>{cursor?.text ?? "还没有事件"}</b>
          <small>{cursor ? `第 ${cursor.hand} 局 · ${cursor.kind}` : ""}</small>
          {cursor?.thought ? (
            <button className="chip-btn tiny" type="button" data-testid="replay-thought" onClick={() => setThoughtOpen((value) => !value)}>
              {thoughtOpen ? "收起思考" : "展开思考"}
            </button>
          ) : null}
          {thoughtOpen && cursor?.thought ? <p className="thought-stream" data-testid="replay-thought-body">{cursor.thought}</p> : null}
        </div>
        <label className="replay-scrub">
          <input
            data-testid="replay-scrub"
            type="range"
            min={0}
            max={Math.max(0, events.length - 1)}
            value={events.length ? index : 0}
            onChange={(event) => {
              setPlaying(false);
              setIndex(Number(event.target.value));
            }}
          />
        </label>
        <div className="hall-levels">
          <button className="chip-btn" type="button" data-testid="replay-play" onClick={() => setPlaying((value) => !value)} disabled={events.length < 2}>
            {playing ? "暂停" : "播放"}
          </button>
          <span>{index + 1} / {events.length}</span>
        </div>
        <ol className="replay-log">
          {seen.map((event) => (
            <li key={event.id} className={event.id === cursor?.id ? "on" : ""}>
              <time>{new Date(event.at).toLocaleTimeString()}</time>
              {event.text}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
