# 智识宇宙 / Knowledge Cosmos

中文优先的沉浸式 AI 知识枢纽与个人笔记。首页是可检视的三维学习宇宙：七门 0→1 课程是星体，笔记是外层卫星。拖曳旋转、选中时镜头靠过去，点击进入课文。减弱动效时自动切到静态星图。

## 技术栈

- Next.js App Router + TypeScript
- Tailwind CSS v4
- MDX（`next-mdx-remote`）
- React Three Fiber + Drei + three
- Motion

## 打开网页（本地即是 live 路径）

此环境没有 Vercel 登录或部署 token，因此没有托管预览 URL。打开页面的方式是本地运行；生产构建已通过。

需要 Node.js 20+。

```bash
cd ai-knowledge-cosmos
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。这就是当前可用的 live 页面。

生产模式（构建已验证通过）：

```bash
npm run build
npm start
```

若要托管到 Vercel，在已登录的机器上于本目录执行 `npx vercel`。

## 预览截图

截图在 [`docs/previews/`](docs/previews/)：

- `home-cosmos.png` / `home-cosmos-v2.png` — 三维学习宇宙
- `learn-worlds-v2.png` — 七座世界轨
- `lesson-page.png` — 课程正文（含玩具）
- `knowledge-atlas.png` / `knowledge-atlas-v2.png` — 知识星图

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 三维学习宇宙 |
| `/learn` `/learn/[slug]` | 七座中文世界（含切分 / 规格对照玩具） |
| `/blog` `/blog/[slug]` | 观测笔记 |
| `/knowledge` | 可点击知识星图 |
| `/about` | 方法、来源与作者 |

## 内容原则

课程与笔记均为原创中文教学，灵感来自公开课程、公开研究博客与产品教育中的教学法，不粘贴专有文档。减弱动效（`prefers-reduced-motion`）或点「静止星图」时，WebGL 会换成静态星图。

## 目录

- `app/` App Router 页面
- `components/cosmos/` 三维宇宙与 HUD
- `components/learn/` 世界轨与课文内玩具
- `content/lessons/` `content/posts/` MDX
- `lib/cosmos.ts` 星图数据（课程结构本身）
- `docs/` 路线卡与主体地图
