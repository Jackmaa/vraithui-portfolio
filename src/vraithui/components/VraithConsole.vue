<template>
  <div
    class="bg-[rgb(var(--panel))] backdrop-blur border-t border-[rgb(var(--border))] text-[rgb(var(--fg))] flex flex-col"
  >
    <div
      class="p-2 font-mono text-xs opacity-70 border-b border-[rgb(var(--border))] flex items-center justify-between"
    >
      <span>
        Vraith Console — type
        <code class="text-[rgb(var(--accent))]">help</code> for commands
      </span>
      <span class="text-[10px] opacity-50">{{ logs.length }} lines</span>
    </div>

    <!-- CustomScrollbar avec ref pour contrôler le scroll -->
    <div class="relative" style="height: 160px">
      <CustomScrollbar
        :height="160"
        :thumbMinSize="28"
        v-model="scrollY"
        ref="scrollbarRef"
      >
        <div ref="contentRef" class="px-3 py-2 font-mono text-sm space-y-1">
          <div
            v-for="(l, i) in logs"
            :key="i"
            class="leading-relaxed whitespace-pre-wrap"
          >
            {{ l }}
          </div>
        </div>
      </CustomScrollbar>
    </div>

    <div
      class="px-3 py-2 border-t border-[rgb(var(--border))] flex items-center gap-2 bg-[rgb(var(--panel-2))]"
    >
      <span class="opacity-60">❯</span>
      <input
        ref="inputRef"
        v-model="line"
        @keydown.enter="run"
        @keydown.up.prevent="historyUp"
        @keydown.down.prevent="historyDown"
        class="bg-transparent outline-none w-full font-mono text-sm"
        placeholder="Type a command..."
        aria-label="console input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from "vue";
import CustomScrollbar from "./CustomScrollbar.vue";
import { useCommandStore } from "@/stores/commandStore";

const props = defineProps({
  commands: { type: Array, default: () => [] },
});
const emit = defineEmits(["close"]);

const commandStore = useCommandStore();

const line = ref("");
const scrollY = ref(0);
const scrollbarRef = ref(null);
const inputRef = ref(null);
const contentRef = ref(null);

// Use logs from command store
const logs = computed(() => commandStore.consoleOutput);

onMounted(() => {
  // Focus automatique sur l'input
  nextTick(() => {
    inputRef.value?.focus();
  });
});

// Auto-scroll when new logs are added
watch(() => commandStore.consoleOutput.length, () => {
  nextTick(() => {
    // Calculate actual scroll height based on content
    if (contentRef.value) {
      const contentHeight = contentRef.value.scrollHeight;
      scrollY.value = contentHeight;
    } else {
      // Fallback to large number if ref not available yet
      scrollY.value = 999999;
    }
  });
});

// Navigation dans l'historique - use command store
function historyUp() {
  const cmd = commandStore.getHistoryUp();
  if (cmd !== null) {
    line.value = cmd;
  }
}

function historyDown() {
  const cmd = commandStore.getHistoryDown();
  line.value = cmd;
}

// Run command - delegate to command store
function run() {
  const cmd = (line.value || "").trim();

  if (!cmd) {
    line.value = "";
    return;
  }

  // Execute through command store
  const result = commandStore.execute(cmd);

  // Handle actions
  if (result.action === 'close-console') {
    setTimeout(() => {
      emit("close");
    }, 300);
  } else if (result.action === 'navigate' && result.section) {
    // Dispatch event for EditorShell to handle navigation
    window.dispatchEvent(
      new CustomEvent("open-file", { detail: { id: result.section } })
    );
  }

  line.value = "";
}
</script>

<style scoped>
/* Amélioration visuelle pour la console */
code {
  padding: 2px 4px;
  border-radius: 3px;
  background: rgb(var(--accent) / 0.2);
}

/* Animation pour les nouvelles lignes */
.space-y-1 > div {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
