import { monitor } from '@/stores/monitor'

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface DetectLanguageResponse {
  detected_language: string
  text: string
}

interface TranslateResponse {
  translated_text: string
  original_text: string
  source_language: string | null
  target_language: string
  provider: string
}

export async function detectLanguage(text: string): Promise<string> {
  const t0 = performance.now()

  try {
    const response = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    const t1 = performance.now()

    if (!response.ok) {
      const error = await response.json()
      const msg = `Detect failed: ${response.status} ${error.detail || response.statusText}`
      monitor.recordError(msg)
      throw new Error(msg)
    }

    const data: DetectLanguageResponse = await response.json()
    monitor.recordDetection(Math.round(t1 - t0), text.length, data.detected_language)
    return data.detected_language
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Detection failed'
    monitor.recordError(msg)
    throw new Error(msg)
  }
}

export async function translateText(text: string, target: string, source?: string): Promise<string> {
  const t0 = performance.now()

  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        target,
        source,
      }),
    })

    const t1 = performance.now()

    if (!response.ok) {
      const error = await response.json()
      const msg = `Translate failed: ${response.status} ${error.detail || response.statusText}`
      monitor.recordError(msg)
      throw new Error(msg)
    }

    const data: TranslateResponse = await response.json()
    monitor.recordTranslation(Math.round(t1 - t0), text.length, target)
    return data.translated_text
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Translation failed'
    monitor.recordError(msg)
    throw new Error(msg)
  }
}

// Utility function to get API base URL
export function getApiBaseUrl(): string {
  return API_BASE_URL
}
