"""
Central configuration for the Autonomous Code Vulnerability Detection System.

Values can be overridden via environment variables or a local `.env` file.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # pragma: no cover - dotenv is optional
    pass


PROJECT_ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
DATASETS_DIR = PROJECT_ROOT / "datasets"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
DATASETS_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class ModelConfig:
    """Configuration for the transformer based classifier."""

    # Base encoder. CodeBERT is the default; GraphCodeBERT / StarCoder work too.
    model_name: str = os.getenv("VULN_MODEL_NAME", "microsoft/codebert-base")
    num_labels: int = 2
    max_seq_length: int = 400
    dropout: float = 0.1
    hidden_size: int = 768

    # Labelling convention used across the project.
    id2label: Dict[int, str] = field(
        default_factory=lambda: {0: "SAFE", 1: "VULNERABLE"}
    )
    label2id: Dict[str, int] = field(
        default_factory=lambda: {"SAFE": 0, "VULNERABLE": 1}
    )


@dataclass
class TrainConfig:
    """Hyper-parameters for the fine-tuning pipeline."""

    output_dir: str = str(ARTIFACTS_DIR / "codebert-vuln")
    epochs: int = 4
    batch_size: int = 8
    eval_batch_size: int = 16
    learning_rate: float = 2e-5
    weight_decay: float = 0.01
    warmup_ratio: float = 0.1
    max_grad_norm: float = 1.0
    seed: int = 42
    fp16: bool = os.getenv("VULN_FP16", "0") == "1"
    gradient_accumulation_steps: int = 1
    early_stopping_patience: int = 2
    metric_for_best_model: str = "f1"


@dataclass
class DataConfig:
    """Dataset configuration."""

    # HuggingFace dataset identifiers.
    hf_dataset: str = "google/code_x_glue_cc_code_refinement"
    devign_repo_dataset: str = "code_x_glue_cc_defect_detection"

    # Local cache paths.
    raw_dir: Path = DATASETS_DIR / "raw"
    processed_dir: Path = DATASETS_DIR / "processed"

    # Splitting.
    train_ratio: float = 0.8
    val_ratio: float = 0.1
    test_ratio: float = 0.1


@dataclass
class APIConfig:
    host: str = os.getenv("VULN_API_HOST", "0.0.0.0")
    port: int = int(os.getenv("VULN_API_PORT", "8000"))
    title: str = "Autonomous Code Vulnerability Detection API"
    version: str = "1.0.0"
    model_path: str = os.getenv("VULN_MODEL_PATH", str(ARTIFACTS_DIR / "codebert-vuln"))
    max_code_bytes: int = 200_000


@dataclass
class AppConfig:
    model: ModelConfig = field(default_factory=ModelConfig)
    train: TrainConfig = field(default_factory=TrainConfig)
    data: DataConfig = field(default_factory=DataConfig)
    api: APIConfig = field(default_factory=APIConfig)

    supported_languages: List[str] = field(
        default_factory=lambda: ["c", "cpp", "python", "java", "javascript"]
    )


CONFIG = AppConfig()
