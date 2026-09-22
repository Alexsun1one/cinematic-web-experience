"use client";

import { useEffect, useRef, useState } from "react";
import { BackRow, CardView, HandFan } from "@/components/CardView";
import { RulesButton } from "@/components/RulesDrawer";
import { statsToCsv } from "@/lib/guandan/stats";
import { FACE } from "@/lib/guandan/types";
import type { MatchView } from "@/lib/view";

type LogEvent = MatchView["log"][number];

const PLACES = ["头游", "二游", "三游", "末游"];
const WIND = ["n", "e", "s", "w"] as const;

export function Arena({
  id,
  role = "host",
  roomCode,
  spectatorCount = 0,
  externalView = null,
  chat = [],
  onChat,
  turnBudgetMs = 8000,
  seatStatuses = [],
}: {
  id: string;
  role?: "host" | "spectator";
  roomCode?: string;
  spectatorCount?: number;
  externalView?: MatchView | null;
  chat?: { id: number; name: string; text: string }[];
  onChat?: (text: string) => void;
  turnBudgetMs?: number;
  seatStatuses?: { status: string; statusLabel: string }[];
}) {
  const [view, setView] = useState<MatchView | null>(null);
  const [error, setError] = useState("");
  const serverDriven = Boolean(roomCode);
  const [auto, setAuto] = useState(role === "host" && !roomCode);
  const [speed, setSpeed] = useState(700);
  const [pending, setPending] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [columns, setColumns] = useState(true);
  const [popStructures, setPopStructures] = useState(true);
  const [panel, setPanel] = useState<"log" | "stats" | "chat">("log");
  const [swept, setSwept] = useState(false);
  const [holding, setHolding] = useState(false);
  const [preview, setPreview] = useState<LogEvent | null>(null);
  const [chatText, setChatText] = useState("");
  const holdTimer = useRef<number | null>(null);
  const spectator = role === "spectator";

  useEffect(() => {
    if (externalView) setView(externalView);
  }, [externalView]);

  useEffect(() => {
    if (spectator) return;
    let gone = false;
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("panel") === "stats") {
      setPanel("stats");
    }
    void fetch(`/api/matches/${id}`)
      .then(async (response) => {
        const data = (await response.json()) as MatchView & { error?: string };
        if (!response.ok) throw new Error(data.error || "找不到这局牌");
        if (!gone) {
          setView(data);
          if (data.status !== "playing") setAuto(false);
        }
      })
      .catch((cause: unknown) => {
        if (!gone) setError(cause instanceof Error ? cause.message : "读取失败");
      });
    return () => {
      gone = true;
    };
  }, [id, spectator]);

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
    if (spectator || !auto || !view || pending || holding || view.status === "finished") return;
    const delay = view.status === "between_rounds" ? Math.max(speed, 3200) : speed;
    const timer = setTimeout(() => void step(), delay);
    return () => clearTimeout(timer);
  }, [auto, view, pending, holding, speed, spectator]);

  async function step() {
    if (pending || spectator || serverDriven) return;
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

  function download(filename: string, text: string, type: string) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportReplay() {
    const response = await fetch(`/api/matches/${id}/replay`);
    const data = await response.json();
    download(`guandan-${id.slice(0, 8)}.json`, JSON.stringify(data, null, 2), "application/json");
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

  const seriesNote = view.handLimit ? ` · 共${view.handLimit}局` : view.startLevel === "2" ? " · 2→A" : "";

  return (
    <main className={`room ${columns ? "vertical" : ""}`} data-testid="table">
      <header className="hud">
        <div className="hud-brand">
          <b>模型掼蛋擂台</b>
          <span>
            第 {view.round} 局{seriesNote} · {id.slice(0, 8)}
            {roomCode ? ` · 房 ${roomCode}` : ""}
          </span>
        </div>
        {roomCode ? (
          <div className="spectator-chip hud-spec" data-testid="hud-spectators">
            观众 {spectatorCount}
            {spectator ? " · 围观中" : " · 主持"}
          </div>
        ) : null}
        <div className="level-plate" data-testid="level-plate">
          <span className="gem">{levelLabel}</span>
          <div>
            <em>打到</em>
            <strong> {levelLabel}</strong>
            <span>逢人配 · 红心{levelLabel}</span>
          </div>
        </div>
        <LevelTrack view={view} />
        <div className="hud-actions">
          <a className="chip-btn" href={roomCode ? `/room/${roomCode}` : "/"}>{roomCode ? "房间" : "大厅"}</a>
          <RulesButton />
          {serverDriven ? (
            <span className="chip-btn timeout-chip" data-testid="turn-budget">回合 {Math.round(turnBudgetMs / 1000)}s · 超时 Mock</span>
          ) : null}
          {!spectator && !serverDriven ? (
            <>
              <button className="chip-btn" type="button" onClick={() => setAuto((value) => !value)}>{auto ? "暂停" : "继续"}</button>
              <button className="chip-btn" type="button" data-testid="step" onClick={() => void step()} disabled={pending || holding || view.status === "finished"}>
                {pending ? "…" : "下一步"}
              </button>
              {([240, 700, 1400] as const).map((value) => (
                <button key={value} className={`chip-btn ${speed === value ? "on" : ""}`} type="button" onClick={() => setSpeed(value)}>
                  {value === 240 ? "快" : value === 700 ? "中" : "慢"}
                </button>
              ))}
            </>
          ) : spectator ? (
            <span className="chip-btn" aria-disabled>只读围观</span>
          ) : null}
          <button className={`chip-btn ${reveal ? "on" : ""}`} type="button" onClick={() => setReveal((value) => !value)}>
            {reveal ? "暗牌" : "明牌"}
          </button>
        </div>
      </header>
      {error ? <p className="banner-error">{error}</p> : null}
      <section className="board">
        <SeatPlate view={view} index={0} reveal={reveal} place="north" statusLabel={seatStatuses[0]?.statusLabel} />
        <div className="table-row">
        <SeatPlate view={view} index={3} reveal={reveal} place="west" statusLabel={seatStatuses[3]?.statusLabel} />
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
                <em>
                  {preview.reason.source === "jev" ? "Jev 快推理" : "Mock 快推理"}
                  <code>{preview.reason.latencyMs}ms</code>
                </em>
                {(preview.reason.timedOut ? ["超时跳过"] : preview.reason.lines).map((line, index) => (
                  <b key={`${index}-${line}`}>{line}</b>
                ))}
              </div>
            ) : null}
            {view.status !== "playing" && latestRound ? (
              <div className="round-banner ceremony" data-testid="result" key={latestRound.round}>
                <div className="ceremony-sparks" aria-hidden>
                  {Array.from({ length: 10 }, (_, index) => (
                    <i
                      key={index}
                      style={{
                        left: `${8 + ((index * 17) % 84)}%`,
                        top: `${20 + ((index * 23) % 55)}%`,
                        animationDelay: `${index * 45}ms`,
                        background: index % 2 === 0 ? "#2ee6a6" : "#4da3ff",
                      }}
                    />
                  ))}
                </div>
                <div className={`ceremony-seal ${latestRound.delta >= 3 ? "double" : ""}`}>
                  {latestRound.delta >= 3 ? "双下" : "头游"}
                </div>
                <b className="title">{latestRound.outcome} +{latestRound.delta}</b>
                <div className="places">
                  {latestRound.order.map((seat, index) => (
                    <span key={seat}>
                      <em>{PLACES[index]}</em>
                      {view.seats[seat].short}
                    </span>
                  ))}
                </div>
                <p className={latestRound.winner === "ns" ? "climb ns" : "climb"}>
                  南北 打{chip(latestRound.nsBefore)} → 打{chip(latestRound.nsAfter)}
                </p>
                <p className={latestRound.winner === "ew" ? "climb ew" : "climb"}>
                  东西 打{chip(latestRound.ewBefore)} → 打{chip(latestRound.ewAfter)}
                </p>
                {view.status === "finished" ? (
                  <small>{view.winner === "ns" ? "南北" : "东西"}{latestRound.matchWon ? " 过A" : " 领先"}</small>
                ) : (
                  <small>只升不降 · 双下+3 · 头游+三游+2 · 头游+末游+1</small>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <SeatPlate view={view} index={1} reveal={reveal} place="east" statusLabel={seatStatuses[1]?.statusLabel} />
        </div>
        <section className="south-hand">
          <div className="south-meta">
            <NameBlock view={view} index={2} statusLabel={seatStatuses[2]?.statusLabel} />
            <div className="sort-toggle">
              <button className={`chip-btn tiny ${columns ? "on" : ""}`} type="button" data-testid="layout-vertical" onClick={() => setColumns(true)}>
                垂直理牌
              </button>
              <button className={`chip-btn tiny ${popStructures ? "on" : ""}`} type="button" data-testid="pop-structures" onClick={() => setPopStructures((value) => !value)}>
                炸弹/同花顺
              </button>
              <button className={`chip-btn tiny ${columns ? "" : "on"}`} type="button" data-testid="layout-fan" onClick={() => setColumns(false)}>
                横排扇形
              </button>
            </div>
          </div>
          <HandFan cards={view.hands[2]} level={view.level} mode={columns ? "columns" : "fan"} popStructures={columns && popStructures} />
        </section>
        <aside className="record" data-testid="play-log">
          <h2>
            <span className="record-tabs">
              <button className={panel === "log" ? "on" : ""} type="button" onClick={() => setPanel("log")}>记录</button>
              <button className={panel === "stats" ? "on" : ""} type="button" data-testid="stats-tab" onClick={() => setPanel("stats")}>统计</button>
              {roomCode ? (
                <button className={panel === "chat" ? "on" : ""} type="button" data-testid="chat-tab" onClick={() => setPanel("chat")}>聊天</button>
              ) : null}
            </span>
            {!spectator ? (
              <button className="chip-btn tiny" type="button" data-testid="export" onClick={() => void exportReplay()}>复盘</button>
            ) : null}
          </h2>
          {panel === "log" ? (
            <div className="record-list">
              {(preview ? [...view.log, preview] : view.log).slice(-24).map((event) => (
                <p key={event.id} className={event.kind === "reason" ? "reason-line" : ""}>
                  <b>{event.zh}</b>
                  <small>{event.reason ? `${event.reason.latencyMs}ms` : event.source ? event.source : ""}</small>
                </p>
              ))}
            </div>
          ) : panel === "stats" ? (
            <StatsPanel view={view} onCsv={() => download(`guandan-${id.slice(0, 8)}-stats.csv`, statsToCsv(view.stats), "text/csv")} onJson={() => download(`guandan-${id.slice(0, 8)}-stats.json`, JSON.stringify(view.stats, null, 2), "application/json")} />
          ) : (
            <div className="room-chat in-arena" data-testid="arena-chat">
              <div className="room-chat-list">
                {chat.length === 0 ? <p className="muted">还没有消息</p> : null}
                {chat.map((row) => (
                  <p key={row.id}><b>{row.name}</b> {row.text}</p>
                ))}
              </div>
              {onChat ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!chatText.trim()) return;
                    onChat(chatText);
                    setChatText("");
                  }}
                >
                  <input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="短评" maxLength={80} />
                  <button className="chip-btn tiny" type="submit">发送</button>
                </form>
              ) : null}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function chip(rank: string): string {
  return rank === "T" ? "10" : rank;
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
        <div key={zone.id} className={`zone-cards well from-${wind}`}>
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
  statusLabel,
}: {
  view: MatchView;
  index: number;
  reveal: boolean;
  place: "north" | "west" | "east";
  statusLabel?: string;
}) {
  const seat = view.seats[index];
  return (
    <section className={`seat-plate ${place} ${seat.team} ${seat.active ? "active" : ""}`}>
      <NameBlock view={view} index={index} statusLabel={statusLabel} />
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

function NameBlock({ view, index, statusLabel }: { view: MatchView; index: number; statusLabel?: string }) {
  const seat = view.seats[index];
  const place = seat.finished >= 0 ? PLACES[seat.finished] : null;
  const face = (seat.short || seat.name || seat.wind).slice(0, 1);
  return (
    <header className="nameplate">
      <span className={`seat-avatar ${seat.team}`} aria-hidden>{face}</span>
      <span className={`wind-chip ${seat.team}`}>{seat.wind}</span>
      <div>
        <strong>{seat.name}</strong>
        <small>
          {statusLabel || (seat.provider === "mock" ? "Mock" : seat.provider)}
          {seat.active ? " · 出牌" : ""}
        </small>
      </div>
      <b className="count-chip">{seat.cards}</b>
      {place ? <em className="place-ribbon">{place}</em> : null}
    </header>
  );
}

function LevelTrack({ view }: { view: MatchView }) {
  const latest = view.rounds.at(-1);
  return (
    <div className="level-track" data-testid="level-track">
      <div className="track-rail">
        {FACE.map((rank) => {
          const ns = view.levels.ns === rank;
          const ew = view.levels.ew === rank;
          const deal = view.level === rank;
          const climbed = Boolean(
            latest &&
              view.status !== "playing" &&
              ((latest.winner === "ns" && latest.nsAfter === rank && latest.nsBefore !== rank) ||
                (latest.winner === "ew" && latest.ewAfter === rank && latest.ewBefore !== rank)),
          );
          return (
            <div
              key={rank}
              className={`track-stop ${deal ? "deal" : ""} ${ns ? "has-ns" : ""} ${ew ? "has-ew" : ""} ${climbed ? "climbed" : ""}`}
            >
              <i className={`mark ns ${ns ? "on" : ""}`}>{ns ? "南" : ""}</i>
              <b>{chip(rank)}</b>
              <i className={`mark ew ${ew ? "on" : ""}`}>{ew ? "东" : ""}</i>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsPanel({ view, onCsv, onJson }: { view: MatchView; onCsv: () => void; onJson: () => void }) {
  const stats = view.stats;
  return (
    <div className="stats-panel" data-testid="stats-panel">
      <div className="stats-actions">
        <button className="chip-btn tiny" type="button" data-testid="export-csv" onClick={onCsv}>CSV</button>
        <button className="chip-btn tiny" type="button" data-testid="export-json" onClick={onJson}>JSON</button>
      </div>
      <div className="kpi-row">
        {stats.teams.map((team) => (
          <div key={team.team} className={`kpi-card ${team.team}`}>
            <em>{team.name}</em>
            <b>打{chip(team.level)}</b>
            <small>升{team.levelsClimbed} · 双下 {team.doubleDowns}</small>
          </div>
        ))}
      </div>
      {stats.teams.map((team) => (
        <section key={team.team} className={`team-stat ${team.team}`}>
          <header>
            <b>{team.name}进度</b>
            <span>{team.timeToA === null ? "未到A" : `${team.timeToA} 局到A`}</span>
          </header>
          <Sparkline values={team.timeline} team={team.team} />
        </section>
      ))}
      <div className="seat-kpis">
        {stats.seats.map((seat) => (
          <article key={seat.seat} className="seat-kpi">
            <header>
              <b>{view.seats[seat.seat].wind} {view.seats[seat.seat].short}</b>
              <span>胜率 {Math.round(seat.teamWinRate * 100)}%</span>
            </header>
            <div className="bar" title="队伍胜率"><i style={{ width: `${Math.round(seat.teamWinRate * 100)}%` }} /></div>
            <div className="bar first" title="头游率"><i style={{ width: `${Math.round(seat.firstRate * 100)}%` }} /></div>
            <div className="bar last" title="末游率"><i style={{ width: `${Math.round(seat.lastRate * 100)}%` }} /></div>
            <div className="meta">
              <span>头游 {Math.round(seat.firstRate * 100)}%</span>
              <span>末游 {Math.round(seat.lastRate * 100)}%</span>
              <span>名次 {seat.avgFinish ?? "—"}</span>
              <span>炸 {seat.bombs}</span>
              <span>同花 {seat.flushes}</span>
              <span>过 {seat.passes}</span>
              <span>思考 {seat.avgThinkMs === null ? "—" : `${seat.avgThinkMs}ms`}</span>
            </div>
          </article>
        ))}
      </div>
      <details className="stats-details">
        <summary>明细表</summary>
        <table>
          <thead>
            <tr>
              <th>座位</th>
              <th>胜率</th>
              <th>头游</th>
              <th>末游</th>
              <th>名次</th>
              <th>炸</th>
              <th>同花</th>
              <th>过</th>
              <th>思考</th>
              <th>拒</th>
              <th>余牌</th>
            </tr>
          </thead>
          <tbody>
            {stats.seats.map((seat) => (
              <tr key={seat.seat}>
                <td>{view.seats[seat.seat].wind}</td>
                <td>{Math.round(seat.teamWinRate * 100)}%</td>
                <td>{Math.round(seat.firstRate * 100)}%</td>
                <td>{Math.round(seat.lastRate * 100)}%</td>
                <td>{seat.avgFinish ?? "—"}</td>
                <td>{seat.bombs}</td>
                <td>{seat.flushes}</td>
                <td>{seat.passes}</td>
                <td>{seat.avgThinkMs === null ? "—" : `${seat.avgThinkMs}`}</td>
                <td>{seat.retries}</td>
                <td>{seat.partnerCardsLeft ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <ol className="hand-log">
        {stats.hands.map((hand) => (
          <li key={hand.round}>
            第{hand.round}局 {hand.outcome}+{hand.delta} · 南北 打{chip(hand.nsBefore)}→打{chip(hand.nsAfter)} · 东西 打{chip(hand.ewBefore)}→打{chip(hand.ewAfter)}
          </li>
        ))}
        {stats.hands.length === 0 ? <li>本局尚未结束</li> : null}
      </ol>
    </div>
  );
}

function Sparkline({ values, team }: { values: number[]; team: "ns" | "ew" }) {
  if (values.length === 0) return <svg className="spark" viewBox="0 0 120 28" aria-hidden />;
  const step = values.length === 1 ? 0 : 112 / (values.length - 1);
  const points = values.map((value, index) => `${4 + index * step},${24 - (value / 12) * 20}`).join(" ");
  return (
    <svg className={`spark ${team}`} viewBox="0 0 120 28" aria-hidden>
      <polyline points={points} />
    </svg>
  );
}
