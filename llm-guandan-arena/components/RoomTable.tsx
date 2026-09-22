"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Arena } from "@/components/Arena";
import { SEAT_WIND } from "@/lib/guandan/types";
import type { MatchView } from "@/lib/view";

type RoomSeries = "open" | "three" | "full";

interface RoomSeat {
  index: number;
  wind: string;
  team: "ns" | "ew";
  empty: boolean;
  name: string | null;
  short: string | null;
  kind: "mock" | "env" | "openai" | null;
  provider: string | null;
  vendor: string | null;
  model: string | null;
  ready: boolean;
  badge: string;
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
  const [seatForm, setSeatForm] = useState<number | null>(null);
  const [kind, setKind] = useState<"mock" | "env" | "openai">("mock");
  const [agentName, setAgentName] = useState("");
  const [model, setModel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [chatText, setChatText] = useState("");
  const [copied, setCopied] = useState(false);

  const headers = useMemo(() => {
    const next: Record<string, string> = { "content-type": "application/json" };
    if (hostSecret) next["x-room-host"] = hostSecret;
    if (spectatorId) next["x-spectator-id"] = spectatorId;
    return next;
  }, [hostSecret, spectatorId]);

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
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ hostSecret: savedHost }),
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
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: spectatorName }),
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
    if (!view) return;
    const streamHeaders: Record<string, string> = {};
    if (hostSecret) streamHeaders["x-room-host"] = hostSecret;
    if (spectatorId) streamHeaders["x-spectator-id"] = spectatorId;
    const source = EventSourcePoly(upper, streamHeaders, (payload) => {
      setView(payload);
    });
    return () => source.close();
  }, [view?.code, hostSecret, spectatorId, upper]);

  async function api(path: string, body: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(path, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...body, hostSecret }),
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

  async function claim() {
    if (seatForm === null) return;
    await api(`/api/rooms/${upper}/seat`, {
      seat: seatForm,
      kind,
      name: agentName || undefined,
      model: model || undefined,
      baseUrl: baseUrl || undefined,
      apiKey: apiKey || undefined,
    });
    setSeatForm(null);
    setApiKey("");
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
  if ((view.status === "playing" || view.status === "finished") && view.matchId) {
    return (
      <Arena
        id={view.matchId}
        role={role}
        roomCode={view.code}
        spectatorCount={view.spectatorCount}
        externalView={role === "spectator" ? view.match : null}
        chat={view.chat}
        onChat={(text) => void api(`/api/rooms/${upper}/chat`, { text, name: view.isHost ? "房主" : spectatorName })}
      />
    );
  }

  return (
    <main className="hall room-hall" data-testid="room-lobby">
      <section className="hall-copy">
        <p className="eyebrow">Room · {SERIES_LABEL[view.series]}</p>
        <h1>房间 {view.code}</h1>
        <p>分享链接让人类围观。四席可坐自带 Agent（Mock / 环境密钥 / OpenAI 兼容）。密钥只留在服务端房间会话，不会进前端包。</p>
        <div className="room-share">
          <code data-testid="room-code">{view.code}</code>
          <button className="chip-btn gold" type="button" data-testid="copy-room-link" onClick={() => void copyLink()}>
            {copied ? "已复制" : "复制链接"}
          </button>
          <a className="chip-btn" href="/">大厅</a>
        </div>
        <p className="room-path">/room/{view.code}</p>
        <div className="spectator-chip" data-testid="spectator-count">
          观众 {view.spectatorCount}
          <span>{view.spectators.map((row) => row.name).join(" · ") || "等待围观"}</span>
        </div>
      </section>

      <section className="hall-table room-panel">
        <div className="name-grid room-seats">
          {view.seats.map((seat) => (
            <article key={seat.index} className={`hall-seat room-seat ${seat.team} ${seat.ready ? "ready" : ""}`} data-testid={`room-seat-${seat.index}`}>
              <header>
                <em>{seat.wind}</em>
                {seat.ready ? <b className="ready-dot">就绪</b> : <b className="empty-dot">空</b>}
              </header>
              {seat.empty ? (
                <>
                  <strong>空位</strong>
                  <small>坐上我的 Agent</small>
                  <button className="chip-btn tiny" type="button" disabled={busy} onClick={() => { setSeatForm(seat.index); setKind("mock"); }}>
                    坐上我的 Agent
                  </button>
                </>
              ) : (
                <>
                  <strong>{seat.name}</strong>
                  <small>
                    <span className="provider-badge">{seat.badge}</span>
                    {seat.model}
                  </small>
                  {view.isHost ? (
                    <button className="chip-btn tiny" type="button" disabled={busy} onClick={() => void api(`/api/rooms/${upper}/seat`, { seat: seat.index, clear: true })}>
                      清空
                    </button>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </div>

        {seatForm !== null ? (
          <div className="seat-form" data-testid="seat-form">
            <p>入座 · {SEAT_WIND[seatForm]}</p>
            <div className="hall-levels">
              <button className={`chip-btn ${kind === "mock" ? "on" : ""}`} type="button" onClick={() => setKind("mock")}>Mock</button>
              <button className={`chip-btn ${kind === "env" ? "on" : ""}`} type="button" onClick={() => setKind("env")}>环境密钥</button>
              <button className={`chip-btn ${kind === "openai" ? "on" : ""}`} type="button" onClick={() => setKind("openai")}>OpenAI 兼容</button>
            </div>
            <input placeholder="Agent 显示名（可选）" value={agentName} onChange={(event) => setAgentName(event.target.value)} />
            {kind === "openai" ? (
              <>
                <input placeholder="Base URL" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
                <input placeholder="Model id" value={model} onChange={(event) => setModel(event.target.value)} />
                <input placeholder="API key（仅服务端保存）" type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} autoComplete="off" />
              </>
            ) : null}
            {kind === "env" ? (
              <input placeholder="Model 覆盖（可选）" value={model} onChange={(event) => setModel(event.target.value)} />
            ) : null}
            <div className="hall-levels">
              <button className="chip-btn gold" type="button" disabled={busy} onClick={() => void claim()}>确认入座</button>
              <button className="chip-btn" type="button" onClick={() => setSeatForm(null)}>取消</button>
            </div>
          </div>
        ) : null}

        <div className="hall-levels">
          {view.isHost ? (
            <>
              <button className="chip-btn" type="button" data-testid="fill-mock" disabled={busy} onClick={() => void api(`/api/rooms/${upper}/fill-mock`)}>
                空位填 Mock
              </button>
              <button className="chip-btn gold" type="button" data-testid="room-start" disabled={busy || !view.ready} onClick={() => void api(`/api/rooms/${upper}/start`)}>
                {busy ? "发牌…" : "开打"}
              </button>
            </>
          ) : (
            <span className="muted">你是观众 · 等待房主开打</span>
          )}
        </div>

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
