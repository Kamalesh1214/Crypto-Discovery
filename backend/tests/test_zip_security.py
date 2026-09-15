import os
import zipfile
import pytest
import tempfile
from app.scanner.zip_extractor import SafeZipExtractor, ZipSecurityError
from app.config import MAX_FILES_COUNT

def test_valid_zip_extraction(tmp_path):
    zip_path = str(tmp_path / "valid.zip")
    with zipfile.ZipFile(zip_path, "w") as zf:
        zf.writestr("test.py", "print('hello')")
        zf.writestr("subdir/nested.py", "import hashlib")

    extract_dest = str(tmp_path / "extracted")
    dest_dir, count = SafeZipExtractor.extract(zip_path, extract_dest)
    
    assert os.path.exists(os.path.join(dest_dir, "test.py"))
    assert os.path.exists(os.path.join(dest_dir, "subdir", "nested.py"))
    assert count == 2

def test_invalid_corrupt_zip(tmp_path):
    corrupt_path = str(tmp_path / "corrupt.zip")
    with open(corrupt_path, "wb") as f:
        f.write(b"NOT_A_ZIP_FILE_RANDOM_BYTES_1234567890")

    with pytest.raises(ZipSecurityError) as exc:
        SafeZipExtractor.extract(corrupt_path)
    assert "Invalid or corrupted ZIP" in str(exc.value)

def test_zip_path_traversal_zip_slip(tmp_path):
    traversal_zip = str(tmp_path / "traversal.zip")
    with zipfile.ZipFile(traversal_zip, "w") as zf:
        # Intentionally craft a zip entry with path traversal
        zf.writestr("../../evil.txt", "MALICIOUS CONTENT")

    extract_dest = str(tmp_path / "safe_box")
    with pytest.raises(ZipSecurityError) as exc:
        SafeZipExtractor.extract(traversal_zip, extract_dest)
    assert "traversal" in str(exc.value).lower() or "escape" in str(exc.value).lower()
    # Verify the file was NEVER written outside
    assert not os.path.exists(str(tmp_path / "evil.txt"))

def test_empty_zip(tmp_path):
    empty_zip = str(tmp_path / "empty.zip")
    with zipfile.ZipFile(empty_zip, "w"):
        pass

    dest_dir, count = SafeZipExtractor.extract(empty_zip)
    assert count == 0
    assert os.path.exists(dest_dir)

def test_excessive_file_count_rejection(tmp_path, monkeypatch):
    # Temporarily set max files count to 5 for test
    monkeypatch.setattr("app.scanner.zip_extractor.MAX_FILES_COUNT", 5)
    bomb_zip = str(tmp_path / "too_many_files.zip")
    with zipfile.ZipFile(bomb_zip, "w") as zf:
        for i in range(10):
            zf.writestr(f"file_{i}.txt", "test")

    with pytest.raises(ZipSecurityError) as exc:
        SafeZipExtractor.extract(bomb_zip)
    assert "exceeding limit" in str(exc.value)
