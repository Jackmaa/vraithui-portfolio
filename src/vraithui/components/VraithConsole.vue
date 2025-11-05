<template>
  <div
    class="bg-[rgb(var(--panel))] backdrop-blur border-t border-[rgb(var(--border))] text-[rgb(var(--fg))] flex flex-col"
  >
    <div
      class="p-2 font-mono text-xs opacity-70 border-b border-[rgb(var(--border))]"
    >
      Vraith Console — type
      <code class="text-[rgb(var(--accent))]">help</code> for commands
    </div>

    <!-- CustomScrollbar avec ref pour contrôler le scroll -->
    <div class="relative" style="height: 160px">
      <CustomScrollbar
        :height="160"
        :thumbMinSize="28"
        v-model="scrollY"
        ref="scrollbarRef"
      >
        <div class="px-3 py-2 font-mono text-sm space-y-1">
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
import { ref, nextTick, onMounted, watch } from "vue";
import CustomScrollbar from "./CustomScrollbar.vue";

const props = defineProps({ commands: { type: Array, default: () => [] } });
const emit = defineEmits(["close"]);

const logs = ref([]);
const line = ref("");
const scrollY = ref(0);
const history = ref([]);
const historyIndex = ref(-1);
const scrollbarRef = ref(null);
const inputRef = ref(null);

onMounted(() => {
  window.addEventListener("vraith-console-print", (e) => {
    if (e?.detail) println(String(e.detail));
  });

  // Focus automatique sur l'input
  nextTick(() => {
    inputRef.value?.focus();
  });
});

function println(s) {
  logs.value.push(s);
  nextTick(() => {
    // Force le scroll vers le bas après ajout de contenu
    scrollY.value = 999999;
  });
}

// Navigation dans l'historique
function historyUp() {
  if (history.value.length === 0) return;
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++;
    line.value = history.value[history.value.length - 1 - historyIndex.value];
  }
}

function historyDown() {
  if (historyIndex.value > 0) {
    historyIndex.value--;
    line.value = history.value[history.value.length - 1 - historyIndex.value];
  } else if (historyIndex.value === 0) {
    historyIndex.value = -1;
    line.value = "";
  }
}

const help = () => {
  println("Available commands:");
  println("─────────────────────────────────────");
  props.commands.forEach((c) => {
    const name = (c.name || c.key).padEnd(25);
    println(`  ${name} ${c.desc || c.label || ""}`);
  });
  println("─────────────────────────────────────");
};

function run() {
  const cmd = (line.value || "").trim();

  if (!cmd) {
    line.value = "";
    return;
  }

  println(`$ ${cmd}`);

  // Ajouter à l'historique
  if (cmd && history.value[history.value.length - 1] !== cmd) {
    history.value.push(cmd);
  }
  historyIndex.value = -1;

  // Exécution des commandes
  if (cmd === "help") {
    help();
  } else if (/^theme\s+list$/i.test(cmd)) {
    println("Available themes:");
    window.dispatchEvent(new CustomEvent("theme-list-request"));
  } else if (/^theme\s+set\s+([a-z0-9\-]+)$/i.test(cmd)) {
    const theme = cmd.split(/\s+/).pop();
    document.documentElement.setAttribute("data-theme", theme);
    println(`✓ Theme switched to: ${theme}`);
  } else if (/^open\s+(home|about|projects|github|contact)$/i.test(cmd)) {
    const section = cmd.split(/\s+/).pop();
    println(`✓ Opening: ${section}`);
    window.dispatchEvent(
      new CustomEvent("open-file", { detail: { id: section } })
    );
  } else if (cmd === "ascii vraith") {
    println(`
  __     __        _ _   _   _
  \\ \\   / /__ _ __(_) |_| |_(_)
   \\ \\ / / _ \\ '__| | __| __| |
    \\ V /  __/ |  | | |_| |_| |
     \\_/ \\___|_|  |_|\\__|\\__|_|
    `);
  } else if (cmd === "clear" || cmd === "cls") {
    logs.value = [];
  } else if (/^roll(\s+d(\d+))?$/i.test(cmd)) {
    const match = cmd.match(/d(\d+)/i);
    const dice = match ? parseInt(match[1]) : 20;
    const result = Math.floor(Math.random() * dice) + 1;
    println(`🎲 You rolled d${dice}: ${result}`);
  } else if (cmd === "exit" || cmd === "quit") {
    emit("close");
  } else if (cmd === "whoami") {
    println("vraith@portfolio");
  } else if (cmd === "pwd") {
    println("/home/vraith/portfolio");
  } else {
    println(`✗ Command not found: '${cmd}'`);
    println(`  Type 'help' for available commands`);
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
</style>
