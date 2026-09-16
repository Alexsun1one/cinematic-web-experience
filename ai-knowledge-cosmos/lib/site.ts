export const site = {
  name: "夜览馆",
  tagline: "一条只在夜里亮着的走廊。墙上是隐喻，座上只放一件展品。",
  description:
    "中文优先的当代模型常设展：把续写、尺子、规格、边界、伸手、停顿与注视做成可走完的展厅。不是博客主题，也不是发光球体。",
  author: "观星",
} as const;

export const nav = [
  { href: "/", label: "展厅" },
  { href: "/learn", label: "展墙" },
  { href: "/blog", label: "夜刊" },
  { href: "/knowledge", label: "平面" },
  { href: "/about", label: "馆务" },
] as const;
