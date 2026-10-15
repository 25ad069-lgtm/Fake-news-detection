from __future__ import annotations

from fastapi import FastAPI

from app.api.routes import router as api_router
from app.core.config import settings
from app.core.security import configure_security

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="TruthLens AI provides AI-assisted news credibility analysis and uncertainty-aware predictions.",
)

configure_security(app)
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root() -> dict:
    return {"message": "Welcome to TruthLens AI API."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", reload=True, host="0.0.0.0", port=8000)
