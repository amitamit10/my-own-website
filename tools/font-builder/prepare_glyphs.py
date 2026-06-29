#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT.parent / "font-maker" / "letters"
OUT_DIR = ROOT / "build" / "normalized"
BOUNDS_PATH = ROOT / "build" / "glyph-bounds.json"
METRICS_PATH = ROOT / "font-metrics.json"


def normalize_glyph(path: Path, canvas_size: int = 1024, padding: int = 96):
    img = Image.open(path).convert("RGBA")
    bbox = img.getbbox()
    if bbox is None:
        raise ValueError(f"{path.name} is empty")

    cropped = img.crop(bbox)
    inner = canvas_size - padding * 2
    cropped.thumbnail((inner, inner))

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    x = (canvas_size - cropped.width) // 2
    y = (canvas_size - cropped.height) // 2
    canvas.paste(cropped, (x, y), cropped)

    bounds = {
        "x": x,
        "y": y,
        "width": cropped.width,
        "height": cropped.height
    }
    return canvas, bounds


def main() -> int:
    metrics = json.loads(METRICS_PATH.read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    glyph_bounds = {}

    for path in sorted(SOURCE_DIR.glob("*.png")):
        if path.name == ".gitkeep":
            continue
        normalized, bounds = normalize_glyph(
            path,
            canvas_size=metrics["normalizeCanvas"],
            padding=metrics["padding"],
        )
        normalized.save(OUT_DIR / path.name)
        glyph_bounds[path.stem] = bounds

    BOUNDS_PATH.write_text(json.dumps(glyph_bounds, indent=2))
    print(f"Normalized {len(glyph_bounds)} glyph(s) into {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
