#!/usr/bin/env python3
"""
Convert black backgrounds in tools/font-maker/letters/*.png to transparency.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

LETTERS_DIR = Path(__file__).resolve().parent / "letters"
GLYPHS = [chr(c) for c in range(ord("A"), ord("Z") + 1)] + [str(d) for d in range(10)]


def make_black_background_transparent(img: Image.Image, threshold: int = 12) -> Image.Image:
    rgba = np.array(img.convert("RGBA"))
    rgb_max = rgba[:, :, :3].max(axis=2)
    mask = rgb_max <= threshold
    rgba[mask, 3] = 0
    return Image.fromarray(rgba, "RGBA")


def main() -> int:
    LETTERS_DIR.mkdir(parents=True, exist_ok=True)

    processed = 0
    for glyph in GLYPHS:
        path = LETTERS_DIR / f"{glyph}.png"
        if not path.exists():
          continue
        img = Image.open(path)
        out = make_black_background_transparent(img)
        out.save(path)
        processed += 1

    print(f"Transparentized {processed} glyph(s) in {LETTERS_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
