import unittest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

class TestCodeSentinel(unittest.TestCase):
    def test_app_loads(self):
        from app.main import app
        self.assertIsNotNone(app)

    def test_settings(self):
        from app.core.config import settings
        self.assertEqual(settings.PROJECT_NAME, "CODE SENTINEL")

if __name__ == "__main__":
    unittest.main()
