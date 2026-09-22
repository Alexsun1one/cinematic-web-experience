import type { Match } from "./match";

/** deal and tribute are part of the guest contract. This engine never emits them. */
export type TablePhase = "deal" | "tribute" | "play" | "settle";

export interface MustBeat {
  seat: number;
  kind: string;
  label: string;
}

export interface TableProcedure {
  phase: TablePhase | null;
  leaderSeat: number | null;
  currentTurn: number | null;
  mustBeat: MustBeat | null;
}

/** Ordered table procedure. Same sentences go in the invite paste and the rules drawer. */
export const OPENING_ORDER: { title: string; body: string }[] = [
  {
    title: "座位与牌",
    body: "座位 0 北、1 东、2 南、3 西。0 与 2 是南北一家，1 与 3 是东西一家。两副牌 108 张，每人 27 张，由服务器洗牌发出。级牌阶梯是 2→3→4→5→6→7→8→9→10→J→Q→K→A。本副打的级牌是当前庄家队伍的级牌。红心的这一级是逢人配（两张），可补点数和花色，不能当王。",
  },
  {
    title: "系列第一局",
    body: "第一局庄家固定是南北（dealer = ns），不是抽牌，不是随机座位，也不是南家发牌。第一手领出固定是座位 0（北）。发牌是瞬时的：state.phase 直接是 play，不会停在 deal。此时 leaderSeat 为 0，currentTurn 为 0，mustBeat 为 null。",
  },
  {
    title: "每一局之后",
    body: "下一局由上一局的头游领出。phase 为 settle 时 leaderSeat 就是这个座位，currentTurn 为 null，没人出牌。下一局的庄家改为头游所在的队伍，级牌用该队升级之后的级牌。",
  },
  {
    title: "进贡 / 还贡 / 抗贡",
    body: "本引擎简化：不进贡、不还贡、不抗贡。没有贡牌交换。双下只让胜方升级 +3，不交牌。phase 永远不会是 tribute。不要等待贡牌。",
  },
  {
    title: "一墩之内",
    body: "phase 为 play 时，currentTurn 是现在该行动的座位。mustBeat 为 null：这是领出，只能出 you.legal 里的非过牌牌型。mustBeat 不为 null：必须压过那一手（同型且更大；炸弹可压非炸弹，更大的炸弹压更小的炸弹），或者过牌。别的牌型会被引擎拒绝。仍有牌的其他人都过牌后，本墩结束，当前墩上最大那手的座位领出下一墩。",
  },
  {
    title: "接风",
    body: "赢墩的人已经没牌，且对家（座位 +2，模 4）还有牌：对家接风，由对家领出。日志会写「接风」。对家也出完时，从赢墩者起顺时针，下一家还有牌的人领出。",
  },
  {
    title: "名次与升级",
    body: "出完顺序是头游、二游、三游、末游。头游的对家也走完（双下），或已经有三家走完，本局结束；剩下的人从最后出牌的座位起按顺时针补成末游。只升不降，升的是头游那一队：双下 +3，头游+三游 +2，头游+末游 +1。打到 A、越过 A、或已在 A 再赢，比赛结束。逢人配跟着新庄家的级牌变。",
  },
];

export function openingOrderText(): string {
  return OPENING_ORDER.map((step, index) => `${index + 1}. ${step.title}：${step.body}`).join("\n");
}

export function tableProcedure(match: Match | null): TableProcedure {
  if (!match) {
    return { phase: null, leaderSeat: null, currentTurn: null, mustBeat: null };
  }
  const playing = match.status === "playing";
  const last = match.trick.lastPlay;
  const lastSeat = match.trick.lastSeat;
  return {
    phase: playing ? "play" : "settle",
    leaderSeat: match.nextLeader,
    currentTurn: playing ? match.trick.currentSeat : null,
    mustBeat:
      playing && last && lastSeat !== null
        ? { seat: lastSeat, kind: last.kind, label: last.label }
        : null,
  };
}
