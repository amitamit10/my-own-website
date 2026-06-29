import tempfile
import unittest
from pathlib import Path

from PIL import Image

from compose_wordmark import build_wordmark


class ComposeWordmarkTest(unittest.TestCase):
    def test_build_wordmark_creates_non_empty_rgba_image(self):
        with tempfile.TemporaryDirectory() as tmp:
            src_dir = Path(tmp) / "letters"
            src_dir.mkdir()

            for char in "AB":
                img = Image.new("RGBA", (80, 100), (0, 0, 0, 0))
                for x in range(15, 65):
                    for y in range(20, 80):
                        img.putpixel((x, y), (220, 200, 170, 255))
                img.save(src_dir / f"{char}.png")

            wordmark = build_wordmark("AB", src_dir)

            self.assertEqual(wordmark.mode, "RGBA")
            self.assertGreater(wordmark.size[0], 0)
            self.assertGreater(wordmark.size[1], 0)
            self.assertIsNotNone(wordmark.getbbox())


if __name__ == "__main__":
    unittest.main()
