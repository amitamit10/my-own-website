#!/usr/bin/env python3
"""
fix-letters.py — Auto-fix water-font letter PNGs in tools/font-maker/letters/.

Removes small detached blobs (connected components smaller than MIN_BLOB_PX²)
that are not the main glyph body. These would otherwise render as unwanted
black dots when the font is rasterised in solid black.

Safe to re-run (idempotent). A blob that has already been removed stays
removed; a glyph that has no extra blobs is left untouched.

Usage:
    python3 tools/font-maker/fix-letters.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

# --- config -----------------------------------------------------------------

LETTERS_DIR = Path(__file__).resolve().parent / "letters"

# Glyphs to process, in render order.
GLYPHS = [chr(c) for c in range(ord("A"), ord("Z") + 1)] + [str(d) for d in range(10)]

# A blob must be at least this many pixels-squared to be considered part of
# the main glyph. Anything smaller is treated as a stray droplet.
#
# Threshold rationale: across the 36 glyphs the smallest main body is ~70k
# px² and the largest genuine non-main sub-component is the 5's bowl-tail
# at ~2.7k px². Setting MIN_BLOB_PX2 = 1500 safely erases stray drops
# (I: 1079, W: 626, etc.) while preserving all real letter parts.
MIN_BLOB_PX2 = 1500

# Alpha threshold — anything above this is "opaque enough" to count as glyph.
ALPHA_THRESHOLD = 10


# --- core -------------------------------------------------------------------

def fix_letter(path: Path) -> dict:
    """Remove stray blobs from a single letter PNG. Returns a summary dict."""
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)

    alpha = arr[:, :, 3] > ALPHA_THRESHOLD
    if not alpha.any():
        return {"name": path.stem, "status": "empty", "removed": 0, "kept": 0}

    labeled, n_components = ndimage.label(alpha)
    if n_components <= 1:
        return {"name": path.stem, "status": "clean", "removed": 0, "kept": n_components}

    sizes = ndimage.sum(alpha, labeled, range(1, n_components + 1))
    main_label = int(np.argmax(sizes)) + 1
    main_size = float(sizes[main_label - 1])

    removed = 0
    kept = 1  # the main body
    for i, size in enumerate(sizes, start=1):
        if i == main_label:
            continue
        if size < MIN_BLOB_PX2:
            arr[labeled == i, 3] = 0
            removed += 1
        else:
            kept += 1

    if removed:
        Image.fromarray(arr).save(path)

    return {
        "name": path.stem,
        "status": "fixed" if removed else "clean",
        "removed": removed,
        "kept": kept,
        "main_size": int(main_size),
    }


def main() -> int:
    if not LETTERS_DIR.is_dir():
        print(f"letters directory not found: {LETTERS_DIR}", file=sys.stderr)
        return 1

    results: list[dict] = []
    for glyph in GLYPHS:
        path = LETTERS_DIR / f"{glyph}.png"
        if not path.exists():
            results.append({"name": glyph, "status": "missing", "removed": 0, "kept": 0})
            continue
        results.append(fix_letter(path))

    # --- summary ------------------------------------------------------------

    fixed = [r for r in results if r["status"] == "fixed"]
    clean = [r for r in results if r["status"] == "clean"]
    missing = [r for r in results if r["status"] == "missing"]
    empty = [r for r in results if r["status"] == "empty"]

    total_removed = sum(r["removed"] for r in results)

    print(f"Processed {len(results)} glyphs in {LETTERS_DIR}")
    print(f"  Fixed (blobs removed): {len(fixed)}")
    print(f"  Already clean:         {len(clean)}")
    if missing:
        print(f"  Missing files:         {len(missing)}  -> {[r['name'] for r in missing]}")
    if empty:
        print(f"  Empty glyphs:          {len(empty)}  -> {[r['name'] for r in empty]}")
    print(f"  Total stray blobs erased: {total_removed}")
    print()

    if fixed:
        print("Per-glyph detail (fixed only):")
        for r in fixed:
            print(
                f"  {r['name']}: erased {r['removed']} stray blob(s); "
                f"main body = {r['main_size']} px²; {r['kept']} large component(s) kept"
            )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
