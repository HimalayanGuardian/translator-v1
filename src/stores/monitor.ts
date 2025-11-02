import { reactive, readonly } from 'vue'

export type Activity = { id: string; type: 'detect' | 'translate' | 'error'; message: string; at: number; meta?: Record<string, unknown> }

const state = reactive({
  translations: 0,
  detections: 0,
  errors: 0,
  characters: 0,
  lastLatencyMs: 0,
  avgLatencyMs: 0,
  history: [] as Activity[],
})

function pushActivity(activity: Activity) {
  state.history.unshift(activity)
  if (state.history.length > 50) state.history.pop()
}

export const monitor = {
  state: readonly(state),
  recordDetection(latencyMs: number, textLen: number, lang: string) {
    state.detections += 1
    state.characters += textLen
    state.lastLatencyMs = latencyMs
    state.avgLatencyMs = Math.round((state.avgLatencyMs * (state.detections + state.translations - 1) + latencyMs) / (state.detections + state.translations))
    pushActivity({ id: crypto.randomUUID(), type: 'detect', message: `Detected language: ${lang}`, at: Date.now(), meta: { latencyMs, textLen } })
  },
  recordTranslation(latencyMs: number, textLen: number, target: string) {
    state.translations += 1
    state.characters += textLen
    state.lastLatencyMs = latencyMs
    state.avgLatencyMs = Math.round((state.avgLatencyMs * (state.detections + state.translations - 1) + latencyMs) / (state.detections + state.translations))
    pushActivity({ id: crypto.randomUUID(), type: 'translate', message: `Translated to: ${target}`, at: Date.now(), meta: { latencyMs, textLen } })
  },
  recordError(message: string) {
    state.errors += 1
    pushActivity({ id: crypto.randomUUID(), type: 'error', message, at: Date.now() })
  },
}
