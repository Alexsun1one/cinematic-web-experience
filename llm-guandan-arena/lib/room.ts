import { createMatch, parseStartLevel, type Match } from "./guandan/match";
import type { FaceRank, ProviderId, SeatConfig, VendorId } from "./guandan/types";
import { SEAT_WIND, teamOf } from "./guandan/types";
import { ROSTER } from "./roster-data";
import { keyStatus, vendorReady } from "./roster";
import { remember } from "./store";
import { toView, type MatchView } from "./view";

export type RoomSeries = "open" | "three" | "full";
export type RoomStatus = "lobby" | "playing" | "finished";

export interface RoomSeatAgent {
  name: string;
  short: string;
  kind: "mock" | "env" | "openai";
  provider: ProviderId;
  vendor: VendorId;
  model: string;
  ready: boolean;
  /** Server-only secrets — stripped from public view. */
  custom?: { baseUrl: string; apiKey: string } | null;
}

export interface RoomSeatPublic {
  index: number;
  wind: string;
  team: "ns" | "ew";
  empty: boolean;
  name: string | null;
  short: string | null;
  kind: "mock" | "env" | "openai" | null;
  provider: ProviderId | null;
  vendor: VendorId | null;
  model: string | null;
  ready: boolean;
  badge: string;
}

export interface ChatMessage {
  id: number;
  at: number;
  name: string;
  text: string;
  role: "host" | "spectator";
}

export interface Room {
  code: string;
  hostSecret: string;
  createdAt: number;
  updatedAt: number;
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
}

type GlobalRooms = {
  __guandanRooms?: Map<string, Room>;
};

function rooms(): Map<string, Room> {
  const g = globalThis as GlobalRooms;
  if (!g.__guandanRooms) g.__guandanRooms = new Map();
  return g.__guandanRooms;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export function getRoom(code: string): Room | undefined {
  return rooms().get(code.toUpperCase());
}

export function listRooms(): Room[] {
  return [...rooms().values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function createRoom(input: {
  series?: RoomSeries;
  startLevel?: unknown;
  seatsOpen?: boolean;
  autoFillMock?: boolean;
}): { room: Room; hostSecret: string } {
  let code = makeRoomCode();
  while (rooms().has(code)) code = makeRoomCode();
  const hostSecret = crypto.randomUUID();
  const series = input.series === "full" || input.series === "three" || input.series === "open" ? input.series : "three";
  const room: Room = {
    code,
    hostSecret,
    createdAt: Date.now(),
    updatedAt: Date.now(),
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
  };
  if (room.autoFillMock) fillMockSeats(room);
  rooms().set(code, room);
  pruneRooms();
  return { room, hostSecret };
}

function pruneRooms() {
  const store = rooms();
  if (store.size <= 40) return;
  const oldest = [...store.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
  if (oldest) store.delete(oldest.code);
}

export function touch(room: Room) {
  room.updatedAt = Date.now();
}

export function isHost(room: Room, secret: string | null | undefined): boolean {
  return Boolean(secret && secret === room.hostSecret);
}

export function fillMockSeats(room: Room) {
  for (let i = 0; i < 4; i++) {
    if (room.seats[i]) continue;
    const roster = ROSTER[i];
    room.seats[i] = {
      name: roster.name,
      short: roster.short,
      kind: "mock",
      provider: "mock",
      vendor: roster.vendor,
      model: roster.model,
      ready: true,
      custom: null,
    };
  }
  touch(room);
}

export function claimSeat(
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
): RoomSeatAgent {
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
      provider: "openai",
      vendor: roster.vendor,
      model,
      ready: true,
      custom: { baseUrl, apiKey },
    };
  }

  room.seats[index] = agent;
  touch(room);
  return agent;
}

export function clearSeat(room: Room, index: number) {
  if (room.status !== "lobby") throw new Error("对局已开始");
  room.seats[index] = null;
  touch(room);
}

export function addSpectator(room: Room, name?: string): { id: string; name: string } {
  const id = crypto.randomUUID();
  const label = (name?.trim() || `观众${room.spectators.size + 1}`).slice(0, 16);
  room.spectators.set(id, { id, name: label, lastSeen: Date.now() });
  touch(room);
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

export function postChat(room: Room, name: string, text: string, role: "host" | "spectator") {
  const cleaned = text.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!cleaned) throw new Error("空消息");
  room.chatSeq += 1;
  room.chat.push({ id: room.chatSeq, at: Date.now(), name: name.slice(0, 16), text: cleaned, role });
  if (room.chat.length > 40) room.chat = room.chat.slice(-40);
  touch(room);
}

export function seatsReady(room: Room): boolean {
  return room.seats.every((seat) => seat && seat.ready);
}

export function startRoomMatch(room: Room): Match {
  if (room.status !== "lobby") throw new Error("已经开打");
  if (!seatsReady(room)) {
    if (room.autoFillMock) fillMockSeats(room);
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
  room.matchId = match.id;
  room.status = "playing";
  touch(room);
  return match;
}

function seatBadge(seat: RoomSeatAgent | null): string {
  if (!seat) return "空位";
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
} {
  pruneSpectators(room);
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
    seats: room.seats.map((seat, index) => ({
      index,
      wind: SEAT_WIND[index],
      team: teamOf(index),
      empty: !seat,
      name: seat?.name ?? null,
      short: seat?.short ?? null,
      kind: seat?.kind ?? null,
      provider: seat?.provider ?? null,
      vendor: seat?.vendor ?? null,
      model: seat?.model ?? null,
      ready: Boolean(seat?.ready),
      badge: seatBadge(seat),
    })),
    ready: seatsReady(room),
    matchId: room.matchId,
    match: opts.match ? toView(opts.match) : null,
    chat: room.chat.slice(-24),
    keys: keyStatus(),
    updatedAt: room.updatedAt,
  };
}
