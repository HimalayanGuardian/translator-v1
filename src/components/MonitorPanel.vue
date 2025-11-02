<template>
  <section class="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-slate-900">Usage Monitor</h3>
      <span class="text-xs text-slate-500">Realtime</span>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Translations" :value="monitor.state.translations" />
      <StatCard label="Detections" :value="monitor.state.detections" />
      <StatCard label="Characters" :value="monitor.state.characters" />
      <StatCard label="Errors" :value="monitor.state.errors" />
    </div>
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Stat label="Last Latency" :value="monitor.state.lastLatencyMs + ' ms'" />
      <Stat label="Avg Latency" :value="monitor.state.avgLatencyMs + ' ms'" />
    </div>
    <div class="mt-6">
      <h4 class="text-sm font-medium text-slate-700 mb-2">Recent Activity</h4>
      <ul class="space-y-2 max-h-56 overflow-auto pr-2">
        <li v-for="item in monitor.state.history" :key="item.id" class="flex items-start gap-3 text-sm">
          <span :class="badgeClass(item.type)">{{ item.type }}</span>
          <div class="flex-1">
            <p class="text-slate-800">{{ item.message }}</p>
            <p class="text-slate-500 text-xs">{{ formatTime(item.at) }}</p>
          </div>
        </li>
        <li v-if="monitor.state.history.length === 0" class="text-sm text-slate-500">No activity yet.</li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { monitor } from '@/stores/monitor'
import StatCard from '@/components/StatCard.vue'

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString()
}

function badgeClass(type: string) {
  if (type === 'translate') return 'inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-emerald-100 text-emerald-700'
  if (type === 'detect') return 'inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-blue-100 text-blue-700'
  return 'inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-rose-100 text-rose-700'
}
</script>

<script lang="ts">
export default {}
</script>
