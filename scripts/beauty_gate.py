#!/usr/bin/env python3
"""Structured beauty gate for cinematic-web-experience deliverables."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


SCORE_KEYS = (
    "material_specificity",
    "first_viewport_memorability",
    "transformation_clarity",
    "typography_spacing",
    "composition_stability",
    "palette_material_restraint",
    "source_anchor_proof_density",
    "mobile_composition",
    "motion_meaning",
    "interaction_freedom",
    "simulation_truth",
    "non_genericness",
)

MIN_CRITICAL = (
    "material_specificity",
    "first_viewport_memorability",
    "mobile_composition",
)

REQUIRED_EVIDENCE = (
    "page_path_or_url",
    "source_material_inventory",
    "material_mechanism_map",
    "linked_skill_outputs",
    "desktop_screenshot",
    "mobile_screenshot",
    "reduced_motion_evidence",
    "canvas_3d_nonblank_evidence",
    "section_source_anchors",
    "offline_truth",
)


def skeleton() -> dict[str, Any]:
    return {
        "page_path_or_url": "",
        "source_material_inventory": [],
        "material_mechanism_map": "",
        "linked_skill_outputs": {},
        "desktop_screenshot": "",
        "mobile_screenshot": "",
        "reduced_motion_evidence": "",
        "canvas_3d_nonblank_evidence": "",
        "section_source_anchors": {},
        "offline_truth": "",
        "hard_gate_failures": [],
        "scores": {key: 4 for key in SCORE_KEYS},
        "repair_action": "",
    }


def present(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, tuple, dict, set)):
        return bool(value)
    return True


def validate(data: dict[str, Any]) -> tuple[list[str], list[str], float]:
    failures: list[str] = []
    warnings: list[str] = []

    for key in REQUIRED_EVIDENCE:
        if not present(data.get(key)):
            failures.append(f"missing evidence: {key}")

    hard_gate_failures = data.get("hard_gate_failures") or []
    if hard_gate_failures:
        failures.append(f"hard gate failures present: {', '.join(map(str, hard_gate_failures))}")

    scores = data.get("scores") or {}
    numeric_scores: list[float] = []
    for key in SCORE_KEYS:
        raw = scores.get(key)
        if raw is None:
            failures.append(f"missing score: {key}")
            continue
        try:
            value = float(raw)
        except (TypeError, ValueError):
            failures.append(f"non-numeric score: {key}")
            continue
        if value < 1 or value > 5:
            failures.append(f"score out of range 1-5: {key}={value}")
        if key in MIN_CRITICAL and value < 4:
            failures.append(f"critical score below 4: {key}={value:g}")
        numeric_scores.append(value)

    average = sum(numeric_scores) / len(numeric_scores) if numeric_scores else 0.0
    if average < 4:
        failures.append(f"average score below 4: {average:.2f}")

    if data.get("linked_skill_outputs") == "named only":
        failures.append("linked skills named without concrete outputs")

    if not present(data.get("repair_action")):
        warnings.append("no repair action recorded; include the highest-leverage fix if any gate was close")

    return failures, warnings, average


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the cinematic beauty gate against evidence JSON.")
    parser.add_argument("evidence", nargs="?", type=Path, help="Evidence JSON file.")
    parser.add_argument("--template", action="store_true", help="Print an evidence JSON template.")
    args = parser.parse_args()

    if args.template:
        print(json.dumps(skeleton(), ensure_ascii=False, indent=2))
        return 0
    if not args.evidence:
        parser.error("provide evidence JSON or --template")
    if not args.evidence.exists():
        print(f"FAIL: evidence not found: {args.evidence}", file=sys.stderr)
        return 2

    data = json.loads(args.evidence.read_text(encoding="utf-8"))
    failures, warnings, average = validate(data)

    for item in failures:
        print(f"FAIL: {item}")
    for item in warnings:
        print(f"WARN: {item}")

    if failures:
        print(f"RESULT: failed beauty gate, average={average:.2f}, failures={len(failures)}, warnings={len(warnings)}")
        return 1

    print(f"RESULT: passed beauty gate, average={average:.2f}, warnings={len(warnings)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
