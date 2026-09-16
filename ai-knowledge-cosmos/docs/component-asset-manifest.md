# Component Asset Manifest — 智识宇宙

## Source

- project: 智识宇宙 / Knowledge Cosmos
- source files: `lib/cosmos.ts`, `content/lessons/*`, `content/posts/*`
- target route: Evidence constellation
- SSS target: inspectable curriculum world

## Components

| id | type | source | web layer role | interaction |
| --- | --- | --- | --- | --- |
| core | generated icosahedron | curriculum thesis | 理解核 | 点击进入 /learn |
| lesson-nodes | generated meshes | six lessons | 可检视主体 | 拖曳场景、点击聚焦、缩放 |
| filaments | line components | COSMOS_EDGES | 依赖关系 | 聚焦时点亮 |
| nebula | transparent spheres | atmosphere | 空间深度 | 无直接操作 |
| hud | DOM overlay | copy + controls | 规格与导航 | 复位 / 缩放 / 静止 |
| atlas | SVG map | same graph | 可读星图 | 点击节点 |
| fallback | static SVG | same graph | reduced-motion | 键盘与链接仍可用 |

## Truth labels

- 3D 星体是课程结构的空间化，不是科学模拟。
- 教学内容为原创，灵感来自公开教育学，非专有文档。
