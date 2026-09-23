"use client";

import { useEffect, useRef, useState } from "react";
import { AceStrip } from "@/components/AceStrip";
import { StatusBoard } from "@/components/StatusBoard";
import { TelemetryHud, TelemetryTable } from "@/components/TelemetryHud";
import { CardView, HandFan } from "@/components/CardView";
import { RulesButton } from "@/components/RulesDrawer";
import { bannerFromHighlight, fxForMove, loudestCue } from "@/lib/guandan/highlight";
import { armAudio, playTableCue, readMuted, writeMuted } from "@/lib/table-audio";
import { statsToCsv } from "@/lib/guandan/stats";
import { FACE } from "@/lib/guandan/types";
import { blankSeatLives, chipText, type SeatLive } from "@/lib/seat-live";
import type { PlayMetric, ReplayEvent } from "@/lib/telemetry";
import type { MatchView } from "@/lib/view";

type LogEvent = MatchView["log"][number];

const PLACES = ["头游", "二游", "三游", "末游"];
const WIND = ["n", "e", "s", "w"] as const;
const SEAT_PLACE = ["north", "east", "south", "west"] as const;

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
  metrics = [],
  seatLive = blankSeatLives(),
  statusLog = [],
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
  metrics?: PlayMetric[];
  seatLive?: SeatLive[];
  statusLog?: ReplayEvent[];
}) {
  const [view, setView] = useState<MatchView | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, []);
  const [error, setError] = useState("");
  const serverDriven = Boolean(roomCode);
  const [auto, setAuto] = useState(role === "host" && !roomCode);
  const [speed, setSpeed] = useState(700);
  const [banner, setBanner] = useState<{ id: number; title: string; seat: number | null } | null>(null);
  const [shake, setShake] = useState(false);
  const seenLog = useRef(0);
  const primed = useRef(false);
  const [pending, setPending] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [columns, setColumns] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [popStructures, setPopStructures] = useState(true);
  const [panel, setPanel] = useState<"log" | "stats" | "chat">("log");
  const [swept, setSwept] = useState(false);
  const [holding, setHolding] = useState(false);
  const [preview, setPreview] = useState<LogEvent | null>(null);
  const [chatText, setChatText] = useState("");
  const [muted, setMuted] = useState(false);
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
          if (new URLSearchParams(window.location.search).get("still") === "1") setAuto(false);
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
    setMuted(readMuted());
    const arm = () => armAudio();
    window.addEventListener("pointerdown", arm);
    return () => window.removeEventListener("pointerdown", arm);
  }, []);

  useEffect(() => {
    if (!view) return;
    const lastId = view.log.at(-1)?.id ?? 0;
    const still = new URLSearchParams(window.location.search).get("still") === "1";
    if (!primed.current) {
      primed.current = true;
      seenLog.current = lastId;
      if (still) {
        const prior = [...view.log].reverse().find((event) => bannerFromHighlight(event.highlight));
        const title = prior ? bannerFromHighlight(prior.highlight) : null;
        if (prior && title) {
          setBanner({ id: prior.id, title, seat: prior.seat });
          if (title === "钢板") {
            setShake(true);
            window.setTimeout(() => setShake(false), fxMs(speed));
          }
        }
      }
      return;
    }
    const fresh = view.log.filter((event) => event.id > seenLog.current);
    seenLog.current = lastId;
    const cue = loudestCue(fresh);
    if (cue) playTableCue(cue);
    const hit = [...fresh].reverse().find((event) => bannerFromHighlight(event.highlight));
    const title = hit ? bannerFromHighlight(hit.highlight) : null;
    if (!hit || !title) return;
    setBanner({ id: hit.id, title, seat: hit.seat });
    if (title === "钢板") {
      setShake(true);
      window.setTimeout(() => setShake(false), fxMs(speed));
    }
    const timer = window.setTimeout(() => {
      setBanner((current) => (current?.id === hit.id ? null : current));
    }, bannerMs(speed));
    return () => window.clearTimeout(timer);
  }, [view, speed]);

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
  const fireSeat = banner?.title === "头游" ? banner.seat : null;
  const hl = banner ? hlSlug(banner.title) : "";

  return (
    <main
      className={`room ${columns ? "vertical" : ""} ${shake ? "fx-shake" : ""} ${hl ? `hl-live hl-${hl}` : ""}`}
      data-testid="table"
      style={{ ["--fx-ms" as string]: `${fxMs(speed)}ms`, ["--banner-ms" as string]: `${bannerMs(speed)}ms` }}
    >
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
          {roomCode ? <a className="chip-btn" href={`/replay/${roomCode}`} data-testid="open-replay">复盘</a> : null}
          <RulesButton />
          {serverDriven ? (
            <span className="turn-ring" data-testid="turn-budget" key={view.trick.currentSeat} style={{ ["--turn-ms" as string]: `${turnBudgetMs}ms` }}>
              <i />
              <b>{Math.round(turnBudgetMs / 1000)}s</b>
            </span>
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
          <button className={`chip-btn ${logOpen ? "on" : ""}`} type="button" data-testid="log-toggle" aria-expanded={logOpen} onClick={() => setLogOpen((value) => !value)}>
            {logOpen ? "收起记录" : "记录"}
          </button>
          <button
            className={`chip-btn ${muted ? "" : "on"}`}
            type="button"
            data-testid="sound-toggle"
            onClick={() => {
              armAudio();
              const next = !muted;
              writeMuted(next);
              setMuted(next);
            }}
          >
            {muted ? "静音" : "声音"}
          </button>
        </div>
        <TelemetryHud metrics={metrics} />
      </header>
      {error ? <p className="banner-error">{error}</p> : null}
      <AceStrip
        levels={view.levels}
        aceFails={view.aceFails ?? { ns: 0, ew: 0 }}
        aceLimit={view.aceLimit ?? 3}
      />
      <section className="board" data-testid="table-board">
        <div className="compass" data-testid="compass">
          <SeatPlate view={view} index={0} reveal={reveal} place="north" statusLabel={seatStatuses[0]?.statusLabel} live={seatLive[0]} now={now} fire={fireSeat === 0} />
          <SeatPlate view={view} index={3} reveal={reveal} place="west" statusLabel={seatStatuses[3]?.statusLabel} live={seatLive[3]} now={now} fire={fireSeat === 3} />
          <div className="table-rim">
            <div className={`felt-square ${view.trick.closed && !hideZones ? "clearing" : ""}`} data-testid="felt">
              <span className="bearing n">北</span>
              <span className="bearing e">东</span>
              <span className="bearing s">南</span>
              <span className="bearing w">西</span>
              <LeadWell view={view} hidden={hideZones} levelLabel={levelLabel} />
              {preview?.reason && preview.seat !== null ? (
                <div className={`reason-chip ${WIND[preview.seat]}`} data-testid="quick-reason">
                  <em>{preview.reason.source === "jev" ? "Jev" : "快推理"}</em>
                  <b>{preview.reason.timedOut ? "超时跳过" : preview.reason.lines[0] || "…"}</b>
                  <code>{preview.reason.latencyMs}ms</code>
                </div>
              ) : null}
              {banner ? (
                <div className={`hl-banner hl-${hl}`} data-testid="highlight" key={banner.id}>
                  <b>{banner.title}</b>
                </div>
              ) : null}
              {view.status === "tribute" || view.status === "return" || view.status === "resist" ? (
                <TributeBoard view={view} />
              ) : view.status !== "playing" && latestRound ? (
                <Ceremony view={view} round={latestRound} speed={speed} />
              ) : null}
            </div>
          </div>
          <SeatPlate view={view} index={1} reveal={reveal} place="east" statusLabel={seatStatuses[1]?.statusLabel} live={seatLive[1]} now={now} fire={fireSeat === 1} />
          <section className="south-hand">
            <div className="south-meta">
              <div className="seat-bar">
                <NameBlock view={view} index={2} statusLabel={seatStatuses[2]?.statusLabel} live={seatLive[2]} now={now} fire={fireSeat === 2} />
                <SeatAct view={view} index={2} />
              </div>
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
        </div>
        {logOpen ? <button className="log-backdrop" type="button" aria-label="关闭记录" onClick={() => setLogOpen(false)} /> : null}
        <aside className={`record ${logOpen ? "open" : ""}`} data-testid="play-log" aria-hidden={logOpen ? undefined : true}>
          <StatusBoard seats={seatLive} events={statusLog} metrics={metrics} now={now} />
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
                  <small data-highlight={event.highlight || ""}>{event.highlight || (event.reason ? `${event.reason.latencyMs}ms` : event.source || "")}</small>
                </p>
              ))}
            </div>
          ) : panel === "stats" ? (
            <StatsPanel
              view={view}
              metrics={metrics}
              roomCode={roomCode}
              onCsv={() => download(`guandan-${id.slice(0, 8)}-stats.csv`, statsToCsv(view.stats), "text/csv")}
              onJson={() => download(`guandan-${id.slice(0, 8)}-stats.json`, JSON.stringify(view.stats, null, 2), "application/json")}
            />
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

function hlSlug(title: string): string {
  const map: Record<string, string> = {
    天王炸: "royal",
    钢板: "plate",
    同花顺: "flush",
    翻盘炸: "comeback",
    首炸: "first",
    打A: "ace",
    头游: "firstout",
    抗贡: "resist",
    进贡: "tribute",
    还贡: "return",
    接风: "lead",
    双下: "double",
    升级: "up",
  };
  return map[title] || "mark";
}

function fxMs(speed: number): number {
  if (speed <= 240) return 200;
  if (speed >= 1400) return 350;
  return 280;
}

function bannerMs(speed: number): number {
  if (speed <= 240) return 1200;
  if (speed >= 1400) return 2000;
  return 1600;
}

function beatDuration(speed: number): number {
  if (speed <= 240) return 800;
  if (speed >= 1400) return 1500;
  return 1100;
}

function LeadWell({ view, hidden, levelLabel }: { view: MatchView; hidden: boolean; levelLabel: string }) {
  const pile = hidden ? null : view.pile;
  const zone = pile ? view.zones[pile.seat] : null;
  const fx = zone ? fxForMove(zone.moveKind || (zone.bombTier > 0 ? "bomb4" : zone.kind)) : "whoosh";
  const flash = fx === "bomb" || fx === "royal" || fx === "plate" || fx === "flush" ? `flash-${fx}` : "";
  return (
    <div className="lead-well" data-testid="lead-well">
      <span className="felt-level">级牌 {levelLabel}</span>
      {pile && pile.cards.length > 0 ? (
        <div className={`lead-cards ${flash}`} key={pile.cards.map((card) => card.id).join("-")}>
          {pile.cards.map((card) => (
            <CardView key={card.id} card={card} level={view.level} size="play" />
          ))}
        </div>
      ) : (
        <p className="lead-empty">等待出牌</p>
      )}
      {pile ? <span className="zone-label">{view.seats[pile.seat]?.wind} · {pile.label}</span> : null}
    </div>
  );
}

function SeatAct({ view, index }: { view: MatchView; index: number }) {
  const zone = view.zones[index];
  if (!zone || view.trick.closed) return null;
  if (zone.kind === "play" && view.pile?.seat === index) return null;
  return <em className="seat-act">{zone.kind === "pass" ? "不要" : zone.label}</em>;
}

function SeatPlate({
  view,
  index,
  reveal,
  place,
  statusLabel,
  live,
  now,
  fire,
}: {
  view: MatchView;
  index: number;
  reveal: boolean;
  place: "north" | "west" | "east";
  statusLabel?: string;
  live?: SeatLive;
  now: number;
  fire?: boolean;
}) {
  const seat = view.seats[index];
  return (
    <section className={`seat-plate ${place} ${seat.team} ${seat.active ? "active" : ""}`}>
      <div className="seat-bar">
        <NameBlock view={view} index={index} statusLabel={statusLabel} live={live} now={now} fire={fire} />
        <SeatAct view={view} index={index} />
      </div>
      {reveal ? (
        <HandFan cards={view.hands[index]} level={view.level} mode="fan" size="mini" axis="row" />
      ) : null}
    </section>
  );
}

function NameBlock({ view, index, statusLabel, live, now, fire }: { view: MatchView; index: number; statusLabel?: string; live?: SeatLive; now: number; fire?: boolean }) {
  const seat = view.seats[index];
  const place = seat.finished >= 0 ? PLACES[seat.finished] : null;
  const face = (seat.short || seat.name || seat.wind).slice(0, 1);
  return (
    <header className={`nameplate ${fire ? "fire" : ""}`} data-testid={`seat-${SEAT_PLACE[index]}`}>
      {fire ? (
        <span className="seat-fire" aria-hidden>
          <i /><i /><i /><i /><i />
        </span>
      ) : null}
      <span className={`seat-avatar ${seat.team}`} aria-hidden>{face}</span>
      <span className={`wind-chip ${seat.team}`}>{seat.wind}</span>
      <div>
        <strong>{seat.name}</strong>
        <small>
          {statusLabel || (seat.provider === "mock" ? "Mock" : seat.provider)}
          {seat.active ? " · 出牌" : ""}
        </small>
        {live ? (
          <em className={`phase-chip phase-${live.phase}`} data-testid={`seat-chip-${index}`}>
            {chipText(live, now)}
          </em>
        ) : null}
      </div>
      <b className="count-chip">{seat.cards}</b>
      {place ? <em className="place-ribbon">{place}</em> : null}
    </header>
  );
}

function LevelTrack({ view }: { view: MatchView }) {
  const latest = view.rounds.at(-1);
  const settling = Boolean(latest && view.status !== "playing");
  const before = settling && latest ? (latest.winner === "ns" ? latest.nsBefore : latest.ewBefore) : "";
  const after = settling && latest ? (latest.winner === "ns" ? latest.nsAfter : latest.ewAfter) : "";
  const faces = FACE as readonly string[];
  const from = faces.indexOf(before);
  const to = faces.indexOf(after);
  return (
    <div className="level-track" data-testid="level-track">
      <div className="track-rail">
        {FACE.map((rank) => {
          const ns = view.levels.ns === rank;
          const ew = view.levels.ew === rank;
          const deal = view.level === rank;
          const index = faces.indexOf(rank);
          const rose = from >= 0 && to > from;
          const onPath = rose && index > from && index <= to;
          const climbed = Boolean(settling && latest && rose && ((latest.winner === "ns" && ns) || (latest.winner === "ew" && ew)));
          return (
            <div
              key={rank}
              className={`track-stop ${deal ? "deal" : ""} ${ns ? "has-ns" : ""} ${ew ? "has-ew" : ""} ${climbed ? "climbed" : ""} ${onPath ? `climb-path ${latest?.winner === "ew" ? "ew-path" : "ns-path"}` : ""}`}
              style={onPath ? { animationDelay: `${(index - from) * 90}ms` } : undefined}
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

function StatsPanel({ view, metrics, roomCode, onCsv, onJson }: { view: MatchView; metrics: PlayMetric[]; roomCode?: string; onCsv: () => void; onJson: () => void }) {
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
            <small>
              {team.levelsClimbed < 0 ? `退${-team.levelsClimbed}` : `升${team.levelsClimbed}`} · 双下 {team.doubleDowns}
            </small>
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
      <TelemetryTable metrics={metrics} roomCode={roomCode} />
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

function TributeBoard({ view }: { view: MatchView }) {
  const tribute = view.tribute;
  const title = view.status === "resist" ? "抗贡" : view.status === "return" ? "还贡" : "进贡";
  const winds = ["北", "东", "南", "西"];
  return (
    <div className={`tribute-board tribute-${view.status}`} data-testid="tribute">
      <b>{title}</b>
      <p>
        {view.status === "resist"
          ? "进贡方有两张大王，取消交换，头游领出"
          : tribute?.mode === "double"
            ? "双下 · 较大的贡牌给头游"
            : "末游进贡给头游"}
      </p>
      {tribute && view.status !== "resist" ? (
        <ol>
          {tribute.payments.map((payment) => (
            <li key={`${payment.from}-${payment.to ?? "x"}`}>
              <span>{winds[payment.from]}</span>
              {payment.give ? <CardView card={payment.give} level={view.level} size="mini" /> : <em>待进贡</em>}
              <span>→ {payment.to === null ? "待定" : winds[payment.to]}</span>
              {payment.back ? <CardView card={payment.back} level={view.level} size="mini" /> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function Ceremony({ view, round, speed }: { view: MatchView; round: MatchView["rounds"][number]; speed: number }) {
  const winds = ["北", "东", "南", "西"];
  const replay = view.log.filter((event) => event.round === round.round && event.kind === "play").slice(-4);
  const gap = speed <= 240 ? 110 : speed >= 1400 ? 220 : 160;
  return (
    <div className={`ceremony round-banner team-wash ${round.winner}`} data-testid="ceremony">
      <div className="podium">
        {round.order.map((seat, index) => (
          <span
            key={`${round.round}-${seat}-${index}`}
            className={`podium-step ${view.seats[seat]?.team || ""}`}
            style={{ animationDelay: `${index * gap}ms` }}
          >
            <em>{PLACES[index]}</em>
            <b>{winds[seat] || seat}</b>
          </span>
        ))}
      </div>
      <p className={`climb ${round.winner}`}>
        {round.winner === "ns" ? "南北" : "东西"} <DeltaCount delta={round.delta} speed={speed} />
      </p>
      {replay.length > 0 ? (
        <ol className="replay-strip">
          {replay.map((event) => (
            <li key={event.id}>{event.highlight || event.zh}</li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function DeltaCount({ delta, speed }: { delta: number; speed: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || delta <= 0) {
      setValue(delta);
      return;
    }
    const step = Math.max(160, Math.round(bannerMs(speed) / Math.max(delta, 1)));
    let current = 0;
    setValue(0);
    const timer = window.setInterval(() => {
      current += 1;
      setValue(current);
      if (current >= delta) window.clearInterval(timer);
    }, step);
    return () => window.clearInterval(timer);
  }, [delta, speed]);
  return <b className="delta-count">+{value}</b>;
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
