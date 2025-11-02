<template>
  <section class="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-5 shadow-sm">
    <header class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-slate-900 flex items-center gap-2">
        Translator
        <span
          v-if="isTranslating || isDetecting"
          class="flex items-center gap-1 text-sm text-blue-600 font-normal"
        >
          <svg
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isTranslating ? 'Translating...' : 'Detecting...' }}
        </span>
      </h3>
      <div class="flex items-center gap-2 text-sm">
        <label class="text-slate-600">Preferred Language</label>
        <select
          v-model="preferred"
          class="rounded-md border-slate-300 bg-white text-slate-900 text-sm"
        >
          <option v-for="opt in languageOptions" :key="opt.code" :value="opt.code">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Input Text</label>
        <textarea
          v-model="input"
          rows="8"
          :disabled="isTranslating || isDetecting"
          class="w-full rounded-lg border border-slate-300 bg-white/90 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        ></textarea>
        <div class="mt-3 flex items-center gap-2">
          <button class="btn" @click="onDetect" :disabled="isDetecting || isTranslating">
            <svg
              v-if="isDetecting"
              class="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isDetecting ? 'Detecting...' : 'Detect Language' }}
          </button>
          <span v-if="detected && !isDetecting" class="text-sm text-slate-600 animate-fade-in">
            Detected: <strong class="text-slate-900">{{ detected.toUpperCase() }}</strong>
          </span>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">
          Translated ({{ preferred.toUpperCase() }})
        </label>
        <div class="relative">
          <textarea
            :value="output"
            readonly
            rows="8"
            class="w-full rounded-lg border border-slate-300 bg-white/50 p-3 text-slate-900 transition-all"
            :class="{ 'opacity-50': isTranslating }"
          ></textarea>
          <div
            v-if="isTranslating"
            class="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg"
          >
            <div class="flex flex-col items-center gap-2">
              <svg
                class="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span class="text-sm font-medium text-blue-600">Translating your text...</span>
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <button class="btn-primary" @click="onTranslate" :disabled="isTranslating || isDetecting">
            <svg
              v-if="isTranslating"
              class="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isTranslating ? 'Translating...' : 'Translate' }}
          </button>
          <span v-if="error" class="text-sm text-rose-600 animate-fade-in">{{ error }}</span>
          <span
            v-if="!error && output && !isTranslating"
            class="text-sm text-green-600 animate-fade-in flex items-center gap-1"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            Translation complete!
          </span>
        </div>
      </div>
    </div>

    <p class="mt-3 text-xs text-slate-500">
      We read your preferred language from a cookie named "preferred_lang". You can change it above.
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { prefs } from '@/stores/prefs'
import { detectLanguage, translateText } from '@/services/translate'

const input = ref('')
const output = ref('')
const detected = ref('')
const error = ref('')

const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese (Simplified)' },
  { code: 'ar', label: 'Arabic' },
]

const preferred = computed({
  get: () => prefs.state.preferredLang,
  set: (v: string) => prefs.setPreferredLang(v),
})

onMounted(() => {
  // prefs loaded in App
})

async function onDetect() {
  error.value = ''
  detected.value = ''
  try {
    if (!input.value.trim()) {
      error.value = 'Enter text to detect.'
      return
    }
    detected.value = await detectLanguage(input.value)
  } catch (e: any) {
    error.value = e.message || 'Detection failed.'
  }
}

async function onTranslate() {
  error.value = ''
  output.value = ''
  try {
    if (!input.value.trim()) {
      error.value = 'Enter text to translate.'
      return
    }
    let source: string | undefined
    if (!detected.value) {
      try {
        source = await detectLanguage(input.value)
      } catch {
        /* ignore detect error for translate */
      }
    } else {
      source = detected.value
    }
    output.value = await translateText(input.value, preferred.value, source)
  } catch (e: any) {
    error.value = e.message || 'Translation failed.'
  }
}
</script>

<style scoped>
.btn {
  @apply inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50;
}
.btn-primary {
  @apply inline-flex items-center rounded-lg bg-brand-600 text-white px-3 py-2 text-sm font-medium hover:bg-brand-700 shadow;
}
</style>
