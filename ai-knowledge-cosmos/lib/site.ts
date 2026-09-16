export const site = {
  name: "智识宇宙",
  english: "Knowledge Cosmos",
  tagline: "从 0 到 1，把当代 AI 看成可走的路，而不是神秘气候。",
  description:
    "中文优先的沉浸式 AI 知识枢纽与个人笔记：用三维星图学习语言模型直觉、Token、提示词、对齐、工具智能体、动手方法、核验与注意力。",
  author: "观星",
  url: "https://localhost:3000",
} as const;

export const nav = [
  { href: "/", label: "宇宙" },
  { href: "/learn", label: "课程" },
  { href: "/blog", label: "笔记" },
  { href: "/knowledge", label: "星图" },
  { href: "/about", label: "关于" },
] as const;
