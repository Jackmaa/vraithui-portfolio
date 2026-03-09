<template>
  <div
    class="bg-[rgb(var(--panel))] backdrop-blur border-t border-[rgb(var(--border))] text-[rgb(var(--fg))] flex flex-col transition-all"
    :style="{ height: consoleHeight + 'px' }"
  >
    <!-- Resize handle -->
    <div
      @mousedown="startResize"
      class="resize-handle w-full h-1 cursor-ns-resize hover:bg-[rgb(var(--accent))] transition-colors flex items-center justify-center group"
      title="Drag to resize console"
    >
      <div class="w-12 h-0.5 bg-[rgb(var(--border))] group-hover:bg-[rgb(var(--accent))] rounded-full transition-colors"></div>
    </div>

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
    <div class="relative flex-1" :style="{ minHeight: scrollAreaHeight + 'px' }">
      <CustomScrollbar
        :height="scrollAreaHeight"
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

    <!-- Input bar + suggestion overlay wrapper -->
    <div class="relative shrink-0">
      <!-- Suggestion dropdown (absolutely positioned, grows upward from input) -->
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="suggestion-dropdown absolute bottom-full left-0 right-0 max-h-52 overflow-auto scroll-theme font-mono text-sm bg-[rgb(var(--panel))] border border-[rgb(var(--border))] border-b-0 rounded-t shadow-lg z-10"
      >
        <button
          v-for="(s, i) in suggestions"
          :key="s.item.name"
          @click="acceptSuggestion(i)"
          @mouseenter="suggestionIndex = i"
          class="w-full text-left px-3 py-1.5 flex items-center gap-3 transition-colors"
          :class="i === suggestionIndex ? 'bg-[rgb(var(--panel-2))]' : ''"
        >
          <span>
            <template v-for="(seg, si) in getSuggestionSegments(s)" :key="si">
              <span v-if="seg.highlight" class="text-[rgb(var(--accent))]">{{ seg.text }}</span>
              <template v-else>{{ seg.text }}</template>
            </template>
          </span>
          <span class="ml-auto text-xs opacity-40 truncate max-w-48">{{ s.item.description }}</span>
        </button>
      </div>

    <div
      class="px-3 py-2 border-t border-[rgb(var(--border))] flex items-center gap-2 bg-[rgb(var(--panel-2))]"
    >
      <span class="opacity-60">❯</span>
      <input
        ref="inputRef"
        v-model="line"
        @keydown="handleKeydown"
        class="bg-transparent outline-none w-full font-mono text-sm"
        placeholder="Type a command..."
        aria-label="console input"
      />
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import CustomScrollbar from "./CustomScrollbar.vue";
import { useCommandStore } from "@/stores/commandStore";
import { highlightMatches } from "@/vraithui/utils/fuzzyMatch";

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

// Autocomplete state
const suggestions = ref([]);
const suggestionIndex = ref(-1);
const showSuggestions = ref(false);

// Use logs from command store
const logs = computed(() => commandStore.consoleOutput);

// Console resize state
const MIN_HEIGHT = 200;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 240;
const STORAGE_KEY = 'vraithui-console-height';

const consoleHeight = ref(DEFAULT_HEIGHT);
const isResizing = ref(false);
const resizeStartY = ref(0);
const resizeStartHeight = ref(0);

// Calculate scroll area height (total height minus header and input)
const scrollAreaHeight = computed(() => {
  // Header ~40px + input ~45px = ~85px overhead
  return Math.max(100, consoleHeight.value - 85);
});

// Get highlight segments for a suggestion
function getSuggestionSegments(s) {
  return highlightMatches(s.item.name, s.matches);
}

// Watch line for suggestion computation
watch(line, (val) => {
  const trimmed = val.trim();
  if (!trimmed) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  const results = commandStore.getSuggestions(trimmed);
  suggestions.value = results.slice(0, 8);
  suggestionIndex.value = -1;
  showSuggestions.value = suggestions.value.length > 0;
});

// Accept a suggestion
function acceptSuggestion(idx) {
  const target = idx >= 0 && idx < suggestions.value.length ? idx : suggestionIndex.value;
  if (target >= 0 && target < suggestions.value.length) {
    line.value = suggestions.value[target].item.name;
    showSuggestions.value = false;
    suggestionIndex.value = -1;
    nextTick(() => inputRef.value?.focus());
  }
}

// Unified keydown handler
function handleKeydown(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    handleTab();
    return;
  }

  if (e.key === 'Escape') {
    if (showSuggestions.value) {
      showSuggestions.value = false;
      suggestionIndex.value = -1;
    } else {
      emit("close");
    }
    return;
  }

  if (showSuggestions.value && suggestions.value.length > 0) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestionIndex.value <= 0) {
        suggestionIndex.value = suggestions.value.length - 1;
      } else {
        suggestionIndex.value--;
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestionIndex.value >= suggestions.value.length - 1) {
        suggestionIndex.value = 0;
      } else {
        suggestionIndex.value++;
      }
      return;
    }
    if (e.key === 'Enter') {
      if (suggestionIndex.value >= 0) {
        e.preventDefault();
        acceptSuggestion(suggestionIndex.value);
        return;
      }
      // No highlight → execute as normal
      run();
      return;
    }
  } else {
    // No suggestions visible — use original keybindings
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      historyUp();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      historyDown();
      return;
    }
    if (e.key === 'Enter') {
      run();
      return;
    }
  }
}

// Tab completion
function handleTab() {
  if (suggestions.value.length === 0) return;

  if (suggestions.value.length === 1) {
    line.value = suggestions.value[0].item.name;
    showSuggestions.value = false;
    suggestionIndex.value = -1;
  } else {
    // Cycle through suggestions
    if (suggestionIndex.value >= suggestions.value.length - 1) {
      suggestionIndex.value = 0;
    } else {
      suggestionIndex.value++;
    }
    line.value = suggestions.value[suggestionIndex.value].item.name;
  }
}

// Load saved height from localStorage
function loadHeight() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const height = parseInt(saved);
      if (height >= MIN_HEIGHT && height <= MAX_HEIGHT) {
        consoleHeight.value = height;
      }
    }
  } catch (error) {
    console.error('[Console] Failed to load height:', error);
  }
}

// Save height to localStorage
function saveHeight() {
  try {
    localStorage.setItem(STORAGE_KEY, consoleHeight.value.toString());
  } catch (error) {
    console.error('[Console] Failed to save height:', error);
  }
}

// Start resizing
function startResize(e) {
  isResizing.value = true;
  resizeStartY.value = e.clientY;
  resizeStartHeight.value = consoleHeight.value;

  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);

  // Add class to body to prevent text selection
  document.body.classList.add('resizing');

  // Prevent text selection during drag
  e.preventDefault();
}

// Handle resize
function handleResize(e) {
  if (!isResizing.value) return;

  // Calculate new height (inverted because we're dragging from top)
  const deltaY = resizeStartY.value - e.clientY;
  let newHeight = resizeStartHeight.value + deltaY;

  // Clamp to min/max
  newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));

  consoleHeight.value = newHeight;
}

// Stop resizing
function stopResize() {
  if (isResizing.value) {
    isResizing.value = false;
    saveHeight();

    // Remove class from body
    document.body.classList.remove('resizing');

    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  }
}

onMounted(() => {
  // Load saved height
  loadHeight();

  // Focus automatique sur l'input
  nextTick(() => {
    inputRef.value?.focus();
  });
});

// Cleanup on unmount
onBeforeUnmount(() => {
  document.body.classList.remove('resizing');
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
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

  // Hide suggestions before clearing line to prevent flash
  showSuggestions.value = false;
  suggestionIndex.value = -1;

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
  } else if (result.action === 'matrix') {
    window.dispatchEvent(new CustomEvent('trigger-matrix'));
  } else if (result.action === 'barrel-roll') {
    window.dispatchEvent(new CustomEvent('barrel-roll'));
  }

  line.value = "";
}
</script>

<style scoped>
/* Resize handle styling */
.resize-handle {
  position: relative;
  user-select: none;
  -webkit-user-select: none;
}

.resize-handle:active {
  background: rgb(var(--accent) / 0.2);
  cursor: ns-resize !important;
}

/* Prevent text selection while resizing */
body.resizing * {
  user-select: none !important;
  -webkit-user-select: none !important;
}

/* Smooth transition when not resizing */
.transition-all {
  transition: height 0.05s ease-out;
}

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
