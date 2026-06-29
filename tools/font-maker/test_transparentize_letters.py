import unittest

from PIL import Image

from transparentize_letters import make_black_background_transparent


class TransparentizeLettersTest(unittest.TestCase):
    def test_black_pixels_become_transparent_while_glyph_pixels_stay_opaque(self):
        img = Image.new("RGBA", (2, 1), (0, 0, 0, 255))
        img.putpixel((1, 0), (220, 200, 170, 255))

        out = make_black_background_transparent(img, threshold=12)

        self.assertEqual(out.getpixel((0, 0)), (0, 0, 0, 0))
        self.assertEqual(out.getpixel((1, 0)), (220, 200, 170, 255))


if __name__ == "__main__":
    unittest.main()
