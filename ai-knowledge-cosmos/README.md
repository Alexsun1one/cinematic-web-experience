# 夜览馆

中文优先的 0→1 AI 学习走廊。不是发光球体落地页，也不是纸杂志主题。

**这一轮（动效）：** 方向仍是夜览馆。门缝呼吸、颗粒、双「向前」箭头与进厅惯性都更贴手。走廊用停留段和自适应跟随，射灯交接、铭牌随距离升起。字盘有阻尼抬起和点击过冲；射灯横拖带速度、回弹、吸到「猫 / 它」。厅与课文、夜刊之间是光缝划过，不是淡入淡出。减弱动效时停在构图里，焦点环仍是酸色。WebGL 限制 DPR、离开视野即暂停。

**产品命题：** 把当代模型学成一条走得完的路。四个周末，一个外行，会三件事：解释它为何流畅却可能错；把含糊写成可验收；分清拒绝、幻觉、窗口满了不是同一种病。

## 打开页面

没有托管预览。本地即是 live 路径。需要 Node.js 20+。

```bash
cd ai-knowledge-cosmos
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

```bash
npm run build
npm start
```

## 预览

`docs/previews/`：

- `motion-home.png` — 门厅：光缝呼吸中段
- `motion-chamber.png` — 展厅交接
- `motion-exhibit.png` — 字盘抬起
- `motion-lesson.png` — 展墙课文
- `polish-*.png` — 上一轮打磨静帧

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 展厅走廊：门厅 → 壹到捌 → 出口 |
| `/learn` `/learn/[slug]` | 展墙目录与八课深读 |
| `/blog` `/blog/[slug]` | 夜刊 |
| `/knowledge` | 一层平面 |
| `/about` | 馆务 |

课文与笔记均为原创中文教学。玩具标明「示意」。减弱动效时走廊改为竖向叠厅。
