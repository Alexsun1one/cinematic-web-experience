# 智识宇宙 / Knowledge Cosmos

中文优先的沉浸式 AI 知识枢纽与个人笔记。首页是可检视的三维学习宇宙：六门 0→1 课程是星体，笔记是外层卫星。拖曳旋转、按钮缩放、点击进入课文。减弱动效时自动切到静态星图，课程与博客仍可完整阅读。

## 技术栈

- Next.js App Router + TypeScript
- Tailwind CSS v4
- MDX（`next-mdx-remote`）
- React Three Fiber + Drei + three
- Motion

## 本地运行

需要 Node.js 20+。

```bash
cd ai-knowledge-cosmos
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

```bash
npm run build
npm start
```

用于生产构建与本地预览。

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 三维学习宇宙 |
| `/learn` `/learn/[slug]` | 六站中文课程 |
| `/blog` `/blog/[slug]` | 观测笔记 |
| `/knowledge` | 可点击知识星图 |
| `/about` | 方法、来源与作者 |

## 内容原则

课程与笔记均为原创中文教学，灵感来自公开课程、公开研究博客与产品教育中的教学法，不粘贴专有文档。减弱动效（`prefers-reduced-motion`）或点「静止星图」时，WebGL 会换成静态星图。

## 目录

- `app/` App Router 页面
- `components/cosmos/` 三维宇宙与 HUD
- `content/lessons/` `content/posts/` MDX
- `lib/cosmos.ts` 星图数据（课程结构本身）
- `docs/` 路线卡与主体地图
