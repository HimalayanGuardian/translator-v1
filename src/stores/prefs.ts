import { reactive, readonly, watch } from 'vue'
import { getCookie, setCookie } from '@/utils/cookies'

const state = reactive({ preferredLang: 'en' })

export function loadPrefs() {
  const c = getCookie('preferred_lang')
  state.preferredLang = c || (navigator.language || 'en').split('-')[0]
}

watch(
  () => state.preferredLang,
  (val) => setCookie('preferred_lang', val),
  { immediate: true }
)

export const prefs = {
  state: readonly(state),
  setPreferredLang(lang: string) {
    state.preferredLang = lang
  },
}
