"""
FastAPI Translation API Server
Provides REST endpoints for translation and language detection
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
import os
from dotenv import load_dotenv

from services.translation import detect_language, translate_text

load_dotenv()

app = FastAPI(
    title="Translation API",
    description="REST API for text translation and language detection using Hugging Face and Google Cloud Translation",
    version="1.0.0"
)

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class DetectLanguageRequest(BaseModel):
    text: str = Field(..., description="Text to detect language from", min_length=1)
    provider: Optional[Literal["huggingface", "google"]] = Field(
        None, 
        description="Translation provider to use (default: from env)"
    )


class DetectLanguageResponse(BaseModel):
    detected_language: str = Field(..., description="Detected language code (e.g., 'en', 'es', 'fr')")
    text: str = Field(..., description="Original text")


class TranslateRequest(BaseModel):
    text: str = Field(..., description="Text to translate", min_length=1)
    target: str = Field(..., description="Target language code (e.g., 'en', 'es', 'fr', 'ne')")
    source: Optional[str] = Field(None, description="Source language code (auto-detect if not provided)")
    provider: Optional[Literal["huggingface", "google"]] = Field(
        None, 
        description="Translation provider to use (default: from env)"
    )


class TranslateResponse(BaseModel):
    translated_text: str = Field(..., description="Translated text")
    original_text: str = Field(..., description="Original text")
    source_language: Optional[str] = Field(None, description="Source language code")
    target_language: str = Field(..., description="Target language code")
    provider: str = Field(..., description="Translation provider used")


class HealthResponse(BaseModel):
    status: str
    provider: str
    message: str


# API Endpoints
@app.get("/", response_model=HealthResponse)
async def root():
    """
    Health check endpoint
    """
    provider = os.getenv("TRANSLATION_PROVIDER", "huggingface")
    return HealthResponse(
        status="ok",
        provider=provider,
        message=f"Translation API is running with {provider} provider"
    )


@app.post("/detect", response_model=DetectLanguageResponse)
async def detect_language_endpoint(request: DetectLanguageRequest):
    """
    Detect the language of the provided text
    
    - **text**: The text to detect language from
    - **provider**: Optional provider selection ('huggingface' or 'google')
    """
    try:
        detected_lang = await detect_language(request.text, request.provider)
        return DetectLanguageResponse(
            detected_language=detected_lang,
            text=request.text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Language detection failed: {str(e)}")


@app.post("/translate", response_model=TranslateResponse)
async def translate_endpoint(request: TranslateRequest):
    """
    Translate text from source language to target language
    
    - **text**: The text to translate
    - **target**: Target language code (e.g., 'en', 'es', 'fr', 'ne')
    - **source**: Source language code (optional, will auto-detect if not provided)
    - **provider**: Optional provider selection ('huggingface' or 'google')
    """
    try:
        # Auto-detect source language if not provided
        source_lang = request.source
        if not source_lang:
            try:
                source_lang = await detect_language(request.text, request.provider)
            except Exception:
                source_lang = None
        
        # Translate text
        translated = await translate_text(
            request.text,
            request.target,
            source_lang,
            request.provider
        )
        
        provider = request.provider or os.getenv("TRANSLATION_PROVIDER", "huggingface")
        
        return TranslateResponse(
            translated_text=translated,
            original_text=request.text,
            source_language=source_lang,
            target_language=request.target,
            provider=provider
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@app.get("/languages")
async def get_supported_languages():
    """
    Get list of supported language codes
    """
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "es", "name": "Spanish"},
            {"code": "fr", "name": "French"},
            {"code": "de", "name": "German"},
            {"code": "hi", "name": "Hindi"},
            {"code": "ne", "name": "Nepali"},
            {"code": "ja", "name": "Japanese"},
            {"code": "zh", "name": "Chinese (Simplified)"},
            {"code": "ar", "name": "Arabic"},
            {"code": "it", "name": "Italian"},
            {"code": "pt", "name": "Portuguese"},
            {"code": "ru", "name": "Russian"},
            {"code": "ko", "name": "Korean"},
            {"code": "nl", "name": "Dutch"},
            {"code": "pl", "name": "Polish"},
            {"code": "tr", "name": "Turkish"},
            {"code": "vi", "name": "Vietnamese"},
            {"code": "th", "name": "Thai"},
            {"code": "id", "name": "Indonesian"},
        ]
    }


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload
    )
