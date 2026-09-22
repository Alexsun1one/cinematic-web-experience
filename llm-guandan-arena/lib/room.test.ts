import assert from "node:assert/strict";
import { armAudio, playTableCue, readMuted } from "./table-audio";
import { commitMove, currentLegal, stepLocal } from "./guandan/match";
import { tableProcedure } from "./guandan/procedure";
import {
  claimByToken,
  claimSeat,
  createRoom,
  fillMockSeats,
  getRoom,
  issueInvite,
  makeRoomCode,
  seatsReady,
  openOperatorTable,
  startRoomMatch,
  stateForToken,
  toRoomView,
} from "./room";
import { matchKey, matchLockKey, MemoryRoomStore, roomKey, roomStore, tenantRoomsKey, TenantRoomLimitError } from "./room-store";

function testCodes() {
  const codes = new Set(Array.from({ length: 20 }, () => makeRoomCode()));
  assert.equal(codes.size, 20);
  for (const code of codes) assert.match(code, /^[A-Z2-9]{6}$/);
}

async function testMockRoomFlow() {
  const { room, hostSecret } = await createRoom({ series: "three", startLevel: "T", autoFillMock: true });
  assert.equal(room.seats.filter(Boolean).length, 4);
  assert.equal(seatsReady(room), true);
  const view = toRoomView(room, { isHost: true });
  assert.equal(view.code.length, 6);
  assert.equal(view.ready, true);
  assert.ok(view.seats.every((seat) => seat.badge === "Mock"));
  assert.ok(!JSON.stringify(view).includes("apiKey"));

  const match = await startRoomMatch(room);
  assert.equal(room.status, "playing");
  assert.equal(room.matchId, match.id);
  assert.equal(match.seats.every((seat) => seat.provider === "mock"), true);
  assert.equal(hostSecret.length > 10, true);
}

async function testByoSeatStripsSecret() {
  const { room } = await createRoom({ series: "open", autoFillMock: false });
  assert.equal(seatsReady(room), false);
  await claimSeat(room, 0, {
    kind: "openai",
    name: "MyBot",
    baseUrl: "https://example.com/v1",
    apiKey: "sk-secret-never-leak",
    model: "gpt-test",
  });
  assert.equal(room.seats[0]?.custom?.apiKey, "sk-secret-never-leak");
  const publicView = toRoomView(room, { isHost: false });
  const blob = JSON.stringify(publicView);
  assert.equal(blob.includes("sk-secret-never-leak"), false);
  assert.equal(blob.includes("apiKey"), false);
  assert.equal(publicView.seats[0].badge, "OpenAI");
  await fillMockSeats(room);
  assert.equal(seatsReady(room), true);
  assert.ok(await getRoom(room.code));
}

async function testGuestInvite() {
  const { room } = await createRoom({ series: "three", autoFillMock: true });
  const issued = await issueInvite(room, "http://localhost:3456");
  assert.match(issued.block, /缺 Jev，不能打/);
  assert.match(issued.block, /你自己的 Jev/);
  assert.match(issued.block, /claim-seat/);
  assert.match(issued.block, /\/act/);
  assert.equal(issued.block.includes("apiKey"), false);
  assert.equal(issued.block.includes(issued.token), true);
  const seat = await claimByToken(room, issued.token, "Guest");
  assert.equal(room.seats[seat]?.drive, "self");
  await assert.rejects(() => claimByToken(room, issued.token, "Again"));
  const secretView = JSON.stringify(toRoomView(room, { isHost: false }));
  assert.equal(secretView.includes(issued.token), false);
  assert.equal((await stateForToken(room, "not-a-token")).you, null);
  const waiting = await stateForToken(room, issued.token);
  assert.equal(waiting.you?.seat, seat);
  assert.equal(waiting.phase, null);
  assert.equal(JSON.stringify(waiting).includes("apiKey"), false);
  assert.match(issued.block, /开局与出牌顺序/);
  assert.match(issued.block, /两张大王则抗贡/);
  assert.match(issued.block, /第一手领出固定是座位 0/);
  assert.match(issued.block, /接风/);
  assert.match(issued.block, /phase 会是 tribute、return 或 resist/);
  assert.match(issued.block, /guest-agent-player/);
  assert.match(issued.block, /不要等人类教牌/);
  assert.match(issued.block, /胜利目标/);
  assert.match(issued.block, /双下/);
  assert.match(issued.block, /逢人配/);
  assert.match(issued.block, /\{"moveId":"\.\.\."\}/);
  assert.match(issued.block, /legalMoves/);
  assert.match(issued.block, /升到 A 还不算赢/);
  assert.match(issued.block, /退回 2/);

  const match = await startRoomMatch(room);
  const opened = tableProcedure(match);
  assert.equal(opened.phase, "play");
  assert.equal(opened.leaderSeat, 0);
  assert.equal(opened.currentTurn, 0);
  assert.equal(opened.mustBeat, null);
  const lead = currentLegal(match).find((move) => move.kind !== "pass");
  assert.ok(lead);
  const opening = await stateForToken(room, issued.token);
  assert.ok(Array.isArray(opening.legalMoves));
  assert.equal(opening.legalMoves?.length, opening.you?.legal.length);
  commitMove(match, lead, { source: "mock", provider: "mock", retries: 0, note: "test" });
  const following = await stateForToken(room, issued.token);
  assert.equal(following.phase, "play");
  assert.equal(following.leaderSeat, 0);
  assert.equal(following.currentTurn, 1);
  assert.equal(following.mustBeat?.seat, 0);
  assert.equal(following.you?.mustBeat?.seat, 0);
  assert.equal(following.you?.currentTurn, 1);
  assert.equal(following.legalMoves, null);
}

async function testSeatPresence() {
  const { room } = await createRoom({ series: "open", autoFillMock: false });
  assert.equal(toRoomView(room, { isHost: true }).seats[0].status, "waiting");
  const issued = await issueInvite(room, "http://localhost:3456");
  assert.equal(toRoomView(room, { isHost: false }).seats[issued.seat].status, "checking");
  await claimByToken(room, issued.token, "Guest");
  assert.equal(toRoomView(room, { isHost: false }).seats[issued.seat].status, "ready");
  await fillMockSeats(room);
  await startRoomMatch(room);
  assert.equal(toRoomView(room, { isHost: false }).seats[issued.seat].status, "playing");
  room.lastTimeoutSeat = issued.seat;
  assert.equal(toRoomView(room, { isHost: false }).seats[issued.seat].status, "timedOut");
  assert.equal(toRoomView(room, { isHost: false }).seats[issued.seat].statusLabel, "超时");
}

async function testSettleNamesNextLeader() {
  const { room } = await createRoom({ series: "open", autoFillMock: true });
  const match = await startRoomMatch(room);
  let guard = 0;
  while (match.status === "playing" && guard < 4000) {
    stepLocal(match);
    guard += 1;
  }
  assert.equal(match.status, "between_rounds");
  const procedure = tableProcedure(match);
  assert.equal(procedure.phase, "settle");
  assert.equal(procedure.currentTurn, null);
  assert.equal(procedure.mustBeat, null);
  assert.equal(procedure.leaderSeat, match.finishOrder[0]);
  const state = await stateForToken(room, null);
  assert.equal(state.phase, "settle");
  assert.equal(state.leaderSeat, match.finishOrder[0]);
}

async function testOperatorTable() {
  const opened = await openOperatorTable({ seat: 2, series: "open", startLevel: "T" });
  assert.equal(opened.seat, 2);
  assert.equal(opened.wind, "南");
  assert.equal(opened.room.seats.filter((seat) => seat?.drive === "mock").length, 3);
  assert.equal(opened.room.seats[2], null);
  assert.equal(seatsReady(opened.room), false);
  const hidden = JSON.stringify(toRoomView(opened.room, { isHost: false }));
  assert.equal(hidden.includes(opened.seatToken), false);
  const seat = await claimByToken(opened.room, opened.seatToken, "知识");
  assert.equal(seat, 2);
  assert.equal(opened.room.seats[2]?.name, "知识");
  assert.equal(opened.room.seats[2]?.drive, "self");
  assert.equal(seatsReady(opened.room), true);
  const match = await startRoomMatch(opened.room);
  const state = await stateForToken(opened.room, opened.seatToken);
  assert.equal(state.you?.seat, 2);
  assert.equal(state.you?.yourTurn, false);
  assert.equal(state.currentTurn, 0);
  assert.equal(state.legalMoves, null);
  const lead = currentLegal(match).find((move) => move.kind !== "pass");
  assert.ok(lead);
  commitMove(match, lead, { source: "mock", provider: "mock", retries: 0, note: "bot" });
  commitMove(match, currentLegal(match)[0], { source: "mock", provider: "mock", retries: 0, note: "bot" });
  const yours = await stateForToken(opened.room, opened.seatToken);
  assert.equal(yours.you?.yourTurn, true);
  assert.ok((yours.you?.legal.length ?? 0) > 0);
  const moveId = yours.you?.legal[0]?.id;
  assert.ok(moveId);
  commitMove(match, currentLegal(match).find((move) => move.id === moveId)!, {
    source: "llm",
    provider: "guest",
    retries: 0,
    note: "知识",
  });
  assert.equal((await stateForToken(opened.room, opened.seatToken)).you?.yourTurn, false);
}

function testStoreKeys() {
  assert.equal(roomStore() instanceof MemoryRoomStore, true);
  assert.equal(roomKey("Acme", "ab12cd"), "guandan:room:acme:AB12CD");
  assert.equal(tenantRoomsKey("acme"), "guandan:tenant:acme:rooms");
  assert.equal(matchKey("m1"), "guandan:match:m1");
  assert.equal(matchLockKey("m1"), "guandan:lock:match:m1");
}

async function testTenantIsolation() {
  const alpha = await createRoom({ tenantId: "Alpha_Team", autoFillMock: false });
  assert.equal(alpha.room.tenantId, "alpha_team");
  assert.equal(await getRoom(alpha.room.code, "alpha_team"), alpha.room);
  assert.equal(await getRoom(alpha.room.code, "beta"), undefined);
  assert.equal(await getRoom(alpha.room.code), undefined);
  const store = roomStore();
  await store.put({
    tenantId: "alpha",
    code: "SAME01",
    status: "lobby",
    createdAt: 1,
    updatedAt: 1,
  });
  await store.put({
    tenantId: "beta",
    code: "SAME01",
    status: "lobby",
    createdAt: 2,
    updatedAt: 2,
  });
  assert.equal((await store.get("alpha", "same01"))?.tenantId, "alpha");
  assert.equal((await store.get("beta", "SAME01"))?.tenantId, "beta");
  assert.equal(await store.get("default", "SAME01"), null);
}

async function testRoomRevisionAndPrune() {
  const store = roomStore();
  const first = {
    tenantId: "cas",
    code: "CAS001",
    status: "lobby",
    createdAt: 1,
    updatedAt: 1,
    rev: 1,
  };
  assert.equal(await store.compareAndSet(first, 0), true);
  assert.equal(await store.compareAndSet({ ...first, rev: 2, status: "playing", updatedAt: 2 }, 1), true);
  assert.equal(await store.compareAndSet({ ...first, rev: 9, status: "finished", updatedAt: 9 }, 1), false);
  assert.equal((await store.get("cas", "CAS001"))?.status, "playing");

  await store.compareAndSet({ tenantId: "a", code: "AAAAAA", status: "lobby", createdAt: 1, updatedAt: 1, rev: 1 }, 0);
  await store.compareAndSet({ tenantId: "ab", code: "BBBBBB", status: "lobby", createdAt: 1, updatedAt: 1, rev: 1 }, 0);
  const listed = await store.list("a");
  assert.equal(listed.some((row) => row.code === "AAAAAA"), true);
  assert.equal(listed.some((row) => row.code === "BBBBBB"), false);

  const tenant = "prune-live";
  await store.compareAndSet({ tenantId: tenant, code: "LIVE01", status: "playing", createdAt: 1, updatedAt: 1, rev: 1 }, 0);
  for (let index = 0; index < 40; index += 1) {
    await store.compareAndSet(
      {
        tenantId: tenant,
        code: `Z${String(index).padStart(5, "0")}`,
        status: "finished",
        createdAt: 10 + index,
        updatedAt: 10 + index,
        rev: 1,
      },
      0,
    );
  }
  const created = await createRoom({ tenantId: tenant, autoFillMock: false });
  assert.equal((await store.get(tenant, "LIVE01"))?.status, "playing");
  assert.equal((await store.get(tenant, created.room.code))?.code, created.room.code);
  const playingOnly = "prune-play";
  for (let index = 0; index < 40; index += 1) {
    await store.compareAndSet(
      {
        tenantId: playingOnly,
        code: `P${String(index).padStart(5, "0")}`,
        status: "playing",
        createdAt: index + 1,
        updatedAt: index + 1,
        rev: 1,
      },
      0,
    );
  }
  const extra = await createRoom({ tenantId: playingOnly, autoFillMock: false });
  assert.equal((await store.list(playingOnly)).length, 41);
  assert.ok((await store.list(playingOnly)).some((row) => row.code === extra.room.code));
  assert.equal((await store.list(playingOnly)).every((row) => row.status !== "finished"), true);
}

async function testTenantQuota() {
  const previous = process.env.TENANT_MAX_ROOMS;
  process.env.TENANT_MAX_ROOMS = "1";
  try {
    await createRoom({ tenantId: "quota-side", autoFillMock: false });
    await assert.rejects(() => createRoom({ tenantId: "quota-side", autoFillMock: false }), TenantRoomLimitError);
    const other = await createRoom({ tenantId: "quota-other", autoFillMock: false });
    assert.equal(other.room.tenantId, "quota-other");
  } finally {
    if (previous === undefined) delete process.env.TENANT_MAX_ROOMS;
    else process.env.TENANT_MAX_ROOMS = previous;
  }
}

assert.equal(readMuted(), false);
armAudio();
playTableCue("bomb");
playTableCue("plate");

async function main() {
  await testMockRoomFlow();
  await testByoSeatStripsSecret();
  await testGuestInvite();
  await testOperatorTable();
  await testSeatPresence();
  await testSettleNamesNextLeader();
  testCodes();
  testStoreKeys();
  await testTenantIsolation();
  await testRoomRevisionAndPrune();
  await testTenantQuota();
  console.log("room tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
