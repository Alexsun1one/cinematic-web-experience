export type Chapter = {
  id: string;
  numeral: string;
  index: string;
  title: string;
  hook: string;
  metaphor: string;
  wall: string;
  plate: string;
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
    title: "把眼睛交给黑暗",
    hook: "书签是一座永不开放的馆。",
    metaphor: "走廊只有一条。墙会说话。座上只放一件东西。",
    wall: "先别打开新标签页。",
    plate: "门厅 · 请沿走廊向前",
    body: "四个周末。一个外行。走完只要会三件事：解释它为何流畅却可能错；把含糊请求写成可验收的句子；分清拒绝、幻觉、窗口满了不是同一种病。",
    slug: null,
    cta: "推开那道缝",
    toy: "none",
    setpiece: "none",
  },
  {
    id: "llm-intuition",
    numeral: "壹",
    index: "01",
    title: "它不会想，它会接着写",
    hook: "你问一句，它答一段，像在思考。更稳的说法是：它在已有的句子后面，捡下一颗最像的字。",
    metaphor: "展柜亮起的不是灵感。是下一颗被选中的字。",
    wall: "馆员不读诗。他只是伸手。",
    plate: "展品 01 · 下一颗字",
    body: "流畅来自「接下来通常会怎样」，不是来自内心世界。所以它会把含糊问题补全成常见任务，也会在缺事实时把语法写得很漂亮。把输出当草稿，不要当判决。",
    slug: "llm-intuition",
    cta: "读墙上的课文",
    toy: "next-token",
    setpiece: "typecase",
  },
  {
    id: "tokens",
    numeral: "贰",
    index: "02",
    title: "它看见的不是字",
    hook: "你看见「帮助」。机器可能看见三截编号。尺子一换，价格、窗口、怪癖一起换。",
    metaphor: "墙被锯开了。同一句话，两边的砖数对不上。",
    wall: "中文像整块夜砖。英文长词常被劈成短棍。",
    plate: "展品 02 · 尺子",
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
    hook: "形容词堆砌像对馆员喊「认真一点」。他听得见音量，听不见版式。",
    metaphor: "好的提示词是一块铭牌：读者、做成什么样、依据是什么、什么叫越界。",
    wall: "愿望句续写成空话。规格句续写成可执行的草稿。",
    plate: "展品 03 · 铭牌",
    body: "差别不在开头的敬语，在你有没有把验收标准写进上下文。同一任务，两种写法会把走廊带向完全不同的房间。",
    slug: "prompting",
    cta: "对照两块铭牌",
    toy: "prompt",
    setpiece: "none",
  },
  {
    id: "alignment",
    numeral: "肆",
    index: "04",
    title: "拒绝不是针对你",
    hook: "模型被训练成有偏好的助手。有用、无害、诚实会打架。打架的时候，它会盖章：通过、改写、或拒绝。",
    metaphor: "章盖下去，不是因为讨厌参观者，是因为这件展品踩了哪一条规矩。",
    wall: "边界是灯，不是脾气。",
    plate: "展品 04 · 三枚章",
    body: "把拒绝当成脾气，学得很累。当成边界冲突，你会开始换一种问法：把目标说具体，把不能做的事自己先划掉，把判断权留在自己手里。",
    slug: "alignment",
    cta: "试三枚章",
    toy: "stamp",
    setpiece: "none",
  },
  {
    id: "tools-agents",
    numeral: "伍",
    index: "05",
    title: "一旦会伸手",
    hook: "纯聊天像隔着玻璃看。工具出现之后，玻璃上开了一扇门：搜、读、改、跑。",
    metaphor: "智能体不是灵魂。是「模型 + 工具 + 循环」。循环看不见，事故半径就看不见。",
    wall: "钥匙在信封里。你必须看见它被转了几圈。",
    plate: "展品 05 · 循环",
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
    hook: "学会了机制，还差一次收束。问题、成功标准、一次尝试、一次检验、一次迭代。五块地砖就够。",
    metaphor: "不要收藏新门牌。把上周那句「帮我看看」在这间房里跑完。",
    wall: "模型出草稿。你出标准。",
    plate: "展品 06 · 五块砖",
    body: "闭环的意义是让你重新成为作者。没有标准的尝试，只是更昂贵的刷新。",
    slug: "hands-on",
    cta: "点亮一圈地砖",
    toy: "checklist",
    setpiece: "none",
  },
  {
    id: "verification",
    numeral: "柒",
    index: "07",
    title: "流畅不是证据",
    hook: "句子完整，不代表事件发生过。核验不是怀疑一切，是给每句话找去处。",
    metaphor: "三只夜抽屉：可核对的事实、只是文风、以及必须停下来去查的。",
    wall: "漂亮的句子可以是空抽屉。",
    plate: "展品 07 · 抽屉",
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
    metaphor: "射灯。灯罩一转，墙上亮的位置就换了。注意是锥光，不是洞察。",
    wall: "少说「如上所述」。把关键名词再写一次，靠近当前任务。",
    plate: "展品 08 · 射灯",
    body: "所以「请参考上面第三点」常常失败：第三点还在，灯却照在最近的闲聊上。",
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
