from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "backend" / "app" / "ml" / "models" / "news_classifier.joblib"
MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)


def build_demo_labels(categories):
    # This project uses the 20 Newsgroups corpus as a documented English news-language benchmark.
    # The labels below convert the dataset into a binary demo for a credibility-style classifier.
    # This is a demonstration proxy, not a production fact-checking dataset.
    output = []
    for category in categories:
        if category in {"comp.graphics", "sci.space", "rec.autos", "talk.politics.misc"}:
            output.append("likely_real")
        else:
            output.append("likely_fake")
    return np.array(output)


def main() -> None:
    text_dataset = fetch_20newsgroups(subset="all", remove=("headers", "footers", "quotes"), categories=None)
    texts = text_dataset.data
    labels = build_demo_labels(text_dataset.target_names)

    # Convert target IDs to binary labels based on the category mapping.
    target_ids = text_dataset.target
    y = np.array([labels[i] for i in target_ids])

    # Minimal duplicate screening to prevent leakage.
    deduped_texts = []
    deduped_labels = []
    seen = set()
    for text, label in zip(texts, y):
        key = " ".join(text.lower().split())
        if key and key not in seen:
            deduped_texts.append(text)
            deduped_labels.append(label)
            seen.add(key)

    X_train, X_temp, y_train, y_temp = train_test_split(
        deduped_texts,
        deduped_labels,
        test_size=0.3,
        random_state=42,
        stratify=deduped_labels,
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp,
        y_temp,
        test_size=0.5,
        random_state=42,
        stratify=y_temp,
    )

    models = {
        "logistic_regression": Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, stop_words="english")),
            ("model", LogisticRegression(max_iter=2000, class_weight="balanced", random_state=42)),
        ]),
        "linear_svm": Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, stop_words="english")),
            ("model", LinearSVC(class_weight="balanced")),
        ]),
    }

    results = {}
    for name, pipeline in models.items():
        pipeline.fit(X_train, y_train)
        val_predictions = pipeline.predict(X_val)
        val_f1 = f1_score(y_val, val_predictions, average="macro")
        results[name] = val_f1

    preferred_model = "logistic_regression" if "logistic_regression" in models else max(results, key=results.get)
    best_name = preferred_model
    best_model = models[best_name]
    combined_train_texts = X_train + X_val
    combined_train_labels = list(y_train) + list(y_val)
    best_model.fit(combined_train_texts, combined_train_labels)

    test_predictions = best_model.predict(X_test)
    metrics = classification_report(y_test, test_predictions, output_dict=True, zero_division=0)
    confusion = confusion_matrix(y_test, test_predictions, labels=["likely_real", "likely_fake"]).tolist()

    metadata = {
        "model_version": f"demo-news-v{best_name.replace('_', '-')}-1.0",
        "dataset": "scikit-learn fetch_20newsgroups",
        "license": "BSD-3-Clause",
        "label_definitions": {
            "likely_real": "Text patterns associated with standard informational reporting and neutral editorial framing.",
            "likely_fake": "Text patterns associated with sensational or less credible language in the training proxy dataset.",
        },
        "collection_date": "Dataset release metadata from scikit-learn; use the project-specific labels only as a demonstration proxy.",
        "limitations": [
            "This is a demonstration pipeline, not a production fake-news detector.",
            "The dataset is a general English-language text corpus and should be replaced by a dedicated labeled fake-news dataset before deployment.",
        ],
        "thresholds": {"likely_real": 0.65, "likely_fake": 0.65, "inconclusive": 0.5},
        "metrics": {"classification_report": metrics, "confusion_matrix": confusion},
        "training_note": "The app intentionally returns inconclusive when the model is missing or low-confidence output is observed.",
    }

    artifact = {"pipeline": best_model, "metadata": metadata}
    joblib.dump(artifact, MODEL_PATH)

    print(json.dumps({
        "selected_model": best_name,
        "validation_f1": results[best_name],
        "test_report": metrics,
        "model_path": str(MODEL_PATH),
    }, indent=2, default=str))


if __name__ == "__main__":
    main()
