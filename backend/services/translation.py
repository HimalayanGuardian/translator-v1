"""
Translation Service Module
Handles translation and language detection using Hugging Face and Google Cloud Translation
"""

import os
from typing import Optional, Literal
from huggingface_hub import InferenceClient
import httpx
from dotenv import load_dotenv

load_dotenv()

# Configuration
HF_TOKEN = os.getenv("HF_TOKEN")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
TRANSLATION_PROVIDER = os.getenv("TRANSLATION_PROVIDER", "huggingface")

# Initialize Hugging Face client
if HF_TOKEN:
    hf_client = InferenceClient(token=HF_TOKEN)
    print("🔑 Using Hugging Face with authentication token")
else:
    hf_client = InferenceClient()
    print("⚠️ Using Hugging Face without token (rate limited, for testing only)")


# Language code mapping for NLLB models
NLLB_LANG_MAP = {
    'en': 'eng_Latn',
    'es': 'spa_Latn',
    'fr': 'fra_Latn',
    'de': 'deu_Latn',
    'it': 'ita_Latn',
    'pt': 'por_Latn',
    'ru': 'rus_Cyrl',
    'ja': 'jpn_Jpan',
    'ko': 'kor_Hang',
    'zh': 'zho_Hans',
    'zh-CN': 'zho_Hans',
    'zh-TW': 'zho_Hant',
    'ar': 'arb_Arab',
    'hi': 'hin_Deva',
    'ne': 'npi_Deva',
    'nl': 'nld_Latn',
    'pl': 'pol_Latn',
    'tr': 'tur_Latn',
    'vi': 'vie_Latn',
    'th': 'tha_Thai',
    'id': 'ind_Latn',
}

# Helsinki-NLP OPUS model mappings
OPUS_MODEL_MAP = {
    'en-es': 'Helsinki-NLP/opus-mt-en-es',
    'en-fr': 'Helsinki-NLP/opus-mt-en-fr',
    'en-de': 'Helsinki-NLP/opus-mt-en-de',
    'en-ja': 'Helsinki-NLP/opus-mt-en-jap',
    'en-zh': 'Helsinki-NLP/opus-mt-en-zh',
    'en-ar': 'Helsinki-NLP/opus-mt-en-ar',
    'en-hi': 'Helsinki-NLP/opus-mt-en-hi',
    'en-ne': 'Helsinki-NLP/opus-mt-en-hi',  # Fallback, Nepali might use Hindi model
    'es-en': 'Helsinki-NLP/opus-mt-es-en',
    'fr-en': 'Helsinki-NLP/opus-mt-fr-en',
    'de-en': 'Helsinki-NLP/opus-mt-de-en',
    'zh-en': 'Helsinki-NLP/opus-mt-zh-en',
}


async def detect_language_hf(text: str) -> str:
    """
    Detect language using Hugging Face
    """
    try:
        result = await hf_client.request(
            model='papluca/xlm-roberta-base-language-detection',
            inputs=text,
        )
        
        # Parse the response
        predictions = result
        if isinstance(predictions, list) and len(predictions) > 0:
            detected_lang = predictions[0].get('label', 'en')
        else:
            detected_lang = 'en'
        
        return detected_lang
    except Exception as e:
        print(f"HF Detect failed: {e}")
        # Fallback to English
        return 'en'


async def detect_language_google(text: str) -> str:
    """
    Detect language using Google Cloud Translation API
    """
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not configured")
    
    url = f"https://translation.googleapis.com/language/translate/v2/detect?key={GOOGLE_API_KEY}"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json={"q": text},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        data = response.json()
        
    lang = data.get('data', {}).get('detections', [[{}]])[0][0].get('language', 'en')
    return lang


async def translate_text_hf(text: str, target: str, source: Optional[str] = None) -> str:
    """
    Translate text using Hugging Face
    """
    src_lang_code = NLLB_LANG_MAP.get(source or 'en', 'eng_Latn')
    tgt_lang_code = NLLB_LANG_MAP.get(target, 'eng_Latn')
    
    try:
        # Try NLLB-200 model first
        result = await hf_client.translation(
            model='facebook/nllb-200-distilled-600M',
            inputs=text,
            src_lang=src_lang_code,
            tgt_lang=tgt_lang_code,
        )
        
        translated = result.get('translation_text', '')
        return translated
    
    except Exception as nllb_error:
        print(f"NLLB model failed: {nllb_error}, trying Helsinki-NLP model")
        
        # Fallback to Helsinki-NLP OPUS model
        lang_pair = f"{source or 'en'}-{target}"
        model_name = OPUS_MODEL_MAP.get(lang_pair, 'Helsinki-NLP/opus-mt-mul-en')
        
        try:
            result = await hf_client.translation(
                model=model_name,
                inputs=text,
            )
            translated = result.get('translation_text', '')
            return translated
        except Exception as opus_error:
            raise Exception(f"Translation failed: {opus_error}")


async def translate_text_google(text: str, target: str, source: Optional[str] = None) -> str:
    """
    Translate text using Google Cloud Translation API
    """
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not configured")
    
    url = f"https://translation.googleapis.com/language/translate/v2?key={GOOGLE_API_KEY}"
    
    payload = {
        "q": text,
        "target": target,
    }
    if source:
        payload["source"] = source
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        data = response.json()
    
    translated = data.get('data', {}).get('translations', [{}])[0].get('translatedText', '')
    return translated


# Public API functions
async def detect_language(text: str, provider: Optional[str] = None) -> str:
    """
    Detect the language of the given text
    """
    provider = provider or TRANSLATION_PROVIDER
    
    if provider == "huggingface":
        return await detect_language_hf(text)
    else:
        return await detect_language_google(text)


async def translate_text(
    text: str, 
    target: str, 
    source: Optional[str] = None,
    provider: Optional[str] = None
) -> str:
    """
    Translate text to the target language
    """
    provider = provider or TRANSLATION_PROVIDER
    
    if provider == "huggingface":
        return await translate_text_hf(text, target, source)
    else:
        return await translate_text_google(text, target, source)
