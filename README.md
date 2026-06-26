# Cinematic Web Experience

把文档、照片、产品、街区、服务方案、报告或模糊商业想法，转成客户能看、能拖、能放大、能比较、能相信的高级网页样机。

这个 Skill 的重点不是“炫技网页模板”，而是一个主体优先的视觉样机系统：

```text
真实需求 -> 主体识别 -> 素材处理 -> 视觉机制 -> 交互手感 -> SSS 质量门禁 -> 可交付网页
```

## 核心原则

- 先理解客户要相信什么，再选视觉机制。
- 不把所有东西硬凹成地球仪、粒子、3D 或黑金炫技。
- 有参考图时，先明确主体，再抠主体、清背景、补部件、线稿化、假 3D 化或近似重建。
- 没有参考图时，优先生成可组合部件：主体、clean backplate、材质微距、前景光泽、线稿/深度 guide，而不是一张静态大图。
- 产品展示必须能对象级操控：拖拽、旋转、局部缩放、聚焦、复位，必要时支持摆放/组装/吸附/碰撞。
- 质量门禁不是评分表。没看截图、没体验交互、没跑修复循环，就不能说完成。

## 适用场景

- 产品/器物：可旋转、缩放、热点检查的展示间。
- 街区/空间：清理杂物、分层、线稿/透视平面、before-after 灯光或改造模拟。
- 文档/报告/方案：证据剧场、章节证明、source-bound proof。
- 服务/教育/咨询：旅程模拟、步骤控制、关键节点证明。
- 品牌/人物/Logo：粒子身份、动势印章、证据环绕。
- 无素材概念：先生成组件，再组合成可互动网页。

## SSS 交付循环

每轮必须留下证据：

1. route card
2. subject map
3. component asset manifest
4. desktop screenshot
5. active interaction screenshot or recording
6. reduced-motion still/proof
7. hard-gate failure list
8. one highest-leverage repair action

修复顺序：

1. 路由错先重路由
2. 主体错先处理素材
3. 背景死图先组件化/线稿化
4. 交互假先做对象级操控
5. 视觉弱先修材质/光/构图
6. 动效乱先简化并加复位
7. 证明空先补 source anchors
8. 性能差再降效果和资源

## 目录

- `SKILL.md`：Codex Skill 主入口。
- `references/strategy/source-spatialization-pipeline.md`：主体抽取、清理、组件化、线稿、假 3D 管线。
- `references/strategy/component-grammar.md`：真实物理操控和对象级交互规则。
- `references/qa/sss-quality-gates.md`：SSS 质量门禁和修复循环。
- `references/prompts/imagegen-prompt-pack.md`：部件化生图提示词。
- `templates/asset-manifest.md`：组件资产清单模板。
- `scripts/route_skill_plan.py`：根据 brief 自动生成读文件/路由计划。
- `scripts/validate_cinematic_page.py`：静态 QA，支持严格主体/交互检查。
- `examples/`：高质量案例和截图。
- `docs/CODEX_HANDOFF.md`：跨机器/跨 agent 交接。

## 示例

- `examples/globe-atelier-physical/`：产品/器物路线。用参考图切出的地球仪主体做对象级拖拽、旋转、缩放、聚焦和复位。
- `examples/street-linework-intervention/`：复杂街区路线。用清理层、线稿、透视平面、灯光锥和 before-after scrub 做假 3D 空间改造。
- `examples/evidence-theater-trust/`：证据/信任路线。证明不是每个 brief 都需要 3D，把 claim/proof/risk/assumption 做成可检查的证据剧场。

每个示例目录都包含 `index.html` 和桌面/移动端 QA 截图。

## 快速验证

```bash
python3 scripts/route_skill_plan.py \
  --brief "复杂街区照片，清理杂物，线稿化，做假3D灯光改造网页" \
  --delivery "desktop premium web demo"

python3 scripts/validate_cinematic_page.py examples/<case>/index.html \
  --require-material-transform \
  --require-subject-spatialization \
  --require-object-manipulation
```

## 开源状态

本仓库是本机 Codex Skill 的产品化版本。正式对外传播前，需要确保示例截图/录屏、第三方依赖许可、README 图廊和 release tag 都已补齐。
