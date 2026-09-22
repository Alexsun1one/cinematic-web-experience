# 模型掼蛋擂台 · LLM Guandan Arena

四人掼蛋观赛台。座位 0 与 2 是南北一家，座位 1 与 3 是东西一家。每个座位挂着一个模型名字；没有密钥时，四席全部由 Mock 在合法着法里代打，`npm install && npm run dev` 可以直接看完一局。

A four-player Guandan spectator table. Seats 0 and 2 are partners (North–South). Seats 1 and 3 are partners (East–West). Each seat keeps a model name. With no API keys, all four seats use the Mock legal-move player, so `npm install && npm run dev` plays a full match.

## 一键开房 / One-click room

大厅点 **一键开房** → 得到房间码与 `/room/[code]`。房主点 **复制给 Agent**，把整段说明交给对方的 Agent。那个 Agent 先自检：没有 `TYPESAFE_API_KEY` 就告诉人「缺 Jev，不能打」并停止；没有自己的 LLM、或打不到房间地址，也停止。合格后它用自己的 Jev 和自己的 LLM 入座自打。服务器只列出合法着法，不接收密钥，也不替客人调用 Jev 或模型。回合超时则服务器用 Mock 推进，牌桌不冻结。

人类打开同一链接就是 **观众**（只读：牌桌、快推理、级牌轨、统计）。本地没有客人时，**高级 · 本地 Mock** 或 `npm run watch` 用四席 Mock 开打。

1. `npm run dev` → 大厅 → **一键开房**
2. **复制给 Agent**（整段协议，不是只发链接）
3. 对方 Agent 自检 Jev + LLM + 房间可达，再 `claim-seat` / `act`
4. 观众打开 `/room/CODE` 围观
5. 可选：**围观聊天**

房间状态在服务端内存 Map 里（与对局相同）。重启进程会清空。多实例部署需要 Redis 之类的共享状态——本 MVP 未接。

Room + match state live in the current Node process `Map`. Restart clears them. Multi-instance needs a shared store later (Redis etc.); this demo is single-process.

参考玩家：`node scripts/guest-agent.mjs`，环境变量 `ROOM_URL` `SEAT_TOKEN` `TYPESAFE_API_KEY` `LLM_API_KEY`。密钥只留在客人进程里。

开局顺序以引擎为准，写在邀请和「规则速览」的「开局与出牌顺序」里：第一局南北坐庄、座位 0 先出；之后头游先出；不进贡、不还贡、不抗贡；赢墩者领出，出完则对家接风。`GET /api/room/:code/state` 带 `phase`、`leaderSeat`、`currentTurn`、`mustBeat`。

## 座位 / Seats

| 座位 | 方位 | 队伍 | 显示名 | 密钥 |
| --- | --- | --- | --- | --- |
| 0 | 北 North | 南北 | DeepSeek V4.1 Flash | `DEEPSEEK_API_KEY` |
| 1 | 东 East | 东西 | Gemini 3.8 Flash | `GEMINI_API_KEY` 或 `GOOGLE_API_KEY` |
| 2 | 南 South | 南北 | MiMo 2.6 Flash | `MIMO_API_KEY` + `MIMO_BASE_URL` |
| 3 | 西 West | 东西 | GLM 5.3 Flash | `ZHIPU_API_KEY` |

Mock 模式下界面仍显示这些名字，决策不访问网络。大厅里的「实盘」只有在对应密钥存在时才会把该座位交给模型。可选的 Jev / TypeSafe 协助读取 `TYPESAFE_API_KEY`：引擎先列出合法着法，Jev 可以回答 Noul（要不要过）和 Choice（选哪一手），模型仍必须从合法列表里选；非法着法打回一次，再非法就回退到 Mock。

In Mock mode the UI still shows those names and never calls a provider. Live mode sends a seat to its model only when that key exists. Optional Jev / TypeSafe assist (`TYPESAFE_API_KEY`) may answer a Noul and a Choice over the engine's legal moves. The model must still pick a listed move. One illegal answer is retried with the rejection reason; a second failure falls back to Mock.

本地围观：`npm run watch`

发给你的 Agent：房间页 **复制给 Agent**。它必须自备 `TYPESAFE_API_KEY`（没有就停并说「缺 Jev，不能打」）和自己的 LLM，然后 `claim-seat` + `act`。服务器不替客人跑 Jev。参考 `scripts/guest-agent.mjs`。回合超时则服务器 Mock/过牌，桌子不停。

## 运行 / Run

```bash
cd llm-guandan-arena
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，按「一键开房」或「快速开打」。观赛页是一张方桌：北东南西各有出牌区，南家默认错落垂直理牌（可改横排扇形），对手默认牌背。顶栏是 2→A 级牌轨道。一局结束会报头游到末游，以及双下 / 头游+三游 / 头游+末游。侧栏「统计」可导出 CSV 和 JSON。

Open [http://localhost:3000](http://localhost:3000) and press **一键开房** (room + spectators) or **快速开打** (solo match). The table is a square felt with a play zone on each side.

### 牌桌约定 / Table conventions

对齐常见江苏客户端（爱掼蛋一类）和升级类四方牌桌，而不是赌场椭圆桌：

- 方毡、细发光边、四角方位。南北对坐，东西对坐。
- 每家出牌落在自己身边的出牌区。一圈结束后牌面淡出。三带二先三后对，顺子从左到右升序。
- 桌心红心级牌即逢人配。手牌里的红心级牌标霓虹「配」。
- 南家是主视角，默认「垂直理牌」：同一点数竖叠成列，列与列错落，炸弹、同花顺、钢板靠左，散牌靠右，逢人配单独成列并标「配」。可改「横排扇形」。北东西默认牌背加张数。
- 观赛台皮肤为 **Glass Arena**：炭黑底、电青绿强调、玻璃 HUD、圆角翠绿毡。顶栏霓虹级牌轨、快推理玻璃 toast、局终全屏暗场仪式、统计 KPI 卡同一套视觉。
- 顶栏始终显示本副打到哪一级，以及南北、东西在 2→A 上的位置。本副逢人配跟着庄家的级牌。
- 一局结束宣布头游、二游、三游、末游。升级只升不降，按常见线上记法：双下 +3，头游+三游 +2，头游+末游 +1。动画写出「南北 打8 → 打J」这种前后级牌。打满一盘从 2 打到过 A；选「三局」则打完三副就按级牌高低收场。
- 统计按座位记下局数、队伍胜率、头游率、末游率、平均名次、炸弹、同花顺、过牌、快推理耗时、拒牌次数，以及对家走完时自己还剩几张。队伍记下升级数、双下次数、到 A 的局数。复盘 JSON 和 CSV 都带这份记录。
- 每家出牌前先闪一句「快推理」。有 `TYPESAFE_API_KEY` 时问 Jev，约 800ms 超时就写「超时跳过」；没有密钥时用局面事实写 Mock 快推理。问题和答案记进复盘。

Before each play the table flashes a short 快推理 glass toast beside that seat. With `TYPESAFE_API_KEY` it asks Jev and gives up after about 800ms (`超时跳过`). With no key it shows a Mock line from the same facts. Questions, answers, and latency are stored on the replay log.

These follow a Jiangsu-style square table rather than a casino oval: luminous rim, four bearings, a play zone per seat, heart level-card in the center, and South’s hand in staggered vertical columns. Upgrades follow the common online rule, winners only: 双下 +3, 头游+三游 +2, 头游+末游 +1.

```bash
npm run test:engine
npm run build
```

对局存在当前 Node 进程的内存里。重启 dev server 会清空。这是单进程观赛台，不是多实例 serverless 存储。

Matches live in the current Node process. Restarting the server clears them.

## 环境变量 / Environment

复制 `.env.example`。全部留空即为 Mock。

| 变量 | 作用 |
| --- | --- |
| `DEEPSEEK_API_KEY` | DeepSeek。默认模型 `DEEPSEEK_MODEL=deepseek-v4.1-flash`，接口 `DEEPSEEK_BASE_URL`（OpenAI 兼容 `/chat/completions`） |
| `GEMINI_API_KEY` 或 `GOOGLE_API_KEY` | Gemini。默认 `GEMINI_MODEL=gemini-3.8-flash` |
| `MIMO_API_KEY` | 小米 MiMo。必须同时有 `MIMO_BASE_URL`（按量默认 `https://api.xiaomimimo.com/v1`）。模型 `MIMO_MODEL=mimo-v2.6-flash` |
| `ZHIPU_API_KEY` | 智谱 GLM。默认 `ZHIPU_MODEL=glm-5.3-flash`，`ZHIPU_BASE_URL` |
| `TYPESAFE_API_KEY` | Jev。`POST {TYPESAFE_BASE_URL}/v1/systemone`，默认 `https://api.typesafe.ai`，模型 `TYPESAFE_MODEL` |

模型 ID 都可用环境变量覆盖，因此供应商改名时不用改代码。密钥只在服务端读取。

Model ids are env-overridable. Keys are read only on the server.

## 规则与简化 / Rules and simplifications

实现了发牌、级牌、常见牌型、炸弹、过牌、局分和过 A。下面这些是故意的简化：

- 两副牌 108 张，每人 27 张。红桃级牌两张是逢人配，可补点数和花色，不能当王。
- 牌型：单张、对子、三张、三带二、五张顺子、三连对（木板）、钢板、四至八炸、同花顺、天王炸（四王）。没有更长顺子，没有 A-2-3-4-5 回头。同花顺只当炸弹：大于五炸，小于六炸。
- 顺子、三连对、钢板按自然点数比大小。对子、三张、三带二、炸弹按「级牌大于 A、小于王」。
- 同点同型只留一组代表牌，尽量少用逢人配。
- 赢墩者领出；若已出完，对家接风。不进贡、不还贡，下一局头游先出。
- 只升级不降级：双上 +3，头游+三游 +2，头游+末游 +1。升到 A、越过 A，或已经在 A 再赢，比赛结束。
- 首局南北坐庄，从所选级牌开打。大厅默认从 K 开，方便看完升级；选 2 即从最低级打起。
- 观赛台明牌能看见四家手牌。发给模型的提示只包含该座位自己的手牌、张数和明面出牌。

The engine deals, tracks levels, recognizes the common combos and bombs, supports pass, and scores rounds through passing ace.

- 108 cards, 27 each. Both heart level-cards are wild and are never jokers.
- Combos: single, pair, triple, full house, 5-card straight, three pair tube, plate, bombs of 4–8, straight flush, four jokers. No longer straights and no wheel. A straight flush is only a bomb, ranked between a 5-bomb and a 6-bomb.
- Straights, tubes, and plates use natural rank. Pairs, triples, full houses, and bombs rank the level card above aces and below jokers.
- One representative holding per pattern and rank.
- Trick winner leads. If they are out, the partner takes the lead. No tribute. First-out leads the next round.
- Upgrades only: +3 / +2 / +1. Reaching A, passing A, or winning on A ends the match.
- North–South starts as dealer. The lobby defaults to level K so a round can finish on screen; choose 2 for a match from the bottom.
- The spectator view can show every hand. A model prompt contains only that seat's hand, public counts, and the visible trick.

## 结构 / Layout

- `app/` 大厅 `/` 与观赛 `/match/[id]`，步进和复盘走 Route Handler。
- `lib/guandan/` 牌、合法着法、计分、对局状态机、Mock 启发式。
- `lib/llm/` 提示词、四家供应商 stub、Jev Noul/Choice、非法重试。
- `lib/roster-data.ts` 座位显示名。`lib/roster.ts` 只在服务端把密钥映射到实盘或 Mock。
