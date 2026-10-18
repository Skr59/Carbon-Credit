"""
Ablation / comparison benchmark.

Compares three detection strategies on the same evaluation split:

1. **rules-only**   - deterministic static rule engine.
2. **model-only**   - the ML classifier probability.
3. **hybrid**       - model OR rules (the deployed configuration).

This directly supports the project's evaluation chapter: it quantifies the
*marginal contribution* of fusing static analysis with the learned model.

Example::

    python scripts/benchmark.py --source builtin --backend heuristic
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from config import CONFIG  # noqa: E402
from data import build_dataset  # noqa: E402
from evaluation import classification_metrics, format_metrics  # noqa: E402
from explanation.rules import RuleEngine  # noqa: E402


def _rule_scores(engine: RuleEngine, texts: List[str], langs: List[str]) -> List[float]:
    """Map rule findings to a pseudo-probability for metric computation."""
    scores: List[float] = []
    for code, lang in zip(texts, langs):
        findings = engine.scan(code, lang)
        if not findings:
            scores.append(0.0)
        else:
            # Use the max finding confidence as the score.
            scores.append(max(f.confidence for f in findings))
    return scores


def _hybrid_scores(model_scores: List[float], rule_scores: List[float]) -> List[float]:
    """Combine model and rules: any strong rule hit forces vulnerability."""
    out: List[float] = []
    for m, r in zip(model_scores, rule_scores):
        out.append(max(m, r))
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare detection strategies.")
    parser.add_argument("--backend", choices=["heuristic", "transformer"], default="heuristic")
    parser.add_argument("--source", choices=["builtin", "hf"], default="builtin")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--out", default=str(Path("artifacts") / "benchmark.json"))
    args = parser.parse_args()

    dataset = build_dataset(args.source, limit=args.limit)
    train_ds, val_ds, test_ds = dataset.split(
        train=CONFIG.data.train_ratio, val=CONFIG.data.val_ratio, seed=CONFIG.train.seed
    )
    labels = test_ds.labels()
    texts = test_ds.texts()
    langs = [str(r["language"]) for r in test_ds.records]

    if args.backend == "heuristic":
        from models.heuristic import HeuristicClassifier

        clf = HeuristicClassifier().fit(train_ds.texts(), train_ds.labels())
        model_scores = clf.predict_proba_batch(texts)
    else:
        from models.codebert_classifier import VulnerabilityClassifier

        clf = VulnerabilityClassifier.load(CONFIG.api.model_path)
        model_scores = clf.predict_proba_batch(texts)

    engine = RuleEngine()
    rule_scores = _rule_scores(engine, texts, langs)
    hybrid = _hybrid_scores(model_scores, rule_scores)

    table = {
        "rules-only": classification_metrics(labels, rule_scores),
        "model-only": classification_metrics(labels, model_scores),
        "hybrid": classification_metrics(labels, hybrid),
    }

    print(f"backend={args.backend} source={args.source} n={len(labels)}\n")
    for name, m in table.items():
        print(f"{name:<12} {format_metrics(m)}")

    report = {"backend": args.backend, "source": args.source, "n": len(labels), "table": table}
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nreport -> {args.out}")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
