#!/usr/bin/env python3
"""Produce a compact route/read plan for cinematic-web-experience."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Route:
    name: str
    triggers: tuple[str, ...]
    material_transform: str
    hero_preset: str
    linked_skills: tuple[str, ...]
    strategy_refs: tuple[str, ...]
    build_refs: tuple[str, ...]
    reject_if: str


ROUTES: tuple[Route, ...] = (
    Route(
        "Planetary Authority",
        ("globe", "earth", "map", "global", "export", "logistics", "tourism", "world", "atlas", "地球", "地球仪", "地图", "全球", "出海", "旅游"),
        "earth/map/product -> rotating proof globe or orbital atlas, resolving into the real product when provided",
        "Rotating World",
        ("master-styles", "image-gen", "article-visual-grammar"),
        ("strategy/material-alchemy.md", "strategy/brand-register.md", "strategy/experience-archetypes.md"),
        ("build/react-three.md", "build/material-transforms.md"),
        "the product/geography is not visible or proof labels are fake",
    ),
    Route(
        "Material Desire",
        ("cosmetic", "serum", "fashion", "textile", "fabric", "furniture", "wood", "jewelry", "food", "craft", "美妆", "纺织", "面料", "家具", "珠宝", "食物", "木", "手作"),
        "texture/product -> macro material stage, tactile light, craft cutaway, or hero object theater",
        "Hero Object Theater",
        ("master-styles", "image-gen", "cover-pop"),
        ("strategy/material-alchemy.md", "strategy/brand-register.md", "strategy/experience-archetypes.md"),
        ("build/material-transforms.md", "build/react-three.md"),
        "the material becomes a decorative background only",
    ),
    Route(
        "Regulated Trust",
        ("healthcare", "medical", "clinic", "hospital", "wellness", "biotech", "finance", "insurance", "legal", "law", "government", "public service", "nonprofit", "compliance", "risk", "audit", "医疗", "健康", "诊所", "医院", "生物", "金融", "保险", "法律", "律师", "政府", "政务", "公益", "合规", "风控", "审计", "信任"),
        "documents/cases/process/proof -> calm evidence theater, audit trail, source-anchored trust journey",
        "Trust Theater",
        ("article-visual-grammar", "master-styles", "paper-operators"),
        ("strategy/universal-brief-router.md", "strategy/material-alchemy.md", "strategy/experience-archetypes.md"),
        ("build/single-html.md", "build/material-transforms.md"),
        "claims, outcomes, safety, compliance, legal certainty, or returns are invented",
    ),
    Route(
        "Learning / Service Journey",
        ("education", "course", "training", "school", "learning", "onboarding", "service journey", "customer journey", "therapy", "consulting delivery", "curriculum", "lesson", "教育", "课程", "培训", "学校", "学习", "教学", "服务旅程", "客户旅程", "咨询交付", "疗程", "方案落地"),
        "curriculum/process/persona path -> interactive journey, step simulation, proof checkpoints, before/after understanding",
        "Learning / Service Journey",
        ("article-visual-grammar", "paper-operators", "master-styles"),
        ("strategy/universal-brief-router.md", "strategy/proposal-to-simulation.md", "strategy/component-grammar.md"),
        ("build/single-html.md", "build/material-transforms.md"),
        "it becomes a linear animated PPT instead of an experience the user can step through",
    ),
    Route(
        "Command Center / Data World",
        ("data", "metrics", "kpi", "spreadsheet", "dashboard", "market", "forecast", "portfolio", "supply chain", "logistics", "energy", "carbon", "climate", "operations", "数据", "指标", "表格", "看板", "市场", "预测", "组合", "供应链", "物流", "能源", "碳", "气候", "运营", "调度"),
        "data/maps/metrics -> command center, drill-down map/network, scenario toggles, source-labeled proof field",
        "Command Center / Data World",
        ("article-visual-grammar", "master-styles"),
        ("strategy/universal-brief-router.md", "strategy/material-alchemy.md", "strategy/experience-archetypes.md"),
        ("build/single-html.md", "build/react-three.md", "build/material-transforms.md"),
        "metrics, maps, forecasts, or impact claims are invented or visually misleading",
    ),
    Route(
        "Operational Mechanism",
        ("manufacturing", "factory", "industrial", "machine", "equipment", "production line", "process", "warehouse", "quality", "maintenance", "agriculture", "farm", "food production", "制造", "工厂", "工业", "机器", "设备", "产线", "仓库", "质检", "维护", "农业", "农场", "食品生产"),
        "process/site/equipment/specs -> mechanism cutaway, factory walkthrough, assembly or operations simulation",
        "Mechanism Cutaway",
        ("article-visual-grammar", "paper-operators", "master-styles"),
        ("strategy/universal-brief-router.md", "strategy/material-alchemy.md", "strategy/component-grammar.md"),
        ("build/react-three.md", "build/material-transforms.md", "build/physics-components.md"),
        "safety, mechanical, production, or quality claims are not grounded in source material",
    ),
    Route(
        "Mechanism Prestige",
        ("saas", "dashboard", "screenshot", "interface", "workflow", "platform", "ai tool", "system", "教育", "系统", "仪表盘", "截图", "平台", "工具", "流程"),
        "screenshot/framework -> layered artifact cutaway, decision flow, capability stack, or transformation tunnel",
        "Layered Artifact Cutaway",
        ("article-visual-grammar", "paper-operators", "master-styles"),
        ("strategy/material-alchemy.md", "strategy/brand-register.md", "strategy/experience-archetypes.md"),
        ("build/material-transforms.md", "build/react-three.md"),
        "the interface is no longer inspectable in any state",
    ),
    Route(
        "Spatial Intervention",
        ("lighting", "street", "facade", "interior", "retail", "exhibition", "architecture", "renovation", "campus", "urban", "block", "灯光", "街区", "街道", "立面", "室内", "展厅", "建筑", "改造", "园区", "城市更新"),
        "site/street/interior photo -> before/after future-state simulation with focusable intervention points",
        "Before/After Simulation",
        ("master-styles", "image-gen", "article-visual-grammar"),
        ("strategy/proposal-to-simulation.md", "strategy/component-grammar.md", "strategy/experience-archetypes.md"),
        ("build/material-transforms.md", "build/single-html.md", "build/react-three.md"),
        "the original state disappears or assumptions are presented as measured engineering truth",
    ),
    Route(
        "Inspectable Product",
        ("product", "hardware", "device", "furniture", "instrument", "cad", "detail", "rotate", "zoom", "explode", "inspect", "产品", "硬件", "设备", "家具", "细节", "旋转", "放大", "爆炸", "查看"),
        "product photo/CAD/detail shots -> rotate/zoom/focus showroom with proof hotspots and fallback stills",
        "Interactive Product Showroom",
        ("master-styles", "image-gen"),
        ("strategy/material-alchemy.md", "strategy/component-grammar.md", "strategy/brand-register.md"),
        ("build/react-three.md", "build/material-transforms.md", "build/physics-components.md"),
        "the product can rotate but cannot be inspected or remains generic",
    ),
    Route(
        "Particle Identity",
        ("particle", "particles", "photo", "image", "picture", "silhouette", "outline", "mask", "portrait", "logo", "粒子", "照片", "图片", "图像", "轮廓", "剪影", "头像"),
        "photo/logo/silhouette/product outline -> recognizable particle reveal, proof orbit, or identity field",
        "Particle Identity Reveal",
        ("master-styles", "image-gen"),
        ("strategy/material-alchemy.md", "strategy/component-grammar.md", "strategy/experience-archetypes.md"),
        ("build/material-transforms.md", "build/react-three.md", "build/single-html.md"),
        "the resolved image is unrecognizable or particles are only decorative",
    ),
    Route(
        "Human Credibility",
        ("portrait", "founder", "expert", "teacher", "consultant", "team", "coach", "人物", "头像", "创始人", "专家", "老师", "顾问", "团队"),
        "portrait -> particle identity reveal, trust field, proof orbit, or case evidence halo",
        "Particle Identity Reveal",
        ("master-styles", "article-visual-grammar", "image-gen"),
        ("strategy/material-alchemy.md", "strategy/brand-register.md", "strategy/experience-archetypes.md"),
        ("build/material-transforms.md", "build/react-three.md"),
        "the face/identity is unrecognizable when fidelity matters",
    ),
    Route(
        "Cultural Worldbuilding",
        ("heritage", "museum", "exhibition", "festival", "place", "culture", "tour", "archive", "文旅", "文化", "展览", "博物馆", "非遗", "节日", "地方", "档案"),
        "place/archive/ritual -> route atlas, cinematic gallery, paper-stage world, or night-market proof journey",
        "Cinematic Gallery",
        ("paper-operators", "master-styles", "image-gen", "cover-pop"),
        ("strategy/material-alchemy.md", "strategy/brand-register.md", "strategy/experience-archetypes.md"),
        ("build/react-three.md", "build/single-html.md"),
        "the scene is atmospheric but no real place/ritual/source anchor remains",
    ),
    Route(
        "Evidence Authority",
        ("pdf", "deck", "report", "whitepaper", "document", "proposal", "research", "paper", "报告", "文档", "白皮书", "论文", "方案", "提案"),
        "document/deck -> source-bound evidence constellation, proof theater, or paper-stage scroll world",
        "Evidence Constellation",
        ("article-visual-grammar", "master-styles", "paper-operators"),
        ("strategy/material-alchemy.md", "strategy/brand-register.md", "strategy/experience-archetypes.md"),
        ("build/single-html.md", "build/material-transforms.md"),
        "any major section lacks a source anchor",
    ),
    Route(
        "Kinetic Identity",
        ("logo", "brand", "identity", "campaign", "mark", "monogram", "品牌", "logo", "标志", "活动", "主视觉"),
        "logo/mark -> kinetic seal, particle monogram, SVG path reveal, or foil/material assembly",
        "Kinetic Seal",
        ("master-styles", "image-gen", "cover-pop"),
        ("strategy/material-alchemy.md", "strategy/brand-register.md", "strategy/experience-archetypes.md"),
        ("build/single-html.md", "build/material-transforms.md"),
        "the mark is distorted or unreadable at rest",
    ),
)


ALWAYS_READ = (
    "route-engine.md",
    "industry-atlas.md",
    "planner/intake-schema.md",
    "planner/web-figure-spec.md",
)
QA_READ = ("qa/beauty-gate.md", "qa/perf-a11y.md")
SSS_READ = ("qa/sss-quality-gates.md",)
INTERACTION_READ = (
    "interaction-feel-atlas.md",
    "effects-catalog.md",
    "qa/interaction-feel-gate.md",
)
SOURCE_SPATIALIZATION_READ = ("strategy/source-spatialization-pipeline.md",)

SOURCE_SPATIALIZATION_TRIGGERS = (
    "image",
    "photo",
    "picture",
    "reference",
    "asset",
    "generated plate",
    "product",
    "globe",
    "street",
    "block",
    "interior",
    "facade",
    "room",
    "building",
    "portrait",
    "logo",
    "screenshot",
    "cutout",
    "mask",
    "extract",
    "cleanup",
    "linework",
    "wireframe",
    "fake 3d",
    "2.5d",
    "图片",
    "照片",
    "参考图",
    "素材",
    "生图",
    "产品",
    "地球仪",
    "街区",
    "街道",
    "室内",
    "立面",
    "房间",
    "建筑",
    "抠",
    "抠图",
    "主体",
    "清理",
    "去除",
    "线稿",
    "假3d",
    "伪3d",
)


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def score_route(route: Route, text: str) -> int:
    return sum(2 if trigger in text else 0 for trigger in route.triggers)


def pick_route(text: str) -> tuple[Route, str]:
    scored = sorted(((score_route(route, text), route) for route in ROUTES), key=lambda item: item[0], reverse=True)
    top_score, top_route = scored[0]
    if top_score > 0:
        return top_route, "keyword match"
    evidence = next(route for route in ROUTES if route.name == "Evidence Authority")
    return evidence, "fallback: evidence route until source material is inspected"


def build_plan(brief: str, *, delivery: str) -> dict[str, Any]:
    text = normalize(f"{brief} {delivery}")
    route, reason = pick_route(text)
    build_refs = list(route.build_refs)

    if "single" in text or "html" in text or "offline" in text or "离线" in text or "单html" in text:
        if "build/single-html.md" not in build_refs:
            build_refs.append("build/single-html.md")
    if any(word in text for word in ("3d", "three", "webgl", "globe", "earth", "地球", "粒子", "particle")):
        if "build/react-three.md" not in build_refs:
            build_refs.insert(0, "build/react-three.md")
    if any(word in text for word in ("physics", "collision", "assemble", "drag", "snap", "碰撞", "物理", "组装", "拖拽", "吸附")):
        if "build/physics-components.md" not in build_refs:
            build_refs.append("build/physics-components.md")

    linked_refs = [f"linked-skills/{skill}.md" for skill in route.linked_skills]
    prompt_refs: list[str] = []
    if "image-gen" in route.linked_skills or any(word in text for word in ("生成", "image", "photo", "lighting", "灯光", "future", "before", "after")):
        prompt_refs.append("prompts/imagegen-prompt-pack.md")
    if any(word in text for word in ("research", "调研", "github", "library", "技术")):
        prompt_refs.append("prompts/research-protocol.md")

    inspiration_refs: list[str] = ["template-families.md"]
    if any(word in text for word in ("template", "inspiration", "reference", "showcase", "awwwards", "codrops", "参考", "模板", "炫技", "展示")):
        inspiration_refs.append("inspiration-gallery.md")
    interaction_refs: list[str] = []
    if any(
        word in text
        for word in (
            "interaction",
            "interactive",
            "animation",
            "motion",
            "feel",
            "tactile",
            "drag",
            "physics",
            "smooth",
            "premium",
            "luxury",
            "交互",
            "互动",
            "动画",
            "动效",
            "手感",
            "真实",
            "拖拽",
            "物理",
            "丝滑",
            "高级",
            "炫技",
        )
    ):
        interaction_refs.extend(INTERACTION_READ)

    spatial_refs: list[str] = []
    if any(word in text for word in SOURCE_SPATIALIZATION_TRIGGERS):
        spatial_refs.extend(SOURCE_SPATIALIZATION_READ)

    sss_refs: list[str] = list(SSS_READ)

    files_to_read = list(
        dict.fromkeys(
            (
                *ALWAYS_READ,
                "planner/context-budget.md",
                "orchestration/multi-agent-workflow.md",
                "orchestration/loop-harness.md",
                "strategy/universal-brief-router.md",
                *route.strategy_refs,
                *spatial_refs,
                *linked_refs,
                *prompt_refs,
                *inspiration_refs,
                *interaction_refs,
                *build_refs,
                *QA_READ,
                *sss_refs,
            )
        )
    )

    return {
        "route": route.name,
        "reason": reason,
        "material_transform": route.material_transform,
        "hero_preset": route.hero_preset,
        "linked_skills": list(route.linked_skills),
        "build_refs": build_refs,
        "files_to_read": files_to_read,
        "hard_gates": [
            "Material Transform Gate",
            "Subject Spatialization Gate",
            "Background Plate Ban",
            "Component Evidence Gate",
            "Subject Identity Gate",
            "First Viewport Specificity Gate",
            "Linked Skill Proof Gate",
            "Template Contamination Gate",
            "Proof Density Gate",
            "Simulation Truth Gate",
            "Inspection Freedom Gate",
            "Physical Manipulation Gate",
            "Context Budget Gate",
            "Beauty Gate",
            "SSS Quality Gate",
        ],
        "reject_if": route.reject_if,
        "next_actions": [
            "inventory exact source materials and preserve/transform rules",
            "write a subject map before building image-led or product-led pages",
            "produce a component asset manifest: subject, clean backplate, depth/line guide, detail layers, fallback still",
            "write web figure spec before code",
            "produce linked-skill artifacts before frontend build",
            "choose a template family and inspiration pattern without copying",
            "choose an interaction feel model and effect budget",
            "verify object-local controls for inspectable products: drag, rotate, zoom, focus, reset",
            "run SSS quality loop: screenshot/recording, failure naming, highest-leverage repair, rerun evidence",
            "screenshot desktop/mobile and run beauty gate",
        ],
    }


def as_markdown(plan: dict[str, Any]) -> str:
    lines = [
        "# Cinematic Route Plan",
        "",
        f"- route: {plan['route']}",
        f"- reason: {plan['reason']}",
        f"- material transform: {plan['material_transform']}",
        f"- hero preset: {plan['hero_preset']}",
        f"- reject if: {plan['reject_if']}",
        "",
        "## Linked Skills",
        *[f"- {item}" for item in plan["linked_skills"]],
        "",
        "## Files To Read",
        *[f"- references/{item}" for item in plan["files_to_read"]],
        "",
        "## Hard Gates",
        *[f"- {item}" for item in plan["hard_gates"]],
        "",
        "## Next Actions",
        *[f"- {item}" for item in plan["next_actions"]],
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Route a brief into a cinematic-web-experience skill plan.")
    parser.add_argument("--brief", help="Short user/client brief.")
    parser.add_argument("--brief-file", type=Path, help="Read the brief from a text/markdown file.")
    parser.add_argument("--delivery", default="", help="Delivery constraint: single HTML, offline folder, React app, etc.")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of markdown.")
    args = parser.parse_args()

    brief_parts: list[str] = []
    if args.brief:
        brief_parts.append(args.brief)
    if args.brief_file:
        brief_parts.append(args.brief_file.read_text(encoding="utf-8"))
    if not brief_parts:
        parser.error("provide --brief or --brief-file")

    plan = build_plan("\n".join(brief_parts), delivery=args.delivery)
    if args.json:
        print(json.dumps(plan, ensure_ascii=False, indent=2))
    else:
        print(as_markdown(plan))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
