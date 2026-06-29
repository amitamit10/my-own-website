# Water Font Builder

This folder contains the local-only workflow for turning the cleaned PNG glyphs
from `../font-maker/letters/` into a color webfont without installing the font
globally on the machine.

## Local environment

```bash
python3 -m venv .venv
.venv/bin/pip install fonttools pillow numpy scipy
```

## Inputs

- `../font-maker/letters/*.png` — cleaned transparent source glyphs
- `glyph-map.json` — character to Unicode mapping
- `font-metrics.json` — baseline font metrics and spacing defaults

## Outputs

- `build/normalized/` — cropped working PNGs prepared for vectorization
- `build/glyph-bounds.json` — normalized glyph bounds
- `output/water.ttf` — local TrueType build
- `output/water.woff2` — local color webfont build
- `output/specimen.png` — rendered proof image using the water-tone palette
- `output/wordmarks/*.png` — real-photo text assets for hero/section titles

## Workflow summary

1. Run `prepare_glyphs.py` to normalize the PNGs.
2. Run `build_font.py` to vectorize the normalized glyphs and export TTF/WOFF2 with `COLR/CPAL` color tables.
3. Run `compose_wordmark.py <TEXT>` to build image-based website titles from the original glyph PNGs.
4. Run `validate_font.py` to confirm character coverage and color-table output.

## Recommended website use

The generated font is useful for fallback and secondary accents, but it still flattens the photographed water effect compared with the real glyph PNGs.

For the website:

- Use `output/wordmarks/amit.png` for the hero/name treatment
- Use image wordmarks sparingly for one or two standout section titles such as `PROJECTS`
- Use `water.woff2` for secondary display text only when a scalable text layer is more important than preserving the exact photographed texture

Example:

```bash
.venv/bin/python compose_wordmark.py AMIT
.venv/bin/python compose_wordmark.py PROJECTS
```
