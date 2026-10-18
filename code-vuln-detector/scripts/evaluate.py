"""
Evaluate a trained model against a held-out split.

Examples::

    python scripts/evaluate.py --backend heuristic
    python scripts/evaluate.py --backend transformer --source builtin

Prints a metrics table and (optionally) writes a JSON report under
``artifacts/eval_report.json``.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from config import CONFIG  # noqa: E402
from data import build_dataset  # noqa: E402
from evaluation import best_threshold, classification_metrics, format_metrics  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate a detector backend.")
    parser.add_argument("--backend", choices=["heuristic", "transformer"], default="heuristic")
    parser.add_argument("--source", choices=["builtin", "hf"], default="builtin")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--split", choices=["val", "test"], default="test")
    parser.add_argument("--out", default=str(Path("artifacts") / "eval_report.json"))
    args = parser.parse_args()

    dataset = build_dataset(args.source, limit=args.limit)
    train_ds, val_ds, test_ds = dataset.split(
        train=CONFIG.data.train_ratio, val=CONFIG.data.val_ratio, seed=CONFIG.train.seed
    )
    eval_ds = val_ds if args.split == "val" else test_ds

    if args.backend == "heuristic":
        from models.heuristic import HeuristicClassifier

        clf = HeuristicClassifier().fit(train_ds.texts(), train_ds.labels())
        scores = clf.predict_proba_batch(eval_ds.texts())
    else:
        from models.codebert_classifier import VulnerabilityClassifier

        clf = VulnerabilityClassifier.load(CONFIG.api.model_path)
        scores = clf.predict_proba_batch(eval_ds.texts())

    metrics = classification_metrics(eval_ds.labels(), scores)
    best_t, best_v = best_threshold(eval_ds.labels(), scores, metric="f1")

    print(f"backend : {args.backend}")
    print(f"split   : {args.split} ({len(eval_ds)} samples)")
    print("metrics :", format_metrics(metrics))
    print(f"best F1 : {best_v:.4f} @ threshold={best_t:.2f}")

    report = {
        "backend": args.backend,
        "source": args.source,
        "split": args.split,
        "n": len(eval_ds),
        "metrics@0.5": metrics,
        "best_threshold": best_t,
        "best_f1": best_v,
    }
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"report  : {args.out}")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
