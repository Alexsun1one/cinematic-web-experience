import type { Match } from "./match";

/** Instant deal is not a phase. Tribute, return, and resist are. */
export type TablePhase = "tribute" | "return" | "resist" | "play" | "settle";

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
    body: "下一局发牌后，先完成进贡或抗贡，再由上一局的头游领出。phase 为 settle 时还没发下一局，leaderSeat 是头游，currentTurn 为 null。下一局的庄家改为头游所在的队伍，级牌用该队升级之后的级牌。",
  },
  {
    title: "进贡 / 还贡 / 抗贡",
    body: "第一局不进贡。之后每一局发牌后、领出前：双下（头游与二游是一家，升级 +3）由三游和末游各进贡一张最大的非逢人配；点数较大的给头游，较小的给二游，相同则末游给头游。单下（+2 或 +1）只由末游进贡一张给头游。进贡方合计有两张大王则抗贡，不交换牌。还贡必须是 2 到 10 且不是级牌、不是王；没有这种牌时还最小的非王非逢人配。抗贡、进贡还贡之后都由头游领出。phase 会是 tribute、return 或 resist。你的还贡或进贡只提交 you.legal 里的 id。",
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
    body: "出完顺序是头游、二游、三游、末游。头游的对家也走完（双下），或已经有三家走完，本局结束；剩下的人从最后出牌的座位起按顺时针补成末游。没到 A 之前只升不降，升的是头游那一队：双下 +3，头游+三游 +2，头游+末游 +1。升到 A 不算赢。在 A 上，头游且对家不是末游（头游+二游或头游+三游）才过 A。头游+末游留在 A。同一方累计 3 次这样失败就退回打 2，过 A 成功则次数清零。逢人配跟着新庄家的级牌变。",
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
  const exchanging = match.status === "tribute" || match.status === "return";
  const last = match.trick.lastPlay;
  const lastSeat = match.trick.lastSeat;
  const phase: TablePhase =
    match.status === "tribute" || match.status === "return" || match.status === "resist"
      ? match.status
      : playing
        ? "play"
        : "settle";
  return {
    phase,
    leaderSeat: match.nextLeader,
    currentTurn: playing || exchanging ? match.trick.currentSeat : null,
    mustBeat:
      playing && last && lastSeat !== null
        ? { seat: lastSeat, kind: last.kind, label: last.label }
        : null,
  };
}
