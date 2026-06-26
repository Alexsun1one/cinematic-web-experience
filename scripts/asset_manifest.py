#!/usr/bin/env python3
"""Inspect local image assets for cinematic web routing."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


def inspect_image(path: Path) -> dict[str, Any]:
    try:
        from PIL import Image
    except ImportError as exc:
        raise SystemExit("Pillow is required for image inspection: python3 -m pip install Pillow") from exc

    with Image.open(path) as image:
        image.load()
        width, height = image.size
        mode = image.mode
        has_alpha = "A" in mode or mode in {"LA", "PA"}
        sample = image.convert("RGBA").resize((80, 80))
        pixels = list(sample.getdata())

    opaque = [p for p in pixels if p[3] > 8]
    alpha_ratio = 0 if not pixels else sum(1 for p in pixels if p[3] < 250) / len(pixels)

    quantized = Counter((r // 32 * 32, g // 32 * 32, b // 32 * 32) for r, g, b, a in opaque)
    palette = [
        {"hex": f"#{r:02x}{g:02x}{b:02x}", "count": count}
        for (r, g, b), count in quantized.most_common(6)
    ]

    aspect = width / height if height else 0
    suggested_routes: list[str] = []
    if 1.7 <= aspect <= 2.2:
        suggested_routes.append("wide hero plate / paper-stage / depth gallery")
    if 0.8 <= aspect <= 1.25:
        suggested_routes.append("particle identity / central object / kinetic seal")
    if aspect >= 1.8:
        suggested_routes.append("possible map or panorama; inspect for globe/route usage")
    if has_alpha or alpha_ratio > 0.05:
        suggested_routes.append("alpha-mask particles or layered cutout")

    return {
        "path": str(path),
        "width": width,
        "height": height,
        "aspect_ratio": round(aspect, 4),
        "mode": mode,
        "has_alpha": has_alpha,
        "transparent_pixel_ratio": round(alpha_ratio, 4),
        "approx_palette": palette,
        "suggested_routes": suggested_routes or ["inspect subject manually before routing"],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect image assets for cinematic web routing.")
    parser.add_argument("paths", nargs="+", type=Path)
    args = parser.parse_args()

    results = []
    for path in args.paths:
        if not path.exists():
            results.append({"path": str(path), "error": "not found"})
            continue
        try:
            results.append(inspect_image(path))
        except Exception as exc:  # noqa: BLE001 - CLI should report per-file errors.
            results.append({"path": str(path), "error": str(exc)})

    print(json.dumps(results, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
