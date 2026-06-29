# Water Font Assembly Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the finished `tools/font-maker/letters/` PNG set into a reusable webfont (`.woff2`) with a repeatable local workflow and validation steps.

**Architecture:** Build the font in a standalone `tools/font-builder/` workspace so this work does not depend on the Next.js site existing yet. Use Python scripts to normalize glyph images and validate the exported font, and use FontForge as the interactive tracing/editing tool to convert the cleaned PNG silhouettes into vector glyphs before exporting `water.woff2`.

**Tech Stack:** FontForge, Python 3.12, Pillow, fontTools, existing glyph PNGs in `tools/font-maker/letters/`

## Global Constraints
- Keep this work independent of the site scaffold; do **not** create `public/fonts/` yet.
- Source glyphs remain `tools/font-maker/letters/A.png` … `Z.png`, `0.png` … `9.png`.
- Build artifacts live under `tools/font-builder/`.
- Final deliverable for this plan is `tools/font-builder/output/water.woff2`.
- The font is display-only: uppercase A–Z and digits 0–9 are required; lowercase and punctuation are out of scope for this pass.

---

### Task 1: Font builder scaffold

**Files:**
- Create: `tools/font-builder/README.md`
- Create: `tools/font-builder/glyph-map.json`
- Create: `tools/font-builder/font-metrics.json`
- Create: `tools/font-builder/build/.gitkeep`
- Create: `tools/font-builder/output/.gitkeep`

**Interfaces:**
- Produces: a documented standalone workspace for assembling and validating the font

- [ ] **Step 1: Install desktop and Python prerequisites**

```bash
sudo apt-get update
sudo apt-get install -y fontforge python3-fontforge
python3 -m pip install --break-system-packages fonttools pillow
```

Expected:
- `fontforge --version` prints a version string
- `python3 -c "import fontTools, PIL; print('ok')"` prints `ok`

- [ ] **Step 2: Create the builder directories**

```bash
mkdir -p tools/font-builder/build tools/font-builder/output
touch tools/font-builder/build/.gitkeep tools/font-builder/output/.gitkeep
```

Expected: both directories exist and are empty except for `.gitkeep`.

- [ ] **Step 3: Create `tools/font-builder/glyph-map.json`**

```json
{
  "glyphs": [
    { "char": "A", "unicode": "U+0041", "filename": "A.png" },
    { "char": "B", "unicode": "U+0042", "filename": "B.png" },
    { "char": "C", "unicode": "U+0043", "filename": "C.png" },
    { "char": "D", "unicode": "U+0044", "filename": "D.png" },
    { "char": "E", "unicode": "U+0045", "filename": "E.png" },
    { "char": "F", "unicode": "U+0046", "filename": "F.png" },
    { "char": "G", "unicode": "U+0047", "filename": "G.png" },
    { "char": "H", "unicode": "U+0048", "filename": "H.png" },
    { "char": "I", "unicode": "U+0049", "filename": "I.png" },
    { "char": "J", "unicode": "U+004A", "filename": "J.png" },
    { "char": "K", "unicode": "U+004B", "filename": "K.png" },
    { "char": "L", "unicode": "U+004C", "filename": "L.png" },
    { "char": "M", "unicode": "U+004D", "filename": "M.png" },
    { "char": "N", "unicode": "U+004E", "filename": "N.png" },
    { "char": "O", "unicode": "U+004F", "filename": "O.png" },
    { "char": "P", "unicode": "U+0050", "filename": "P.png" },
    { "char": "Q", "unicode": "U+0051", "filename": "Q.png" },
    { "char": "R", "unicode": "U+0052", "filename": "R.png" },
    { "char": "S", "unicode": "U+0053", "filename": "S.png" },
    { "char": "T", "unicode": "U+0054", "filename": "T.png" },
    { "char": "U", "unicode": "U+0055", "filename": "U.png" },
    { "char": "V", "unicode": "U+0056", "filename": "V.png" },
    { "char": "W", "unicode": "U+0057", "filename": "W.png" },
    { "char": "X", "unicode": "U+0058", "filename": "X.png" },
    { "char": "Y", "unicode": "U+0059", "filename": "Y.png" },
    { "char": "Z", "unicode": "U+005A", "filename": "Z.png" },
    { "char": "0", "unicode": "U+0030", "filename": "0.png" },
    { "char": "1", "unicode": "U+0031", "filename": "1.png" },
    { "char": "2", "unicode": "U+0032", "filename": "2.png" },
    { "char": "3", "unicode": "U+0033", "filename": "3.png" },
    { "char": "4", "unicode": "U+0034", "filename": "4.png" },
    { "char": "5", "unicode": "U+0035", "filename": "5.png" },
    { "char": "6", "unicode": "U+0036", "filename": "6.png" },
    { "char": "7", "unicode": "U+0037", "filename": "7.png" },
    { "char": "8", "unicode": "U+0038", "filename": "8.png" },
    { "char": "9", "unicode": "U+0039", "filename": "9.png" }
  ]
}
```

- [ ] **Step 4: Create `tools/font-builder/font-metrics.json`**

```json
{
  "fontName": "WaterDisplay",
  "familyName": "Water Display",
  "styleName": "Regular",
  "unitsPerEm": 1000,
  "ascender": 820,
  "descender": -180,
  "capHeight": 700,
  "xHeight": 0,
  "defaultAdvanceWidth": 760,
  "sideBearing": 70,
  "digitAdvanceWidth": 700,
  "version": "Version 0.1"
}
```

- [ ] **Step 5: Create `tools/font-builder/README.md`**

```markdown
# Water Font Builder

This folder contains the standalone workflow for turning the cleaned PNG glyphs
from `../font-maker/letters/` into a traced vector font.

## Inputs
- `../font-maker/letters/*.png` — cleaned transparent source glyphs
- `glyph-map.json` — character → Unicode mapping
- `font-metrics.json` — baseline font metrics and spacing defaults

## Outputs
- `build/normalized/` — cropped working PNGs prepared for tracing
- `build/water-display.sfd` — FontForge source file
- `output/water.woff2` — final webfont export

## Workflow summary
1. Run `prepare_glyphs.py` to normalize the PNGs.
2. Open FontForge and create `build/water-display.sfd`.
3. Import each normalized glyph PNG into the matching character slot as a guide layer.
4. Trace each glyph to vectors, set sidebearings, and keep cap alignment consistent.
5. Export `output/water.ttf` and `output/water.woff2`.
6. Run `validate_font.py` to confirm character coverage and naming.
```

- [ ] **Step 6: Commit**

```bash
git add tools/font-builder/
git commit -m "chore: scaffold water font builder workspace"
```

---

### Task 2: Glyph normalization script

**Files:**
- Create: `tools/font-builder/prepare_glyphs.py`
- Create: `tools/font-builder/test_prepare_glyphs.py`

**Interfaces:**
- Produces: `tools/font-builder/build/normalized/*.png`
- Produces: `tools/font-builder/build/glyph-bounds.json`

- [ ] **Step 1: Write the failing test**

```python
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from prepare_glyphs import normalize_glyph


class PrepareGlyphsTest(unittest.TestCase):
    def test_normalize_glyph_crops_transparent_edges_and_pads_canvas(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "A.png"
            img = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
            for x in range(8, 12):
                for y in range(5, 17):
                    img.putpixel((x, y), (220, 200, 170, 255))
            img.save(src)

            out, bounds = normalize_glyph(src, canvas_size=64, padding=6)

            self.assertEqual(out.size, (64, 64))
            self.assertEqual(bounds["width"] > 0, True)
            self.assertEqual(bounds["height"] > 0, True)
            self.assertEqual(out.getbbox() is not None, True)
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd tools/font-builder
python3 -m unittest test_prepare_glyphs.py
```

Expected: FAIL with `ModuleNotFoundError: No module named 'prepare_glyphs'`.

- [ ] **Step 3: Write minimal implementation in `tools/font-builder/prepare_glyphs.py`**

```python
#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT.parent / "font-maker" / "letters"
OUT_DIR = ROOT / "build" / "normalized"
BOUNDS_PATH = ROOT / "build" / "glyph-bounds.json"


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
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    glyph_bounds = {}

    for path in sorted(SOURCE_DIR.glob("*.png")):
        if path.name == ".gitkeep":
            continue
        normalized, bounds = normalize_glyph(path)
        normalized.save(OUT_DIR / path.name)
        glyph_bounds[path.stem] = bounds

    BOUNDS_PATH.write_text(json.dumps(glyph_bounds, indent=2))
    print(f"Normalized {len(glyph_bounds)} glyph(s) into {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd tools/font-builder
python3 -m unittest test_prepare_glyphs.py
```

Expected: PASS.

- [ ] **Step 5: Run the script on the real glyph set**

```bash
cd tools/font-builder
python3 prepare_glyphs.py
```

Expected:
- `build/normalized/` contains `36` PNGs
- `build/glyph-bounds.json` exists
- Output includes `Normalized 36 glyph(s)`

- [ ] **Step 6: Commit**

```bash
git add tools/font-builder/prepare_glyphs.py tools/font-builder/test_prepare_glyphs.py tools/font-builder/build/glyph-bounds.json tools/font-builder/build/normalized/
git commit -m "feat: normalize water glyph PNGs for tracing"
```

---

### Task 3: FontForge source setup

**Files:**
- Create: `tools/font-builder/fontforge-bootstrap.py`
- Produces later: `tools/font-builder/build/water-display.sfd`

**Interfaces:**
- Produces: a preconfigured FontForge source file with the right glyph slots and metrics

- [ ] **Step 1: Create `tools/font-builder/fontforge-bootstrap.py`**

```python
#!/usr/bin/env fontforge
import json
from pathlib import Path

import fontforge

ROOT = Path(__file__).resolve().parent
MAP_PATH = ROOT / "glyph-map.json"
METRICS_PATH = ROOT / "font-metrics.json"
OUT_PATH = ROOT / "build" / "water-display.sfd"

glyph_map = json.loads(MAP_PATH.read_text())["glyphs"]
metrics = json.loads(METRICS_PATH.read_text())

font = fontforge.font()
font.fontname = metrics["fontName"]
font.familyname = metrics["familyName"]
font.fullname = f'{metrics["familyName"]} {metrics["styleName"]}'
font.version = metrics["version"]
font.em = metrics["unitsPerEm"]
font.ascent = metrics["ascender"]
font.descent = abs(metrics["descender"])

for item in glyph_map:
    codepoint = int(item["unicode"].replace("U+", ""), 16)
    glyph = font.createChar(codepoint, item["char"])
    glyph.width = metrics["digitAdvanceWidth"] if item["char"].isdigit() else metrics["defaultAdvanceWidth"]

font.save(str(OUT_PATH))
print(f"Created {OUT_PATH}")
```

- [ ] **Step 2: Run the bootstrap script**

```bash
cd tools/font-builder
fontforge -script fontforge-bootstrap.py
```

Expected: `build/water-display.sfd` exists and the command prints `Created .../water-display.sfd`.

- [ ] **Step 3: Open the source in FontForge and import guide images**

Run:

```bash
cd tools/font-builder
fontforge build/water-display.sfd
```

Inside FontForge, for each glyph in `glyph-map.json`:
1. Open the glyph cell.
2. Use `File -> Import` and choose the matching image from `build/normalized/<char>.png`.
3. Import it into the background layer.
4. Scale and position it so the baseline sits near `y = 0` and the top of the glyph lands near cap height.

Expected: every uppercase and digit slot contains its matching PNG as a guide image in the background layer.

- [ ] **Step 4: Save the updated source**

Inside FontForge:
1. `File -> Save`
2. Confirm `build/water-display.sfd` updates on disk

Expected: `build/water-display.sfd` is the canonical editable source file for the font.

- [ ] **Step 5: Commit**

```bash
git add tools/font-builder/fontforge-bootstrap.py tools/font-builder/build/water-display.sfd
git commit -m "feat: bootstrap FontForge source for water font"
```

---

### Task 4: Manual tracing and spacing

**Files:**
- Modify: `tools/font-builder/build/water-display.sfd`

**Interfaces:**
- Produces: traced vector glyphs for A–Z and 0–9 with consistent sidebearings

- [ ] **Step 1: Trace uppercase glyphs A–Z**

Inside FontForge, for each uppercase glyph:
1. Enter the glyph window.
2. Use the pen tool to trace the outer silhouette.
3. For enclosed forms (`A`, `B`, `D`, `O`, `P`, `Q`, `R`) trace counters as separate interior paths.
4. Simplify points only enough to keep smooth curves; do not over-fit the PNG.

Expected: A–Z all render as vector outlines when `View -> Filled` is enabled and the background image is hidden.

- [ ] **Step 2: Trace digits 0–9**

Inside FontForge, repeat the same process for the digit glyphs.

Expected: `0` through `9` all render as vector outlines with no missing counters.

- [ ] **Step 3: Set horizontal metrics**

In FontForge:
1. Open `Metrics -> Set Width`
2. Set uppercase letters to approximately `760`
3. Set digits to approximately `700`
4. Fine-tune narrow letters (`I`, `J`) and wide letters (`M`, `W`) by eye

Expected: no glyph looks cramped against its sidebearings in the metrics window.

- [ ] **Step 4: Align glyph heights**

In FontForge:
1. Open the metrics window
2. Compare `H`, `O`, `T`, `0`, `8`
3. Adjust any glyph whose cap height or baseline visibly drifts

Expected: top and bottom alignment feel consistent across the set.

- [ ] **Step 5: Save progress**

Inside FontForge:
1. `File -> Save`
2. Re-open `build/water-display.sfd` once to confirm it loads cleanly

Expected: traced outlines persist after reopening.

- [ ] **Step 6: Commit**

```bash
git add tools/font-builder/build/water-display.sfd
git commit -m "feat: trace water glyph outlines and spacing"
```

---

### Task 5: Export and validation

**Files:**
- Create: `tools/font-builder/validate_font.py`
- Produces: `tools/font-builder/output/water.ttf`
- Produces: `tools/font-builder/output/water.woff2`

**Interfaces:**
- Produces: installable/exportable font files with required character coverage

- [ ] **Step 1: Export the font from FontForge**

Inside FontForge:
1. Open `build/water-display.sfd`
2. `File -> Generate Fonts`
3. Export `output/water.ttf`
4. Export `output/water.woff2`

Expected: both files exist in `tools/font-builder/output/`.

- [ ] **Step 2: Create `tools/font-builder/validate_font.py`**

```python
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

    print(f"Family: {family}")
    print(f"Full name: {full}")
    print(f"Missing glyphs: {missing}")

    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 3: Run validation**

```bash
cd tools/font-builder
python3 validate_font.py output/water.woff2
```

Expected:
- exit code `0`
- `Missing glyphs: []`
- family/full names print correctly

- [ ] **Step 4: Smoke-test in a browser**

Create a temporary HTML file:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: "Water Display";
        src: url("./output/water.woff2") format("woff2");
      }
      body {
        background: #0a0a0a;
        color: #f5f5f7;
        font-family: system-ui, sans-serif;
        padding: 40px;
      }
      h1 {
        font-family: "Water Display", system-ui, sans-serif;
        font-size: 96px;
        margin: 0 0 20px;
      }
      p {
        font-family: "Water Display", system-ui, sans-serif;
        font-size: 48px;
      }
    </style>
  </head>
  <body>
    <h1>AMIT</h1>
    <p>WATER 0123456789</p>
  </body>
</html>
```

Open it in a browser from `tools/font-builder/` and confirm the glyphs render from the new font.

- [ ] **Step 5: Commit**

```bash
git add tools/font-builder/validate_font.py tools/font-builder/output/water.ttf tools/font-builder/output/water.woff2
git commit -m "feat: export and validate water webfont"
```

---

### Task 6: Site handoff preparation

**Files:**
- Modify: `README.md`
- Modify later in Phase 2: `public/fonts/water.woff2` (copy only after the site scaffold exists)

**Interfaces:**
- Produces: explicit handoff so the site phase can consume the finished font without redoing this work

- [ ] **Step 1: Update `README.md` Phase 1 notes**

Add a short note under the font cleanup section:

```md
- `tools/font-builder/output/water.woff2` now contains the traced and exported display font built from the cleaned glyph set.
```

- [ ] **Step 2: Copy the font into the site only when Phase 2 is ready**

Run **after** the Next.js scaffold creates `public/fonts/`:

```bash
cp tools/font-builder/output/water.woff2 public/fonts/water.woff2
```

Expected: `public/fonts/water.woff2` exists and replaces the placeholder file from the site-foundation phase.

- [ ] **Step 3: Verify the file is the real export**

Run:

```bash
ls -lh tools/font-builder/output/water.woff2
ls -lh public/fonts/water.woff2
```

Expected: both files exist and have matching non-zero sizes.

- [ ] **Step 4: Commit**

```bash
git add README.md public/fonts/water.woff2
git commit -m "chore: hand off final water font to site"
```

---

### Self-review

- Spec coverage:
  - Clean glyph PNGs as source: covered by Tasks 1–2.
  - Manual tracing in FontForge/Glyphs: covered by Tasks 3–4 using FontForge.
  - Export to `woff2`: covered by Task 5.
  - Site handoff to later phases: covered by Task 6.
- Placeholder scan:
  - No `TODO` / `TBD` placeholders remain in implementation steps.
- Type consistency:
  - `prepare_glyphs.py`, `fontforge-bootstrap.py`, and `validate_font.py` all use the same glyph map and output locations under `tools/font-builder/`.
