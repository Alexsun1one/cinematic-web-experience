"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AceStrip } from "@/components/AceStrip";
import { Arena } from "@/components/Arena";
import { RoomRail } from "@/components/RoomRail";
import { RulesButton } from "@/components/RulesDrawer";
import { TenantBar } from "@/components/TenantBar";
import { readLockedTenant, rememberHosted, tenantHeaders } from "@/lib/tenant-client";
import type { MatchView } from "@/lib/view";

type RoomSeries = "open" | "three" | "full";

interface RoomSeat {
  index: number;
  wind: string;
  team: "ns" | "ew";
  empty: boolean;
  name: string | null;
  short: string | null;
  kind: "mock" | "env" | "openai" | "self" | null;
  drive: "mock" | "self" | null;
  provider: string | null;
  vendor: string | null;
  model: string | null;
  ready: boolean;
  badge: string;
  status?: "waiting" | "checking" | "ready" | "playing" | "timedOut";
  statusLabel?: string;
}

interface RoomView {
  code: string;
  path: string;
  status: "lobby" | "playing" | "finished";
  series: RoomSeries;
  startLevel: string;
  seatsOpen: boolean;
  isHost: boolean;
  spectatorCount: number;
  spectators: { id: string; name: string }[];
  seats: RoomSeat[];
  ready: boolean;
  matchId: string | null;
  match: MatchView | null;
  chat: { id: number; at: number; name: string; text: string; role: string }[];
  keys: Record<string, boolean>;
  updatedAt: number;
  turnBudgetMs?: number;
  aceLimit?: number;
}

const SERIES_LABEL: Record<RoomSeries, string> = {
  open: "本局起",
  three: "三局",
  full: "打满一盘",
};

function hostKey(code: string) {
  return `guandan-room-host:${code}`;
}

function spectatorKey(code: string) {
  return `guandan-room-spec:${code}`;
}

export function RoomTable({ code }: { code: string }) {
  const upper = code.toUpperCase();
  const [view, setView] = useState<RoomView | null>(null);
  const [error, setError] = useState("");
  const [hostSecret, setHostSecret] = useState<string | null>(null);
  const [spectatorId, setSpectatorId] = useState<string | null>(null);
  const [spectatorName, setSpectatorName] = useState("观众");
  const [busy, setBusy] = useState(false);
  const [chatText, setChatText] = useState("");
  const [copied, setCopied] = useState(false);
  const [invite, setInvite] = useState("");
  const [inviteSeat, setInviteSeat] = useState("");
  const [tenant, setTenant] = useState("default");
  const [claimAt, setClaimAt] = useState<number | null>(null);
  const [claimToken, setClaimToken] = useState("");
  const [claimName, setClaimName] = useState("Guest Agent");

  const headers = useMemo(() => {
    const next = tenantHeaders({ "content-type": "application/json" });
    if (hostSecret) next["x-room-host"] = hostSecret;
    if (spectatorId) next["x-spectator-id"] = spectatorId;
    return next;
  }, [hostSecret, spectatorId, tenant]);

  const apply = useCallback((data: RoomView & { error?: string; hostSecret?: string; spectatorId?: string; spectatorName?: string }) => {
    if (data.error) throw new Error(data.error);
    setView(data);
    if (data.hostSecret) {
      setHostSecret(data.hostSecret);
      localStorage.setItem(hostKey(upper), data.hostSecret);
    }
    if (data.spectatorId) {
      setSpectatorId(data.spectatorId);
      localStorage.setItem(spectatorKey(upper), JSON.stringify({ id: data.spectatorId, name: data.spectatorName || "观众" }));
      if (data.spectatorName) setSpectatorName(data.spectatorName);
    }
  }, [upper]);

  useEffect(() => {
    setTenant(readLockedTenant() || "default");
  }, [upper]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceSpectator = params.get("role") === "spectator";
    const hostParam = params.get("host");
    if (!forceSpectator && hostParam && hostParam !== "1") {
      localStorage.setItem(hostKey(upper), hostParam);
    }
    if (!forceSpectator) {
      const savedHost = localStorage.getItem(hostKey(upper));
      if (savedHost) setHostSecret(savedHost);
    }
    try {
      const raw = localStorage.getItem(spectatorKey(upper));
      if (raw) {
        const parsed = JSON.parse(raw) as { id?: string; name?: string };
        if (parsed.id) setSpectatorId(parsed.id);
        if (parsed.name) setSpectatorName(parsed.name);
      }
    } catch {
      /* ignore */
    }
  }, [upper]);

  useEffect(() => {
    let gone = false;
    async function bootstrap() {
      try {
        const params = new URLSearchParams(window.location.search);
        const forceSpectator = params.get("role") === "spectator";
        const hostParam = params.get("host");
        if (!forceSpectator && hostParam && hostParam !== "1") {
          localStorage.setItem(hostKey(upper), hostParam);
        }
        const savedHost = forceSpectator ? null : localStorage.getItem(hostKey(upper));
        if (savedHost) {
          const response = await fetch(`/api/rooms/${upper}/join`, {
            method: "POST",
            headers: tenantHeaders({ "content-type": "application/json" }),
            body: JSON.stringify({ hostSecret: savedHost, tenantId: readLockedTenant() || "default" }),
          });
          const data = await response.json();
          if (!gone && response.ok) {
            setHostSecret(savedHost);
            apply(data);
            return;
          }
        }
        const response = await fetch(`/api/rooms/${upper}/join`, {
          method: "POST",
          headers: tenantHeaders({ "content-type": "application/json" }),
          body: JSON.stringify({ name: spectatorName, tenantId: readLockedTenant() || "default" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "加入失败");
        if (!gone) apply(data);
      } catch (cause) {
        if (!gone) setError(cause instanceof Error ? cause.message : "加入失败");
      }
    }
    void bootstrap();
    return () => {
      gone = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upper, apply]);

  useEffect(() => {
    if (view?.isHost) rememberHosted(tenant, upper);
    if (!view?.isHost || !hostSecret || view.status !== "lobby") return;
    let gone = false;
    void fetch(`/api/rooms/${upper}/invite`, { headers: tenantHeaders({ "x-room-host": hostSecret }) })
      .then(async (response) => {
        const data = (await response.json()) as { block?: string; wind?: string; error?: string };
        if (!response.ok || !data.block) return;
        if (!gone) {
          setInvite(data.block);
          setInviteSeat(data.wind ?? "");
        }
      })
      .catch(() => undefined);
    return () => {
      gone = true;
    };
  }, [view?.isHost, view?.status, view?.updatedAt, hostSecret, upper, tenant]);

  useEffect(() => {
    if (!view) return;
    const streamHeaders = tenantHeaders();
    if (hostSecret) streamHeaders["x-room-host"] = hostSecret;
    if (spectatorId) streamHeaders["x-spectator-id"] = spectatorId;
    const source = EventSourcePoly(upper, streamHeaders, (payload) => {
      setView(payload);
    });
    return () => source.close();
  }, [view?.code, hostSecret, spectatorId, upper, tenant]);

  async function api(path: string, body: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(path, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...body, hostSecret, tenantId: tenant }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "操作失败");
      apply(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }

  async function claimSeat(seat: number) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/room/${upper}/claim-seat`, {
        method: "POST",
        headers: tenantHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ seatToken: claimToken, name: claimName, tenantId: tenant }),
      });
      const data = (await response.json()) as { error?: string; you?: { seat?: number } };
      if (!response.ok) throw new Error(data.error || "入座失败");
      if (data.you?.seat !== undefined && data.you.seat !== seat) {
        setError(`这个 token 坐的是 ${data.you.seat} 席`);
      }
      setClaimAt(null);
      const fresh = await fetch(`/api/rooms/${upper}`, { headers });
      if (fresh.ok) setView((await fresh.json()) as RoomView);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "入座失败");
    } finally {
      setBusy(false);
    }
  }

  async function copySeatInvite(seat: number) {
    if (!hostSecret) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/rooms/${upper}/invite?seat=${seat}`, {
        headers: tenantHeaders({ "x-room-host": hostSecret }),
      });
      const data = (await response.json()) as { block?: string; wind?: string; error?: string };
      if (!response.ok || !data.block) throw new Error(data.error || "无法生成邀请");
      setInvite(data.block);
      setInviteSeat(data.wind ?? "");
      await navigator.clipboard.writeText(data.block);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "无法生成邀请");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/room/${upper}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("复制失败");
    }
  }

  if (error && !view) {
    return (
      <main className="room quiet">
        <p>{error}</p>
        <a className="chip-btn" href="/">回大厅</a>
      </main>
    );
  }
  if (!view) return <main className="room quiet">进房…</main>;

  const role = view.isHost ? "host" : "spectator";
  const full = view.seats.every((seat) => !seat.empty);
  const aceLevels = view.match?.levels ?? { ns: view.startLevel, ew: view.startLevel };
  const aceFails = view.match?.aceFails ?? { ns: 0, ew: 0 };
  const aceLimit = view.match?.aceLimit ?? view.aceLimit ?? 3;

  if ((view.status === "playing" || view.status === "finished") && view.matchId) {
    return (
      <div className="room-stack">
        <RoomRail tenant={tenant} currentCode={view.code} />
        <Arena
          id={view.matchId}
          role={role}
          roomCode={view.code}
          spectatorCount={view.spectatorCount}
          externalView={view.match}
          turnBudgetMs={view.turnBudgetMs}
          seatStatuses={view.seats.map((seat) => ({ status: seat.status || "playing", statusLabel: seat.statusLabel || "出牌中" }))}
          chat={view.chat}
          onChat={(text) => void api(`/api/rooms/${upper}/chat`, { text, name: view.isHost ? "房主" : spectatorName })}
        />
      </div>
    );
  }

  return (
    <main className="hall room-hall hall-ia" data-testid="room-lobby">
      <TenantBar locked={tenant} onLocked={() => undefined} readOnly />
      <RoomRail tenant={tenant} currentCode={view.code} />
      <section className="hall-copy">
        <p className="eyebrow">Room · {SERIES_LABEL[view.series]}</p>
        <h1>房间 {view.code}</h1>
        <p>发给你的 Agent → 它自检 Jev → 合格再入座自打。密钥不要贴进这页。人类用同一链接围观。</p>
        <div className="room-share">
          <code data-testid="room-code">{view.code}</code>
          <button className="chip-btn" type="button" data-testid="copy-room-link" onClick={() => void copyLink()}>
            {copied ? "已复制" : "复制围观链接"}
          </button>
          <RulesButton />
          <a className="chip-btn" href="/">大厅</a>
        </div>
        <p className="room-path">/room/{view.code}</p>
        <div className="spectator-chip" data-testid="spectator-count">
          观众 {view.spectatorCount}
          <span>{view.spectators.map((row) => row.name).join(" · ") || "等待围观"}</span>
        </div>
      </section>

      <section className="hall-table room-panel">
        <AceStrip levels={aceLevels} aceFails={aceFails} aceLimit={aceLimit} />
        {full ? <p className="spectate-only" data-testid="spectate-only">已满 · 围观</p> : null}
        {view.isHost && view.status === "lobby" ? (
          <div className="invite-card" data-testid="agent-invite">
            <p className="invite-kicker">发给你的 Agent → 它自检 Jev → 合格再入座自打</p>
            <button
              className="chip-btn gold cta-room"
              type="button"
              data-testid="copy-agent-invite"
              disabled={!invite}
              onClick={() => {
                void navigator.clipboard.writeText(invite).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                });
              }}
            >
              {copied ? "已复制给 Agent" : "复制给 Agent"}
            </button>
            <small>{inviteSeat ? `这段话会让它坐 ${inviteSeat}。没有 Jev 它应当停下来告诉你。` : "正在生成邀请…"}</small>
            <pre data-testid="invite-preview">{invite || "…"}</pre>
          </div>
        ) : null}
        <div className="name-grid room-seats" data-testid="seat-map">
          {view.seats.map((seat) => {
            const hostSeat = view.isHost && seat.index === 0;
            return (
              <article
                key={seat.index}
                className={`hall-seat room-seat ${seat.team} ${seat.ready ? "ready" : ""} ${hostSeat ? "is-host-seat" : ""}`}
                data-testid={hostSeat ? "host-seat" : `room-seat-${seat.index}`}
              >
                <header>
                  <em>{seat.wind}{hostSeat ? " · 房主" : ""}</em>
                  <b className={`ready-dot status-${seat.status || "waiting"}`} data-testid={`seat-status-${seat.index}`}>{seat.statusLabel || (seat.ready ? "就绪" : "等待")}</b>
                </header>
                {seat.empty ? (
                  <>
                    <strong>空位</strong>
                    <small>{seat.status === "checking" ? "Agent 正在自检 Jev" : "入座"}</small>
                    {view.isHost ? (
                      <button className="chip-btn tiny" type="button" data-testid={`claim-seat-${seat.index}`} disabled={busy} onClick={() => void copySeatInvite(seat.index)}>
                        入座
                      </button>
                    ) : (
                      <button className="chip-btn tiny" type="button" data-testid={`claim-seat-${seat.index}`} onClick={() => setClaimAt(seat.index)}>
                        入座
                      </button>
                    )}
                    {!view.isHost && claimAt === seat.index ? (
                      <form
                        className="seat-claim"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void claimSeat(seat.index);
                        }}
                      >
                        <input value={claimToken} onChange={(event) => setClaimToken(event.target.value)} placeholder="seatToken" aria-label="seatToken" />
                        <input value={claimName} onChange={(event) => setClaimName(event.target.value)} placeholder="名字" aria-label="名字" />
                        <button className="chip-btn tiny" type="submit" disabled={busy || !claimToken}>入座</button>
                      </form>
                    ) : null}
                  </>
                ) : (
                  <>
                    <strong>{seat.name}</strong>
                    <small>
                      <span className="provider-badge">{seat.badge}</span>
                      {seat.model}
                    </small>
                  </>
                )}
                {hostSeat ? (
                  <div className="host-actions" data-testid="host-actions">
                    <button className="chip-btn tiny" type="button" data-testid="fill-mock" disabled={busy} onClick={() => void api(`/api/rooms/${upper}/fill-mock`)}>
                      空位填 Mock
                    </button>
                    <button className="chip-btn tiny" type="button" data-testid="room-start" disabled={busy || !view.ready} onClick={() => void api(`/api/rooms/${upper}/start`)}>
                      {busy ? "发牌…" : view.ready ? "可开打" : "席未齐"}
                    </button>
                    {!seat.empty ? (
                      <button className="chip-btn tiny" type="button" disabled={busy} onClick={() => void api(`/api/rooms/${upper}/seat`, { seat: seat.index, clear: true })}>
                        清空本席
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {!view.isHost ? <p className="muted">你是观众。空位入座，满座只围观。</p> : null}

        <div className="room-chat" data-testid="room-chat">
          <h3>围观聊天</h3>
          <div className="room-chat-list">
            {view.chat.length === 0 ? <p className="muted">还没有消息</p> : null}
            {view.chat.map((row) => (
              <p key={row.id}><b>{row.name}</b> {row.text}</p>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!chatText.trim()) return;
              void api(`/api/rooms/${upper}/chat`, { text: chatText, name: view.isHost ? "房主" : spectatorName });
              setChatText("");
            }}
          >
            <input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="短评一句" maxLength={80} />
            <button className="chip-btn tiny" type="submit">发送</button>
          </form>
        </div>

        {error ? <p className="banner-error">{error}</p> : null}
      </section>
    </main>
  );
}

/** Tiny EventSource wrapper that supports custom headers via fetch streaming. */
function EventSourcePoly(code: string, headers: Record<string, string>, onRoom: (view: RoomView) => void) {
  const controller = new AbortController();
  let closed = false;

  void (async () => {
    try {
      const response = await fetch(`/api/rooms/${code}/stream`, { headers, signal: controller.signal });
      if (!response.ok || !response.body) throw new Error("stream failed");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (!closed) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";
        for (const chunk of chunks) {
          const line = chunk.split("\n").find((row) => row.startsWith("data: "));
          if (!line) continue;
          try {
            onRoom(JSON.parse(line.slice(6)) as RoomView);
          } catch {
            /* ignore */
          }
        }
      }
    } catch {
      if (closed) return;
      const poll = async () => {
        if (closed) return;
        try {
          const response = await fetch(`/api/rooms/${code}`, { headers });
          if (response.ok) onRoom((await response.json()) as RoomView);
        } catch {
          /* ignore */
        }
        if (!closed) window.setTimeout(poll, 900);
      };
      void poll();
    }
  })();

  return {
    close() {
      closed = true;
      controller.abort();
    },
  };
}
