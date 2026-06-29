#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

from fontTools.ttLib import TTFont

REQUIRED = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"


def main() -> int:
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "output/water.woff2")
    font = TTFont(path)
    cmap = {}
    for table in font["cmap"].tables:
        cmap.update(table.cmap)

    missing = [ch for ch in REQUIRED if ord(ch) not in cmap]
    names = font["name"]
    family = names.getDebugName(1)
    full = names.getDebugName(4)
    has_colr = "COLR" in font
    has_cpal = "CPAL" in font

    print(f"Family: {family}")
    print(f"Full name: {full}")
    print(f"Missing glyphs: {missing}")
    print(f"Has COLR table: {has_colr}")
    print(f"Has CPAL table: {has_cpal}")
    return 1 if (missing or not has_colr or not has_cpal) else 0


if __name__ == "__main__":
    raise SystemExit(main())
