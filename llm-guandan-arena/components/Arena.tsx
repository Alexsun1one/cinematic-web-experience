"use client";

import { useEffect, useRef, useState } from "react";
import { BackRow, CardView, HandFan } from "@/components/CardView";
import { FACE } from "@/lib/guandan/types";
import type { MatchView } from "@/lib/view";

type LogEvent = MatchView["log"][number];

const PLACES = ["头游", "二游", "三游", "末游"];
const WIND = ["n", "e", "s", "w"] as const;

export function Arena({ id }: { id: string }) {
  const [view, setView] = useState<MatchView | null>(null);
  const [error, setError] = useState("");
  const [auto, setAuto] = useState(true);
  const [speed, setSpeed] = useState(700);
  const [pending, setPending] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [columns, setColumns] = useState(false);
  const [swept, setSwept] = useState(false);
  const [holding, setHolding] = useState(false);
  const [preview, setPreview] = useState<LogEvent | null>(null);
  const holdTimer = useRef<number | null>(null);

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

  const trickKey = view?.zones.map((zone) => zone?.id ?? 0).join("-") ?? "";

  useEffect(() => {
    setSwept(false);
    if (!view?.trick.closed) return;
    const timer = setTimeout(() => setSwept(true), 680);
    return () => clearTimeout(timer);
  }, [view?.trick.closed, trickKey]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!auto || !view || pending || holding || view.status === "finished") return;
    const delay = view.status === "between_rounds" ? Math.max(speed, 1600) : speed;
    const timer = setTimeout(() => void step(), delay);
    return () => clearTimeout(timer);
  }, [auto, view, pending, holding, speed]);

  async function step() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/matches/${id}/step`, { method: "POST" });
      const data = (await response.json()) as MatchView & { error?: string };
      if (!response.ok) throw new Error(data.error || "出牌失败");
      const previous = view?.log.at(-1)?.id ?? -1;
      const reason = [...data.log].reverse().find((event) => event.kind === "reason" && event.id > previous);
      if (reason?.reason) {
        setPreview(reason);
        setHolding(true);
        const wait = reason.reason.timedOut ? 650 : beatDuration(speed);
        if (holdTimer.current) window.clearTimeout(holdTimer.current);
        holdTimer.current = window.setTimeout(() => {
          setView(data);
          setPreview(null);
          setHolding(false);
          holdTimer.current = null;
        }, wait);
      } else {
        setPreview(null);
        setHolding(false);
        setView(data);
      }
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

  if (error && !view) {
    return (
      <main className="room">
        <p>{error}</p>
        <a href="/">返回大厅</a>
      </main>
    );
  }
  if (!view) return <main className="room quiet">摆桌…</main>;

  const levelLabel = view.level === "T" ? "10" : view.level;
  const latestRound = view.rounds.at(-1);
  const hideZones = view.trick.closed && swept;

  return (
    <main className="room" data-testid="table">
      <header className="hud">
        <div className="hud-brand">
          <b>模型掼蛋擂台</b>
          <span>第 {view.round} 局 · {id.slice(0, 8)}</span>
        </div>
        <div className="level-plate" data-testid="level-plate">
          <em>打</em>
          <strong>{levelLabel}</strong>
          <span>逢人配 ★ 红心{levelLabel}</span>
        </div>
        <div className="ladders">
          <Ladder name="南北" team="ns" level={view.levels.ns} other={view.levels.ew} />
          <Ladder name="东西" team="ew" level={view.levels.ew} other={view.levels.ns} />
        </div>
        <div className="hud-actions">
          <a className="wood-btn" href="/">大厅</a>
          <button className="wood-btn" type="button" onClick={() => setAuto((value) => !value)}>{auto ? "暂停" : "继续"}</button>
          <button className="wood-btn" type="button" data-testid="step" onClick={() => void step()} disabled={pending || holding || view.status === "finished"}>
            {pending ? "…" : "下一步"}
          </button>
          {([240, 700, 1400] as const).map((value) => (
            <button key={value} className={`wood-btn ${speed === value ? "on" : ""}`} type="button" onClick={() => setSpeed(value)}>
              {value === 240 ? "快" : value === 700 ? "中" : "慢"}
            </button>
          ))}
          <button className={`wood-btn ${reveal ? "on" : ""}`} type="button" onClick={() => setReveal((value) => !value)}>
            {reveal ? "暗牌" : "明牌"}
          </button>
          <button className={`wood-btn ${columns ? "on" : ""}`} type="button" onClick={() => setColumns((value) => !value)}>
            {columns ? "横排" : "理牌"}
          </button>
        </div>
      </header>
      {error ? <p className="banner-error">{error}</p> : null}
      <section className="board">
        <SeatPlate view={view} index={0} reveal={reveal} place="north" />
        <div className="table-row">
        <SeatPlate view={view} index={3} reveal={reveal} place="west" />
        <div className="table-rim">
          <div className={`felt-square ${view.trick.closed && !hideZones ? "clearing" : ""}`} data-testid="felt">
            <span className="bearing n">北</span>
            <span className="bearing e">东</span>
            <span className="bearing s">南</span>
            <span className="bearing w">西</span>
            <div className="heart-level">
              <CardView
                card={{ id: "level-heart", deck: 0, suit: "H", rank: view.level }}
                level={view.level}
                size="play"
              />
              <small>红心{levelLabel} · 逢人配</small>
            </div>
            {WIND.map((wind, index) => (
              <PlayZone key={wind} view={view} index={index} wind={wind} hidden={hideZones} />
            ))}
            {preview?.reason && preview.seat !== null ? (
              <div className={`reason-bubble ${WIND[preview.seat]}`} data-testid="quick-reason">
                <em>{preview.reason.source === "jev" ? "Jev 快推理" : "Mock 快推理"}</em>
                {(preview.reason.timedOut ? ["超时跳过"] : preview.reason.lines).map((line, index) => (
                  <b key={`${index}-${line}`}>{line}</b>
                ))}
              </div>
            ) : null}
            {view.status !== "playing" && latestRound ? (
              <div className="round-banner" data-testid="result">
                <b>{view.status === "finished" ? (view.winner === "ns" ? "南北过A" : "东西过A") : "本局结算"}</b>
                <p>{latestRound.order.map((seat, index) => `${PLACES[index]} ${view.seats[seat].short}`).join("  ")}</p>
                <p>
                  {latestRound.winner === "ns" ? "南北" : "东西"} +{latestRound.delta} · {latestRound.from === "T" ? "10" : latestRound.from} → {latestRound.to === "T" ? "10" : latestRound.to}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <SeatPlate view={view} index={1} reveal={reveal} place="east" />
        </div>
        <section className="south-hand">
          <div className="south-meta">
            <NameBlock view={view} index={2} />
            <span className="sort-note">{columns ? "竖组理牌 · 同点一列" : "横排理牌 · 从大到小"}</span>
          </div>
          <HandFan cards={view.hands[2]} level={view.level} mode={columns ? "columns" : "fan"} />
        </section>
        <aside className="record" data-testid="play-log">
          <h2>
            出牌记录
            <button className="wood-btn tiny" type="button" data-testid="export" onClick={() => void exportReplay()}>复盘</button>
          </h2>
          <div className="record-list">
            {(preview ? [...view.log, preview] : view.log).slice(-24).map((event) => (
              <p key={event.id} className={event.kind === "reason" ? "reason-line" : ""}>
                <b>{event.zh}</b>
                <small>{event.reason ? `${event.reason.latencyMs}ms` : event.source ? event.source : ""}</small>
              </p>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function beatDuration(speed: number): number {
  if (speed <= 240) return 800;
  if (speed >= 1400) return 1500;
  return 1100;
}

function PlayZone({
  view,
  index,
  wind,
  hidden,
}: {
  view: MatchView;
  index: number;
  wind: (typeof WIND)[number];
  hidden: boolean;
}) {
  const zone = view.zones[index];
  return (
    <div className={`play-zone ${wind} ${zone && !hidden ? "live" : ""} ${zone && zone.bombTier > 0 ? "bomb" : ""}`}>
      {zone && !hidden ? (
        <div key={zone.id} className={`zone-cards from-${wind}`}>
          {zone.kind === "pass" ? (
            <div className="pass-stamp">不要</div>
          ) : (
            zone.cards.map((card) => <CardView key={card.id} card={card} level={view.level} size="play" />)
          )}
          {zone.kind === "play" ? <span className="zone-label">{zone.label}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function SeatPlate({
  view,
  index,
  reveal,
  place,
}: {
  view: MatchView;
  index: number;
  reveal: boolean;
  place: "north" | "west" | "east";
}) {
  const seat = view.seats[index];
  return (
    <section className={`seat-plate ${place} ${seat.team} ${seat.active ? "active" : ""}`}>
      <NameBlock view={view} index={index} />
      {reveal ? (
        <HandFan
          cards={view.hands[index]}
          level={view.level}
          mode="fan"
          size="mini"
          axis={place === "north" ? "row" : "col"}
        />
      ) : (
        <BackRow count={seat.cards} axis={place === "north" ? "row" : "stack"} />
      )}
    </section>
  );
}

function NameBlock({ view, index }: { view: MatchView; index: number }) {
  const seat = view.seats[index];
  const place = seat.finished >= 0 ? PLACES[seat.finished] : null;
  return (
    <header className="nameplate">
      <span className={`wind-chip ${seat.team}`}>{seat.wind}</span>
      <div>
        <strong>{seat.name}</strong>
        <small>
          {seat.provider === "mock" ? "Mock" : seat.provider} · {seat.cards}张
          {seat.active ? " · 出牌" : ""}
        </small>
      </div>
      {place ? <em className="place-ribbon">{place}</em> : null}
    </header>
  );
}

function Ladder({ name, team, level, other }: { name: string; team: "ns" | "ew"; level: string; other: string }) {
  return (
    <div className="ladder">
      <span>{name}</span>
      <div>
        {FACE.map((rank) => {
          const here = rank === level;
          const shared = here && rank === other;
          return (
            <i key={rank} className={shared ? "both" : here ? team : ""}>
              {rank === "T" ? "10" : rank}
            </i>
          );
        })}
      </div>
    </div>
  );
}
