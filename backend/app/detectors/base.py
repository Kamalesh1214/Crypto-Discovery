from abc import ABC, abstractmethod
from typing import List, Dict, Any

class DetectedArtefact:
    def __init__(
        self,
        algorithm: str,
        file: str,
        line: int,
        evidence: str,
        type: str = "Unknown / Not Determined",
        mode: str = "Unknown / Not Determined",
        key_size: str = "Unknown / Not Determined",
        library: str = "Unknown / Not Determined",
        confidence: str = "HIGH"
    ):
        self.algorithm = algorithm
        self.file = file.replace("\\", "/")
        self.line = line
        self.evidence = evidence.strip()
        self.type = type
        self.mode = mode
        self.key_size = key_size
        self.library = library
        self.confidence = confidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "algorithm": self.algorithm,
            "type": self.type,
            "mode": self.mode,
            "key_size": self.key_size,
            "library": self.library,
            "file": self.file,
            "line": self.line,
            "evidence": self.evidence,
            "confidence": self.confidence
        }

class BaseDetector(ABC):
    @abstractmethod
    def scan_file(self, file_path: str, relative_path: str) -> List[DetectedArtefact]:
        pass
