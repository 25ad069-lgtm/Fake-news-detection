from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AnalyzeRequest(BaseModel):
    headline: Optional[str] = Field(default=None, max_length=500)
    text: str = Field(..., min_length=80, max_length=20000)

    @field_validator("headline")
    @classmethod
    def validate_headline(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            return None
        return cleaned

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Text cannot be empty.")
        return cleaned


class AnalysisResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: str
    prediction: str
    confidence: Optional[float] = None
    class_probabilities: dict[str, float] = Field(default_factory=dict)
    explanation: str
    limitations: list[str]
    model_version: Optional[str] = None
    source: Optional[str] = None
