import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

from build_font import DEFAULT_PALETTE, extract_polygons_from_mask


class BuildFontTest(unittest.TestCase):
    def test_extract_polygons_returns_outer_and_inner_contours(self):
        mask = np.zeros((64, 64), dtype=bool)
        mask[8:56, 8:56] = True
        mask[24:40, 24:40] = False

        polygons = extract_polygons_from_mask(mask, tolerance=1.0)

        self.assertGreaterEqual(len(polygons), 2)
        self.assertTrue(all(len(poly) >= 3 for poly in polygons))

    def test_default_palette_uses_rgba_color(self):
        self.assertEqual(len(DEFAULT_PALETTE), 1)
        self.assertEqual(len(DEFAULT_PALETTE[0]), 4)
        self.assertTrue(all(0 <= channel <= 1 for channel in DEFAULT_PALETTE[0]))


if __name__ == "__main__":
    unittest.main()
