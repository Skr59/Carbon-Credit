"""
Download and materialise datasets to disk.

Examples::

    python scripts/download_data.py --source builtin
    python scripts/download_data.py --source hf --limit 10000

Writes JSONL/CSV files under ``datasets/processed`` for inspection.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from config import CONFIG  # noqa: E402
from data import build_dataset, save_csv, save_jsonl  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialise datasets.")
    parser.add_argument("--source", choices=["builtin", "hf"], default="builtin")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--augment", action="store_true")
    args = parser.parse_args()

    dataset = build_dataset(args.source, limit=args.limit, augment=args.augment)
    out_dir = CONFIG.data.processed_dir
    save_jsonl(dataset.records, out_dir / f"{args.source}.jsonl")
    save_csv(dataset.records, out_dir / f"{args.source}.csv")

    print(f"source        : {args.source}")
    print(f"records       : {len(dataset)}")
    print(f"class balance : {dataset.class_balance()}")
    print(f"saved         : {out_dir / (args.source + '.jsonl')}")
    print(f"saved         : {out_dir / (args.source + '.csv')}")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
