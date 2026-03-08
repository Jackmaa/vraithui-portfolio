<template>
  <div
    class="h-7 w-full flex items-center text-xs px-3 border-t"
    :style="`border-color: rgb(var(--border)); background: rgb(${modeColor} / 0.15)`"
  >
    <span
      class="font-mono px-2 py-0.5 rounded mr-3"
      :style="`background: rgb(${modeColor}); color: rgb(var(--bg))`"
    >
      {{ mode }}
    </span>
    <span class="opacity-80">{{ file || "—" }}</span>
    <span class="ml-2 text-[rgb(var(--accent))] opacity-70">{{ languageStore.currentLocale.toUpperCase() }}</span>
    <span class="ml-auto opacity-60">{{ elapsedFormatted }} · UTF-8 · LF</span>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useLanguageStore } from "@/stores/languageStore";

const props = defineProps({ mode: String, file: String, git: String });
const languageStore = useLanguageStore();

const sessionStart = Date.now();
const elapsed = ref(0);
let timerInterval = null;

const elapsedFormatted = computed(() => {
  const totalSecs = Math.floor(elapsed.value / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}m ${secs}s`;
});

onMounted(() => {
  timerInterval = setInterval(() => {
    elapsed.value = Date.now() - sessionStart;
  }, 1000);
});

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval);
});
const modeColor = computed(() => {
  switch ((props.mode || "NORMAL").toUpperCase()) {
    case "INSERT":
      return getVar("--mode-i");
    case "VISUAL":
      return getVar("--mode-v");
    case "REPLACE":
      return getVar("--mode-r");
    default:
      return getVar("--mode-n");
  }
});
function getVar(name) {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
    .replace(/\s+/g, " ");
  return v || "99 102 241";
}
</script>
