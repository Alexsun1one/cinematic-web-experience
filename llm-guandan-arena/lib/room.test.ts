import assert from "node:assert/strict";
import {
  claimSeat,
  createRoom,
  fillMockSeats,
  getRoom,
  makeRoomCode,
  seatsReady,
  startRoomMatch,
  toRoomView,
} from "./room";

function testCodes() {
  const codes = new Set(Array.from({ length: 20 }, () => makeRoomCode()));
  assert.equal(codes.size, 20);
  for (const code of codes) assert.match(code, /^[A-Z2-9]{6}$/);
}

function testMockRoomFlow() {
  const { room, hostSecret } = createRoom({ series: "three", startLevel: "T", autoFillMock: true });
  assert.equal(room.seats.filter(Boolean).length, 4);
  assert.equal(seatsReady(room), true);
  const view = toRoomView(room, { isHost: true });
  assert.equal(view.code.length, 6);
  assert.equal(view.ready, true);
  assert.ok(view.seats.every((seat) => seat.badge === "Mock"));
  assert.ok(!JSON.stringify(view).includes("apiKey"));

  const match = startRoomMatch(room);
  assert.equal(room.status, "playing");
  assert.equal(room.matchId, match.id);
  assert.equal(match.seats.every((seat) => seat.provider === "mock"), true);
  assert.equal(hostSecret.length > 10, true);
}

function testByoSeatStripsSecret() {
  const { room } = createRoom({ series: "open", autoFillMock: false });
  assert.equal(seatsReady(room), false);
  claimSeat(room, 0, {
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
  fillMockSeats(room);
  assert.equal(seatsReady(room), true);
  assert.ok(getRoom(room.code));
}

testCodes();
testMockRoomFlow();
testByoSeatStripsSecret();
console.log("room tests passed");
