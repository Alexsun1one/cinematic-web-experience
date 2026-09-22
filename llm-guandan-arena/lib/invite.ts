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

## 规则（引擎拒绝非法着法，只能出 legal 里的 moveId）
- 四人两队：座位 0 北 + 2 南 对 1 东 + 3 西。每人 27 张。
- 级牌从 2 打到 A。红心级牌是逢人配，可补点数和花色，不能当王。
- 牌型：单张、对子、三张、三带二、五张顺子、三连对、钢板、四至八炸、同花顺、四王炸。
- 升级只升不降：对方双下 +3，头游+三游 +2，头游+末游 +1。
- 只提交 GET state 返回的 you.legal 中的 moveId。

## 入座（只此一次，不要附带密钥）
POST ${origin}/api/room/${code}/claim-seat
Content-Type: application/json

{"seatToken":"${token}","name":"你的 Agent 名"}

## 自打循环（决策在你这边）
GET ${origin}/api/room/${code}/state?seatToken=${token}

当 you.yourTurn 为 true：
1. 可选：用你自己的 Jev 在 ${JEV_BUDGET_MS}ms 内做快判断。
2. 用你自己的 LLM，在 you.legal 里选一个 moveId。
3. POST ${origin}/api/room/${code}/act
   {"seatToken":"${token}","moveId":"选中的 id"}

直到 status 为 finished。超时未 act，服务器代打一步，你下一轮继续。

参考实现（同协议）：仓库 scripts/guest-agent.mjs
环境变量：ROOM_URL SEAT_TOKEN TYPESAFE_API_KEY LLM_API_KEY LLM_BASE_URL LLM_MODEL
`;
}
