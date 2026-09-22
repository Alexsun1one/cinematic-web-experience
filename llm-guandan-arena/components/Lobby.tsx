"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SIMPLIFICATIONS } from "@/lib/guandan/simplifications";
import { teamOf, SEAT_WIND, SEAT_WIND_EN } from "@/lib/guandan/types";
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
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("K");
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

  async function start() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ startLevel: level, live, jevAssist: jev }),
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
    <main className="lobby">
      <section className="panel">
        <p className="wind">LLM Guandan Arena</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight">四席对坐，南北一家。</h1>
        <p className="quiet mt-3">
          零密钥即可开打。四位选手仍以模型名入座，出牌由引擎列出的合法着法交给 Mock 启发式代打。密钥写进环境变量后，不必改代码即可改走对应模型。
        </p>
        <p className="quiet">Zero keys required. Seats keep their model names; Mock plays legal moves until a key is present and live mode is on.</p>
        <ul className="rules">
          {SIMPLIFICATIONS.slice(0, 4).map((item) => (
            <li key={item.en}>{item.zh}</li>
          ))}
        </ul>
      </section>
      <section className="panel" data-testid="lobby">
        <div className="seat-grid">
          {ROSTER.map((seat, index) => (
            <article key={seat.name} className={`roster-card ${teamOf(index)}`}>
              <div className="wind">{SEAT_WIND[index]} {SEAT_WIND_EN[index]} · {index % 2 === 0 ? "南北" : "东西"}</div>
              <strong>{seat.name}</strong>
              <p className="quiet">{keys[seat.vendor] ? "密钥已就绪，可切换实盘" : "Mock · 未检测到密钥"}</p>
            </article>
          ))}
        </div>
        <div className="level-row mt-4">
          <span className="quiet">开局级牌</span>
          {LEVELS.map((item) => (
            <button key={item} className={`chip ${level === item ? "on" : ""}`} onClick={() => setLevel(item)} type="button">
              {item === "T" ? "10" : item}
            </button>
          ))}
        </div>
        <div className="toggle-row mt-4">
          <button className={`chip ${live ? "on" : ""}`} type="button" onClick={() => setLive((value) => !value)} disabled={!anyLiveKey}>
            {live ? "实盘：有密钥的座位调用模型" : "Mock 对局"}
          </button>
          <button className={`chip ${jev ? "on" : ""}`} type="button" onClick={() => setJev((value) => !value)} disabled={!keys.typesafe}>
            Jev / TypeSafe {keys.typesafe ? "可协助" : "未配置"}
          </button>
        </div>
        <div className="controls mt-4">
          <button className="primary" type="button" data-testid="start-match" onClick={() => void start()} disabled={busy}>
            {busy ? "发牌中…" : "开始擂台"}
          </button>
          <span className="quiet">默认从 K 开打，赢下头游即可看到升级。标准长赛可选 2。</span>
        </div>
        {error ? <p className="mt-3 text-[var(--danger)]">{error}</p> : null}
        {recent.length > 0 ? (
          <div className="mt-5">
            <div className="quiet">本进程里的对局</div>
            {recent.slice(0, 5).map((match) => (
              <a key={match.id} className="mt-2 block" href={`/match/${match.id}`}>
                {match.id.slice(0, 8)} · 第 {match.round} 局 · {match.status}
                {match.winner ? ` · ${match.winner === "ns" ? "南北胜" : "东西胜"}` : ""}
              </a>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
