<template>
  <button
    class="language-toggle btn btn-ghost btn-sm flex items-center gap-1.5 group"
    @click="toggleLanguage"
    :title="`Switch to ${languageStore.otherLanguage.name}`"
  >
    <span class="label font-semibold">{{ currentConfig.label }}</span>
    <svg class="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { useLanguageStore } from '@/stores/languageStore';

const languageStore = useLanguageStore();

const currentConfig = computed(() => languageStore.languageConfig);

function toggleLanguage() {
  languageStore.toggleLocale();
}
</script>

<style scoped>
.language-toggle {
  transition: all 0.2s ease;
  cursor: pointer;
}

.language-toggle:hover {
  transform: scale(1.05);
  background-color: rgb(var(--accent) / 0.1);
}

.language-toggle:active {
  transform: scale(0.98);
}

.label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  transition: all 0.2s ease;
}

.language-toggle:hover .label {
  color: rgb(var(--accent));
}
</style>
