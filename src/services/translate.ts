import { monitor } from '@/stores/monitor'
import { HfInference } from '@huggingface/inference'

// Configuration
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY as string | undefined
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined
const PROVIDER = (import.meta.env.VITE_TRANSLATION_PROVIDER as string) || 'google'

// Hugging Face client - works with or without token
// Without token: rate limited but functional for testing
// With token: higher rate limits
let hfClient: HfInference
if (HF_TOKEN) {
  hfClient = new HfInference(HF_TOKEN)
  console.log('🔑 Using Hugging Face with authentication token')
} else {
  hfClient = new HfInference()
  console.log('⚠️ Using Hugging Face without token (rate limited, for testing only)')
}

function ensureGoogleKey() {
  if (!GOOGLE_API_KEY) {
    throw new Error(
      'Missing VITE_GOOGLE_TRANSLATE_API_KEY. Set it in project environment variables.',
    )
  }
}

function ensureHFClient() {
  if (!hfClient) {
    throw new Error('Hugging Face client not initialized.')
  }
}

// Language code mapping for Hugging Face models
const languageCodeMap: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  'zh-CN': 'Chinese',
  'zh-TW': 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  nl: 'Dutch',
  pl: 'Polish',
  tr: 'Turkish',
  vi: 'Vietnamese',
  th: 'Thai',
  id: 'Indonesian',
}

// Google Cloud Translation functions
async function detectLanguageGoogle(text: string): Promise<string> {
  ensureGoogleKey()
  const t0 = performance.now()
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text }),
    },
  )
  const t1 = performance.now()
  if (!res.ok) {
    const msg = `Detect failed: ${res.status} ${res.statusText}`
    monitor.recordError(msg)
    throw new Error(msg)
  }
  const data = await res.json()
  const lang = data?.data?.detections?.[0]?.[0]?.language || data?.data?.detections?.[0]?.language
  monitor.recordDetection(Math.round(t1 - t0), text.length, lang)
  return lang
}

async function translateTextGoogle(text: string, target: string, source?: string): Promise<string> {
  ensureGoogleKey()
  const t0 = performance.now()
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target, source }),
    },
  )
  const t1 = performance.now()
  if (!res.ok) {
    const msg = `Translate failed: ${res.status} ${res.statusText}`
    monitor.recordError(msg)
    throw new Error(msg)
  }
  const data = await res.json()
  const translated = data?.data?.translations?.[0]?.translatedText ?? ''
  monitor.recordTranslation(Math.round(t1 - t0), text.length, target)
  return translated
}

// Hugging Face Translation functions
async function detectLanguageHF(text: string): Promise<string> {
  ensureHFClient()
  const t0 = performance.now()

  try {
    // Use language identification model (smaller, faster model)
    const result = await hfClient.request({
      model: 'papluca/xlm-roberta-base-language-detection',
      inputs: text,
    })

    const t1 = performance.now()

    // Parse the response - it returns an array of predictions
    const predictions = result as Array<{ label: string; score: number }>
    const detectedLang = predictions[0]?.label || 'en'

    monitor.recordDetection(Math.round(t1 - t0), text.length, detectedLang)
    return detectedLang
  } catch (error) {
    const msg = `HF Detect failed: ${error instanceof Error ? error.message : String(error)}`
    monitor.recordError(msg)

    // Fallback: return 'en' as default if detection fails
    console.warn('Language detection failed, defaulting to English:', msg)
    return 'en'
  }
}

async function translateTextHF(text: string, target: string, source?: string): Promise<string> {
  ensureHFClient()
  const t0 = performance.now()

  try {
    // Map language codes to NLLB language codes (format: xxx_Yyyy)
    const nllbLangMap: Record<string, string> = {
      en: 'eng_Latn',
      es: 'spa_Latn',
      fr: 'fra_Latn',
      de: 'deu_Latn',
      it: 'ita_Latn',
      pt: 'por_Latn',
      ru: 'rus_Cyrl',
      ja: 'jpn_Jpan',
      ko: 'kor_Hang',
      zh: 'zho_Hans',
      'zh-CN': 'zho_Hans',
      'zh-TW': 'zho_Hant',
      ar: 'arb_Arab',
      hi: 'hin_Deva',
      ne: 'npi_Deva',
      nl: 'nld_Latn',
      pl: 'pol_Latn',
      tr: 'tur_Latn',
      vi: 'vie_Latn',
      th: 'tha_Thai',
      id: 'ind_Latn',
    }

    const srcLangCode = nllbLangMap[source || 'en'] || 'eng_Latn'
    const tgtLangCode = nllbLangMap[target] || 'eng_Latn'

    // Use NLLB-200 model with proper language codes
    try {
      const result = await hfClient.translation({
        model: 'facebook/nllb-200-distilled-600M',
        inputs: text,
        parameters: {
          src_lang: srcLangCode,
          tgt_lang: tgtLangCode,
        },
      })

      const t1 = performance.now()

      // Parse response - translation method returns a single object
      const translated = result.translation_text || ''

      monitor.recordTranslation(Math.round(t1 - t0), text.length, target)
      return translated
    } catch (nllbError) {
      console.warn('NLLB model failed, trying Helsinki-NLP model:', nllbError)

      // Fallback: Try Helsinki-NLP OPUS model (more reliable, specific language pairs)
      // Map common translation pairs
      const modelMap: Record<string, string> = {
        'en-es': 'Helsinki-NLP/opus-mt-en-es',
        'en-fr': 'Helsinki-NLP/opus-mt-en-fr',
        'en-de': 'Helsinki-NLP/opus-mt-en-de',
        'en-ja': 'Helsinki-NLP/opus-mt-en-jap',
        'en-zh': 'Helsinki-NLP/opus-mt-en-zh',
        'en-ar': 'Helsinki-NLP/opus-mt-en-ar',
        'en-hi': 'Helsinki-NLP/opus-mt-en-hi',
        'es-en': 'Helsinki-NLP/opus-mt-es-en',
        'fr-en': 'Helsinki-NLP/opus-mt-fr-en',
        'de-en': 'Helsinki-NLP/opus-mt-de-en',
        'zh-en': 'Helsinki-NLP/opus-mt-zh-en',
      }

      const langPair = `${source || 'en'}-${target}`
      const modelName = modelMap[langPair] || 'Helsinki-NLP/opus-mt-mul-en' // fallback to multi-language

      const opusResult = await hfClient.translation({
        model: modelName,
        inputs: text,
      })

      const t1 = performance.now()
      const translated = opusResult.translation_text || ''

      monitor.recordTranslation(Math.round(t1 - t0), text.length, target)
      return translated
    }
  } catch (error) {
    const msg = `HF Translate failed: ${error instanceof Error ? error.message : String(error)}`
    monitor.recordError(msg)
    throw new Error(msg)
  }
}

// Public API - switches between providers
export async function detectLanguage(text: string): Promise<string> {
  if (PROVIDER === 'huggingface') {
    return detectLanguageHF(text)
  }
  return detectLanguageGoogle(text)
}

export async function translateText(
  text: string,
  target: string,
  source?: string,
): Promise<string> {
  if (PROVIDER === 'huggingface') {
    return translateTextHF(text, target, source)
  }
  return translateTextGoogle(text, target, source)
}

// Utility function to get current provider
export function getTranslationProvider(): string {
  return PROVIDER
}
