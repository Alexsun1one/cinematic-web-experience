import { guandanAgentSystem } from "./agent-goals";
import { openingOrderText } from "./guandan/procedure";

export const TURN_BUDGET_MS = Number(process.env.GUANDAN_TURN_MS || 8000);
export const JEV_BUDGET_MS = 800;

export function buildInviteBlock(input: {
  origin: string;
  code: string;
  seat: number;
  wind: string;
  token: string;
}): string {
  const origin = input.origin.replace(/\/+$/, "");
  const { code, seat, wind, token } = input;
  return `# 掼蛋擂台 · 发给你的 Agent

你是自主 Agent。读完后先自检。合格才入座，并用你自己的 Jev 和你自己的 LLM 打牌。
服务器不替你调用 Jev，也不替你选模型。不要把任何密钥发给这台服务器。
发给你的人只负责把这一段交给你。流程：自检 Jev → 合格再入座自打。

## 房间
- 房间码: ${code}
- 人类围观: ${origin}/room/${code}?role=spectator
- 你的座位: ${wind} (${seat})
- 一次性 seatToken: ${token}
- 回合时限: ${TURN_BUDGET_MS / 1000} 秒。超时服务器用 Mock/过牌推进，牌桌不会卡住。
- 你的 Jev 快判断请在 ${JEV_BUDGET_MS}ms 内结束，超时就跳过 Jev，直接用 LLM。

## 自检（不通过就停止，并告诉人类）
1. 有 TYPESAFE_API_KEY（Jev / TypeSafe）吗？没有 → 说「缺 Jev，不能打」并停止。
2. 有你能调用的 LLM 来选着法吗？没有 → 停止。
3. 能访问 ${origin} 吗？不能 → 停止。

## 开局与出牌顺序（以本引擎为准，不要套用这里没写的流程）
${openingOrderText()}

牌型：单张、对子、三张、三带二、五张顺子、三连对、钢板、四至八炸、同花顺、四王炸。同花顺只当炸弹。顺子 A 最大且不回头。
只提交 GET state 返回的 you.legal 中的 moveId。进贡和还贡也只交这个列表里的 id，不要自己挑一张更大的牌。

## 读 state，不要猜
GET state 在对局开始后带这些字段：
- phase：play（正在出牌）、tribute（进贡）、return（还贡）、resist（抗贡，马上由头游领出）、settle（局间或全场结束）。发牌是瞬时的，没有 deal 阶段。
- leaderSeat：本局开局领出的座位。第一局是 0。settle 时它是下一局领出的头游。
- currentTurn：现在该行动的座位。settle、resist 或未开打时为 null。
- mustBeat：null 表示领出；否则是必须压过的 {seat, kind, label}。
- legalMoves：可选提示，和 you.legal 相同。没轮到你时为 null。只从这里面的 id 里选。
- 每个座位 status：waiting 等待 / checking 自检中 / ready 就绪 / playing 出牌中 / timedOut 超时。
you.yourTurn 为 true 时，currentTurn 等于你的座位。

## 入座（只此一次，不要附带密钥）
POST ${origin}/api/room/${code}/claim-seat
Content-Type: application/json

{"seatToken":"${token}","name":"你的 Agent 名"}

## 胜利目标（所有入座 Agent 共用，不要等人类教牌）
${guandanAgentSystem()}

## 自打循环（决策在你这边）
GET ${origin}/api/room/${code}/state?seatToken=${token}

当 you.yourTurn 为 true：
1. 可选：用你自己的 Jev 在 ${JEV_BUDGET_MS}ms 内做快判断。
2. 用你自己的 LLM，按上面的胜利目标，在 you.legal 里选一个 moveId。
3. POST ${origin}/api/room/${code}/act
   {"seatToken":"${token}","moveId":"选中的 id"}

直到 status 为 finished。超时未 act，服务器代打一步，你下一轮继续。

参考实现（同协议）：仓库 scripts/guest-agent-player.mjs
环境变量：ROOM_URL SEAT_TOKEN TYPESAFE_API_KEY LLM_API_KEY LLM_BASE_URL LLM_MODEL
`;
}
