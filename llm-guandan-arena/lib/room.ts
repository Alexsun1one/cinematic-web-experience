import { createMatch, parseStartLevel, seatActions, type Match } from "./guandan/match";
import { aceStrikeLimit } from "./guandan/score";
import type { FaceRank, ProviderId, SeatConfig, VendorId } from "./guandan/types";
import { SEAT_WIND, teamOf } from "./guandan/types";
import { tableProcedure } from "./guandan/procedure";
import { buildInviteBlock, JEV_BUDGET_MS, TURN_BUDGET_MS } from "./invite";
import { ROSTER } from "./roster-data";
import { keyStatus, vendorReady } from "./roster";
import {
  DEFAULT_TENANT,
  TenantRoomLimitError,
  normalizeTenant,
  roomStore,
  roomTtlSec,
  tenantFromRequest,
  tenantMaxRooms,
  type RoomSnapshot,
} from "./room-store";
import { persistMatch, readMatch, remember } from "./store";
import { toView, type MatchView } from "./view";

export type RoomSeries = "open" | "three" | "full";
export type RoomStatus = "lobby" | "playing" | "finished";

export interface RoomSeatAgent {
  name: string;
  short: string;
  kind: "mock" | "env" | "openai" | "self";
  drive: "mock" | "self";
  provider: ProviderId;
  vendor: VendorId;
  model: string;
  ready: boolean;
  /** Guest act auth. Never included in public views. */
  seatToken?: string | null;
  /** Server-only secrets — stripped from public view. */
  custom?: { baseUrl: string; apiKey: string } | null;
}

export interface SeatInvite {
  token: string;
  seat: number;
  used: boolean;
}

export interface RoomSeatPublic {
  index: number;
  wind: string;
  team: "ns" | "ew";
  empty: boolean;
  name: string | null;
  short: string | null;
  kind: "mock" | "env" | "openai" | "self" | null;
  drive: "mock" | "self" | null;
  provider: ProviderId | null;
  vendor: VendorId | null;
  model: string | null;
  ready: boolean;
  badge: string;
  /** waiting | checking | ready | playing | timedOut */
  status: SeatPresence;
  statusLabel: string;
}

export type SeatPresence = "waiting" | "checking" | "ready" | "playing" | "timedOut";

const STATUS_LABEL: Record<SeatPresence, string> = {
  waiting: "等待",
  checking: "自检中",
  ready: "就绪",
  playing: "出牌中",
  timedOut: "超时",
};

export interface ChatMessage {
  id: number;
  at: number;
  name: string;
  text: string;
  role: "host" | "spectator";
}

export interface Room {
  code: string;
  tenantId: string;
  hostSecret: string;
  createdAt: number;
  updatedAt: number;
  /** Last revision successfully stored. 0 until the first save. */
  rev: number;
  /** Epoch ms. Refreshed on each save. Absent when TTL is disabled. */
  expiresAt?: number;
  /** Consecutive server timeouts, cleared by a real act from that seat. */
  timeoutStreak: [number, number, number, number];
  series: RoomSeries;
  startLevel: FaceRank;
  seatsOpen: boolean;
  status: RoomStatus;
  seats: [RoomSeatAgent | null, RoomSeatAgent | null, RoomSeatAgent | null, RoomSeatAgent | null];
  spectators: Map<string, { id: string; name: string; lastSeen: number }>;
  chat: ChatMessage[];
  chatSeq: number;
  matchId: string | null;
  autoFillMock: boolean;
  invites: SeatInvite[];
  /** Seat whose last action was a server timeout fallback. */
  lastTimeoutSeat: number | null;
  onAct?: (seat: number) => void;
}

type LiveGlobal = { __guandanLiveRooms?: Map<string, Room> };

function liveRooms(): Map<string, Room> {
  const g = globalThis as LiveGlobal;
  if (!g.__guandanLiveRooms) g.__guandanLiveRooms = new Map();
  return g.__guandanLiveRooms;
}

function liveKey(tenantId: string, code: string): string {
  return `${normalizeTenant(tenantId)}:${code.toUpperCase()}`;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

interface RoomRecord extends Omit<RoomSnapshot, "status"> {
  status: RoomStatus;
  hostSecret: string;
  series: RoomSeries;
  startLevel: FaceRank;
  seatsOpen: boolean;
  seats: [RoomSeatAgent | null, RoomSeatAgent | null, RoomSeatAgent | null, RoomSeatAgent | null];
  spectators: { id: string; name: string; lastSeen: number }[];
  chat: ChatMessage[];
  chatSeq: number;
  matchId: string | null;
  autoFillMock: boolean;
  invites: SeatInvite[];
  lastTimeoutSeat: number | null;
  timeoutStreak?: [number, number, number, number];
  expiresAt?: number;
}

function toRecord(room: Room): RoomRecord {
  return {
    tenantId: room.tenantId,
    code: room.code,
    hostSecret: room.hostSecret,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    rev: room.rev,
    series: room.series,
    startLevel: room.startLevel,
    seatsOpen: room.seatsOpen,
    status: room.status,
    seats: room.seats,
    spectators: [...room.spectators.values()],
    chat: room.chat,
    chatSeq: room.chatSeq,
    matchId: room.matchId,
    autoFillMock: room.autoFillMock,
    invites: room.invites,
    lastTimeoutSeat: room.lastTimeoutSeat,
    timeoutStreak: room.timeoutStreak,
    expiresAt: room.expiresAt,
  };
}

function normalizeStreak(raw: [number, number, number, number] | undefined): [number, number, number, number] {
  if (!raw || raw.length !== 4) return [0, 0, 0, 0];
  return [raw[0] || 0, raw[1] || 0, raw[2] || 0, raw[3] || 0];
}

function fromRecord(record: RoomRecord): Room {
  return {
    ...record,
    rev: record.rev ?? 0,
    timeoutStreak: normalizeStreak(record.timeoutStreak),
    spectators: new Map(record.spectators.map((row) => [row.id, { ...row }])),
  };
}

function applyRecord(room: Room, record: RoomRecord) {
  const onAct = room.onAct;
  room.tenantId = record.tenantId;
  room.hostSecret = record.hostSecret;
  room.createdAt = record.createdAt;
  room.updatedAt = record.updatedAt;
  room.rev = record.rev ?? 0;
  room.series = record.series;
  room.startLevel = record.startLevel;
  room.seatsOpen = record.seatsOpen;
  room.status = record.status;
  room.seats = record.seats;
  room.spectators = new Map(record.spectators.map((row) => [row.id, { ...row }]));
  room.chat = record.chat;
  room.chatSeq = record.chatSeq;
  room.matchId = record.matchId;
  room.autoFillMock = record.autoFillMock;
  room.invites = record.invites;
  room.lastTimeoutSeat = record.lastTimeoutSeat;
  room.timeoutStreak = normalizeStreak(record.timeoutStreak);
  room.expiresAt = record.expiresAt;
  room.onAct = onAct;
}

/** Consecutive timeouts before a self seat is switched to Mock. Unset or 0 never kicks. */
export function kickAfterTimeouts(): number {
  const raw = process.env.GUANDAN_KICK_AFTER;
  if (raw === undefined || raw.trim() === "" || raw === "0") return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 0;
  return Math.floor(n);
}

export class RoomRevisionError extends Error {
  readonly status = 409;
  constructor() {
    super("房间已在别处更新，请重试");
    this.name = "RoomRevisionError";
  }
}

export async function saveRoom(room: Room): Promise<void> {
  const expected = room.rev ?? 0;
  room.rev = expected + 1;
  room.updatedAt = Date.now();
  const ttl = roomTtlSec();
  room.expiresAt = ttl === 0 ? undefined : Date.now() + ttl * 1000;
  const wrote = await roomStore().compareAndSet(toRecord(room), expected);
  if (!wrote) {
    room.rev = expected;
    throw new RoomRevisionError();
  }
  liveRooms().set(liveKey(room.tenantId, room.code), room);
}

export async function getRoom(code: string, tenantId: string = DEFAULT_TENANT): Promise<Room | undefined> {
  const tenant = normalizeTenant(tenantId);
  const upper = code.toUpperCase();
  const record = (await roomStore().get(tenant, upper)) as RoomRecord | null;
  const key = liveKey(tenant, upper);
  if (!record) {
    liveRooms().delete(key);
    return undefined;
  }
  const cached = liveRooms().get(key);
  const remoteRev = record.rev ?? 0;
  if (cached && (cached.rev ?? 0) >= remoteRev) return cached;
  if (cached) {
    applyRecord(cached, record);
    return cached;
  }
  const room = fromRecord(record);
  liveRooms().set(key, room);
  return room;
}

export async function listRooms(tenantId: string = DEFAULT_TENANT): Promise<Room[]> {
  const tenant = normalizeTenant(tenantId);
  const records = await roomStore().list(tenant);
  const rooms: Room[] = [];
  for (const record of records) {
    const room = await getRoom(record.code, tenant);
    if (room) rooms.push(room);
  }
  return rooms.sort((a, b) => b.createdAt - a.createdAt);
}

async function pruneTenant(tenantId: string) {
  const rows = await roomStore().list(tenantId);
  if (rows.length <= 40) return;
  const oldestFinished = [...rows]
    .filter((row) => row.status === "finished")
    .sort((a, b) => a.createdAt - b.createdAt)[0];
  if (!oldestFinished) return;
  await roomStore().delete(tenantId, oldestFinished.code);
  liveRooms().delete(liveKey(tenantId, oldestFinished.code));
}

export async function createRoom(input: {
  series?: RoomSeries;
  startLevel?: unknown;
  seatsOpen?: boolean;
  autoFillMock?: boolean;
  tenantId?: string;
}): Promise<{ room: Room; hostSecret: string }> {
  const tenantId = normalizeTenant(input.tenantId);
  const max = tenantMaxRooms();
  if (max !== null) {
    const open = await roomStore().countOpen(tenantId);
    if (open >= max) throw new TenantRoomLimitError();
  }
  let code = makeRoomCode();
  while (await roomStore().get(tenantId, code)) code = makeRoomCode();
  const hostSecret = crypto.randomUUID();
  const series = input.series === "full" || input.series === "three" || input.series === "open" ? input.series : "three";
  const room: Room = {
    code,
    tenantId,
    hostSecret,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rev: 0,
    series,
    startLevel: series === "full" ? "2" : parseStartLevel(input.startLevel),
    seatsOpen: input.seatsOpen !== false,
    status: "lobby",
    seats: [null, null, null, null],
    spectators: new Map(),
    chat: [],
    chatSeq: 0,
    matchId: null,
    autoFillMock: input.autoFillMock !== false,
    invites: [],
    lastTimeoutSeat: null,
    timeoutStreak: [0, 0, 0, 0],
  };
  if (room.autoFillMock) assignMockSeats(room);
  await saveRoom(room);
  await pruneTenant(tenantId);
  return { room, hostSecret };
}

export async function loadRequestRoom(
  request: Request,
  code: string,
  body?: { tenantId?: unknown } | null,
): Promise<Room | undefined> {
  return getRoom(code, tenantFromRequest(request, body));
}

export function isHost(room: Room, secret: string | null | undefined): boolean {
  return Boolean(secret && secret === room.hostSecret);
}

function mockAgent(index: number): RoomSeatAgent {
  const roster = ROSTER[index];
  return {
    name: roster.name,
    short: roster.short,
    kind: "mock",
    drive: "mock",
    provider: "mock",
    vendor: roster.vendor,
    model: roster.model,
    ready: true,
    custom: null,
  };
}

function assignMockSeats(room: Room) {
  for (let i = 0; i < 4; i++) {
    if (room.seats[i]) continue;
    room.seats[i] = mockAgent(i);
  }
}

export async function fillMockSeats(room: Room) {
  assignMockSeats(room);
  await saveRoom(room);
}

/** Three heuristic bots plus one open self-drive seat. The seatToken is only returned here. */
export async function openOperatorTable(input?: {
  seat?: number;
  series?: RoomSeries;
  startLevel?: unknown;
  tenantId?: string;
}): Promise<{ room: Room; hostSecret: string; seat: number; wind: string; seatToken: string }> {
  const seat = input?.seat === 0 || input?.seat === 1 || input?.seat === 2 || input?.seat === 3 ? input.seat : 2;
  const { room, hostSecret } = await createRoom({
    series: input?.series ?? "open",
    startLevel: input?.startLevel ?? "T",
    autoFillMock: false,
    seatsOpen: true,
    tenantId: input?.tenantId,
  });
  for (let index = 0; index < 4; index += 1) {
    if (index === seat) continue;
    room.seats[index] = mockAgent(index);
  }
  const seatToken = crypto.randomUUID();
  room.invites.push({ token: seatToken, seat, used: false });
  await saveRoom(room);
  return { room, hostSecret, seat, wind: SEAT_WIND[seat], seatToken };
}

export async function claimSeat(
  room: Room,
  index: number,
  input: {
    kind: "mock" | "env" | "openai";
    name?: string;
    model?: string;
    baseUrl?: string;
    apiKey?: string;
    vendor?: VendorId;
  },
): Promise<RoomSeatAgent> {
  if (room.status !== "lobby") throw new Error("对局已开始，不能改座位");
  if (index < 0 || index > 3) throw new Error("座位无效");
  if (!room.seatsOpen && room.seats[index]) throw new Error("座位已占用");

  const roster = ROSTER[index];
  let agent: RoomSeatAgent;

  if (input.kind === "mock") {
    agent = {
      name: input.name?.trim() || roster.name,
      short: (input.name?.trim() || roster.short).slice(0, 12),
      kind: "mock",
      drive: "mock",
      provider: "mock",
      vendor: roster.vendor,
      model: roster.model,
      ready: true,
      custom: null,
    };
  } else if (input.kind === "env") {
    const vendor = input.vendor && ["deepseek", "gemini", "mimo", "zhipu"].includes(input.vendor) ? input.vendor : roster.vendor;
    if (!vendorReady(vendor)) throw new Error("该供应商密钥未配置");
    const row = ROSTER.find((item) => item.vendor === vendor) ?? roster;
    agent = {
      name: input.name?.trim() || row.name,
      short: (input.name?.trim() || row.short).slice(0, 12),
      kind: "env",
      drive: "mock",
      provider: vendor,
      vendor,
      model: input.model?.trim() || row.model,
      ready: true,
      custom: null,
    };
  } else {
    const baseUrl = (input.baseUrl || "").trim().replace(/\/+$/, "");
    const apiKey = (input.apiKey || "").trim();
    const model = (input.model || "").trim();
    if (!baseUrl || !apiKey || !model) throw new Error("需要 base URL、model 和 API key");
    const label = input.name?.trim() || model;
    agent = {
      name: label,
      short: label.slice(0, 12),
      kind: "openai",
      drive: "mock",
      provider: "openai",
      vendor: roster.vendor,
      model,
      ready: true,
      custom: { baseUrl, apiKey },
    };
  }

  room.seats[index] = agent;
  await saveRoom(room);
  return agent;
}

export async function clearSeat(room: Room, index: number) {
  if (room.status !== "lobby") throw new Error("对局已开始");
  room.seats[index] = null;
  await saveRoom(room);
}

export async function addSpectator(room: Room, name?: string): Promise<{ id: string; name: string }> {
  const id = crypto.randomUUID();
  const label = (name?.trim() || `观众${room.spectators.size + 1}`).slice(0, 16);
  room.spectators.set(id, { id, name: label, lastSeen: Date.now() });
  await saveRoom(room);
  return { id, name: label };
}

export function heartbeatSpectator(room: Room, id: string) {
  const row = room.spectators.get(id);
  if (!row) return;
  row.lastSeen = Date.now();
}

export function pruneSpectators(room: Room) {
  const cutoff = Date.now() - 45_000;
  for (const [id, row] of room.spectators) {
    if (row.lastSeen < cutoff) room.spectators.delete(id);
  }
}

export async function postChat(room: Room, name: string, text: string, role: "host" | "spectator") {
  const cleaned = text.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!cleaned) throw new Error("空消息");
  room.chatSeq += 1;
  room.chat.push({ id: room.chatSeq, at: Date.now(), name: name.slice(0, 16), text: cleaned, role });
  if (room.chat.length > 40) room.chat = room.chat.slice(-40);
  await saveRoom(room);
}

export async function issueInvite(room: Room, origin: string, seatIndex?: number) {
  if (room.status !== "lobby") throw new Error("已经开打，不能再发入座邀请");
  let seat: number;
  if (seatIndex !== undefined) {
    if (!Number.isInteger(seatIndex) || seatIndex < 0 || seatIndex > 3) throw new Error("座位无效");
    if (room.seats[seatIndex]) throw new Error("该席已有人");
    seat = seatIndex;
  } else {
    const empty = room.seats.findIndex((item) => !item);
    seat = empty >= 0 ? empty : 0;
  }
  let invite = room.invites.find((item) => item.seat === seat && !item.used);
  if (!invite) {
    invite = { token: crypto.randomUUID(), seat, used: false };
    room.invites.push(invite);
  }
  await saveRoom(room);
  const block = buildInviteBlock({
    origin,
    code: room.code,
    seat,
    wind: SEAT_WIND[seat],
    token: invite.token,
    tenantId: room.tenantId,
  });
  return { token: invite.token, seat, wind: SEAT_WIND[seat], block };
}

export async function claimByToken(room: Room, token: string, name?: string) {
  const existing = seatIndexByToken(room, token);
  if (existing >= 0) return existing;
  if (room.status !== "lobby") throw new Error("已经开打");
  const invite = room.invites.find((item) => item.token === token && !item.used);
  if (!invite) throw new Error("seatToken 无效或已使用");
  const roster = ROSTER[invite.seat];
  const label = (name?.trim() || "Guest Agent").slice(0, 24);
  invite.used = true;
  room.seats[invite.seat] = {
    name: label,
    short: label.slice(0, 12),
    kind: "self",
    drive: "self",
    provider: "mock",
    vendor: roster.vendor,
    model: "guest",
    ready: true,
    seatToken: token,
    custom: null,
  };
  await saveRoom(room);
  return invite.seat;
}

export function seatIndexByToken(room: Room, token: string): number {
  return room.seats.findIndex((seat) => seat?.seatToken === token);
}

export async function notifyAct(room: Room, seat: number) {
  const streak = room.timeoutStreak ?? [0, 0, 0, 0];
  const hadTimeout = room.lastTimeoutSeat === seat;
  const hadStreak = (streak[seat] ?? 0) > 0;
  if (hadTimeout) room.lastTimeoutSeat = null;
  if (hadStreak) streak[seat] = 0;
  room.timeoutStreak = streak;
  if (hadTimeout || hadStreak) await saveRoom(room);
  room.onAct?.(seat);
}

export async function markTimeout(room: Room, seat: number) {
  room.lastTimeoutSeat = seat;
  const streak = room.timeoutStreak ?? [0, 0, 0, 0];
  streak[seat] = (streak[seat] ?? 0) + 1;
  room.timeoutStreak = streak;
  const limit = kickAfterTimeouts();
  const agent = room.seats[seat];
  if (limit > 0 && streak[seat] >= limit && agent?.drive === "self") {
    agent.drive = "mock";
    agent.kind = "mock";
  }
  await saveRoom(room);
}

export function seatPresence(room: Room, index: number): SeatPresence {
  const seat = room.seats[index];
  const invited = room.invites.some((item) => item.seat === index && !item.used);
  if (!seat) return invited ? "checking" : "waiting";
  if (invited && seat.drive !== "self") return "checking";
  if (room.status === "lobby") return seat.ready ? "ready" : "waiting";
  if (room.lastTimeoutSeat === index) return "timedOut";
  return "playing";
}

export function seatsReady(room: Room): boolean {
  return room.seats.every((seat) => seat && seat.ready);
}

export async function startRoomMatch(room: Room): Promise<Match> {
  if (room.status !== "lobby") throw new Error("已经开打");
  if (!seatsReady(room)) {
    if (room.autoFillMock) assignMockSeats(room);
  }
  if (!seatsReady(room)) throw new Error("四席未就绪");

  const seats = room.seats.map((seat) => {
    if (!seat) throw new Error("座位空缺");
    const config: SeatConfig = {
      name: seat.name,
      short: seat.short,
      provider: seat.provider,
      vendor: seat.vendor,
      model: seat.model,
      custom: seat.custom ?? null,
    };
    if (seat.kind === "env" && !vendorReady(seat.vendor)) {
      config.provider = "mock";
    }
    return config;
  }) as [SeatConfig, SeatConfig, SeatConfig, SeatConfig];

  const handLimit = room.series === "three" ? 3 : room.series === "full" ? null : null;
  const match = createMatch({
    id: crypto.randomUUID(),
    seats,
    jevAssist: false,
    startLevel: room.series === "full" ? "2" : room.startLevel,
    handLimit: room.series === "three" ? 3 : handLimit,
  });
  remember(match);
  await persistMatch(match);
  room.matchId = match.id;
  room.status = "playing";
  await saveRoom(room);
  return match;
}

function seatBadge(seat: RoomSeatAgent | null): string {
  if (!seat) return "空位";
  if (seat.drive === "self" || seat.kind === "self") return "自驾";
  if (seat.kind === "mock") return "Mock";
  if (seat.kind === "env") return seat.vendor;
  return "OpenAI";
}

export function toRoomView(
  room: Room,
  opts: { isHost: boolean; match?: Match | null },
): {
  code: string;
  path: string;
  status: RoomStatus;
  series: RoomSeries;
  startLevel: FaceRank;
  seatsOpen: boolean;
  isHost: boolean;
  spectatorCount: number;
  spectators: { id: string; name: string }[];
  seats: RoomSeatPublic[];
  ready: boolean;
  matchId: string | null;
  match: MatchView | null;
  chat: ChatMessage[];
  keys: ReturnType<typeof keyStatus>;
  updatedAt: number;
  turnBudgetMs: number;
  aceLimit: number;
  phase: ReturnType<typeof tableProcedure>["phase"];
  leaderSeat: number | null;
  currentTurn: number | null;
  mustBeat: ReturnType<typeof tableProcedure>["mustBeat"];
} {
  pruneSpectators(room);
  const procedure = tableProcedure(opts.match ?? null);
  return {
    code: room.code,
    path: `/room/${room.code}`,
    status: room.status,
    series: room.series,
    startLevel: room.startLevel,
    seatsOpen: room.seatsOpen,
    isHost: opts.isHost,
    spectatorCount: room.spectators.size,
    spectators: [...room.spectators.values()].map((row) => ({ id: row.id, name: row.name })),
    seats: room.seats.map((seat, index) => {
      const status = seatPresence(room, index);
      return {
      index,
      wind: SEAT_WIND[index],
      team: teamOf(index),
      empty: !seat,
      name: seat?.name ?? null,
      short: seat?.short ?? null,
      kind: seat?.kind ?? null,
      drive: seat?.drive ?? null,
      provider: seat?.provider ?? null,
      vendor: seat?.vendor ?? null,
      model: seat?.model ?? null,
      ready: Boolean(seat?.ready),
      badge: seatBadge(seat),
      status,
      statusLabel: STATUS_LABEL[status],
      };
    }),
    ready: seatsReady(room),
    matchId: room.matchId,
    match: opts.match ? toView(opts.match) : null,
    chat: room.chat.slice(-24),
    keys: keyStatus(),
    updatedAt: room.updatedAt,
    turnBudgetMs: TURN_BUDGET_MS,
    aceLimit: aceStrikeLimit(),
    phase: procedure.phase,
    leaderSeat: procedure.leaderSeat,
    currentTurn: procedure.currentTurn,
    mustBeat: procedure.mustBeat,
  };
}

export async function stateForToken(room: Room, token: string | null) {
  const match = await readMatch(room.matchId);
  const view = toRoomView(room, { isHost: false, match });
  const seat = token ? seatIndexByToken(room, token) : -1;
  if (seat < 0) return { ...view, you: null };
  const actionable = Boolean(
    match && (match.status === "playing" || match.status === "tribute" || match.status === "return"),
  );
  const yourTurn = Boolean(actionable && match && match.trick.currentSeat === seat);
  const legal = yourTurn && match ? seatActions(match) : [];
  return {
    ...view,
    you: {
      seat,
      wind: SEAT_WIND[seat],
      name: room.seats[seat]?.name ?? "",
      yourTurn,
      turnBudgetMs: TURN_BUDGET_MS,
      jevBudgetMs: JEV_BUDGET_MS,
      hand: match ? match.hands[seat].map((card) => ({ id: card.id, suit: card.suit, rank: card.rank })) : [],
      legal,
      phase: view.phase,
      leaderSeat: view.leaderSeat,
      currentTurn: view.currentTurn,
      mustBeat: view.mustBeat,
    },
    legalMoves: yourTurn ? legal : null,
  };
}
