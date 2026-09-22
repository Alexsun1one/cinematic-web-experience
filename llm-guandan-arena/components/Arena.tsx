"use client";

import { useEffect, useMemo, useState } from "react";
import { CardView } from "@/components/CardView";
import { FACE } from "@/lib/guandan/types";
import type { MatchView } from "@/lib/view";

const PLACES = ["头游", "二游", "三游", "末游"];

export function Arena({ id }: { id: string }) {
  const [view, setView] = useState<MatchView | null>(null);
  const [error, setError] = useState("");
  const [auto, setAuto] = useState(true);
  const [speed, setSpeed] = useState(700);
  const [pending, setPending] = useState(false);
  const [showHands, setShowHands] = useState(true);

  useEffect(() => {
    let gone = false;
    void fetch(`/api/matches/${id}`)
      .then(async (response) => {
        const data = (await response.json()) as MatchView & { error?: string };
        if (!response.ok) throw new Error(data.error || "找不到这局牌");
        if (!gone) setView(data);
      })
      .catch((cause: unknown) => {
        if (!gone) setError(cause instanceof Error ? cause.message : "读取失败");
      });
    return () => {
      gone = true;
    };
  }, [id]);

  useEffect(() => {
    if (!auto || !view || pending || view.status === "finished") return;
    const delay = view.status === "between_rounds" ? Math.max(speed, 1500) : speed;
    const timer = setTimeout(() => void step(), delay);
    return () => clearTimeout(timer);
  }, [auto, view, pending, speed]);

  async function step() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/matches/${id}/step`, { method: "POST" });
      const data = (await response.json()) as MatchView & { error?: string };
      if (!response.ok) throw new Error(data.error || "出牌失败");
      setView(data);
    } catch (cause) {
      setAuto(false);
      setError(cause instanceof Error ? cause.message : "出牌失败");
    } finally {
      setPending(false);
    }
  }

  async function exportReplay() {
    const response = await fetch(`/api/matches/${id}/replay`);
    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guandan-${id.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const lastAct = useMemo(
    () => view?.log.filter((event) => event.round === view.round && (event.kind === "play" || event.kind === "pass")).at(-1),
    [view],
  );
  if (error && !view) {
    return (
      <main className="p-8">
        <p>{error}</p>
        <a href="/">返回大厅</a>
      </main>
    );
  }
  if (!view) return <main className="p-8 quiet">正在摆桌…</main>;

  const levelLabel = view.level === "T" ? "10" : view.level;
  const latestRound = view.rounds.at(-1);

  return (
    <main className="arena-body" data-testid="table">
      <section>
        <div className="controls mb-3">
          <a className="ghost" href="/">大厅</a>
          <button className="ghost" type="button" onClick={() => setAuto((value) => !value)}>{auto ? "暂停" : "继续"}</button>
          <button className="ghost" type="button" data-testid="step" onClick={() => void step()} disabled={pending || view.status === "finished"}>
            {pending ? "思考中…" : "下一步"}
          </button>
          {[240, 700, 1400].map((value) => (
            <button key={value} className={`chip ${speed === value ? "on" : ""}`} type="button" onClick={() => setSpeed(value)}>
              {value === 240 ? "快" : value === 700 ? "中" : "慢"}
            </button>
          ))}
          <button className="ghost" type="button" onClick={() => setShowHands((value) => !value)}>{showHands ? "明牌" : "暗牌"}</button>
          <button className="ghost" type="button" data-testid="export" onClick={() => void exportReplay()}>导出复盘</button>
          <span className="quiet">第 {view.round} 局 · 打 {levelLabel} · {view.legalCount} 手可选 · {id.slice(0, 8)}</span>
        </div>
        {error ? <p className="mb-2 text-[var(--danger)]">{error}</p> : null}
        <div className="table-grid">
          <Seat view={view} index={0} className="seat-n" showHands={showHands} />
          <Seat view={view} index={3} className="seat-w" showHands={showHands} />
          <div className={`felt ${view.pile && view.pile.bombTier > 0 && !view.trick.closed ? "bomb" : ""}`} data-testid="felt">
            <div className="medallion">
              级牌
              <b>♥ {levelLabel}</b>
            </div>
            <div className="felt-stage">
              <div className="pile-row">
                {view.pile ? (
                  <div className={`pile from-${view.pile.seat} ${view.trick.closed ? "dim" : ""}`} key={lastAct?.id ?? view.pile.label}>
                    {view.pile.cards.map((card) => (
                      <CardView key={card.id} card={card} level={view.level} size="play" />
                    ))}
                  </div>
                ) : (
                  <p className="quiet">{lastAct?.kind === "pass" ? "" : "等待领出"}</p>
                )}
                {lastAct?.kind === "pass" ? <div className="pass-seal">过</div> : null}
              </div>
              <p className="trick-label">
                {view.pile ? view.pile.label : "本墩尚无出牌"}
                {view.trick.closed ? " · 墩结束" : ""}
              </p>
            </div>
            {view.status !== "playing" && latestRound ? (
              <div className="result" data-testid="result">
                <b>{view.status === "finished" ? (view.winner === "ns" ? "南北过 A" : "东西过 A") : "本局结束"}</b>
                <p>{latestRound.order.map((seat, index) => `${PLACES[index]} ${view.seats[seat].short}`).join(" · ")}</p>
                <p className="quiet">
                  {latestRound.winner === "ns" ? "南北" : "东西"} +{latestRound.delta} · {latestRound.from === "T" ? "10" : latestRound.from} → {latestRound.to === "T" ? "10" : latestRound.to}
                </p>
              </div>
            ) : null}
          </div>
          <Seat view={view} index={1} className="seat-e" showHands={showHands} />
          <Seat view={view} index={2} className="seat-s" showHands={showHands} />
        </div>
      </section>
      <aside className="side">
        <section className="panel">
          <div className="wind">Scoreboard</div>
          <LevelTrack label="南北 DeepSeek + MiMo" team="ns" level={view.levels.ns} other={view.levels.ew} />
          <LevelTrack label="东西 Gemini + GLM" team="ew" level={view.levels.ew} other={view.levels.ns} />
          <p className="quiet mt-3">庄家 {view.dealer === "ns" ? "南北" : "东西"} · 逢人配为红桃{levelLabel}</p>
        </section>
        <section className="panel" data-testid="play-log">
          <div className="wind">出牌记录 · {view.log.length}</div>
          <div className="log">
            {view.log.slice(-40).map((event) => (
              <article key={event.id}>
                <b>{event.zh}</b>
                <small>{event.en}{event.source ? ` · ${event.source}` : ""}{event.note ? ` · ${event.note}` : ""}</small>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}

function Seat({
  view,
  index,
  className,
  showHands,
}: {
  view: MatchView;
  index: number;
  className: string;
  showHands: boolean;
}) {
  const seat = view.seats[index];
  const place = seat.finished >= 0 ? PLACES[seat.finished] : null;
  return (
    <section className={`seat ${className} ${seat.team} ${seat.active ? "active" : ""}`}>
      <header>
        <div>
          <div className="wind">{seat.windEn} · seat {index}</div>
          <h2>{seat.name}</h2>
        </div>
        <div className="badges">
          <span className={`badge ${seat.provider === "mock" ? "mock" : "live"}`}>{seat.provider === "mock" ? "Mock" : seat.provider}</span>
          <span className="badge">{seat.cards} 张</span>
          {place ? <span className="badge place">{place}</span> : null}
        </div>
      </header>
      {showHands ? (
        <div className="hand">
          {view.hands[index].map((card) => (
            <CardView key={card.id} card={card} level={view.level} />
          ))}
        </div>
      ) : (
        <p className="hidden-hand">{seat.cards} 张扣牌</p>
      )}
    </section>
  );
}

function LevelTrack({ label, team, level, other }: { label: string; team: "ns" | "ew"; level: string; other: string }) {
  return (
    <div className="mt-3">
      <div>{label}</div>
      <div className="track">
        {FACE.map((rank) => {
          const here = rank === level;
          const shared = here && rank === other;
          const mark = shared ? "both" : here ? `on-${team}` : "";
          return <i key={rank} className={mark}>{rank === "T" ? "10" : rank}</i>;
        })}
      </div>
    </div>
  );
}
