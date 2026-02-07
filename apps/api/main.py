from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import abdm, voice, ocr

app = FastAPI(
    title="Rural AI Healthcare API",
    version="0.1.0",
    description="Backend service for ABDM integration, voice transcription, and prescription OCR",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(abdm.router, prefix="/api/abdm", tags=["ABDM"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "rural-ai-api"}
