import assert from "node:assert/strict";
import { createDeck, deal, shuffle } from "./cards";
import { chooseHeuristic } from "./heuristic";
import { beats, leadAfterTrick, legalMoves, type Move } from "./legal";
import { beginRound, commitMove, createMatch, currentLegal, logReason, stepLocal, type MoveMeta } from "./match";
import { mockQuickReason } from "../llm/quick-reason";
import { parseMoveId } from "../llm/parse";
import { buildPrompt } from "../llm/prompt";
import { handOrder, presentCards } from "./present";
import { bumpLevel, upgradeDelta } from "./score";
import { seatConfigs } from "../roster";
import { FACE, type Card, type FaceRank, type Rank, type Suit } from "./types";

const meta: MoveMeta = { source: "mock", provider: "mock", retries: 0, note: "test" };

function card(deck: 0 | 1, suit: Suit, rank: Rank): Card {
  const id = suit === "J" ? `${deck}J${rank}` : `${deck}${suit}${rank}`;
  return { id, deck, suit, rank };
}

function fresh(level: FaceRank = "2") {
  return createMatch({
    id: `t-${level}-${Math.random().toString(16).slice(2)}`,
    seats: seatConfigs(false),
    jevAssist: false,
    startLevel: level,
    seed: 7,
  });
}

function findMove(moves: Move[], kind: Move["kind"], labelPart: string) {
  const move = moves.find((item) => item.kind === kind && item.label.includes(labelPart));
  assert.ok(move, `missing ${kind} ${labelPart}: ${moves.map((item) => item.label).join(" | ")}`);
  return move;
}

function testDeck() {
  const deck = createDeck();
  assert.equal(deck.length, 108);
  assert.equal(new Set(deck.map((item) => item.id)).size, 108);
  const hands = deal(shuffle(deck, 1));
  assert.deepEqual(hands.map((hand) => hand.length), [27, 27, 27, 27]);
}

function testRanking() {
  const singles = legalMoves(
    [card(0, "S", "A"), card(0, "S", "K"), card(0, "H", "5"), card(0, "S", "SJ"), card(0, "S", "BJ")],
    "5",
    null,
  );
  const ace = findMove(singles, "single", "A");
  const king = findMove(singles, "single", "K");
  const level = findMove(singles, "single", "逢人配");
  const small = findMove(singles, "single", "小王");
  const big = findMove(singles, "single", "大王");
  assert.equal(beats(level, ace), true);
  assert.equal(beats(ace, king), true);
  assert.equal(beats(small, level), true);
  assert.equal(beats(big, small), true);
  assert.equal(beats(ace, ace), false);
  assert.equal(legalMoves([card(0, "S", "3")], "2", ace).some((move) => move.kind === "pass"), true);
  assert.equal(legalMoves([card(0, "S", "3")], "2", null).some((move) => move.kind === "pass"), false);
}

function testBombsAndFlush() {
  const hand = [
    card(0, "S", "T"),
    card(0, "S", "J"),
    card(0, "S", "Q"),
    card(0, "S", "K"),
    card(0, "S", "A"),
    card(0, "S", "2"),
    card(1, "S", "2"),
    card(0, "H", "2"),
    card(1, "H", "2"),
    card(0, "D", "2"),
  ];
  const moves = legalMoves(hand, "3", null);
  const flush = findMove(moves, "straightFlush", "10-J-Q-K-A");
  const bomb5 = findMove(moves, "bomb5", "2");
  const bomb4 = findMove(moves, "bomb4", "2");
  assert.equal(flush.bombTier, 3);
  assert.equal(beats(flush, bomb5), true);
  assert.equal(beats(bomb5, bomb4), true);
  assert.equal(beats(bomb4, flush), false);
  const six = legalMoves(
    ["S", "H", "D", "C"].flatMap((suit) => [card(0, suit as Suit, "9"), card(1, suit as Suit, "9")]).slice(0, 6),
    "2",
    null,
  );
  const bomb6 = findMove(six, "bomb6", "9");
  assert.equal(beats(bomb6, flush), true);
  const jokers = legalMoves(
    [card(0, "J", "SJ"), card(1, "J", "SJ"), card(0, "J", "BJ"), card(1, "J", "BJ")],
    "2",
    null,
  );
  const royal = findMove(jokers, "jokerBomb", "天王炸");
  assert.equal(beats(royal, bomb6), true);
}

function testWildStraight() {
  const hand = [
    card(0, "S", "3"),
    card(0, "H", "3"),
    card(0, "S", "4"),
    card(0, "S", "5"),
    card(0, "S", "6"),
    card(0, "H", "7"),
  ];
  const moves = legalMoves(hand, "7", null);
  assert.ok(moves.some((move) => move.kind === "straight" && move.label.includes("3-4-5-6-7")));
  assert.ok(moves.some((move) => move.kind === "straightFlush" && move.label.includes("3-4-5-6-7")));
  const pair = legalMoves([card(0, "S", "9"), card(0, "H", "7")], "7", null);
  const beat = legalMoves([card(0, "S", "8"), card(1, "S", "8")], "7", findMove(pair, "pair", "9"));
  assert.equal(beat.some((move) => move.kind === "pair"), false);
  assert.ok(beat.some((move) => move.kind === "pass"));
}

function testScoring() {
  assert.equal(upgradeDelta([1, 2]), 3);
  assert.equal(upgradeDelta([1, 3]), 2);
  assert.equal(upgradeDelta([1, 4]), 1);
  assert.deepEqual(bumpLevel("T", 3), { level: "K", won: false });
  assert.deepEqual(bumpLevel("Q", 2), { level: "A", won: true });
  assert.deepEqual(bumpLevel("A", 1), { level: "A", won: true });
  assert.deepEqual(bumpLevel("2", 1), { level: "3", won: false });
}

function testScriptedRound() {
  const match = fresh("A");
  match.hands = [
    [card(0, "S", "3")],
    [card(0, "S", "4"), card(0, "H", "4")],
    [card(0, "S", "5")],
    [card(0, "S", "6")],
  ];
  match.finishOrder = [];
  match.trick = { currentSeat: 0, lastPlay: null, lastSeat: null, closed: false };
  match.status = "playing";
  commitMove(match, findMove(currentLegal(match), "single", "3"), meta);
  assert.deepEqual(match.finishOrder, [0]);
  commitMove(match, findMove(currentLegal(match), "single", "4"), meta);
  commitMove(match, findMove(currentLegal(match), "single", "5"), meta);
  assert.equal(match.status, "finished");
  assert.equal(match.winner, "ns");
  assert.equal(match.rounds[0].delta, 3);
  assert.equal(match.levels.ns, "A");
}

function testLeadPassAndJiefeng() {
  const match = fresh("2");
  match.hands = [
    [card(0, "S", "A"), card(0, "S", "3")],
    [card(0, "S", "4")],
    [card(0, "S", "5")],
    [card(0, "S", "6")],
  ];
  match.finishOrder = [];
  match.trick = { currentSeat: 0, lastPlay: null, lastSeat: null, closed: false };
  commitMove(match, findMove(currentLegal(match), "single", "A"), meta);
  commitMove(match, currentLegal(match)[0], meta);
  commitMove(match, currentLegal(match)[0], meta);
  commitMove(match, currentLegal(match)[0], meta);
  assert.equal(match.trick.closed, true);
  assert.equal(match.trick.currentSeat, 0);
  assert.equal(match.hands[0].length, 1);

  const wind = fresh("2");
  wind.hands = [
    [card(0, "S", "A")],
    [card(0, "S", "4")],
    [card(0, "S", "K")],
    [card(0, "S", "5")],
  ];
  wind.finishOrder = [];
  wind.trick = { currentSeat: 0, lastPlay: null, lastSeat: null, closed: false };
  commitMove(wind, findMove(currentLegal(wind), "single", "A"), meta);
  assert.equal(wind.trick.currentSeat, 1);
  commitMove(wind, currentLegal(wind)[0], meta);
  commitMove(wind, currentLegal(wind)[0], meta);
  commitMove(wind, currentLegal(wind)[0], meta);
  assert.equal(wind.trick.currentSeat, 2);
  assert.ok(wind.log.some((event) => event.zh.includes("接风")));
  assert.deepEqual(leadAfterTrick([0, 2, 5, 0], 0), 2);
  assert.deepEqual(leadAfterTrick([0, 2, 0, 4], 0), 1);
}

function testMovesStayInHand() {
  for (let seed = 1; seed <= 12; seed += 1) {
    const hands = deal(shuffle(createDeck(), seed));
    for (const level of ["2", "T", "A"] as FaceRank[]) {
      for (const hand of hands) {
        const moves = legalMoves(hand, level, null);
        assert.ok(moves.length > 0);
        assert.equal(moves.some((move) => move.kind === "pass"), false);
        for (const move of moves) {
          const ids = move.cards.map((item) => item.id);
          assert.equal(new Set(ids).size, ids.length);
          for (const id of ids) assert.ok(hand.some((item) => item.id === id));
        }
        const lead = chooseHeuristic(moves, 0, null);
        assert.notEqual(lead.kind, "pass");
      }
    }
  }
}

function testMockMatchEnds() {
  for (const seed of [3, 11, 19, 42]) {
    const match = createMatch({
      id: `sim-${seed}`,
      seats: seatConfigs(false),
      jevAssist: false,
      startLevel: "A",
      seed,
    });
    let guard = 0;
    while (match.status !== "finished" && guard < 2500) {
      stepLocal(match);
      guard += 1;
    }
    assert.equal(match.status, "finished", `seed ${seed} stuck at ${guard}`);
    assert.ok(match.winner === "ns" || match.winner === "ew");
    assert.equal(match.finishOrder.length, 4);
    assert.equal(new Set(match.finishOrder).size, 4);
  }
  const long = fresh("2");
  let guard = 0;
  while (long.status === "playing" && guard < 2500) {
    stepLocal(long);
    guard += 1;
  }
  assert.notEqual(long.status, "playing");
  assert.equal(long.rounds.length, 1);
  beginRound(long);
  assert.equal(long.round, 2);
  assert.equal(long.hands.reduce((sum, hand) => sum + hand.length, 0), 108);
}

function testPromptHidesOtherHands() {
  const match = fresh("2");
  const foreign = match.hands[1][0].id;
  const own = match.hands[0][0].id;
  const prompt = buildPrompt(
    {
      seat: 0,
      seatName: "北 DeepSeek",
      level: match.level,
      round: match.round,
      levels: match.levels,
      hand: match.hands[0],
      counts: match.hands.map((hand) => hand.length),
      finishOrder: [],
      lastLabel: null,
      lastSeat: null,
      recent: [],
    },
    currentLegal(match),
    null,
  );
  assert.equal(prompt.includes(foreign), false);
  assert.equal(prompt.includes(own), true);
  assert.match(prompt, /m0/);
  assert.deepEqual(parseMoveId("```json\n{\"moveId\":\"m3\",\"note\":\"低对\"}\n```"), {
    moveId: "m3",
    note: "低对",
  });
  assert.equal(parseMoveId("nope").moveId, undefined);
}

function testRosterNames() {
  const seats = seatConfigs(false);
  assert.deepEqual(
    seats.map((seat) => seat.name),
    ["DeepSeek V4.1 Flash", "Gemini 3.8 Flash", "MiMo 2.6 Flash", "GLM 5.3 Flash"],
  );
  assert.deepEqual(
    seats.map((seat) => seat.provider),
    ["mock", "mock", "mock", "mock"],
  );
  assert.ok(FACE.length === 13);
}

function testPresentation() {
  const straight = presentCards(
    [card(0, "H", "7"), card(0, "S", "6"), card(0, "S", "3"), card(0, "S", "5"), card(0, "S", "4")],
    "北 DeepSeek · 顺子 3-4-5-6-7（配）",
    "7",
  );
  assert.deepEqual(
    straight.map((item) => item.id),
    ["0S3", "0S4", "0S5", "0S6", "0H7"],
  );
  const full = presentCards(
    [card(0, "S", "9"), card(0, "H", "J"), card(0, "S", "J"), card(0, "D", "J"), card(0, "H", "7")],
    "三带二 J带9（配）",
    "7",
  );
  assert.deepEqual(
    full.map((item) => item.rank),
    ["J", "J", "J", "9", "7"],
  );
  const ordered = handOrder(
    [card(0, "S", "3"), card(0, "J", "BJ"), card(0, "H", "K")],
    "K",
  );
  assert.equal(ordered[0].rank, "BJ");
  assert.equal(ordered[1].suit, "H");
}

function testQuickReason() {
  const lead = fresh("K");
  const opening = mockQuickReason(lead, currentLegal(lead));
  assert.equal(opening.source, "mock");
  assert.equal(opening.timedOut, false);
  assert.ok(opening.questions.length >= 1 && opening.questions.length <= 3);
  assert.ok(opening.lines.length >= 1);
  assert.ok(opening.questions.some((item) => item.prompt.length > 0 && item.answer.length > 0));

  const follow = fresh("2");
  follow.hands = [
    [card(0, "S", "A"), card(0, "S", "3")],
    [card(0, "S", "4")],
    [card(0, "S", "5")],
    [card(0, "S", "6")],
  ];
  follow.finishOrder = [];
  follow.trick = { currentSeat: 0, lastPlay: null, lastSeat: null, closed: false };
  commitMove(follow, findMove(currentLegal(follow), "single", "A"), meta);
  const beat = mockQuickReason(follow, currentLegal(follow));
  assert.equal(beat.questions.find((item) => item.id === "should_pass")?.answer, "只能过");
  logReason(follow, beat);
  commitMove(follow, currentLegal(follow)[0], meta);
  logReason(follow, mockQuickReason(follow, currentLegal(follow)));
  commitMove(follow, currentLegal(follow)[0], meta);
  logReason(follow, mockQuickReason(follow, currentLegal(follow)));
  commitMove(follow, currentLegal(follow)[0], meta);
  assert.equal(follow.trick.closed, true);
  assert.ok(follow.log.some((event) => event.kind === "reason" && event.reason?.lines.length));
  const replay = follow.log.filter((event) => event.kind === "reason");
  assert.ok(replay.every((event) => event.seat !== null && typeof event.reason?.latencyMs === "number"));
}

testQuickReason();
testPresentation();
testDeck();
testRanking();
testBombsAndFlush();
testWildStraight();
testScoring();
testScriptedRound();
testLeadPassAndJiefeng();
testMovesStayInHand();
testMockMatchEnds();
testPromptHidesOtherHands();
testRosterNames();
console.log("guandan engine tests passed");
