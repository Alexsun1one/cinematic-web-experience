"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SIMPLIFICATIONS } from "@/lib/guandan/simplifications";
import { SEAT_WIND, teamOf } from "@/lib/guandan/types";
import { ROSTER } from "@/lib/roster-data";

interface ListedMatch {
  id: string;
  status: string;
  round: number;
  level: string;
  winner: string | null;
}

const LEVELS = ["2", "5", "T", "J", "K", "A"] as const;

export function Lobby() {
  const router = useRouter();
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("T");
  const [series, setSeries] = useState<"open" | "three" | "full">("three");
  const [live, setLive] = useState(false);
  const [jev, setJev] = useState(false);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [recent, setRecent] = useState<ListedMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/matches")
      .then((response) => response.json())
      .then((data: { keys?: Record<string, boolean>; matches?: ListedMatch[] }) => {
        setKeys(data.keys ?? {});
        setRecent(data.matches ?? []);
      })
      .catch(() => setError("无法读取擂台状态"));
  }, []);

  const anyLiveKey = Boolean(keys.deepseek || keys.gemini || keys.mimo || keys.zhipu);

  async function openRoom() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ series, startLevel: series === "full" ? "2" : level, seatsOpen: true, autoFillMock: true }),
      });
      const data = (await response.json()) as { code?: string; hostSecret?: string; error?: string };
      if (!response.ok || !data.code) throw new Error(data.error || "开房失败");
      if (data.hostSecret) localStorage.setItem(`guandan-room-host:${data.code}`, data.hostSecret);
      router.push(`/room/${data.code}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "开房失败");
      setBusy(false);
    }
  }

  async function start() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ startLevel: series === "full" ? "2" : level, live, jevAssist: jev, series }),
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) throw new Error(data.error || "开局失败");
      router.push(`/match/${data.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "开局失败");
      setBusy(false);
    }
  }

  return (
    <main className="hall">
      <section className="hall-copy">
        <p className="eyebrow">Glass Arena · NS vs EW</p>
        <h1>模型掼蛋擂台</h1>
        <p>一键开房，四席自带 Agent，人类用链接围观。无密钥时自动四席 Mock，第二标签页即可当观众。</p>
        <ul>
          {SIMPLIFICATIONS.slice(0, 3).map((item) => (
            <li key={item.en}>{item.zh}</li>
          ))}
        </ul>
      </section>
      <section className="hall-table" data-testid="lobby">
        <div className="mini-rim">
          <div className="mini-felt">
            <span>北</span>
            <span>东</span>
            <span>南</span>
            <span>西</span>
            <b>♥</b>
          </div>
        </div>
        <div className="name-grid">
          {ROSTER.map((seat, index) => (
            <article key={seat.name} className={`hall-seat ${teamOf(index)}`}>
              <em>{SEAT_WIND[index]}</em>
              <strong>{seat.name}</strong>
              <small>{keys[seat.vendor] ? "密钥已就绪" : "Mock · 无密钥"}</small>
            </article>
          ))}
        </div>
        <div className="hall-levels">
          <span>赛制</span>
          <button className={`chip-btn ${series === "open" ? "on" : ""}`} type="button" onClick={() => setSeries("open")}>本局起</button>
          <button className={`chip-btn ${series === "three" ? "on" : ""}`} type="button" data-testid="series-three" onClick={() => setSeries("three")}>三局</button>
          <button className={`chip-btn ${series === "full" ? "on" : ""}`} type="button" data-testid="series-full" onClick={() => setSeries("full")}>打满一盘</button>
        </div>
        <div className="hall-levels">
          <span>开局打</span>
          {LEVELS.map((item) => {
            const on = series === "full" ? item === "2" : level === item;
            return (
              <button key={item} className={`chip-btn ${on ? "on" : ""}`} type="button" disabled={series === "full"} onClick={() => setLevel(item)}>
                {item === "T" ? "10" : item}
              </button>
            );
          })}
          {series === "full" ? <span>2→A，只升不降</span> : null}
        </div>
        <div className="hall-levels lobby-cta">
          <button className="chip-btn gold cta-room" type="button" data-testid="open-room" onClick={() => void openRoom()} disabled={busy}>
            {busy ? "开房…" : "一键开房"}
          </button>
          <a className="chip-btn" data-testid="watch-now" href="/watch-now">本地围观</a>
        </div>
        <div className="hall-levels">
          <button className={`chip-btn ${live ? "on" : ""}`} type="button" onClick={() => setLive((value) => !value)} disabled={!anyLiveKey}>
            {live ? "实盘" : "Mock 对局"}
          </button>
          <button className={`chip-btn ${jev ? "on" : ""}`} type="button" onClick={() => setJev((value) => !value)} disabled={!keys.typesafe}>
            Jev {keys.typesafe ? "开" : "未配置"}
          </button>
          <button className="chip-btn" type="button" data-testid="start-match" onClick={() => void start()} disabled={busy}>
            {busy ? "发牌…" : "快速开打"}
          </button>
        </div>
        {error ? <p className="banner-error">{error}</p> : null}
        {recent.length > 0 ? (
          <div className="recent">
            {recent.slice(0, 4).map((match) => (
              <a key={match.id} href={`/match/${match.id}`}>
                {match.id.slice(0, 8)} · 第{match.round}局 · {match.status}
              </a>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
