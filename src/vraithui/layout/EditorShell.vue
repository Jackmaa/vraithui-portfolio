<template>
  <div
    class="h-screen w-full grid"
    style="grid-template-rows: 48px 1fr 28px; grid-template-columns: 240px 1fr"
  >
    <!-- Command Palette (flottante, on/off) -->
    <CommandPalette
      v-if="paletteOpen"
      :commands="paletteCommands"
      @close="paletteOpen = false"
      @command="handleCmd"
    />
    <!-- Header = zone ‘Cursor’ / quick actions -->
    <header
      class="col-span-2 flex items-center gap-3 px-4 border-b"
      style="border-color: var(--border)"
    >
      <button class="btn btn-ghost btn-sm" @click="paletteOpen = true">
        ⌘K
      </button>
      <div class="opacity-70 text-sm">VraithUI · Nvim/Cursor shell</div>
      <div class="ml-auto flex items-center gap-3">
        <button class="btn btn-ghost btn-sm" @click="toggleTheme">Theme</button>
      </div>
    </header>

    <!-- Explorer -->
    <aside class="border-r overflow-auto" style="border-color: var(--border)">
      <NvimExplorer :files="files" @open="open" />
    </aside>

    <!-- Éditeur + Tabline -->
    <main class="relative overflow-hidden">
      <NvimTabline
        :tabs="tabs"
        :active="active"
        @close="close"
        @select="active = $event"
      />
      <section
        class="h-[calc(100%-2rem)] p-6 overflow-auto text-[rgb(var(--fg))]"
      >
        <component :is="activeTab?.component || 'div'" />
      </section>

      <!-- Console flottante (⌘J) -->
      <VraithConsole
        v-if="consoleOpen"
        class="absolute bottom-0 left-0 right-0"
        :commands="[
          { name: 'help', desc: 'Afficher l’aide' },
          { name: 'theme list', desc: 'Lister les thèmes' },
          ...themeNames.map((t) => ({
            name: `theme set ${t}`,
            desc: `Thème: ${t}`,
          })),
          { name: 'open home', desc: 'Ouvrir: home' },
          { name: 'open about', desc: 'Ouvrir: about' },
          { name: 'open projects', desc: 'Ouvrir: projects' },
          { name: 'open github', desc: 'Ouvrir: github' },
          { name: 'ascii vraith', desc: 'ASCII secret' },
          { name: 'roll', desc: 'Lancer un d20' },
        ]"
        @close="consoleOpen = false"
      />
    </main>

    <!-- Statusline -->
    <footer>
      <NvimStatusline :mode="mode" :file="activeTab?.label" :git="'main'" />
    </footer>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import files from "@/data/files.json";
import NvimTabline from "../components/NvimTabline.vue";
import NvimStatusline from "../components/NvimStatusline.vue";
import NvimExplorer from "../components/NvimExplorer.vue";
import CommandPalette from "../components/CommandPalette.vue";
import VraithConsole from "../components/VraithConsole.vue";

const tabs = ref([]);
const active = ref(null);
const paletteOpen = ref(false);
const consoleOpen = ref(false);
const mode = ref("NORMAL");

// 👉 liste des thèmes dispos (ajoute/enlève librement)
const themeNames = [
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
];

// commandes exposées à la palette
const paletteCommands = [
  // open
  ...["home", "about", "projects", "github"].map((n) => ({
    name: `open ${n}`,
    desc: `Ouvrir: ${n}`,
  })),
  { name: "theme list", desc: "Lister les thèmes" },
  // theme set <...>
  ...themeNames.map((t) => ({
    name: `theme set ${t}`,
    desc: `Thème: ${t}`,
  })),

  { name: "help", desc: "Aide palette" },
];

function open(f) {
  if (!tabs.value.find((t) => t.id === f.id)) tabs.value.push(f);
  active.value = f.id;
}
function close(id) {
  tabs.value = tabs.value.filter((t) => t.id !== id);
  if (active.value === id) active.value = tabs.value.at(-1)?.id || null;
}
const activeTab = computed(() => tabs.value.find((t) => t.id === active.value));

function setTheme(name) {
  if (!themeNames.includes(name)) return false;
  document.documentElement.setAttribute("data-theme", name);
  return true;
}

// thème toggle (entre cyberpunk et luxury par ex.)
function toggleTheme() {
  const root = document.documentElement;
  const order = ["cyberpunk", "luxury", "brand", "neutral", "brand-dark"];
  const i = order.indexOf(root.getAttribute("data-theme") || "cyberpunk");
  root.setAttribute("data-theme", order[(i + 1) % order.length]);
}

function handleCmd(cmd) {
  // open <file>
  let m;
  if ((m = cmd.match(/^open\s+(home|about|projects|github)$/i))) {
    const id = m[1].toLowerCase();
    const f = files.find((f) => f.id === id);
    if (f) open(f);
    return;
  }
  // theme set <name>
  if ((m = cmd.match(/^theme\s+set\s+([a-z0-9\-]+)$/i))) {
    const ok = setTheme(m[1].toLowerCase());
    if (!ok) console.warn("Unknown theme:", m[1]);
    return;
  }
  // theme list → affiche dans la console si ouverte, sinon log
  if (/^theme\s+list$/i.test(cmd)) {
    const list = `Themes: ${themeNames.join(", ")}`;
    if (!consoleOpen.value) console.log(list);
    // propage à la console pour affichage
    window.dispatchEvent(
      new CustomEvent("vraith-console-print", { detail: list })
    );
    return;
  }
  if (/^help$/i.test(cmd)) {
    console.log("Commands: open <file>, theme set <name>, theme list, help");
    return;
  }
}

// raccourcis
onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      paletteOpen.value = true;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
      e.preventDefault();
      consoleOpen.value = !consoleOpen.value;
    }
    if (e.key === "i" && mode.value === "NORMAL") mode.value = "INSERT";
    if (e.key === "Escape") mode.value = "NORMAL";
  });

  window.addEventListener("open-file", (e) => {
    const id = e?.detail?.id;
    if (!id) return console.warn("[console] open-file sans id");

    const f = files.find((x) => x.id === id);
    if (!f) return console.warn(`[console] fichier introuvable: ${id}`);

    open(f); // ouvre (ou focus) l’onglet
  });

  // (bonus) répondre à `theme list` demandé par la console
  window.addEventListener("theme-list-request", () => {
    window.dispatchEvent(
      new CustomEvent("vraith-console-print", {
        detail: "Themes: " + themeNames.join(", "),
      })
    );
  });
});
</script>
