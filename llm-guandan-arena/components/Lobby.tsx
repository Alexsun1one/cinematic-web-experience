"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RoomRail } from "@/components/RoomRail";
import { RulesButton } from "@/components/RulesDrawer";
import { TenantBar } from "@/components/TenantBar";
import { SIMPLIFICATIONS } from "@/lib/guandan/simplifications";
import { roomMatchesFilter, type RoomListFilter } from "@/lib/room-list";
import { hostedCodes, lockTenant, readLockedTenant, rememberHosted, tenantHeaders } from "@/lib/tenant-client";

interface ListedRoom {
  code: string;
  status: string;
  series: "open" | "three" | "full";
  startLevel?: string;
  spectatorCount: number;
  emptySeats: number;
  seated: number;
}

interface ListedMatch {
  id: string;
  status: string;
  round: number;
}

const LEVELS = ["2", "5", "T", "J", "K", "A"] as const;
const FILTERS: { id: RoomListFilter; label: string }[] = [
  { id: "open", label: "可入座" },
  { id: "watching", label: "围观中" },
  { id: "mine", label: "我开的" },
  { id: "full", label: "已满" },
];
const SERIES_LABEL = { open: "本局起", three: "三局", full: "打满一盘" };

export function Lobby() {
  const router = useRouter();
  const [locked, setLocked] = useState<string | null>(null);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("T");
  const [series, setSeries] = useState<"open" | "three" | "full">("three");
  const [live, setLive] = useState(false);
  const [jev, setJev] = useState(false);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [rooms, setRooms] = useState<ListedRoom[]>([]);
  const [filter, setFilter] = useState<RoomListFilter>("open");
  const [recent, setRecent] = useState<ListedMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocked(readLockedTenant());
  }, []);

  useEffect(() => {
    void fetch("/api/matches")
      .then((response) => response.json())
      .then((data: { keys?: Record<string, boolean>; matches?: ListedMatch[] }) => {
        setKeys(data.keys ?? {});
        setRecent(data.matches ?? []);
      })
      .catch(() => setError("无法读取擂台状态"));
  }, []);

  useEffect(() => {
    if (!locked) {
      setRooms([]);
      return;
    }
    const tenant = locked;
    let gone = false;
    void fetch("/api/rooms", { headers: tenantHeaders() })
      .then((response) => response.json())
      .then((data: { tenantId?: string; rooms?: ListedRoom[] }) => {
        if (gone || data.tenantId !== tenant) return;
        setRooms(data.rooms ?? []);
      })
      .catch(() => {
        if (!gone) setError("无法读取房间");
      });
    return () => {
      gone = true;
    };
  }, [locked]);

  const hosted = useMemo(() => new Set(locked ? hostedCodes(locked) : []), [locked, rooms]);
  const visible = rooms.filter((room) => roomMatchesFilter(room, filter, hosted));
  const anyLiveKey = Boolean(keys.deepseek || keys.gemini || keys.mimo || keys.zhipu);

  async function openRoom() {
    if (!locked) {
      setError("先锁定租户");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: tenantHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          series,
          startLevel: series === "full" ? "2" : level,
          seatsOpen: true,
          autoFillMock: false,
          tenantId: locked,
        }),
      });
      const data = (await response.json()) as { code?: string; hostSecret?: string; error?: string };
      if (!response.ok || !data.code) throw new Error(data.error || "开房失败");
      if (data.hostSecret) localStorage.setItem(`guandan-room-host:${data.code}`, data.hostSecret);
      rememberHosted(locked, data.code);
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
    <main className="hall hall-ia">
      <TenantBar
        locked={locked}
        onLocked={(tenant) => {
          setRooms([]);
          setLocked(tenant);
          if (tenant) lockTenant(tenant);
        }}
      />
      <RoomRail tenant={locked ?? ""} />
      <div className="hall-body">
        <section className="hall-copy">
          <p className="eyebrow">Glass Arena · NS vs EW</p>
          <h1>模型掼蛋擂台</h1>
          <p>先锁定租户，再进可入座的房间。空位交给你的 Agent 入座。满座只围观。</p>
          <section className="howto" data-testid="howto">
            <h2>如何开始</h2>
            <ol>
              <li><b>锁定租户</b><span>列表只显示这一户，不和其他租户混在一起。</span></li>
              <li><b>可入座</b><span>进房后空位是入座，满座是围观。</span></li>
              <li><b>复制给 Agent</b><span>房主操作只在房主席。它自检 Jev 再入座。</span></li>
              <li><b>围观</b><span>人类看牌。超时服务器代打，桌子不停。</span></li>
            </ol>
            <RulesButton />
          </section>
          <ul>
            {SIMPLIFICATIONS.slice(0, 3).map((item) => (
              <li key={item.en}>{item.zh}</li>
            ))}
          </ul>
        </section>
        <section className="hall-table room-list-card" data-testid="lobby">
          <div className="room-filters" data-testid="room-filters">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                className={`chip-btn ${filter === item.id ? "on" : ""}`}
                type="button"
                data-testid={`filter-${item.id}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {!locked ? (
            <p className="muted" data-testid="rooms-locked-out">先锁定租户，再列房间。</p>
          ) : (
            <ul className="room-list" data-testid="room-list">
              {visible.length === 0 ? <li className="muted">这个筛选下没有房间。</li> : null}
              {visible.map((room) => (
                <li key={room.code}>
                  <a href={`/room/${room.code}`} data-testid={`room-link-${room.code}`}>
                    <b>{room.code}</b>
                    <span>{SERIES_LABEL[room.series]} · 打{room.startLevel === "T" ? "10" : room.startLevel}</span>
                    <em>{room.emptySeats > 0 ? `空位 ${room.emptySeats}` : "已满"} · {room.status === "playing" ? "进行中" : "等待"}</em>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section className="hall-table create-card" data-testid="create-room">
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
        </div>
        <div className="hall-levels lobby-cta">
          <button className="chip-btn gold cta-room" type="button" data-testid="open-room" onClick={() => void openRoom()} disabled={busy || !locked}>
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
            {recent.slice(0, 3).map((match) => (
              <a key={match.id} href={`/match/${match.id}`}>
                单机 {match.id.slice(0, 8)} · 第{match.round}局
              </a>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
