from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from slowapi import Limiter

from app.core.security import limiter
from app.schemas.analysis import AnalyzeRequest, AnalysisResult
from app.services.document_processor import extract_text_from_upload
from app.services.model_service import model_service

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "truthlens-ai",
        "model_status": "ready" if model_service.is_available() else "training_required",
    }


@router.get("/model-info")
def model_info() -> dict:
    return model_service.get_model_info()


@router.post("/analyze")
@limiter.limit("30/minute")
async def analyze(request: Request, payload: AnalyzeRequest) -> dict:
    result = model_service.predict(payload.headline, payload.text)
    return result


@router.post("/analyze-file")
@limiter.limit("30/minute")
async def analyze_file(request: Request, file: UploadFile = File(...)) -> dict:
    try:
        content = extract_text_from_upload(file, max_size_bytes=5 * 1024 * 1024)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"message": str(exc)}) from exc

    result = model_service.predict(None, content)
    return result
