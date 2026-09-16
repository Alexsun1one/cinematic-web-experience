# 智识宇宙 / Knowledge Cosmos

中文优先的沉浸式 AI 知识枢纽与个人笔记。首页是可检视的三维学习宇宙：八门 0→1 课程是星体，笔记是外层卫星。拖曳旋转、选中时镜头靠过去，点击进入课文。减弱动效时自动切到静态星图。

## 技术栈

- Next.js App Router + TypeScript
- Tailwind CSS v4
- MDX（`next-mdx-remote`）
- React Three Fiber + Drei + three
- Motion

## 打开网页（本地即是 live 路径）

此环境没有托管预览 URL。打开页面的方式是本地运行；生产构建需通过。

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

没有 Vercel / 托管部署凭证时，不要依赖 `npx vercel`。`npm run dev` 即是交付路径。

## 预览截图

截图在 [`docs/previews/`](docs/previews/)：

- `home-cosmos-v3.png` — 三维学习宇宙与前五秒操作提示
- `learn-worlds-v3.png` — 八座世界轨
- `attention-toy-v3.png` — 注意力热力玩具
- `blog-magazine-v3.png` — 观测笔记杂志封面
- `blog-post-v3.png` — 笔记正文（进度条 / 引语 / 首字下沉）
- `knowledge-atlas-v3.png` — 知识星图（含 08 注视层）

较早版本仍保留：`*-v2.png`、`home-cosmos.png`、`lesson-page.png`。

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 三维学习宇宙（含可关闭的操作提示） |
| `/learn` `/learn/[slug]` | 八座中文世界（切分 / 规格对照 / 核验 / 注意力玩具） |
| `/blog` `/blog/[slug]` | 观测笔记（杂志排版） |
| `/knowledge` | 可点击知识星图 |
| `/about` | 方法、来源与作者 |

## 内容原则

课程与笔记均为原创中文教学，灵感来自公开课程、公开研究博客与产品教育中的教学法，不粘贴专有文档。减弱动效（`prefers-reduced-motion`）或点「静止星图」时，WebGL 会换成静态星图。课文内玩具均标明「示意」，不是真实分词器或注意力头。

## 目录

- `app/` App Router 页面
- `components/cosmos/` 三维宇宙、HUD 与入门提示
- `components/learn/` 世界轨与课文内玩具
- `components/blog/` 阅读进度与引语
- `content/lessons/` `content/posts/` MDX
- `lib/cosmos.ts` 星图数据（课程结构本身）
- `docs/` 路线卡与主体地图
