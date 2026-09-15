import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "cryptolens.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Security limits for uploaded ZIP files
MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024  # 100 MB
MAX_EXTRACTED_SIZE_BYTES = 250 * 1024 * 1024  # 250 MB
MAX_FILES_COUNT = 2000
MAX_COMPRESSION_RATIO = 100.0  # Archive bomb defense

ALLOWED_EXTENSIONS = {
    ".py", ".java", ".json", ".yaml", ".yml", ".xml",
    ".txt", ".cfg", ".ini", ".properties", ".conf"
}

IGNORED_DIRS = {
    ".git", "node_modules", "venv", ".venv", "env", ".env",
    "__pycache__", "dist", "build", ".idea", ".vscode",
    ".pytest_cache", ".tox", "eggs", ".egg-info"
}

DISCLAIMER_PROTOTYPE = "CryptoLens uses prototype assessment rules and is not a replacement for a formal security audit."
DISCLAIMER_EXPOSURE = "Potential exposure is a prototype assessment based on available scan evidence and configurable rules. It is not a prediction of actual data leakage."
DISCLAIMER_MIGRATION = "Migration estimates are approximate prototype estimates and should not be treated as guaranteed project timelines."
DISCLAIMER_PQC = "PQC migration assessment identifies potential candidates for further analysis; it does not automatically migrate production software."
