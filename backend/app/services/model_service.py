from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import joblib

from app.core.config import settings


class ModelNotAvailableError(RuntimeError):
    pass


class ModelService:
    def __init__(self, model_path: str | Path | None = None):
        self.model_path = Path(model_path or settings.MODEL_PATH)
        self.model_bundle: dict[str, Any] | None = None
        self.model_version = "untrained"
        self.model_metadata: dict[str, Any] | None = None
        self._load_model()

    def _load_model(self) -> None:
        if not self.model_path.exists():
            self.model_bundle = None
            self.model_metadata = None
            return
        try:
            bundle = joblib.load(self.model_path)
            if isinstance(bundle, dict) and "pipeline" in bundle:
                self.model_bundle = bundle
                self.model_metadata = bundle.get("metadata", {})
                self.model_version = str(self.model_metadata.get("model_version", "demo-v0.1"))
            else:
                self.model_bundle = {"pipeline": bundle, "metadata": {"model_version": "legacy-model"}}
                self.model_metadata = self.model_bundle["metadata"]
                self.model_version = str(self.model_metadata.get("model_version", "legacy-model"))
        except Exception:
            self.model_bundle = None
            self.model_metadata = None

    def is_available(self) -> bool:
        return self.model_bundle is not None and "pipeline" in self.model_bundle

    def get_model_info(self) -> dict[str, Any]:
        if not self.is_available():
            return {
                "status": "training_required",
                "message": "No trained model artifact found. Run the training script in the ml/ folder to build the pipeline.",
                "model_version": None,
                "labels": ["real", "fake"],
            }
        metadata = self.model_metadata or {}
        return {
            "status": "ready",
            "message": "Model loaded successfully.",
            "model_version": metadata.get("model_version", self.model_version),
            "labels": ["real", "fake"],
            "dataset": metadata.get("dataset", "Not documented"),
            "decision_method": "highest class score",
        }

    def predict(self, headline: str | None, text: str) -> dict[str, Any]:
        article = " ".join(part for part in [headline or "", text] if part).strip()
        cleaned = " ".join(article.split())
        if len(cleaned) < 80:
            return {
                "status": "success",
                "prediction": "inconclusive",
                "confidence": None,
                "class_probabilities": {},
                "explanation": "The article is too short to make a reliable credibility estimate.",
                "limitations": [
                    "The model requires a meaningful amount of article text before making a prediction.",
                    "The model cannot independently verify the underlying claims in the article.",
                ],
                "model_version": self.model_version,
                "source": "local-model",
            }

        if not self.is_available():
            return {
                "status": "success",
                "prediction": "inconclusive",
                "confidence": None,
                "class_probabilities": {},
                "explanation": "The trained model is not available yet. The app requires a trained pipeline before making predictions.",
                "limitations": [
                    "The model is unavailable. Please run the training workflow in the ml/ folder to build and save the classifier.",
                    "The model cannot independently verify the truth of the reported claims.",
                ],
                "model_version": None,
                "source": "training-required",
            }

        pipeline = self.model_bundle["pipeline"]
        if not hasattr(pipeline, "predict_proba"):
            return {
                "status": "success",
                "prediction": "inconclusive",
                "confidence": None,
                "class_probabilities": {},
                "explanation": "The loaded model artifact is not a probability-based text classifier.",
                "limitations": [
                    "The model service expects a trained TF-IDF + classifier pipeline with probability output.",
                    "Prediction quality depends on data quality and domain coverage.",
                ],
                "model_version": self.model_version,
                "source": "local-model",
            }

        probabilities = pipeline.predict_proba([cleaned])[0]
        label_names = list(getattr(pipeline, "classes_", ["likely_real", "likely_fake"]))
        label_aliases = {"likely_real": "real", "likely_fake": "fake"}
        mapped_probabilities = {
            label_aliases.get(str(name), str(name)): float(prob)
            for name, prob in zip(label_names, probabilities)
        }

        if "real" in mapped_probabilities and "fake" in mapped_probabilities:
            real_confidence = mapped_probabilities["real"]
            fake_confidence = mapped_probabilities["fake"]
            confidence = max(real_confidence, fake_confidence)
            prediction = "real" if real_confidence >= fake_confidence else "fake"
        else:
            top_index = int(probabilities.argmax())
            prediction = str(label_names[top_index])
            confidence = float(probabilities[top_index])

        if prediction == "real":
            explanation = f"The model classifies this article as real (top class score {confidence:.1%}) based on learned text patterns. This is not independent verification of its claims."
        else:
            explanation = f"The model classifies this article as fake (top class score {confidence:.1%}) based on learned text patterns. This is not independent verification of its claims."

        limitations = [
            "This model predicts based on learned language patterns, not proof of truth or falsehood.",
            "It cannot independently verify claims, sources, or underlying facts.",
            "For a valid article, the model always selects the higher-scoring class, even when the scores are close.",
            "The demo was trained on general 20 Newsgroups topics with proxy labels, not verified real-versus-fake news articles.",
        ]

        return {
            "status": "success",
            "prediction": prediction,
            "confidence": round(float(confidence), 4),
            "class_probabilities": {
                label: round(probability, 4)
                for label, probability in mapped_probabilities.items()
            },
            "explanation": explanation,
            "limitations": limitations,
            "model_version": self.model_version,
            "source": "local-model",
        }


model_service = ModelService()
