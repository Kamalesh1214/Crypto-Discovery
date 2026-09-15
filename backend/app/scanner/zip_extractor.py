import os
import zipfile
import shutil
import tempfile
from pathlib import Path
from typing import Tuple
from app.config import (
    MAX_UPLOAD_SIZE_BYTES,
    MAX_EXTRACTED_SIZE_BYTES,
    MAX_FILES_COUNT,
    MAX_COMPRESSION_RATIO
)

class ZipSecurityError(Exception):
    """Custom exception raised when an uploaded ZIP violates security policies."""
    pass

class SafeZipExtractor:
    @staticmethod
    def extract(zip_path: str, extract_to: str = None) -> Tuple[str, int]:
        """
        Safely extracts an untrusted ZIP archive into a target directory.
        Returns (extracted_folder_path, total_files_extracted).
        Raises ZipSecurityError if any security constraint is violated.
        """
        if not os.path.exists(zip_path):
            raise ZipSecurityError("ZIP archive file not found.")

        # Check raw archive file size
        archive_size = os.path.getsize(zip_path)
        if archive_size > MAX_UPLOAD_SIZE_BYTES:
            raise ZipSecurityError(
                f"Uploaded file size ({archive_size} bytes) exceeds maximum permitted limit ({MAX_UPLOAD_SIZE_BYTES} bytes)."
            )

        if not zipfile.is_zipfile(zip_path):
            raise ZipSecurityError("Invalid or corrupted ZIP archive format.")

        dest_dir = extract_to or tempfile.mkdtemp(prefix="cryptolens_scan_")
        dest_dir_abs = os.path.abspath(dest_dir)
        os.makedirs(dest_dir_abs, exist_ok=True)

        try:
            with zipfile.ZipFile(zip_path, 'r') as zf:
                infolist = zf.infolist()

                # Check file count
                if len(infolist) > MAX_FILES_COUNT:
                    raise ZipSecurityError(
                        f"Archive contains {len(infolist)} files, exceeding limit of {MAX_FILES_COUNT} files."
                    )

                # Pre-scan headers to prevent decompression bombs & path traversal
                total_uncompressed_size = 0
                for member in infolist:
                    # Reject symlinks / irregular members
                    # (In zipfile, high bits of external_attr identify file type: 0xA000 indicates symlink)
                    if (member.external_attr >> 16) & 0o120000 == 0o120000:
                        raise ZipSecurityError(f"Symlinks are disallowed for security reasons: {member.filename}")

                    # Validate path traversal (Zip Slip vulnerability)
                    member_path = member.filename
                    # Normalize and ensure no leading slash or drive letter or parent traversal
                    clean_path = os.path.normpath(member_path)
                    if os.path.isabs(clean_path) or clean_path.startswith("..") or ("../" in member_path) or ("..\\" in member_path):
                        raise ZipSecurityError(
                            f"Path traversal detected in archive entry: {member.filename}"
                        )

                    target_path = os.path.abspath(os.path.join(dest_dir_abs, clean_path))
                    # Commonpath check guarantees target is strictly inside destination
                    if os.path.commonpath([dest_dir_abs, target_path]) != dest_dir_abs:
                        raise ZipSecurityError(
                            f"Illegal path escape detected: {member.filename}"
                        )

                    total_uncompressed_size += member.file_size
                    if total_uncompressed_size > MAX_EXTRACTED_SIZE_BYTES:
                        raise ZipSecurityError(
                            f"Extracted content exceeds maximum limit of {MAX_EXTRACTED_SIZE_BYTES} bytes (possible zip bomb)."
                        )

                    # Compression ratio check for archive bomb detection
                    if member.compress_size > 0:
                        ratio = member.file_size / member.compress_size
                        if ratio > MAX_COMPRESSION_RATIO and member.file_size > 1024 * 1024:
                            raise ZipSecurityError(
                                f"Abnormal compression ratio ({ratio:.1f}:1) detected on {member.filename} (archive bomb defense)."
                            )

                # Perform safe extraction
                extracted_count = 0
                for member in infolist:
                    # Ignore directory-only entries
                    if member.is_dir():
                        continue

                    clean_path = os.path.normpath(member.filename)
                    target_path = os.path.abspath(os.path.join(dest_dir_abs, clean_path))
                    os.makedirs(os.path.dirname(target_path), exist_ok=True)

                    with zf.open(member, 'r') as source, open(target_path, 'wb') as target:
                        shutil.copyfileobj(source, target)
                    extracted_count += 1

                return dest_dir_abs, extracted_count

        except Exception as e:
            # Clean up on failure
            if os.path.exists(dest_dir_abs):
                shutil.rmtree(dest_dir_abs, ignore_errors=True)
            if isinstance(e, ZipSecurityError):
                raise
            raise ZipSecurityError(f"Failed to extract ZIP archive: {str(e)}")
