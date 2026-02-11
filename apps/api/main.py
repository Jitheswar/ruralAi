import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

from routers import abdm, voice, ocr, symptoms, location, vitals

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

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


@app.get("/health")
async def health_check():
    checks: dict[str, str] = {}

    use_local = os.getenv("USE_LOCAL_MODELS", "true").lower() == "true"
    checks["mode"] = "local" if use_local else "cloud"

    # Check local model
    if use_local:
        model_path = os.path.join(os.path.dirname(__file__), "models", "symptom_model.joblib")
        checks["local_symptom_model"] = "loaded" if os.path.exists(model_path) else "missing — run: python scripts/train_model.py"

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

    return {
        "status": "ok" if required_ok else "degraded",
        "service": "rural-ai-api",
        "checks": checks,
    }
