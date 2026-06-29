#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent
LETTERS_DIR = ROOT.parent / "font-maker" / "letters"
OUTPUT_DIR = ROOT / "output" / "wordmarks"


def load_letter(char: str, source_dir: Path) -> Image.Image:
    path = source_dir / f"{char}.png"
    if not path.exists():
        raise FileNotFoundError(f"Missing glyph image for {char}: {path}")
    return Image.open(path).convert("RGBA")


def trim_image(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    if bbox is None:
        raise ValueError("Image is empty")
    return img.crop(bbox)


def build_wordmark(
    text: str,
    source_dir: Path = LETTERS_DIR,
    target_height: int = 420,
    spacing: int = 34,
    shadow_offset: tuple[int, int] = (0, 28),
) -> Image.Image:
    letters: list[Image.Image] = []
    for index, char in enumerate(text):
        glyph = trim_image(load_letter(char.upper(), source_dir))
        scale = target_height / glyph.height
        resized = glyph.resize(
            (max(1, round(glyph.width * scale)), target_height),
            Image.Resampling.LANCZOS,
        )
        # slight baseline wobble keeps it closer to real photographed letters
        wobble = (index % 3 - 1) * 8
        canvas = Image.new("RGBA", (resized.width, target_height + 40), (0, 0, 0, 0))
        canvas.paste(resized, (0, max(0, 20 + wobble)), resized)
        letters.append(canvas)

    total_width = sum(letter.width for letter in letters) + spacing * (len(letters) - 1)
    total_height = max(letter.height for letter in letters) + 80

    base = Image.new("RGBA", (total_width + 120, total_height), (0, 0, 0, 0))
    alpha_accumulator = Image.new("L", base.size, 0)

    x = 60
    for letter in letters:
        y = (base.height - letter.height) // 2
        base.paste(letter, (x, y), letter)
        alpha_accumulator.paste(letter.getchannel("A"), (x, y))
        x += letter.width + spacing

    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    glow_mask = alpha_accumulator.filter(ImageFilter.GaussianBlur(22))
    glow.paste((232, 214, 188, 110), (0, 0), glow_mask)

    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_mask = alpha_accumulator.filter(ImageFilter.GaussianBlur(18))
    shadow_pos = ImageChops.offset(shadow_mask, shadow_offset[0], shadow_offset[1])
    shadow.paste((5, 8, 12, 145), (0, 0), shadow_pos)

    composite = Image.alpha_composite(shadow, glow)
    composite = Image.alpha_composite(composite, base)
    return composite


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("text", help="Uppercase word to compose from the letter PNGs")
    parser.add_argument("--out", help="Output PNG path", default=None)
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = Path(args.out) if args.out else OUTPUT_DIR / f"{args.text.lower()}.png"
    image = build_wordmark(args.text)
    image.save(out_path)
    print(f"Built wordmark {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
