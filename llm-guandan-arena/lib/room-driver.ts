import { chooseHeuristic } from "./guandan/heuristic";
import { beginRound, commitMove, currentLegal, logReason } from "./guandan/match";
import { mockQuickReason } from "./llm/quick-reason";
import { TURN_BUDGET_MS } from "./invite";
import { getRoom, type Room } from "./room";
import { matchStore, withMatchLock } from "./store";

const running = new Set<string>();

export function ensureRoomDriver(code: string) {
  const key = code.toUpperCase();
  if (running.has(key)) return;
  running.add(key);
  void loop(key).finally(() => running.delete(key));
}

async function loop(code: string) {
  while (true) {
    const room = getRoom(code);
    if (!room?.matchId) return;
    const match = matchStore().get(room.matchId);
    if (!match) return;
    if (match.status === "finished") {
      room.status = "finished";
      return;
    }
    if (match.status === "between_rounds") {
      await sleep(3200);
      await withMatchLock(match.id, async () => {
        if (match.status === "between_rounds") beginRound(match);
      });
      continue;
    }

    const seat = match.trick.currentSeat;
    const agent = room.seats[seat];
    if (agent?.drive === "self") {
      const acted = await waitForAct(room, seat, TURN_BUDGET_MS);
      const live = matchStore().get(room.matchId);
      if (!live || live.status !== "playing") continue;
      if (acted || live.trick.currentSeat !== seat) {
        await sleep(280);
        continue;
      }
      await withMatchLock(live.id, async () => {
        if (live.status !== "playing" || live.trick.currentSeat !== seat) return;
        playFallback(live, "超时代打");
      });
    } else {
      await withMatchLock(match.id, async () => {
        if (match.status !== "playing") return;
        if (match.trick.currentSeat !== seat) return;
        const moves = currentLegal(match);
        logReason(match, mockQuickReason(match, moves, 0, "Mock"));
        const move = chooseHeuristic(moves, seat, match.trick.lastSeat);
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
  }
}

function playFallback(match: NonNullable<ReturnType<typeof matchStore.get>>, note: string) {
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
  const move = chooseHeuristic(moves, seat, match.trick.lastSeat);
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
