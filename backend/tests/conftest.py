import os
import tempfile
from pathlib import Path


TEST_DATABASE_DIR = tempfile.mkdtemp(prefix="dormdex-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{(Path(TEST_DATABASE_DIR) / 'tests.db').as_posix()}"
os.environ["GEMINI_API_KEY"] = ""
os.environ["RESEND_API_KEY"] = ""