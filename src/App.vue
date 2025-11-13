<template>
  <EditorShell />
</template>

<script setup>
import { onMounted } from 'vue';
import EditorShell from "./vraithui/layout/EditorShell.vue";
import { useThemeStore } from './stores/themeStore';

const themeStore = useThemeStore();

// Initialize theme on app mount
onMounted(() => {
  themeStore.initialize();
});
</script>
