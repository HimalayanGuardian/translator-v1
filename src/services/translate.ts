import { monitor } from '@/stores/monitor'

const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY as string | undefined

function ensureKey() {
  if (!API_KEY) throw new Error('Missing VITE_GOOGLE_TRANSLATE_API_KEY. Set it in project environment variables.')
}

export async function detectLanguage(text: string): Promise<string> {
  ensureKey()
  const t0 = performance.now()
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text }),
  })
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

export async function translateText(text: string, target: string, source?: string): Promise<string> {
  ensureKey()
  const t0 = performance.now()
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, target, source }),
  })
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
