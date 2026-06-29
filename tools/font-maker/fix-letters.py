#!/usr/bin/env python3
"""
fix-letters.py — Erase stray attached blobs from water-font letter PNGs.

Strategy: for each letter marked "Manually fixable: Yes" in
tools/font-maker/letter-notes.md, use morphological erosion with a cross-shaped
kernel to break the thin necks that connect stray drops to the main glyph body,
then run connected-component analysis. The single largest component is
identified as the main glyph body, dilated back to its original size, and
intersected with the original alpha mask. Everything else (stray drops that
were broken off by erosion) is erased.

Usage:  python3 tools/font-maker/fix-letters.py
"""

import re
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent
LETTERS_DIR = ROOT / "letters"
NOTES_PATH = ROOT / "letter-notes.md"
EROSION_ITERATIONS = 5  # cross-shaped kernel iterations to break thin necks


def parse_fixable_letters(notes_text: str) -> list[str]:
    """Return the list of letter IDs (e.g. 'A', '0') marked fixable."""
    fixable: list[str] = []
    for match in re.finditer(
        r"^##\s+(\S+)\s+—\s+NEEDS WORK\s*\n"
        r"(?:.*?\n)*?"
        r"\*\*Manually fixable:\*\*\s*Yes",
        notes_text,
        flags=re.MULTILINE,
    ):
        fixable.append(match.group(1))
    return fixable


def fix_letter(letter_id: str) -> dict:
    """Erase stray blobs from a single letter PNG. Returns a summary dict."""
    path = LETTERS_DIR / f"{letter_id}.png"
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)

    alpha = arr[:, :, 3] > 10
    original_count = int(np.sum(alpha))

    # Erode with a cross-shaped kernel to break thin necks connecting stray
    # drops to the main body. 5 iterations is enough to break necks up to
    # ~5 px wide while leaving the thick main body largely intact.
    eroded = ndimage.binary_erosion(alpha, iterations=EROSION_ITERATIONS)

    labeled, n_components = ndimage.label(eroded)

    if n_components == 0:
        return {"letter": letter_id, "removed": 0, "kept": original_count}

    sizes = ndimage.sum(eroded, labeled, range(1, n_components + 1))
    main_label = int(np.argmax(sizes)) + 1
    main_core = labeled == main_label

    # Dilate the main core back to roughly the original size.
    main_clean = ndimage.binary_dilation(main_core, iterations=EROSION_ITERATIONS)

    # Final mask = original alpha AND cleaned main body. Everything else
    # (stray drops that were broken off by erosion) is erased.
    new_alpha = alpha & main_clean
    removed_count = original_count - int(np.sum(new_alpha))

    if removed_count > 0:
        arr[:, :, 3] = np.where(new_alpha, arr[:, :, 3], 0)
        Image.fromarray(arr).save(path)

    return {
        "letter": letter_id,
        "removed": removed_count,
        "kept": int(np.sum(new_alpha)),
    }


def main() -> None:
    notes_text = NOTES_PATH.read_text()
    fixable = parse_fixable_letters(notes_text)
    print(f"Found {len(fixable)} fixable letters: {', '.join(fixable)}\n")

    results: list[dict] = []
    for letter_id in fixable:
        result = fix_letter(letter_id)
        results.append(result)
        removed = result["removed"]
        if removed:
            print(f"  {letter_id}: erased {removed} px of stray pixels")
        else:
            print(f"  {letter_id}: unchanged (no stray pixels found)")

    total_removed = sum(r["removed"] for r in results)
    changed = sum(1 for r in results if r["removed"] > 0)
    print(
        f"\nDone. {total_removed} stray pixels erased across {changed} of "
        f"{len(results)} letter(s)."
    )


if __name__ == "__main__":
    main()
