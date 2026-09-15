import os
from pathlib import Path
from typing import List, Dict, Any
from app.config import IGNORED_DIRS, ALLOWED_EXTENSIONS

class DiscoveredFile:
    def __init__(self, relative_path: str, absolute_path: str, file_type: str, size: int):
        self.relative_path = relative_path.replace("\\", "/")
        self.absolute_path = absolute_path
        self.file_type = file_type
        self.size = size

    def to_dict(self) -> Dict[str, Any]:
        return {
            "relative_path": self.relative_path,
            "file_type": self.file_type,
            "size": self.size
        }

def is_binary_file(file_path: str) -> bool:
    """Check if a file appears to be binary by reading the first 1024 bytes for null bytes."""
    try:
        with open(file_path, "rb") as f:
            chunk = f.read(1024)
            if b"\x00" in chunk:
                return True
    except Exception:
        return True
    return False

def discover_files(root_dir: str) -> List[DiscoveredFile]:
    """
    Recursively scans the directory for relevant source code and config files,
    pruning ignored directories and binary files.
    """
    discovered: List[DiscoveredFile] = []
    root_path = Path(root_dir).resolve()

    for dirpath, dirnames, filenames in os.walk(root_path):
        # In-place modify dirnames to skip ignored folders
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS and not d.startswith(".")]

        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            lower_name = fname.lower()

            # Determine file type
            file_type = None
            if ext == ".py":
                file_type = "python"
            elif ext == ".java":
                file_type = "java"
            elif ext in [".json", ".yaml", ".yml", ".xml", ".properties", ".ini", ".conf"] or \
                 lower_name in ["requirements.txt", "package.json", "pom.xml", "build.gradle"]:
                file_type = "config"
            elif ext in ALLOWED_EXTENSIONS:
                file_type = "other"

            if not file_type:
                continue

            full_path = os.path.join(dirpath, fname)
            try:
                size = os.path.getsize(full_path)
                # Ignore very large files (> 5MB each) as they are likely data or compiled assets
                if size > 5 * 1024 * 1024:
                    continue

                if is_binary_file(full_path):
                    continue

                rel_path = os.path.relpath(full_path, root_path)
                discovered.append(DiscoveredFile(rel_path, full_path, file_type, size))
            except Exception:
                continue

    return discovered
