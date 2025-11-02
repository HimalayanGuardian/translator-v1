<template>
  <section class="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-5 shadow-sm">
    <header class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-slate-900">Mocked Backend → Auto Translate</h3>
      <button class="btn" @click="loadAndTranslate">Load Mock JSON</button>
    </header>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Mocked Chinese Text</label>
        <textarea :value="source" readonly rows="6" class="w-full rounded-lg border border-slate-300 bg-white/90 p-3 text-slate-900"></textarea>
        <p class="mt-2 text-xs text-slate-500">Fetched from /mock/chinese.json</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Translated ({{ preferred.toUpperCase() }})</label>
        <textarea :value="translated" readonly rows="6" class="w-full rounded-lg border border-slate-300 bg-white/50 p-3 text-slate-900"></textarea>
        <p class="mt-2 text-xs text-slate-500">Preferred language cookie: "preferred_lang" → {{ preferred }}</p>
      </div>
    </div>
    <p v-if="error" class="mt-3 text-sm text-rose-600">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { prefs } from '@/stores/prefs'
import { detectLanguage, translateText } from '@/services/translate'

const source = ref('')
const translated = ref('')
const error = ref('')
const preferred = computed(() => prefs.state.preferredLang)

async function loadAndTranslate() {
  try {
    error.value = ''
    translated.value = ''
    const res = await fetch('/mock/chinese.json')
    if (!res.ok) throw new Error('Failed to load mocked JSON')
    const data = await res.json()
    source.value = data.text || ''
    if (!source.value) throw new Error('Mock JSON missing "text" field')

    const srcLang = await detectLanguage(source.value)
    translated.value = await translateText(source.value, preferred.value, srcLang)
  } catch (e: any) {
    error.value = e.message || 'Unable to translate mocked data.'
  }
}

onMounted(() => {
  // prefs loaded in App
})
</script>

<style scoped>
.btn { @apply inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50; }
</style>
