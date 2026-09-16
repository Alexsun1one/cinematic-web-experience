export type Chapter = {
  id: string;
  numeral: string;
  index: string;
  title: string;
  hook: string;
  metaphor: string;
  body: string;
  slug: string | null;
  cta: string;
  toy: "none" | "next-token" | "tokens" | "prompt" | "stamp" | "loop" | "checklist" | "facts" | "attention";
  setpiece: "none" | "typecase" | "lamp";
};

export const CHAPTERS: Chapter[] = [
  {
    id: "prologue",
    numeral: "〇",
    index: "00",
    title: "先别打开新标签页",
    hook: "工具清单会让人误以为自己在前进。收藏夹很繁荣，能力很贫瘠。",
    metaphor: "这不是一座星图，是一叠刚印好的课稿。你要做的是往下翻，不是绕着发光的球转。",
    body: "假如只剩四个周末，带一个完全外行的朋友走过当代 AI，我希望他最后会三件事：能解释模型为什么流畅却可能是错的；能把含糊请求写成可验收的句子；知道拒绝、幻觉、窗口满了不是同一种病。下面八章按这个顺序排字。",
    slug: null,
    cta: "从续写开始",
    toy: "none",
    setpiece: "none",
  },
  {
    id: "llm-intuition",
    numeral: "壹",
    index: "01",
    title: "它不会想，它会接着写",
    hook: "你问一句，它答一段，像在思考。更稳的说法是：它在已有的句子后面，捡下一颗最像的铅字。",
    metaphor: "排字工不理解社论。他只是手快，盒子里的字又熟。",
    body: "流畅来自「接下来通常会怎样」，不是来自内心世界。所以它会把含糊问题补全成常见任务，也会在缺事实时把语法写得很漂亮。把输出当草稿，不要当判决。",
    slug: "llm-intuition",
    cta: "把「续写」写成默认镜头",
    toy: "next-token",
    setpiece: "typecase",
  },
  {
    id: "tokens",
    numeral: "贰",
    index: "02",
    title: "它看见的不是字",
    hook: "你看见「帮助」。机器可能看见三截编号。尺子一换，价格、窗口、怪癖一起换。",
    metaphor: "中文像整块活字，英文长词常被锯成短棍。同一句话，两边的砖数对不上。",
    body: "上下文不是无限书架，是一排编了号的砖。砖用完了，远处的约束就掉出窗外。你觉得「上面第三点」很清楚，对砖堆来说，第三点必须还在窗里。",
    slug: "tokens",
    cta: "亲手掰开一句中文",
    toy: "tokens",
    setpiece: "none",
  },
  {
    id: "prompting",
    numeral: "叁",
    index: "03",
    title: "提示词不是咒语",
    hook: "形容词堆砌像对排字工喊「认真一点」。他听得见音量，听不见版式。",
    metaphor: "好的提示词是一份 brief：读者、做成什么样、依据是什么、什么叫越界。",
    body: "同一任务，愿望句会续写成空话；规格句会续写成可执行的草稿。差别不在开头的敬语，在你有没有把验收标准写进上下文。",
    slug: "prompting",
    cta: "对照愿望句和规格句",
    toy: "prompt",
    setpiece: "none",
  },
  {
    id: "alignment",
    numeral: "肆",
    index: "04",
    title: "拒绝不是针对你",
    hook: "模型被训练成有偏好的助手。有用、无害、诚实会打架。打架的时候，它会盖章：通过、改写、或拒绝。",
    metaphor: "编辑室的橡皮图章。章盖下去，不是因为讨厌作者，是因为这份稿子踩了哪一条规矩。",
    body: "把拒绝当成脾气，学得很累。当成边界冲突，你会开始换一种问法：把目标说具体，把不能做的事自己先划掉，把判断权留在自己手里。",
    slug: "alignment",
    cta: "试三枚图章",
    toy: "stamp",
    setpiece: "none",
  },
  {
    id: "tools-agents",
    numeral: "伍",
    index: "05",
    title: "一旦会伸手",
    hook: "纯聊天像写信。工具出现之后，信封里开始夹钥匙：搜、读、改、跑。",
    metaphor: "智能体不是灵魂，是「模型 + 工具 + 循环」。循环看不见，事故半径就看不见。",
    body: "能看日志就看日志。写入世界的动作必须经过你。工具失败时，循环该停，而不是换一种更流畅的编造。",
    slug: "tools-agents",
    cta: "走一遍最小循环",
    toy: "loop",
    setpiece: "none",
  },
  {
    id: "hands-on",
    numeral: "陆",
    index: "06",
    title: "最小有用闭环",
    hook: "学会了机制，还差一次收束。问题、成功标准、一次尝试、一次检验、一次迭代。五格就够。",
    metaphor: "不要收藏新客户端。把上周那句「帮我看看」跑完一圈。",
    body: "闭环的意义是让你重新成为作者：模型出草稿，你出标准。没有标准的尝试，只是更昂贵的刷新。",
    slug: "hands-on",
    cta: "填一格闭环",
    toy: "checklist",
    setpiece: "none",
  },
  {
    id: "verification",
    numeral: "柒",
    index: "07",
    title: "流畅不是证据",
    hook: "句子完整，不代表事件发生过。核验不是怀疑一切，是给每句话找去处。",
    metaphor: "三种抽屉：可核对的事实、只是文风、以及必须停下来去查的。",
    body: "「一定能翻倍」是文风。「纪要第 2 条」必须去查。公开课把幻觉讲成机制问题，而不是道德指控——这更有用。你会开始用对照，而不是用崇拜。",
    slug: "verification",
    cta: "给四句话分抽屉",
    toy: "facts",
    setpiece: "none",
  },
  {
    id: "attention",
    numeral: "捌",
    index: "08",
    title: "模型在看哪里",
    hook: "写下一个词时，它把目光分成许多份。权重大，不代表它懂了，只代表这一步更依赖它。",
    metaphor: "台灯。灯罩一转，稿纸上亮的位置就换了。注意是锥光，不是洞察。",
    body: "所以「请参考上面第三点」常常失败：第三点还在，灯却照在最近的闲聊上。把关键名词再写一次，靠近当前任务，少说「如上所述」。",
    slug: "attention",
    cta: "转动那盏灯",
    toy: "attention",
    setpiece: "lamp",
  },
];

export const LESSON_ORDER = CHAPTERS.filter((chapter) => chapter.slug).map((chapter) => chapter.slug as string);

export function chapterBySlug(slug: string) {
  return CHAPTERS.find((chapter) => chapter.slug === slug);
}
