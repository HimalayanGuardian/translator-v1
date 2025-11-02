<template>
  <footer class="border-t border-slate-200/70 bg-white/60 backdrop-blur">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
      <p>© {{ new Date().getFullYear() }} LinguaCookie. All rights reserved.</p>
      <p>
        Built with <a href="https://vuejs.org" target="_blank" rel="noopener" class="underline decoration-dotted">Vue</a> & Tailwind.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>
