import assert from "node:assert/strict";
import { createDeck, deal, shuffle } from "./cards";
import { chooseHeuristic } from "./heuristic";
import { beats, leadAfterTrick, legalMoves, type Move } from "./legal";
import { beginRound, commitMove, createMatch, currentLegal, enterTribute, finishResist, logReason, performSeatAction, seatActions, stepLocal, type Match, type MoveMeta } from "./match";
import { bothBigJokers, returnCards, tributeCard, tributePlan } from "./tribute";
import { mockQuickReason } from "../llm/quick-reason";
import { parseMoveId } from "../llm/parse";
import { buildPrompt } from "../llm/prompt";
import { arrangeColumns } from "./arrange";
import { bannerFromHighlight, cueForLog, fxForMove, playHighlight } from "./highlight";
import { handOrder, presentCards } from "./present";
import { aceStrikeLimit, applyAceAttempt, bumpLevel, outcomeLabel, upgradeDelta } from "./score";
import { matchStats, statsToCsv } from "./stats";
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
  assert.deepEqual(bumpLevel("Q", 2), { level: "A", won: false });
  assert.deepEqual(bumpLevel("A", 1), { level: "A", won: false });
  assert.deepEqual(bumpLevel("A", 2), { level: "A", won: true });
  assert.deepEqual(bumpLevel("A", 3), { level: "A", won: true });
  assert.deepEqual(bumpLevel("2", 1), { level: "3", won: false });
  assert.deepEqual(bumpLevel("K", 1), { level: "A", won: false });
  assert.deepEqual(bumpLevel("J", 3), { level: "A", won: false });
  assert.deepEqual(bumpLevel("Q", 1), { level: "K", won: false });
  assert.equal(outcomeLabel(3), "双下");
  assert.equal(outcomeLabel(2), "头游+三游");
  assert.equal(outcomeLabel(1), "头游+末游");
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
  assert.equal(match.aceFails.ns, 0);
}

function replayHand(match: Match, hands: Match["hands"], lead: number) {
  match.hands = hands;
  match.finishOrder = [];
  match.trick = { currentSeat: lead, lastPlay: null, lastSeat: null, closed: false };
  match.status = "playing";
  match.pile = null;
}

function testAcePassFailAndDrop() {
  assert.deepEqual(applyAceAttempt("K", 3, 0), { level: "A", won: false, fails: 0, dropped: false });
  assert.deepEqual(applyAceAttempt("A", 2, 2), { level: "A", won: true, fails: 0, dropped: false });
  assert.deepEqual(applyAceAttempt("A", 1, 0), { level: "A", won: false, fails: 1, dropped: false });
  assert.deepEqual(applyAceAttempt("A", 1, 2), { level: "2", won: false, fails: 0, dropped: true });
  assert.deepEqual(applyAceAttempt("A", 1, 9, 0), { level: "A", won: false, fails: 10, dropped: false });

  const passed = fresh("A");
  replayHand(passed, [[card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "5")], [card(0, "S", "6"), card(0, "H", "6")]], 0);
  commitMove(passed, findMove(currentLegal(passed), "single", "3"), meta);
  commitMove(passed, findMove(currentLegal(passed), "single", "4"), meta);
  commitMove(passed, findMove(currentLegal(passed), "single", "5"), meta);
  assert.equal(passed.status, "finished");
  assert.equal(passed.winner, "ns");
  assert.equal(passed.rounds[0].delta, 2);
  assert.equal(passed.rounds[0].outcome, "头游+三游");
  assert.equal(passed.aceFails.ns, 0);

  const failed = fresh("A");
  replayHand(failed, [[card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "2"), card(0, "H", "2")], [card(0, "S", "6")]], 0);
  commitMove(failed, findMove(currentLegal(failed), "single", "3"), meta);
  commitMove(failed, findMove(currentLegal(failed), "single", "4"), meta);
  const pass = currentLegal(failed).find((move) => move.kind === "pass");
  assert.ok(pass);
  commitMove(failed, pass, meta);
  commitMove(failed, findMove(currentLegal(failed), "single", "6"), meta);
  assert.equal(failed.status, "between_rounds");
  assert.equal(failed.winner, null);
  assert.equal(failed.levels.ns, "A");
  assert.equal(failed.aceFails.ns, 1);
  assert.equal(failed.rounds[0].delta, 1);
  assert.equal(failed.rounds[0].outcome, "头游+末游");

  const dropped = fresh("A");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    replayHand(dropped, [[card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "2"), card(0, "H", "2")], [card(0, "S", "6")]], 0);
    commitMove(dropped, findMove(currentLegal(dropped), "single", "3"), meta);
    commitMove(dropped, findMove(currentLegal(dropped), "single", "4"), meta);
    commitMove(dropped, currentLegal(dropped).find((move) => move.kind === "pass")!, meta);
    commitMove(dropped, findMove(currentLegal(dropped), "single", "6"), meta);
    assert.equal(dropped.levels.ns, "A");
    assert.equal(dropped.aceFails.ns, attempt + 1);
  }
  replayHand(dropped, [[card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "2"), card(0, "H", "2")], [card(0, "S", "6")]], 0);
  commitMove(dropped, findMove(currentLegal(dropped), "single", "3"), meta);
  commitMove(dropped, findMove(currentLegal(dropped), "single", "4"), meta);
  commitMove(dropped, currentLegal(dropped).find((move) => move.kind === "pass")!, meta);
  commitMove(dropped, findMove(currentLegal(dropped), "single", "6"), meta);
  assert.equal(dropped.levels.ns, "2");
  assert.equal(dropped.aceFails.ns, 0);
  assert.equal(dropped.status, "between_rounds");
  assert.equal(dropped.winner, null);

  const reset = fresh("A");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    replayHand(reset, [[card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "2"), card(0, "H", "2")], [card(0, "S", "6")]], 0);
    commitMove(reset, findMove(currentLegal(reset), "single", "3"), meta);
    commitMove(reset, findMove(currentLegal(reset), "single", "4"), meta);
    commitMove(reset, currentLegal(reset).find((move) => move.kind === "pass")!, meta);
    commitMove(reset, findMove(currentLegal(reset), "single", "6"), meta);
  }
  assert.equal(reset.aceFails.ns, 2);
  replayHand(reset, [[card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "5")], [card(0, "S", "6"), card(0, "H", "6")]], 0);
  commitMove(reset, findMove(currentLegal(reset), "single", "3"), meta);
  commitMove(reset, findMove(currentLegal(reset), "single", "4"), meta);
  commitMove(reset, findMove(currentLegal(reset), "single", "5"), meta);
  assert.equal(reset.status, "finished");
  assert.equal(reset.winner, "ns");
  assert.equal(reset.aceFails.ns, 0);
  assert.equal(reset.levels.ns, "A");

  const gap = fresh("A");
  playNsLast(gap);
  assert.equal(gap.aceFails.ns, 1);
  playEwLast(gap);
  assert.equal(gap.aceFails.ns, 1);
  assert.equal(gap.aceFails.ew, 1);
  assert.equal(gap.levels.ew, "A");
  playNsLast(gap);
  assert.equal(gap.aceFails.ns, 2);
  assert.equal(gap.levels.ns, "A");
  playNsLast(gap);
  assert.equal(gap.levels.ns, "2");
  assert.equal(gap.aceFails.ns, 0);
  assert.equal(gap.levels.ew, "A");
  assert.equal(gap.aceFails.ew, 1);
  const dropLog = gap.log.filter((event) => event.kind === "round").at(-1);
  assert.match(dropLog?.zh ?? "", /退回打2/);
  assert.match(dropLog?.en ?? "", /back to 2/);

  const held = fresh("A");
  playNsLast(held);
  playNsLast(held);
  assert.equal(held.aceFails.ns, 2);
  playEwLast(held);
  assert.equal(held.aceFails.ns, 2);
  assert.equal(held.levels.ns, "A");
  assert.equal(held.aceFails.ew, 1);

  const climbThird = fresh("K");
  replayHand(climbThird, [[card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "5")], [card(0, "S", "6"), card(0, "H", "6")]], 0);
  commitMove(climbThird, findMove(currentLegal(climbThird), "single", "3"), meta);
  commitMove(climbThird, findMove(currentLegal(climbThird), "single", "4"), meta);
  commitMove(climbThird, findMove(currentLegal(climbThird), "single", "5"), meta);
  assert.equal(climbThird.status, "between_rounds");
  assert.equal(climbThird.winner, null);
  assert.equal(climbThird.levels.ns, "A");
  assert.equal(climbThird.aceFails.ns, 0);
  assert.equal(climbThird.rounds[0].matchWon, false);

  const climbLast = fresh("K");
  playNsLast(climbLast);
  assert.equal(climbLast.status, "between_rounds");
  assert.equal(climbLast.levels.ns, "A");
  assert.equal(climbLast.aceFails.ns, 0);

  const previousStrikes = process.env.GUANDAN_ACE_STRIKES;
  delete process.env.GUANDAN_ACE_STRIKES;
  assert.equal(aceStrikeLimit(), 3);
  process.env.GUANDAN_ACE_STRIKES = "0";
  try {
    assert.equal(aceStrikeLimit(), 0);
    const stay = fresh("A");
    playNsLast(stay);
    playNsLast(stay);
    playNsLast(stay);
    playNsLast(stay);
    assert.equal(stay.levels.ns, "A");
    assert.equal(stay.aceFails.ns, 4);
    assert.equal(stay.status, "between_rounds");
    assert.equal(stay.winner, null);
  } finally {
    if (previousStrikes === undefined) delete process.env.GUANDAN_ACE_STRIKES;
    else process.env.GUANDAN_ACE_STRIKES = previousStrikes;
  }
}

function playNsLast(match: Match) {
  replayHand(match, [[card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "2"), card(0, "H", "2")], [card(0, "S", "6")]], 0);
  commitMove(match, findMove(currentLegal(match), "single", "3"), meta);
  commitMove(match, findMove(currentLegal(match), "single", "4"), meta);
  commitMove(match, currentLegal(match).find((move) => move.kind === "pass")!, meta);
  commitMove(match, findMove(currentLegal(match), "single", "6"), meta);
}

function playEwLast(match: Match) {
  replayHand(
    match,
    [[card(0, "S", "5")], [card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "2"), card(0, "H", "2")]],
    1,
  );
  commitMove(match, findMove(currentLegal(match), "single", "3"), meta);
  commitMove(match, findMove(currentLegal(match), "single", "4"), meta);
  commitMove(match, currentLegal(match).find((move) => move.kind === "pass")!, meta);
  commitMove(match, findMove(currentLegal(match), "single", "5"), meta);
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

function testTribute() {
  const doubles = tributePlan([0, 2, 1, 3]);
  assert.equal(doubles.mode, "double");
  assert.deepEqual(doubles.payers, [3, 1]);
  const single = tributePlan([0, 1, 2, 3]);
  assert.equal(single.mode, "single");
  assert.deepEqual(single.payers, [3]);
  const partnerLast = tributePlan([0, 1, 3, 2]);
  assert.deepEqual(partnerLast.payers, [2]);

  const wildHand = [card(0, "H", "5"), card(0, "S", "BJ"), card(0, "S", "A")];
  assert.equal(tributeCard(wildHand, "5").rank, "BJ");
  const levelHand = [card(0, "S", "5"), card(0, "S", "A")];
  assert.equal(tributeCard(levelHand, "5").rank, "5");
  const back = returnCards(
    [card(0, "S", "K"), card(0, "S", "9"), card(0, "S", "BJ"), card(0, "H", "5"), card(0, "S", "5")],
    "5",
  );
  assert.deepEqual(back.map((item) => item.rank), ["9"]);
  const fallback = returnCards([card(0, "S", "K"), card(0, "S", "A"), card(0, "S", "BJ")], "2");
  assert.equal(fallback[0].rank, "K");

  const resistHands: Card[][] = [[], [], [], []];
  resistHands[3] = [card(0, "S", "BJ"), card(1, "S", "BJ")];
  resistHands[1] = [card(0, "S", "4")];
  assert.equal(bothBigJokers(resistHands, [3, 1]), true);
  assert.equal(bothBigJokers(resistHands, [1]), false);

  const resisted = fresh("2");
  resisted.level = "2";
  resisted.hands = [
    [card(0, "S", "3")],
    [card(0, "S", "4")],
    [card(0, "S", "6")],
    [card(0, "S", "BJ"), card(1, "S", "BJ"), card(0, "D", "9")],
  ];
  enterTribute(resisted, [0, 2, 1, 3]);
  assert.equal(resisted.status, "resist");
  assert.equal(resisted.tribute?.mode, "resist");
  const before = resisted.hands.map((hand) => hand.map((item) => item.id).join(","));
  finishResist(resisted);
  assert.equal(resisted.status, "playing");
  assert.equal(resisted.trick.currentSeat, 0);
  assert.deepEqual(resisted.hands.map((hand) => hand.map((item) => item.id).join(",")), before);

  const exchange = fresh("2");
  exchange.level = "2";
  exchange.hands = [
    [card(0, "S", "4"), card(0, "S", "3")],
    [card(0, "H", "K"), card(0, "S", "8")],
    [card(0, "S", "6"), card(0, "D", "5")],
    [card(0, "S", "BJ"), card(0, "D", "9")],
  ];
  enterTribute(exchange, [0, 2, 1, 3]);
  assert.equal(exchange.status, "tribute");
  assert.equal(exchange.trick.currentSeat, 3);
  const first = seatActions(exchange)[0];
  assert.equal(first.id, "t:0SBJ");
  performSeatAction(exchange, 3, first.id);
  assert.equal(exchange.trick.currentSeat, 1);
  performSeatAction(exchange, 1, seatActions(exchange)[0].id);
  assert.equal(exchange.status, "return");
  assert.equal(exchange.hands[0].some((item) => item.id === "0SBJ"), true);
  assert.equal(exchange.hands[2].some((item) => item.id === "0HK"), true);
  assert.equal(exchange.trick.currentSeat, 0);
  const returned = seatActions(exchange);
  assert.deepEqual(returned.map((item) => item.label), ["还贡 3", "还贡 4"]);
  performSeatAction(exchange, 0, returned[0].id);
  assert.equal(exchange.hands[3].some((item) => item.id === "0S3"), true);
  assert.equal(exchange.status, "return");
  performSeatAction(exchange, 2, seatActions(exchange)[0].id);
  assert.equal(exchange.status, "playing");
  assert.equal(exchange.trick.currentSeat, 0);
  assert.equal(exchange.hands[1].some((item) => item.rank === "5" || item.rank === "6"), true);

  const singleHand = fresh("2");
  singleHand.level = "2";
  singleHand.hands = [
    [card(0, "S", "7")],
    [card(0, "S", "8")],
    [card(0, "S", "9")],
    [card(0, "S", "A"), card(0, "H", "2")],
  ];
  enterTribute(singleHand, [0, 1, 2, 3]);
  assert.equal(singleHand.tribute?.mode, "single");
  performSeatAction(singleHand, 3, seatActions(singleHand)[0].id);
  assert.equal(singleHand.status, "return");
  assert.equal(singleHand.hands[0].some((item) => item.rank === "A"), true);
  performSeatAction(singleHand, 0, seatActions(singleHand)[0].id);
  assert.equal(singleHand.status, "playing");
  assert.equal(singleHand.hands[3].some((item) => item.rank === "7"), true);
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

function testArrangeSeriesAndStats() {
  assert.equal(outcomeLabel(3), "双下");
  assert.equal(outcomeLabel(2), "头游+三游");
  assert.equal(outcomeLabel(1), "头游+末游");

  const bomb = arrangeColumns(
    [card(0, "S", "9"), card(1, "S", "9"), card(0, "D", "9"), card(0, "C", "9"), card(0, "S", "3")],
    "2",
  );
  assert.equal(bomb[0].role, "bomb");
  assert.equal(bomb[bomb.length - 1].role, "single");
  assert.ok(bomb.findIndex((column) => column.role === "bomb") < bomb.findIndex((column) => column.role === "single"));

  const wild = arrangeColumns([card(0, "H", "5"), card(0, "S", "K")], "5");
  assert.equal(wild[0].role, "wild");
  assert.equal(wild[0].key, "wild-5");
  assert.ok(wild[0].lift > wild[1].lift);

  const flush = arrangeColumns(
    [card(0, "S", "T"), card(0, "S", "J"), card(0, "S", "Q"), card(0, "S", "K"), card(0, "S", "A"), card(0, "D", "4")],
    "2",
  );
  const flushCols = flush.filter((column) => column.role === "flush");
  assert.deepEqual(
    flushCols.map((column) => column.cards[0].rank),
    ["A", "K", "Q", "J", "T"],
  );
  assert.ok(flush.findIndex((column) => column.role === "flush") < flush.findIndex((column) => column.role === "single"));

  const match = fresh("2");
  match.handLimit = 1;
  match.hands = [[card(0, "S", "3")], [card(0, "S", "4")], [card(0, "S", "5")], [card(0, "S", "6")]];
  match.finishOrder = [];
  match.trick = { currentSeat: 0, lastPlay: null, lastSeat: null, closed: false };
  commitMove(match, findMove(currentLegal(match), "single", "3"), meta);
  const firstFinish = match.log.find((event) => event.kind === "finish");
  assert.deepEqual(firstFinish?.counts, [0, 1, 1, 1]);
  commitMove(match, findMove(currentLegal(match), "single", "4"), meta);
  commitMove(match, findMove(currentLegal(match), "single", "5"), meta);
  assert.equal(match.status, "finished");
  assert.equal(match.rounds[0].outcome, "头游+三游");
  assert.equal(match.rounds[0].delta, 2);
  assert.equal(match.rounds[0].nsBefore, "2");
  assert.equal(match.rounds[0].nsAfter, "4");
  assert.equal(match.rounds[0].ewAfter, "2");
  assert.equal(match.winner, "ns");
  assert.match(match.log.at(-1)?.zh ?? "", /打满 1 局/);
  const series = matchStats(match);
  assert.equal(series.seats[2].partnerCardsLeft, 1);
  assert.equal(series.teams[0].levelsClimbed, 2);
  assert.equal(series.hands[0].outcome, "头游+三游");

  const bombs = fresh("2");
  bombs.hands = [
    [card(0, "S", "9"), card(1, "S", "9"), card(0, "H", "9"), card(0, "D", "9"), card(0, "S", "3")],
    [card(0, "S", "4")],
    [card(0, "S", "5")],
    [card(0, "S", "6")],
  ];
  bombs.finishOrder = [];
  bombs.trick = { currentSeat: 0, lastPlay: null, lastSeat: null, closed: false };
  const bombMove = currentLegal(bombs).find((move) => move.kind === "bomb4");
  assert.ok(bombMove);
  commitMove(bombs, bombMove, meta);
  assert.equal(bombs.log.at(-1)?.highlight, "首炸");
  assert.equal(bombs.log.at(-1)?.moveKind, "bomb4");
  commitMove(bombs, currentLegal(bombs)[0], meta);
  commitMove(bombs, currentLegal(bombs)[0], meta);
  commitMove(bombs, currentLegal(bombs)[0], meta);
  const stats = matchStats(bombs);
  assert.equal(stats.seats[0].bombs, 1);
  assert.equal(stats.seats[0].flushes, 0);
  assert.equal(stats.seats[1].passes, 1);
  assert.equal(stats.seats[2].passes, 1);
  const csv = statsToCsv(stats);
  assert.match(csv, /^type,seat,name/);
  assert.match(csv, /双下|team,ns/);
}

testArrangeSeriesAndStats();
function testHighlights() {
  assert.equal(fxForMove("single"), "whoosh");
  assert.equal(fxForMove("pair"), "whoosh");
  assert.equal(fxForMove("fullhouse"), "burst");
  assert.equal(fxForMove("straight"), "streak");
  assert.equal(fxForMove("tube"), "streak");
  assert.equal(fxForMove("plate"), "plate");
  assert.equal(fxForMove("bomb6"), "bomb");
  assert.equal(fxForMove("straightFlush"), "flush");
  assert.equal(fxForMove("jokerBomb"), "royal");
  assert.equal(bannerFromHighlight("钢板 · 首炸"), "钢板");
  assert.equal(bannerFromHighlight("顺子"), null);
  assert.equal(bannerFromHighlight("头游"), "头游");
  assert.equal(bannerFromHighlight("天王炸 · 首炸"), "天王炸");
  assert.equal(
    playHighlight({ kind: "plate", bombTier: 0, seat: 0, level: "2", priorBomb: false, opponentFinished: false }),
    "钢板",
  );
  assert.equal(
    playHighlight({ kind: "jokerBomb", bombTier: 7, seat: 1, level: "2", priorBomb: false, opponentFinished: false }),
    "天王炸 · 首炸",
  );
  assert.equal(
    playHighlight({ kind: "bomb4", bombTier: 1, seat: 0, level: "A", priorBomb: true, opponentFinished: true }),
    "翻盘炸 · 打A",
  );
  assert.equal(
    playHighlight({ kind: "straightFlush", bombTier: 3, seat: 2, level: "2", priorBomb: false, opponentFinished: false }),
    "同花顺 · 首炸",
  );
  assert.equal(cueForLog({ moveKind: "plate", highlight: "钢板" }), "plate");
  assert.equal(cueForLog({ moveKind: "bomb4" }), "bomb");
  assert.equal(cueForLog({ moveKind: "straightFlush", highlight: "同花顺 · 首炸" }), "flush");
  assert.equal(cueForLog({ kind: "pass", moveKind: "pass" }), "pass");
  assert.equal(cueForLog({ highlight: "头游" }), "first");
  assert.equal(cueForLog({ highlight: "升级" }), "level");
  assert.equal(cueForLog({ moveKind: "single" }), null);
}

function bareMove(over: Partial<Move> & Pick<Move, "id" | "kind">): Move {
  return {
    cards: [],
    label: over.kind,
    rankKey: 1,
    bombTier: 0,
    finishes: false,
    ...over,
  };
}

function testPriorities() {
  const pass = bareMove({ id: "pass", kind: "pass", rankKey: 0 });
  const single = bareMove({ id: "s", kind: "single", rankKey: 3, cards: [card(0, "S", "4")] });
  const bomb = bareMove({
    id: "b",
    kind: "bomb4",
    rankKey: 8,
    bombTier: 1,
    cards: [card(0, "S", "9"), card(1, "S", "9"), card(0, "H", "9"), card(0, "D", "9")],
  });
  assert.equal(chooseHeuristic([bomb, pass, single], 0, 2).id, "pass");
  assert.equal(chooseHeuristic([bomb, single], 0, null).kind, "single");
  assert.equal(chooseHeuristic([bomb, pass], 0, 1).id, "pass");
  assert.equal(chooseHeuristic([bomb, pass], 0, 1, { counts: [20, 3, 20, 20] }).id, "b");
  const finish = bareMove({ id: "f", kind: "single", rankKey: 9, finishes: true, cards: [card(0, "S", "A")] });
  const keep = bareMove({ id: "k", kind: "pair", rankKey: 2, cards: [card(0, "S", "3"), card(1, "S", "3")] });
  assert.equal(chooseHeuristic([finish, keep, pass], 0, null, { counts: [12, 10, 3, 10] }).id, "k");
  const wild = bareMove({ id: "w", kind: "single", rankKey: 1, cards: [card(0, "H", "5")] });
  const plain = bareMove({ id: "p", kind: "single", rankKey: 6, cards: [card(0, "S", "9")] });
  assert.equal(chooseHeuristic([wild, plain], 0, null, { level: "5" }).id, "p");
}

function testAuditEdges() {
  const illegal = fresh("2");
  const legal = currentLegal(illegal);
  assert.deepEqual(seatActions(illegal).map((item) => item.id), legal.map((item) => item.id));
  assert.throws(() => commitMove(illegal, { ...legal[0], id: "not-legal" }, meta));
  assert.throws(() => commitMove(illegal, { ...legal[0], id: "pass", kind: "pass" }, meta));

  const split: Card[][] = [[], [], [], []];
  split[3] = [card(0, "S", "BJ"), card(0, "S", "9")];
  split[1] = [card(1, "S", "BJ"), card(0, "S", "8")];
  assert.equal(bothBigJokers(split, [3, 1]), true);
  assert.equal(bothBigJokers(split, [3]), false);
  const splitResist = fresh("2");
  splitResist.hands = [
    [card(0, "S", "3")],
    [card(1, "S", "BJ"), card(0, "S", "8")],
    [card(0, "S", "4")],
    [card(0, "S", "BJ"), card(0, "S", "9")],
  ];
  enterTribute(splitResist, [0, 2, 1, 3]);
  assert.equal(splitResist.status, "resist");
  finishResist(splitResist);
  assert.equal(splitResist.trick.currentSeat, 0);
  assert.equal(splitResist.hands[3].some((item) => item.id === "0SBJ"), true);

  const resisted = fresh("5");
  resisted.level = "5";
  resisted.hands = [
    [card(0, "S", "3")],
    [card(0, "S", "4")],
    [card(0, "S", "BJ"), card(1, "S", "BJ")],
    [card(0, "S", "6")],
  ];
  enterTribute(resisted, [0, 1, 3, 2]);
  assert.equal(resisted.status, "resist");
  finishResist(resisted);
  assert.equal(resisted.status, "playing");
  assert.equal(resisted.trick.currentSeat, 0);
  assert.equal(resisted.hands.reduce((sum, hand) => sum + hand.length, 0), 5);

  const emptyBack = fresh("5");
  emptyBack.level = "5";
  emptyBack.hands = [
    [card(0, "H", "5"), card(0, "S", "BJ")],
    [card(0, "S", "4")],
    [card(0, "S", "6")],
    [card(0, "S", "A")],
  ];
  enterTribute(emptyBack, [0, 1, 2, 3]);
  assert.equal(emptyBack.tribute?.mode, "single");
  performSeatAction(emptyBack, 3, seatActions(emptyBack)[0].id);
  assert.equal(emptyBack.status, "return");
  const back = seatActions(emptyBack);
  assert.ok(back.length >= 1);
  assert.ok(back.every((item) => item.id.startsWith("r:")));
  performSeatAction(emptyBack, 0, back[0].id);
  assert.equal(emptyBack.status, "playing");
  assert.equal(emptyBack.trick.currentSeat, 0);
  assert.throws(() => performSeatAction(emptyBack, 0, "r:missing"));

  const partnerLast = fresh("2");
  partnerLast.level = "2";
  partnerLast.hands = [
    [card(0, "S", "7")],
    [card(0, "S", "8")],
    [card(0, "S", "A"), card(0, "H", "2")],
    [card(0, "S", "9")],
  ];
  enterTribute(partnerLast, [0, 1, 3, 2]);
  assert.equal(partnerLast.tribute?.mode, "single");
  assert.equal(partnerLast.trick.currentSeat, 2);
  performSeatAction(partnerLast, 2, seatActions(partnerLast)[0].id);
  assert.equal(partnerLast.hands[0].some((item) => item.rank === "A"), true);
  performSeatAction(partnerLast, 0, seatActions(partnerLast)[0].id);
  assert.equal(partnerLast.status, "playing");
  assert.equal(partnerLast.trick.currentSeat, 0);
  assert.equal(partnerLast.hands.reduce((sum, hand) => sum + hand.length, 0), 5);

  const ace = fresh("K");
  ace.hands = [
    [card(0, "S", "3")],
    [card(0, "S", "4"), card(0, "H", "8")],
    [card(0, "S", "5")],
    [card(0, "S", "6"), card(0, "H", "9")],
  ];
  ace.finishOrder = [];
  ace.trick = { currentSeat: 0, lastPlay: null, lastSeat: null, closed: false };
  ace.status = "playing";
  commitMove(ace, findMove(currentLegal(ace), "single", "3"), meta);
  commitMove(ace, findMove(currentLegal(ace), "single", "4"), meta);
  commitMove(ace, findMove(currentLegal(ace), "single", "5"), meta);
  assert.equal(ace.status, "between_rounds");
  assert.equal(ace.winner, null);
  assert.equal(ace.rounds[0].matchWon, false);
  assert.equal(ace.rounds[0].delta, 3);
  assert.equal(ace.rounds[0].from, "K");
  assert.equal(ace.rounds[0].to, "A");
  assert.equal(ace.levels.ns, "A");
  assert.equal(ace.aceFails.ns, 0);
}

testAuditEdges();
testPriorities();
testHighlights();
testTribute();
testQuickReason();
testPresentation();
testDeck();
testRanking();
testBombsAndFlush();
testWildStraight();
testScoring();
testScriptedRound();
testAcePassFailAndDrop();
testLeadPassAndJiefeng();
testMovesStayInHand();
testMockMatchEnds();
testPromptHidesOtherHands();
testRosterNames();
console.log("guandan engine tests passed");
