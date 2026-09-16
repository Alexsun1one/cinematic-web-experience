export type NodeColor = "teal" | "violet" | "rose" | "amber" | "blue" | "ivory";

export type CosmosNode = {
  id: string;
  kind: "core" | "lesson" | "essay";
  title: string;
  english: string;
  short: string;
  summary: string;
  href: string;
  color: NodeColor;
  position: [number, number, number];
  stage?: string;
  duration?: string;
  geometry: "icosa" | "octa" | "torus" | "tetra" | "dodeca" | "box" | "core" | "sphere";
};

export const colorHex: Record<NodeColor, string> = {
  teal: "#3ee0c6",
  violet: "#9b8cff",
  rose: "#ff6b8a",
  amber: "#e8b86d",
  blue: "#6aa8ff",
  ivory: "#f3eee4",
};

function orbit(index: number, y: number, radius = 4.65): [number, number, number] {
  const angle = ((Math.PI * 2) * index) / 7;
  return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
}

export const COSMOS_NODES: CosmosNode[] = [
  {
    id: "core",
    kind: "core",
    title: "理解核",
    english: "Comprehension",
    short: "理解核",
    summary: "七门课共同指向的一件事：把模型当成可检验的系统，而不是神谕。",
    href: "/learn",
    color: "ivory",
    position: [0, 0, 0],
    geometry: "core",
  },
  {
    id: "llm-intuition",
    kind: "lesson",
    title: "语言模型的直觉",
    english: "LLM Intuition",
    short: "直觉",
    summary: "它不是在「想」，它是在根据上下文续写。理解这一点，后面所有课才站得住。",
    href: "/learn/llm-intuition",
    color: "teal",
    position: orbit(0, 0.45),
    stage: "01",
    duration: "14 分钟",
    geometry: "icosa",
  },
  {
    id: "tokens",
    kind: "lesson",
    title: "Token：语言如何变成数字",
    english: "Tokens",
    short: "Token",
    summary: "模型看见的不是汉字或单词，而是切分后的编号。预算、价格、怪癖都从这里来。",
    href: "/learn/tokens",
    color: "blue",
    position: orbit(1, -0.28),
    stage: "02",
    duration: "12 分钟",
    geometry: "box",
  },
  {
    id: "prompting",
    kind: "lesson",
    title: "提示词：把意图写成规格",
    english: "Prompting",
    short: "提示",
    summary: "好的提示词像一份可执行的 brief：目标、约束、例子、输出格式。形容词堆砌帮不上忙。",
    href: "/learn/prompting",
    color: "violet",
    position: orbit(2, 0.52),
    stage: "03",
    duration: "16 分钟",
    geometry: "torus",
  },
  {
    id: "alignment",
    kind: "lesson",
    title: "对齐入门：拒绝、谨慎与判断",
    english: "Alignment",
    short: "对齐",
    summary: "模型被训练成有偏好的助手。拒绝不是针对你，判断也不能外包给它。",
    href: "/learn/alignment",
    color: "rose",
    position: orbit(3, -0.18),
    stage: "04",
    duration: "13 分钟",
    geometry: "octa",
  },
  {
    id: "tools-agents",
    kind: "lesson",
    title: "工具与智能体",
    english: "Tools & Agents",
    short: "工具",
    summary: "工具是函数，智能体是循环。模型开始「动手」之后，错误形态也跟着变了。",
    href: "/learn/tools-agents",
    color: "amber",
    position: orbit(4, 0.38),
    stage: "05",
    duration: "15 分钟",
    geometry: "tetra",
  },
  {
    id: "hands-on",
    kind: "lesson",
    title: "动手概念：从对话到闭环",
    english: "Hands-on",
    short: "动手",
    summary: "最小有用闭环：问题、成功标准、一次尝试、一次检验、一次迭代。",
    href: "/learn/hands-on",
    color: "teal",
    position: orbit(5, -0.42),
    stage: "06",
    duration: "12 分钟",
    geometry: "dodeca",
  },
  {
    id: "verification",
    kind: "lesson",
    title: "核验：幻觉、对照与引用",
    english: "Verification",
    short: "核验",
    summary: "流畅不是证据。学会把句子分成可核对的事实、文风，以及必须停下来查的地方。",
    href: "/learn/verification",
    color: "ivory",
    position: orbit(6, 1.12),
    stage: "07",
    duration: "13 分钟",
    geometry: "sphere",
  },
  {
    id: "zero-to-one",
    kind: "essay",
    title: "从 0 到 1 的路径",
    english: "Essay",
    short: "路径",
    summary: "我给自己设计的入门顺序，以及为什么不从工具清单开始。",
    href: "/blog/zero-to-one",
    color: "ivory",
    position: [6.6, 1.4, 1.8],
    geometry: "octa",
  },
  {
    id: "prompts-are-not-spells",
    kind: "essay",
    title: "提示词不是咒语",
    english: "Essay",
    short: "咒语",
    summary: "把 prompting 从神秘学里救出来，放回设计与编辑的工作。",
    href: "/blog/prompts-are-not-spells",
    color: "violet",
    position: [-6.4, 1.6, 2.4],
    geometry: "torus",
  },
  {
    id: "when-models-grow-hands",
    kind: "essay",
    title: "当聊天框开始会用工具",
    english: "Essay",
    short: "动手之后",
    summary: "工具调用如何改变「问一句答一句」的心智模型。",
    href: "/blog/when-models-grow-hands",
    color: "amber",
    position: [-5.2, -1.5, -5.0],
    geometry: "tetra",
  },
  {
    id: "reading-in-public",
    kind: "essay",
    title: "公开教育学读后",
    english: "Essay",
    short: "阅读",
    summary: "从公开课程与实验室博客里，我学到的三件可迁移的事。",
    href: "/blog/reading-in-public",
    color: "blue",
    position: [5.8, -1.7, -3.2],
    geometry: "icosa",
  },
];

export const COSMOS_EDGES: [string, string][] = [
  ["core", "llm-intuition"],
  ["core", "tokens"],
  ["core", "prompting"],
  ["core", "alignment"],
  ["core", "tools-agents"],
  ["core", "hands-on"],
  ["core", "verification"],
  ["llm-intuition", "tokens"],
  ["tokens", "prompting"],
  ["llm-intuition", "prompting"],
  ["prompting", "alignment"],
  ["prompting", "tools-agents"],
  ["alignment", "tools-agents"],
  ["tools-agents", "hands-on"],
  ["hands-on", "prompting"],
  ["llm-intuition", "alignment"],
  ["prompting", "verification"],
  ["llm-intuition", "verification"],
  ["hands-on", "verification"],
  ["tokens", "verification"],
  ["llm-intuition", "zero-to-one"],
  ["prompting", "prompts-are-not-spells"],
  ["tools-agents", "when-models-grow-hands"],
  ["hands-on", "reading-in-public"],
];

export const LESSON_ORDER = [
  "llm-intuition",
  "tokens",
  "prompting",
  "alignment",
  "tools-agents",
  "hands-on",
  "verification",
] as const;

export const lessons = COSMOS_NODES.filter((node) => node.kind === "lesson");
export const essays = COSMOS_NODES.filter((node) => node.kind === "essay");

export function getNode(id: string) {
  return COSMOS_NODES.find((node) => node.id === id);
}

export function neighborsOf(id: string) {
  const ids = new Set<string>();
  for (const [a, b] of COSMOS_EDGES) {
    if (a === id) ids.add(b);
    if (b === id) ids.add(a);
  }
  return COSMOS_NODES.filter((node) => ids.has(node.id));
}
