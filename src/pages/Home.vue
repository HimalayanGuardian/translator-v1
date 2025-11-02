<template>
  <main class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
    <MockApiTranslate />
    <TranslatePanel />
    <MonitorPanel />
  </main>
</template>

<script setup lang="ts">
import MockApiTranslate from '@/components/MockApiTranslate.vue'
import TranslatePanel from '@/components/TranslatePanel.vue'
import MonitorPanel from '@/components/MonitorPanel.vue'
</script>
