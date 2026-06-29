#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from skimage.measure import approximate_polygon, find_contours
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent
NORMALIZED_DIR = ROOT / "build" / "normalized"
OUTPUT_DIR = ROOT / "output"
MAP_PATH = ROOT / "glyph-map.json"
METRICS_PATH = ROOT / "font-metrics.json"
DEFAULT_PALETTE = [(0.86, 0.72, 0.49, 1.0)]
SPECIMEN_RGBA = (219, 184, 125, 255)


def polygon_area(points: list[tuple[float, float]]) -> float:
    area = 0.0
    for i, (x1, y1) in enumerate(points):
        x2, y2 = points[(i + 1) % len(points)]
        area += x1 * y2 - x2 * y1
    return area / 2.0


def point_in_polygon(point: tuple[float, float], polygon: list[tuple[float, float]]) -> bool:
    x, y = point
    inside = False
    for i in range(len(polygon)):
        x1, y1 = polygon[i]
        x2, y2 = polygon[(i + 1) % len(polygon)]
        if (y1 > y) != (y2 > y):
            cross = (x2 - x1) * (y - y1) / ((y2 - y1) or 1e-9) + x1
            if x < cross:
                inside = not inside
    return inside


def extract_polygons_from_mask(mask: np.ndarray, tolerance: float) -> list[list[tuple[float, float]]]:
    padded = np.pad(mask.astype(float), 1, constant_values=0)
    raw_contours = find_contours(padded, 0.5)
    polygons: list[list[tuple[float, float]]] = []

    for contour in raw_contours:
        # contour comes as row, col pairs on a padded image
        points = [(float(col - 1), float(row - 1)) for row, col in contour]
        simplified = approximate_polygon(np.array(points), tolerance=tolerance)
        if len(simplified) < 4:
            continue
        poly = [(float(x), float(y)) for x, y in simplified[:-1]]
        if len(poly) >= 3:
            polygons.append(poly)

    return polygons


def glyph_from_image(path: Path, metrics: dict[str, float], advance_width: int):
    image = Image.open(path).convert("RGBA")
    alpha = np.array(image.getchannel("A")) > 0
    ys, xs = np.where(alpha)
    if len(xs) == 0:
        raise ValueError(f"{path.name} is empty")

    min_x, max_x = xs.min(), xs.max()
    min_y, max_y = ys.min(), ys.max()
    bbox_width = max_x - min_x + 1
    bbox_height = max_y - min_y + 1
    scale = metrics["capHeight"] / bbox_height
    left = metrics["sideBearing"]
    baseline = 0

    polygons = extract_polygons_from_mask(alpha, metrics["simplifyTolerance"])
    transformed: list[tuple[list[tuple[int, int]], int]] = []
    for poly in polygons:
        tpoly = []
        for x, y in poly:
            tx = int(round((x - min_x) * scale + left))
            ty = int(round((max_y - y) * scale + baseline))
            tpoly.append((tx, ty))
        transformed.append((tpoly, 0))

    # Determine nesting depth to set contour winding.
    depths = []
    for i, (poly, _) in enumerate(transformed):
        point = poly[0]
        depth = 0
        for j, (other, _) in enumerate(transformed):
            if i == j:
                continue
            if point_in_polygon(point, other):
                depth += 1
        depths.append(depth)

    pen = TTGlyphPen(None)
    for (poly, _), depth in sorted(zip(transformed, depths), key=lambda item: abs(polygon_area(item[0][0])), reverse=True):
        is_hole = depth % 2 == 1
        area = polygon_area(poly)
        should_clockwise = not is_hole
        clockwise = area < 0
        if clockwise != should_clockwise:
            poly = list(reversed(poly))

        pen.moveTo(poly[0])
        for pt in poly[1:]:
            pen.lineTo(pt)
        pen.closePath()

    glyph = pen.glyph()
    width = max(advance_width, int(round(bbox_width * scale + metrics["sideBearing"] * 2)))
    return glyph, width


def build_font():
    metrics = json.loads(METRICS_PATH.read_text())
    glyph_map = json.loads(MAP_PATH.read_text())["glyphs"]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    glyph_order = [".notdef"] + [item["char"] for item in glyph_map] + ["space"]
    fb = FontBuilder(metrics["unitsPerEm"], isTTF=True)
    fb.setupGlyphOrder(glyph_order)

    cmap = {int(item["unicode"].replace("U+", ""), 16): item["char"] for item in glyph_map}
    cmap[0x0020] = "space"
    glyphs = {}
    horizontal_metrics = {}

    notdef_pen = TTGlyphPen(None)
    notdef_pen.moveTo((50, 0))
    notdef_pen.lineTo((50, 700))
    notdef_pen.lineTo((450, 700))
    notdef_pen.lineTo((450, 0))
    notdef_pen.closePath()
    glyphs[".notdef"] = notdef_pen.glyph()
    horizontal_metrics[".notdef"] = (500, 0)

    for item in glyph_map:
        advance = metrics["digitAdvanceWidth"] if item["char"].isdigit() else metrics["defaultAdvanceWidth"]
        glyph, width = glyph_from_image(NORMALIZED_DIR / item["filename"], metrics, advance)
        glyphs[item["char"]] = glyph
        horizontal_metrics[item["char"]] = (width, 0)

    space_pen = TTGlyphPen(None)
    glyphs["space"] = space_pen.glyph()
    horizontal_metrics["space"] = (300, 0)

    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(horizontal_metrics)
    fb.setupHorizontalHeader(ascent=metrics["ascender"], descent=abs(metrics["descender"]))
    color_layers = {
        item["char"]: [(item["char"], 0)]
        for item in glyph_map
    }
    fb.setupCPAL([DEFAULT_PALETTE])
    fb.setupCOLR(color_layers)
    fb.setupNameTable(
        {
            "familyName": metrics["familyName"],
            "styleName": metrics["styleName"],
            "uniqueFontIdentifier": f'{metrics["familyName"]} {metrics["version"]}',
            "fullName": f'{metrics["familyName"]} {metrics["styleName"]}',
            "psName": metrics["fontName"],
            "version": metrics["version"],
        }
    )
    fb.setupOS2(
        sTypoAscender=metrics["ascender"],
        sTypoDescender=metrics["descender"],
        usWinAscent=metrics["ascender"],
        usWinDescent=abs(metrics["descender"]),
        sxHeight=0,
        sCapHeight=metrics["capHeight"],
    )
    fb.setupPost()
    fb.setupMaxp()

    ttf_path = OUTPUT_DIR / "water.ttf"
    fb.save(str(ttf_path))

    font = TTFont(str(ttf_path))
    font.flavor = "woff2"
    woff2_path = OUTPUT_DIR / "water.woff2"
    font.save(str(woff2_path))

    specimen = Image.new("RGBA", (1400, 500), (10, 10, 10, 255))
    draw = ImageDraw.Draw(specimen)
    try:
        title_font = ImageFont.truetype(str(ttf_path), 140)
        body_font = ImageFont.truetype(str(ttf_path), 96)
    except OSError:
        title_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
    draw.text((60, 60), "AMIT", fill=SPECIMEN_RGBA, font=title_font)
    draw.text((60, 260), "WATER 0123456789", fill=SPECIMEN_RGBA, font=body_font)
    specimen.save(OUTPUT_DIR / "specimen.png")

    print(f"Built {ttf_path}")
    print(f"Built {woff2_path}")
    print(f"Built {OUTPUT_DIR / 'specimen.png'}")


if __name__ == "__main__":
    build_font()
