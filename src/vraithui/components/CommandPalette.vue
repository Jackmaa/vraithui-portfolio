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
      </div>

      <!-- Results -->
      <div ref="resultsContainer" class="max-h-72 overflow-auto scroll-theme">
        <template v-if="items.length">
          <button
            v-for="(item, i) in items"
            :key="i + '-' + item.key"
            :ref="
              (el) => {
                if (el) itemRefs[i] = el;
              }
            "
            @click="run(item)"
            class="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-[rgb(var(--panel-2))] transition-colors"
            :class="i === index ? 'bg-[rgb(var(--panel-2))]' : ''"
            @mousemove="index = i"
          >
            <span class="opacity-60 font-mono text-xs min-w-28">{{
              item.key
            }}</span>
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

// Commandes de base
const base = [
  {
    key: "open home",
    label: "Ouvrir: home",
    action: () => emit("command", "open home"),
  },
  {
    key: "open about",
    label: "Ouvrir: about",
    action: () => emit("command", "open about"),
  },
  {
    key: "open projects",
    label: "Ouvrir: projects",
    action: () => emit("command", "open projects"),
  },
  {
    key: "open contact",
    label: "Ouvrir: contact",
    action: () => emit("command", "open contact"),
  },
  {
    key: "open github",
    label: "Ouvrir: github",
    action: () => emit("command", "open github"),
  },
  {
    key: "theme set luxury",
    label: "Thème: luxury",
    action: () => emit("command", "theme set luxury"),
  },
  {
    key: "theme set cyberpunk",
    label: "Thème: cyberpunk",
    action: () => emit("command", "theme set cyberpunk"),
  },
  {
    key: "help",
    label: "Afficher aide",
    action: () => emit("command", "help"),
  },
];

function normalize(arr) {
  return (arr || []).map((c) => {
    const key = c.name || c.key || "";
    const label = c.desc || c.label || key;
    const action = () => emit("command", key);
    return { key, label, action };
  });
}

const pool = computed(() => [...normalize(props.commands), ...base]);

const items = computed(() => {
  const q = query.value.trim().toLowerCase();
  const out = !q
    ? pool.value
    : pool.value.filter((i) =>
        (i.key + " " + i.label).toLowerCase().includes(q)
      );
  if (index.value >= out.length) index.value = 0;
  return out;
});

function move(delta) {
  if (!items.value.length) return;
  index.value = (index.value + delta + items.value.length) % items.value.length;

  // Scroll pour que l'élément soit visible
  nextTick(() => {
    const selectedEl = itemRefs.value[index.value];
    if (selectedEl) {
      selectedEl.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
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
