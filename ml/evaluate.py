from __future__ import annotations

import json
from pathlib import Path

import joblib

MODEL_PATH = Path(__file__).resolve().parents[1] / "backend" / "app" / "ml" / "models" / "news_classifier.joblib"


def main() -> None:
    if not MODEL_PATH.exists():
        print("No trained model found. Run ml/train.py first.")
        return

    bundle = joblib.load(MODEL_PATH)
    metadata = bundle.get("metadata", {})
    print(json.dumps({
        "model_version": metadata.get("model_version", "unknown"),
        "dataset": metadata.get("dataset", "unknown"),
        "thresholds": metadata.get("thresholds", {}),
        "metrics": metadata.get("metrics", {}),
    }, indent=2, default=str))


if __name__ == "__main__":
    main()
