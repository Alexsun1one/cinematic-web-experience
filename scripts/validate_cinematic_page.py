#!/usr/bin/env python3
"""Static QA checks for cinematic single-page HTML deliverables.

This script catches basic web defects and the most dangerous failure for this
skill: shipping a generic starter page whose effects are not bound to the
client's source material.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


FAIL_PATTERNS = [
    r"\bTODO\b",
    r"\bFIXME\b",
    r"lorem ipsum",
    r"placeholder",
]

SCAFFOLD_PATTERNS = [
    r"Signal Architecture",
    r"Motion\. Depth\. Particles\. One local file\.",
    r"Turn the brief into a room",
    r"client world",
    r"class=[\"'][^\"']*metric-strip",
    r"class=[\"'][^\"']*signal-map",
    r"class=[\"'][^\"']*orb",
    r"class=[\"'][^\"']*prism",
]

MATERIAL_MARKERS = [
    r"data-source-material",
    r"data-material-transform",
    r"cinematic-source-material",
    r"material-mechanism-map",
    r"source-anchor",
]

SUBJECT_MARKERS = [
    r"data-primary-subject",
    r"data-subject-source",
    r"subject-map",
    r"component-asset-manifest",
    r"subject-cutout",
    r"clean-backplate",
    r"depth-guide",
    r"linework",
]

MANIPULATION_MARKERS = [
    r"data-object-controls",
    r"data-manipulated-object",
    r"setPointerCapture",
    r"pointerdown",
    r"pointermove",
    r"reset-view",
    r"object-local",
    r"drag",
    r"rotate",
    r"zoom",
]


def has_any(text: str, patterns: list[str]) -> bool:
    return any(re.search(pattern, text, re.IGNORECASE | re.MULTILINE) for pattern in patterns)


def check(
    path: Path,
    *,
    allow_scaffold: bool = False,
    require_material_transform: bool = False,
    require_subject_spatialization: bool = False,
    require_object_manipulation: bool = False,
) -> tuple[list[str], list[str]]:
    html = path.read_text(encoding="utf-8")
    lower = html.lower()
    failures: list[str] = []
    warnings: list[str] = []

    if path.suffix.lower() not in {".html", ".htm"}:
        warnings.append("file extension is not .html or .htm")

    if "<!doctype html" not in lower:
        failures.append("missing <!doctype html>")
    if 'name="viewport"' not in lower and "name='viewport'" not in lower:
        failures.append("missing viewport meta tag")
    if "<title>" not in lower:
        failures.append("missing document title")
    if "<main" not in lower:
        warnings.append("missing semantic <main>")
    if lower.count("<section") < 3:
        warnings.append("fewer than 3 sections")
    if ":root" not in lower:
        warnings.append("no CSS variables found in :root")
    if "@media" not in lower:
        warnings.append("no responsive media query found")
    if "prefers-reduced-motion" not in lower and "matchmedia" not in lower:
        failures.append("missing reduced-motion handling")
    if "requestanimationframe" not in lower and "@keyframes" not in lower and "gsap" not in lower and "motion" not in lower:
        warnings.append("no obvious animation driver found")
    has_visual_system = (
        "<canvas" in lower
        or "three" in lower
        or "webgl" in lower
        or "<svg" in lower
        or ("<img" in lower and has_any(html, SUBJECT_MARKERS))
        or ("background-image" in lower and has_any(html, SUBJECT_MARKERS))
    )
    if not has_visual_system:
        warnings.append("no canvas, WebGL, Three.js, SVG, or image-component visual system found")
    if "aria-" not in lower and "aria-label" not in lower:
        warnings.append("no ARIA attributes found; confirm interactive elements are accessible")
    if has_any(html, FAIL_PATTERNS):
        failures.append("contains TODO/FIXME/lorem/placeholder text")
    if not allow_scaffold and has_any(html, SCAFFOLD_PATTERNS):
        failures.append("starter/scaffold contamination detected; rebuild around the user's material")
    if not has_any(html, MATERIAL_MARKERS):
        message = "no explicit source-material or material-transform marker found"
        if require_material_transform:
            failures.append(message)
        else:
            warnings.append(message)
    if not has_any(html, SUBJECT_MARKERS):
        message = "no explicit subject/component spatialization marker found"
        if require_subject_spatialization:
            failures.append(message)
        else:
            warnings.append(message)
    if not has_any(html, MANIPULATION_MARKERS):
        message = "no explicit object-local manipulation marker found"
        if require_object_manipulation:
            failures.append(message)
        else:
            warnings.append(message)
    if re.search(r"background-image:\s*url\(", html, re.IGNORECASE) and has_any(html, [r"new THREE\.SphereGeometry", r"new THREE\.BoxGeometry"]):
        if require_subject_spatialization:
            warnings.append("background image plus procedural geometry detected; verify hero object is source-derived, not unrelated")

    size_mb = path.stat().st_size / (1024 * 1024)
    if size_mb > 5:
        warnings.append(f"large single HTML file: {size_mb:.1f} MB")

    external = re.findall(r"https?://[^\"')\s]+", html)
    if external:
        warnings.append(f"external URLs found; not fully offline ({len(external)} references)")

    return failures, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a cinematic HTML deliverable.")
    parser.add_argument("html", type=Path)
    parser.add_argument(
        "--allow-scaffold",
        action="store_true",
        help="Allow bundled scaffold phrases. Use only while testing templates, never for a client deliverable.",
    )
    parser.add_argument(
        "--require-material-transform",
        action="store_true",
        help="Fail unless the HTML marks source material / material transform metadata.",
    )
    parser.add_argument(
        "--require-subject-spatialization",
        action="store_true",
        help="Fail unless the HTML marks a primary subject / component asset pipeline.",
    )
    parser.add_argument(
        "--require-object-manipulation",
        action="store_true",
        help="Fail unless the HTML marks object-local controls such as drag/rotate/zoom/reset.",
    )
    args = parser.parse_args()

    if not args.html.exists():
        print(f"FAIL: file not found: {args.html}", file=sys.stderr)
        return 2

    failures, warnings = check(
        args.html,
        allow_scaffold=args.allow_scaffold,
        require_material_transform=args.require_material_transform,
        require_subject_spatialization=args.require_subject_spatialization,
        require_object_manipulation=args.require_object_manipulation,
    )

    for item in failures:
        print(f"FAIL: {item}")
    for item in warnings:
        print(f"WARN: {item}")

    if failures:
        print(f"RESULT: failed with {len(failures)} failure(s), {len(warnings)} warning(s)")
        return 1

    print(f"RESULT: passed with {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
