#!/usr/bin/env python3
"""Map a desired web interaction feel to effects, stack, and gates."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class Feel:
    name: str
    triggers: tuple[str, ...]
    motion_model: tuple[str, ...]
    effects: tuple[str, ...]
    stack: tuple[str, ...]
    gates: tuple[str, ...]


FEELS: tuple[Feel, ...] = (
    Feel(
        "liquid luxury",
        ("luxury", "premium", "elegant", "slow", "smooth", "奢华", "高级", "丝滑", "优雅", "克制"),
        ("slow damped camera", "soft parallax", "restrained spring", "material shimmer"),
        ("material macro", "depth of field", "subtle particles", "full-bleed hero"),
        ("R3F/Drei", "react-postprocessing", "GSAP or Theatre.js", "Image Gen support plate"),
        ("material specificity", "palette restraint", "rest state still", "mobile composition"),
    ),
    Feel(
        "physical tactile",
        ("drag", "physics", "touch", "tactile", "inertia", "snap", "collision", "手感", "真实", "拖拽", "物理", "惯性", "吸附", "碰撞"),
        ("drag", "inertia", "elastic constraint", "magnetic snap", "settle"),
        ("rotatable object", "assembly lab", "focus hotspots", "shadow/contact response"),
        ("Motion drag", "GSAP Draggable/Inertia", "@use-gesture", "Rapier or Matter.js"),
        ("release/settle quality", "reset path", "mobile touch", "interaction purpose"),
    ),
    Feel(
        "cinematic scroll",
        ("scroll", "cinematic", "story", "timeline", "chapter", "电影", "滚动", "叙事", "镜头", "时间线"),
        ("pinned chapters", "scrubbed timeline", "camera rail", "staged reveal"),
        ("scroll camera", "section reveal", "focus dive", "before/after scrub"),
        ("GSAP ScrollTrigger", "Lenis", "Theatre.js", "R3F camera controls"),
        ("no scroll hijack", "chapter clarity", "reduced motion", "source anchors"),
    ),
    Feel(
        "calm trust",
        ("trust", "medical", "finance", "legal", "government", "compliance", "clinical", "信任", "医疗", "金融", "法律", "政府", "合规", "稳重"),
        ("small purposeful transitions", "evidence reveal", "steady focus", "low motion"),
        ("audit trail", "proof cards", "source anchor drill-down", "calm timeline"),
        ("DOM/SVG/canvas", "Motion microinteractions", "article-visual-grammar"),
        ("no invented claims", "accessibility", "readability", "proof density"),
    ),
    Feel(
        "data command",
        ("data", "dashboard", "map", "network", "command", "operations", "数据", "看板", "地图", "网络", "指挥室", "运营"),
        ("drill-down", "cross-filter", "scenario toggle", "map pan"),
        ("command center", "network field", "globe/map arcs", "detail cards"),
        ("DOM/SVG/canvas", "Three/R3F if spatial", "three-globe when global"),
        ("no fake metrics", "drill-down clarity", "performance", "keyboard/touch controls"),
    ),
    Feel(
        "playful toy",
        ("playful", "toy", "game", "fun", "youth", "活泼", "好玩", "玩具", "游戏", "年轻"),
        ("bouncy spring", "collision", "toss", "snap", "small reward"),
        ("draggable parts", "particles", "confetti accent", "assembly"),
        ("Matter.js", "Rapier", "Motion", "Canvas"),
        ("brand fit", "not childish if serious", "reset", "reduced motion"),
    ),
)


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def score(feel: Feel, text: str) -> int:
    return sum(2 for trigger in feel.triggers if trigger in text)


def pick(text: str) -> tuple[Feel, str]:
    ranked = sorted(((score(feel, text), feel) for feel in FEELS), key=lambda item: item[0], reverse=True)
    top_score, top = ranked[0]
    if top_score:
        return top, "keyword match"
    return FEELS[0], "fallback: liquid luxury until source/industry indicates another feel"


def plan(brief: str) -> dict[str, Any]:
    feel, reason = pick(normalize(brief))
    return {
        "feel": feel.name,
        "reason": reason,
        "motion_model": list(feel.motion_model),
        "effects": list(feel.effects),
        "stack": list(feel.stack),
        "gates": list(feel.gates),
        "files_to_read": [
            "references/interaction-feel-atlas.md",
            "references/effects-catalog.md",
            "references/qa/interaction-feel-gate.md",
            "templates/interaction-spec.md",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Plan interaction feel for cinematic-web-experience.")
    parser.add_argument("--brief", required=True)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    result = plan(args.brief)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"# Interaction Feel Plan\n\n- feel: {result['feel']}\n- reason: {result['reason']}")
        print("\n## Motion Model")
        print("\n".join(f"- {item}" for item in result["motion_model"]))
        print("\n## Effects")
        print("\n".join(f"- {item}" for item in result["effects"]))
        print("\n## Stack")
        print("\n".join(f"- {item}" for item in result["stack"]))
        print("\n## Gates")
        print("\n".join(f"- {item}" for item in result["gates"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
