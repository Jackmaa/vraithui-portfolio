<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50" @click.self="close">
    <div class="absolute inset-0 backdrop-blur-sm bg-[rgb(var(--bg))]/80"></div>

    <!-- Palette -->
    <div
      class="relative max-w-2xl mx-auto mt-24 rounded-xl overflow-hidden shadow-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--fg))]"
    >
      <!-- Input -->
      <div
        class="flex items-center gap-2 px-3 py-2 border-b border-[rgb(var(--border))]"
      >
        <span class="opacity-70 text-sm">⌘K</span>
        <input
          ref="inputEl"
          v-model="query"
          type="text"
          class="w-full bg-transparent outline-none py-2"
          placeholder="Tape une commande… (Esc pour fermer)"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="runSelected"
          @keydown.esc.prevent="close"
        />
        <!-- Close button (especially useful on mobile) -->
        <button
          @click="close"
          class="p-1 hover:bg-[rgb(var(--panel-2))] rounded transition-colors flex-shrink-0"
          aria-label="Fermer"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Results -->
      <div ref="resultsContainer" class="max-h-72 overflow-auto scroll-theme">
        <template v-if="items.length">
          <button
            v-for="(item, i) in items"
            :key="i + '-' + item.key"
            :ref="(el) => setItemRef(el, i)"
            @click="run(item)"
            class="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-[rgb(var(--panel-2))] transition-colors border-l-2"
            :class="i === index ? 'bg-[rgb(var(--panel-2))] border-[rgb(var(--accent))]' : 'border-transparent'"
            @mousemove="index = i"
          >
            <span class="opacity-60 font-mono text-xs min-w-28">
              <template v-for="(seg, si) in item.segments" :key="si">
                <span v-if="seg.highlight" class="text-[rgb(var(--accent))] opacity-100">{{ seg.text }}</span>
                <template v-else>{{ seg.text }}</template>
              </template>
            </span>
            <span>{{ item.label }}</span>
          </button>
        </template>
        <div v-else class="px-4 py-6 text-sm opacity-70">
          Aucune commande. Essaie <code>open</code>, <code>theme</code>,
          <code>help</code>…
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex justify-end gap-2 px-3 py-2 border-t border-[rgb(var(--border))] text-xs opacity-70"
      >
        <span class="font-mono">↑/↓</span> pour naviguer
        <span class="font-mono ml-3">Entrée</span> exécuter
        <span class="font-mono ml-3">Esc</span> fermer
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { fuzzyScore, fuzzyFilter, highlightMatches } from "@/vraithui/utils/fuzzyMatch";

const props = defineProps({
  commands: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "command"]);

const inputEl = ref(null);
const resultsContainer = ref(null);
const query = ref("");
const index = ref(0);
const itemRefs = ref([]);

// Function to set item ref
function setItemRef(el, i) {
  if (el) {
    itemRefs.value[i] = el;
  }
}

// Normalize commands from props
function normalize(arr) {
  return (arr || []).map((c) => {
    const key = c.name || c.key || "";
    const label = c.desc || c.label || key;
    const action = () => emit("command", key);
    return { key, label, action };
  });
}

// All commands now come from the store via props
const pool = computed(() => normalize(props.commands));

const items = computed(() => {
  const q = query.value.trim();
  if (!q) {
    const out = pool.value.map((item) => ({
      ...item,
      segments: highlightMatches(item.key, []),
    }));
    if (index.value >= out.length) index.value = 0;
    return out;
  }

  // Run fuzzy against both key and label, take best score
  const scored = [];
  for (const item of pool.value) {
    const keyResult = fuzzyScore(q, item.key);
    const labelResult = fuzzyScore(q, item.label);

    let best = null;
    let matchesForKey = [];

    if (keyResult && labelResult) {
      best = keyResult.score >= labelResult.score ? keyResult : labelResult;
      matchesForKey = keyResult ? keyResult.matches : [];
    } else if (keyResult) {
      best = keyResult;
      matchesForKey = keyResult.matches;
    } else if (labelResult) {
      best = labelResult;
      matchesForKey = [];
    }

    if (best) {
      scored.push({
        ...item,
        score: best.score,
        segments: highlightMatches(item.key, matchesForKey),
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  if (index.value >= scored.length) index.value = 0;
  return scored;
});

function move(delta) {
  if (!items.value.length) return;
  index.value = (index.value + delta + items.value.length) % items.value.length;

  // Scroll instantané pour une navigation fluide
  nextTick(() => {
    const selectedEl = itemRefs.value[index.value];
    if (selectedEl) {
      selectedEl.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  });
}

function runSelected() {
  const item = items.value[index.value];
  if (item) run(item);
}

function run(item) {
  item.action?.();
  close();
}

function close() {
  emit("close");
}

onMounted(() => {
  requestAnimationFrame(() => inputEl.value?.focus());
});

watch(
  () => query.value,
  () => {
    index.value = 0;
  }
);
</script>
