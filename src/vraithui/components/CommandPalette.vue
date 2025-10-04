<!-- src/vraithui/components/CommandPalette.vue -->
<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50" @click.self="close">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

    <!-- Palette -->
    <div
      class="relative max-w-2xl mx-auto mt-24 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[rgb(var(--panel))] text-[rgb(var(--fg))]"
    >
      <!-- Input -->
      <div class="flex items-center gap-2 px-3 py-2 border-b border-white/10">
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

      <div class="max-h-72 overflow-hidden">
        <CustomScrollbar :height="320" :thumbMinSize="28" v-model="y">
          <template v-if="items.length" class="overflow-hidden">
            <button
              v-for="(item, i) in items"
              :key="i + '-' + item.key"
              @click="run(item)"
              class="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-white/5"
              :class="i === index ? 'bg-white/10' : ''"
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
        </CustomScrollbar>
      </div>

      <!-- Footer -->
      <div
        class="flex justify-end gap-2 px-3 py-2 border-t border-white/10 text-xs opacity-70"
      >
        <span class="font-mono">↑/↓</span> pour naviguer
        <span class="font-mono ml-3">Entrée</span> exécuter
        <span class="font-mono ml-3">Esc</span> fermer
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import CustomScrollbar from "./CustomScrollbar.vue";

const props = defineProps({
  // Tableau facultatif venant du parent (ex: help, theme set …)
  commands: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "command"]);

const inputEl = ref(null);
const query = ref("");

// Index sélectionné
const index = ref(0);

// Commandes de base + merge avec props.commands
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

// Normalise les props.commands → { key, label, action }
function normalize(arr) {
  return (arr || []).map((c) => {
    const key = c.name || c.key || "";
    const label = c.desc || c.label || key;
    const action = () => emit("command", key);
    return { key, label, action };
  });
}

const pool = computed(() => [...normalize(props.commands), ...base]);

// Fuzzy très simple (substring insensible à la casse)
const items = computed(() => {
  const q = query.value.trim().toLowerCase();
  const out = !q
    ? pool.value
    : pool.value.filter((i) =>
        (i.key + " " + i.label).toLowerCase().includes(q)
      );
  // assure index valide
  if (index.value >= out.length) index.value = 0;
  return out;
});

function move(delta) {
  if (!items.value.length) return;
  index.value = (index.value + delta + items.value.length) % items.value.length;
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
  // focus auto
  requestAnimationFrame(() => inputEl.value?.focus());
});

// Reset index quand la query change
watch(
  () => query.value,
  () => {
    index.value = 0;
  }
);
</script>
