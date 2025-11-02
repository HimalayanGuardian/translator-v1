<template>
  <div class="rounded-xl bg-white border border-slate-200 p-3">
    <div class="text-xs text-slate-500 mb-1">{{ label }}</div>
    <div class="text-lg font-semibold text-slate-900">{{ value }}</div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>
