import os
import shutil
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

load_dotenv()

from routers import abdm, voice, ocr, symptoms, location, vitals, analytics
from services.rate_limit import limiter

app = FastAPI(
    title="Rural AI Healthcare API",
    version="0.2.0",
    description="Backend service for AI symptom analysis, prescription OCR, location services, and ABDM integration",
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please slow down."},
    )


cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8081")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(abdm.router, prefix="/api/abdm", tags=["ABDM"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(symptoms.router, prefix="/api/symptoms", tags=["Symptoms"])
app.include_router(location.router, prefix="/api/location", tags=["Location"])
app.include_router(vitals.router, prefix="/api/vitals", tags=["Vitals"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/health")
async def health_check():
    checks: dict[str, str] = {}

    use_local = os.getenv("USE_LOCAL_MODELS", "true").lower() == "true"
    checks["mode"] = "local" if use_local else "cloud"
    checks["local_ocr_engine"] = os.getenv("PRESCRIPTION_OCR_ENGINE", "trocr")

    # Check local model
    if use_local:
        model_path = os.path.join(os.path.dirname(__file__), "models", "symptom_model.joblib")
        checks["local_symptom_model"] = "loaded" if os.path.exists(model_path) else "missing — run: python scripts/train_model.py"

    tesseract_bin = shutil.which("tesseract")
    checks["tesseract_binary"] = tesseract_bin if tesseract_bin else "missing"

    ocr_model_path = os.getenv("PRESCRIPTION_OCR_MODEL_PATH", "models/prescription_ocr_trocr_int8.onnx")
    ocr_artifact = Path(ocr_model_path)
    if not ocr_artifact.is_absolute():
        ocr_artifact = Path(__file__).resolve().parent / ocr_artifact
    checks["ocr_model_artifact"] = "present" if ocr_artifact.exists() else "missing"

    cloud_fallback_enabled = os.getenv("PRESCRIPTION_OCR_CLOUD_FALLBACK", "false").lower() == "true"
    checks["cloud_fallback_for_ocr"] = "enabled" if cloud_fallback_enabled else "disabled"

    # Check cloud API keys (fallback)
    gemini_key = os.getenv("GEMINI_API_KEY")
    checks["gemini"] = "configured" if gemini_key else ("not_needed" if use_local else "missing")

    openai_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPEN_AI_KEY")
    checks["openai"] = "configured" if openai_key else ("not_needed" if use_local else "missing")

    # Check Supabase
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    checks["supabase"] = "configured" if (supabase_url and supabase_key) else "missing"

    required_ok = checks["supabase"] == "configured"
    if use_local:
        required_ok = required_ok and checks.get("local_symptom_model") == "loaded"
        required_ok = required_ok and checks.get("tesseract_binary") != "missing"
        # Cloud fallback being enabled is a positive signal (safety net), not a degradation
    else:
        # Cloud mode requires at least one AI provider
        required_ok = required_ok and (
            checks.get("gemini") == "configured" or checks.get("openai") == "configured"
        )

    return {
        "status": "ok" if required_ok else "degraded",
        "service": "rural-ai-api",
        "checks": checks,
    }
