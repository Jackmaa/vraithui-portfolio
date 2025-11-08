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
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";
import CustomScrollbar from "./CustomScrollbar.vue";

const props = defineProps({
  commands: { type: Array, default: () => [] },
});
const emit = defineEmits(["close"]);

const logs = ref([]);
const line = ref("");
const scrollY = ref(0);
const history = ref([]);
const historyIndex = ref(-1);
const scrollbarRef = ref(null);
const inputRef = ref(null);

// Liste complète des thèmes (19 avec Nord et Dracula)
const availableThemes = [
  "nord",
  "dracula",
  "cyberpunk",
  "luxury",
  "brand",
  "brand-dark",
  "neutral",
  "velvet-charcoal",
  "persian-plum",
  "bordeaux-silk",
  "regal-gold",
  "velvet-indigo",
  "deep-jungle",
  "crimson-peach",
  "imperial-blue",
  "mystic-jade",
  "lush-merlot",
  "oxford-maize",
  "rich-black",
];

// Event listener pour l'impression externe
function handleConsolePrint(e) {
  if (e?.detail) println(String(e.detail));
}

onMounted(() => {
  window.addEventListener("vraith-console-print", handleConsolePrint);

  // Focus automatique sur l'input
  nextTick(() => {
    inputRef.value?.focus();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("vraith-console-print", handleConsolePrint);
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
  println("─────────────────────────────────────────────────────────");
  println("  Navigation:");
  println("    open home              Open home page");
  println("    open about             Open about page");
  println("    open projects          Open projects page");
  println("    open github            Open GitHub page");
  println("    open contact           Open contact page");
  println("");
  println("  Theming:");
  println("    theme list             List all available themes");
  println("    theme set <name>       Switch to a specific theme");
  println("");
  println("  Utilities:");
  println("    help                   Show this help message");
  println("    ascii vraith           Display ASCII art");
  println("    roll [dX]              Roll a dice (default: d20)");
  println("    clear / cls            Clear console output");
  println("    whoami                 Display user info");
  println("    pwd                    Print working directory");
  println("    exit / quit            Close console");
  println("─────────────────────────────────────────────────────────");
  println("");
  println("Tips:");
  println("  • Use ↑/↓ arrows to navigate command history");
  println("  • Press Tab for command completion (coming soon)");
  println("  • Press Ctrl+J to toggle console");
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
    println("Available themes (19 total):");
    println("─────────────────────────────────────");
    println("Popular themes:");
    println("  • nord           Arctic, elegant, & harmonious");
    println("  • dracula        Dark with vibrant accents");
    println("  • cyberpunk      Neon cyan on dark blue");
    println("  • luxury         Gold on black - premium");
    println("");
    println("Light themes:");
    println("  • brand          Orange accent (light)");
    println("  • neutral        Minimalist gray (light)");
    println("  • mystic-jade    Jade with violet (light)");
    println("");
    println("Dark themes:");
    println("  • brand-dark     Orange accent (dark)");
    println("  • velvet-charcoal  Cream on charcoal");
    println("  • persian-plum   Ivory on plum");
    println("  • bordeaux-silk  Silver on bordeaux");
    println("  • regal-gold     Gold on onyx");
    println("  • velvet-indigo  Platinum on indigo");
    println("  • deep-jungle    Light olive on jungle green");
    println("  • crimson-peach  Peach on crimson");
    println("  • imperial-blue  Vintage rose on imperial blue");
    println("  • lush-merlot    Gold on merlot");
    println("  • oxford-maize   Maize on Oxford blue");
    println("  • rich-black     Vivid yellow on rich black");
    println("─────────────────────────────────────");
    println(`Total: ${availableThemes.length} themes`);
    println("");
    println("Usage: theme set <name>");
  } else if (/^theme\s+set\s+([a-z0-9\-]+)$/i.test(cmd)) {
    const theme = cmd.split(/\s+/).pop();
    if (availableThemes.includes(theme)) {
      document.documentElement.setAttribute("data-theme", theme);
      println(`✓ Theme switched to: ${theme}`);

      // Messages personnalisés pour certains thèmes
      if (theme === "nord") {
        println(`  🌌 Welcome to the Arctic - enjoy the harmony!`);
      } else if (theme === "dracula") {
        println(`  🧛 Welcome to the night - embrace the darkness!`);
      } else if (theme === "cyberpunk") {
        println(`  ⚡ Neon lights activated - welcome to the future!`);
      }
    } else {
      println(`✗ Unknown theme: '${theme}'`);
      println(`  Type 'theme list' to see available themes`);
    }
  } else if (/^open\s+(home|about|projects|github|contact)$/i.test(cmd)) {
    const section = cmd.split(/\s+/).pop();
    println(`✓ Opening: ${section}`);
    window.dispatchEvent(
      new CustomEvent("open-file", { detail: { id: section } })
    );
  } else if (cmd === "ascii vraith" || cmd === "ascii") {
    println(`
 __     __        _ _   _     
 \\ \\   / / _ __ _(_) |_| |__  
  \\ \\ / / '_/ _\`| |  __| '_  \\ 
   \\ V /| | | (_| | | |_| | | |
    \\_/ |_|  \\__,_|_|\\__|_| |_|
  `);
  } else if (cmd === "clear" || cmd === "cls") {
    logs.value = [];
  } else if (/^roll(\s+d(\d+))?$/i.test(cmd)) {
    const match = cmd.match(/d(\d+)/i);
    const dice = match ? parseInt(match[1]) : 20;
    const result = Math.floor(Math.random() * dice) + 1;
    println(`🎲 You rolled d${dice}: ${result}`);
    if (result === dice) {
      println(`   ⭐ Critical success!`);
    } else if (result === 1) {
      println(`   💀 Critical failure!`);
    }
  } else if (cmd === "exit" || cmd === "quit") {
    println("✓ Closing console...");
    setTimeout(() => {
      emit("close");
    }, 300);
  } else if (cmd === "whoami") {
    println("vraith@portfolio");
  } else if (cmd === "pwd") {
    println("/home/vraith/portfolio");
  } else if (cmd === "date") {
    println(new Date().toLocaleString());
  } else if (cmd === "version" || cmd === "ver") {
    println("Vraith Portfolio v2.1");
    println("Built with Vue 3 + Vite");
    println("19 themes available (including Nord & Dracula)");
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
