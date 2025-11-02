<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
import { ref } from 'vue'
import { prefs, loadPrefs } from '@/stores/prefs'

loadPrefs()
const open = ref(false)
const temp = ref(prefs.state.preferredLang)
function savePref() {
  prefs.setPreferredLang(temp.value)
  open.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-white to-slate-50 text-slate-900">
    <GlobalHeader @openPrefs="open = true" />
    <router-view />
    <GlobalFooter />

    <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 class="text-lg font-semibold text-slate-900">Preferences</h3>
        <p class="mt-1 text-sm text-slate-600">Set your preferred language cookie (preferred_lang).</p>
        <div class="mt-4">
          <select v-model="temp" class="w-full rounded-md border-slate-300 bg-white text-slate-900 text-sm">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese (Simplified)</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button class="btn" @click="open = false">Cancel</button>
          <button class="btn-primary" @click="savePref">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn { @apply inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50; }
.btn-primary { @apply inline-flex items-center rounded-lg bg-brand-600 text-white px-3 py-2 text-sm font-medium hover:bg-brand-700 shadow; }
</style>
