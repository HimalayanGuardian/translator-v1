<template>
  <header class="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-slate-200/70">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white grid place-items-center font-semibold shadow-sm">LC</div>
        <span class="text-slate-900 font-semibold">LinguaCookie</span>
      </router-link>
      <nav class="flex items-center gap-2">
        <button class="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800" @click="$emit('openPrefs')">
          Preferences
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped>
.nav-link {
  @apply inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition; 
}
.router-link-active.nav-link { @apply bg-slate-900 text-white hover:bg-slate-800; }
</style>
