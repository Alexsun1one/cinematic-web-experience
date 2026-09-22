import { chooseHeuristic } from "./guandan/heuristic";
import { beginRound, commitMove, currentLegal, finishResist, logReason, stepLocal, type Match } from "./guandan/match";
import { mockQuickReason } from "./llm/quick-reason";
import { TURN_BUDGET_MS } from "./invite";
import { getRoom, markTimeout, RoomRevisionError, saveRoom, type Room } from "./room";
import { normalizeTenant } from "./room-store";
import { matchStore, readMatch, withMatchLock } from "./store";

const running = new Set<string>();

export function ensureRoomDriver(code: string, tenantId = "default") {
  const key = `${normalizeTenant(tenantId)}:${code.toUpperCase()}`;
  if (running.has(key)) return;
  running.add(key);
  void loop(normalizeTenant(tenantId), code.toUpperCase()).finally(() => running.delete(key));
}

async function loop(tenantId: string, code: string) {
  while (true) {
    try {
      const progressed = await tick(tenantId, code);
      if (!progressed) return;
    } catch (error) {
      console.error(`room ${code} driver`, error instanceof Error ? error.message : error);
      await sleep(400);
    }
  }
}

async function tick(tenantId: string, code: string): Promise<boolean> {
  const room = await getRoom(code, tenantId);
  if (!room?.matchId) return false;
  const match = await readMatch(room.matchId);
  if (!match) return false;
  if (match.status === "finished") {
    room.status = "finished";
    await saveFinished(room);
    return false;
  }
  if (match.status === "between_rounds") {
    await sleep(3200);
    await withMatchLock(match.id, async () => {
      if (match.status === "between_rounds") beginRound(match);
    });
    return true;
  }
  if (match.status === "resist") {
    await sleep(900);
    await withMatchLock(match.id, async () => {
      if (match.status === "resist") finishResist(match);
    });
    return true;
  }
  if (match.status === "tribute" || match.status === "return") {
    const seat = match.trick.currentSeat;
    const agent = room.seats[seat];
    if (agent?.drive === "self") {
      const acted = await waitForAct(room, seat, TURN_BUDGET_MS);
      const live = matchStore().get(room.matchId);
      if (!live || (live.status !== "tribute" && live.status !== "return")) return true;
      if (acted || live.trick.currentSeat !== seat) {
        await sleep(280);
        return true;
      }
      await withMatchLock(live.id, async () => {
        if ((live.status !== "tribute" && live.status !== "return") || live.trick.currentSeat !== seat) return;
        stepLocal(live);
        await markTimeout(room, seat);
      });
    } else {
      await withMatchLock(match.id, async () => {
        if (match.status !== "tribute" && match.status !== "return") return;
        if (match.trick.currentSeat !== seat) return;
        stepLocal(match);
      });
    }
    await sleep(1100);
    return true;
  }

  const seat = match.trick.currentSeat;
  const agent = room.seats[seat];
  if (agent?.drive === "self") {
    const acted = await waitForAct(room, seat, TURN_BUDGET_MS);
    const live = matchStore().get(room.matchId);
    if (!live || live.status !== "playing") return true;
    if (acted || live.trick.currentSeat !== seat) {
      await sleep(280);
      return true;
    }
    await withMatchLock(live.id, async () => {
      if (live.status !== "playing" || live.trick.currentSeat !== seat) return;
      playFallback(live, "超时代打");
      await markTimeout(room, seat);
    });
  } else {
    await withMatchLock(match.id, async () => {
      if (match.status !== "playing") return;
      if (match.trick.currentSeat !== seat) return;
      const moves = currentLegal(match);
      logReason(match, mockQuickReason(match, moves, 0, "Mock"));
      const move = chooseHeuristic(moves, seat, match.trick.lastSeat, {
        counts: match.hands.map((hand) => hand.length),
        level: match.level,
      });
      commitMove(match, move, {
        source: "mock",
        provider: "mock",
        retries: 0,
        note: "mock",
        assist: null,
      });
    });
  }
  await sleep(320);
  return true;
}

async function saveFinished(room: Room) {
  try {
    await saveRoom(room);
  } catch (error) {
    if (!(error instanceof RoomRevisionError)) throw error;
    const fresh = await getRoom(room.code, room.tenantId);
    if (!fresh) return;
    fresh.status = "finished";
    await saveRoom(fresh);
  }
}

function playFallback(match: Match, note: string) {
  const seat = match.trick.currentSeat;
  const moves = currentLegal(match);
  logReason(match, {
    source: "mock",
    timedOut: true,
    latencyMs: TURN_BUDGET_MS,
    note,
    questions: [],
    lines: [note],
  });
  const move = chooseHeuristic(moves, seat, match.trick.lastSeat, {
    counts: match.hands.map((hand) => hand.length),
    level: match.level,
  });
  commitMove(match, move, {
    source: "fallback",
    provider: "timeout",
    retries: 0,
    note,
    assist: null,
  });
}

function waitForAct(room: Room, seat: number, ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      if (room.onAct === onAct) room.onAct = undefined;
      clearTimeout(timer);
      resolve(value);
    };
    const onAct = (actedSeat: number) => {
      if (actedSeat === seat) finish(true);
    };
    room.onAct = onAct;
    const timer = setTimeout(() => finish(false), ms);
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
