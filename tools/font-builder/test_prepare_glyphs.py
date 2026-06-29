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
            self.assertGreater(bounds["width"], 0)
            self.assertGreater(bounds["height"], 0)
            self.assertIsNotNone(out.getbbox())


if __name__ == "__main__":
    unittest.main()
