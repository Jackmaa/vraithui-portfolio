<template>
  <div class="h-screen w-full grid responsive-grid">
    <!-- Command Palette (flottante, on/off) -->
    <CommandPalette
      v-if="paletteOpen"
      :commands="paletteCommands"
      @close="paletteOpen = false"
      @command="handleCmd"
    />

    <!-- Header = zone 'Cursor' / quick actions -->
    <header
      class="header-area flex items-center gap-3 px-4 border-b border-[rgb(var(--border))]"
    >
      <!-- Burger menu (mobile only) -->
      <button
        class="md:hidden btn btn-ghost btn-sm"
        @click="mobileExplorerOpen = !mobileExplorerOpen"
        aria-label="Toggle file explorer"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <button
        class="hidden md:inline-flex btn btn-ghost btn-sm"
        @click="paletteOpen = true"
      >
        ⌘K
      </button>
      <div class="opacity-70 text-sm truncate">
        VraithUI · Nvim/Cursor shell
      </div>
      <div class="ml-auto flex items-center gap-3">
        <button class="btn btn-ghost btn-sm" @click="toggleTheme">Theme</button>
      </div>
    </header>

    <!-- Mobile drawer overlay -->
    <div
      v-if="mobileExplorerOpen"
      class="fixed inset-0 bg-black/50 z-30 md:hidden"
      @click="mobileExplorerOpen = false"
    ></div>

    <!-- Explorer -->
    <aside
      class="explorer-area border-r border-[rgb(var(--border))] overflow-auto scroll-theme transition-transform"
      :class="{
        'mobile-drawer-open': mobileExplorerOpen,
        'mobile-drawer-closed': !mobileExplorerOpen,
      }"
    >
      <NvimExplorer :files="files" @open="openFile" />
    </aside>

    <!-- Éditeur + Tabline -->
    <main class="main-area relative overflow-hidden">
      <NvimTabline
        :tabs="tabs"
        :active="active"
        @close="close"
        @select="active = $event"
      />
      <section
        class="h-[calc(100%-2rem)] p-4 md:p-6 overflow-auto scroll-theme text-[rgb(var(--fg))]"
      >
        <component :is="activeTab?.component || 'div'" />
      </section>

      <!-- Console flottante (⌘J) -->
      <VraithConsole
        v-if="consoleOpen"
        class="absolute bottom-0 left-0 right-0"
        :commands="[
          { name: 'help', desc: 'Afficher l\'aide' },
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
    <footer class="footer-area">
      <NvimStatusline :mode="mode" :file="activeTab?.label" :git="'main'" />
    </footer>

    <!-- Mobile Controls (FAB buttons) -->
    <MobileControls
      :explorerOpen="mobileExplorerOpen"
      :consoleOpen="consoleOpen"
      :paletteOpen="paletteOpen"
      @toggle-explorer="mobileExplorerOpen = !mobileExplorerOpen"
      @toggle-console="consoleOpen = !consoleOpen"
      @toggle-palette="paletteOpen = true"
    />
  </div>
</template>

<script setup>
import files from "../../data/files.json";
import { ref, computed, onMounted, markRaw } from "vue";
import NvimTabline from "../components/NvimTabline.vue";
import NvimStatusline from "../components/NvimStatusline.vue";
import NvimExplorer from "../components/NvimExplorer.vue";
import CommandPalette from "../components/CommandPalette.vue";
import VraithConsole from "../components/VraithConsole.vue";
import MobileControls from "../components/MobileControls.vue";

// 👉 Import des composants de pages
import Home from "../sections/Home.vue";
import AboutMe from "../sections/AboutMe.vue";
import Projects from "../sections/Projects.vue";
import Github from "../sections/Github.vue";
import Contact from "../sections/Contact.vue";

// 👉 Map des composants (structure des fichiers)
const componentMap = {
  home: markRaw(Home),
  about: markRaw(AboutMe),
  projects: markRaw(Projects),
  github: markRaw(Github),
  contact: markRaw(Contact),
};

const tabs = ref([]);
const active = ref(null);
const paletteOpen = ref(false);
const consoleOpen = ref(false);
const mobileExplorerOpen = ref(false);
const mode = ref("NORMAL");

// 👉 liste des thèmes dispos
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
  "oxford-maize",
  "rich-black",
];

// commandes exposées à la palette
const paletteCommands = [
  ...["home", "about", "projects", "github"].map((n) => ({
    name: `open ${n}`,
    desc: `Ouvrir: ${n}`,
  })),
  { name: "theme list", desc: "Lister les thèmes" },
  ...themeNames.map((t) => ({
    name: `theme set ${t}`,
    desc: `Thème: ${t}`,
  })),
  { name: "help", desc: "Aide palette" },
];

function open(f) {
  // Crée un objet tab avec le composant associé
  const tab = {
    id: f.id,
    label: f.label,
    component: componentMap[f.id] || "div",
  };

  if (!tabs.value.find((t) => t.id === f.id)) tabs.value.push(tab);
  active.value = f.id;
}

function openFile(f) {
  open(f);
  // Ferme le drawer mobile après sélection
  mobileExplorerOpen.value = false;
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

function toggleTheme() {
  const root = document.documentElement;
  const order = ["cyberpunk", "luxury", "brand", "neutral", "brand-dark"];
  const i = order.indexOf(root.getAttribute("data-theme") || "cyberpunk");
  root.setAttribute("data-theme", order[(i + 1) % order.length]);
}

function handleCmd(cmd) {
  let m;
  if ((m = cmd.match(/^open\s+(home|about|projects|github)$/i))) {
    const id = m[1].toLowerCase();
    const f = files.find((f) => f.id === id);
    if (f) open(f);
    return;
  }
  if ((m = cmd.match(/^theme\s+set\s+([a-z0-9\-]+)$/i))) {
    const ok = setTheme(m[1].toLowerCase());
    if (!ok) console.warn("Unknown theme:", m[1]);
    return;
  }
  if (/^theme\s+list$/i.test(cmd)) {
    const list = `Themes: ${themeNames.join(", ")}`;
    if (!consoleOpen.value) console.log(list);
    window.dispatchEvent(
      new CustomEvent("vraith-console-print", { detail: list })
    );
    return;
  }
  if (/^help$/i.test(cmd)) {
    console.log("Commands: open <file>, theme set <n>, theme list, help");
    return;
  }
}

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
    if (e.key === "Escape") {
      if (paletteOpen.value) paletteOpen.value = false;
      else if (consoleOpen.value) consoleOpen.value = false;
      else if (mobileExplorerOpen.value) mobileExplorerOpen.value = false;
      else mode.value = "NORMAL";
    }
    if (e.key === "i" && mode.value === "NORMAL") mode.value = "INSERT";
  });

  window.addEventListener("open-file", (e) => {
    const id = e?.detail?.id;
    if (!id) return console.warn("[console] open-file sans id");
    const f = files.find((x) => x.id === id);
    if (!f) return console.warn(`[console] fichier introuvable: ${id}`);
    open(f);
  });

  window.addEventListener("theme-list-request", () => {
    window.dispatchEvent(
      new CustomEvent("vraith-console-print", {
        detail: "Themes: " + themeNames.join(", "),
      })
    );
  });
});
</script>

<style scoped>
.intro-mode {
  grid-template-rows: 1fr !important;
  grid-template-columns: 1fr !important;
}
/* Grid responsive */
.responsive-grid {
  grid-template-areas:
    "header header"
    "explorer main"
    "footer footer";
  grid-template-rows: 48px 1fr 28px;
  grid-template-columns: 240px 1fr;
}

.header-area {
  grid-area: header;
}
.explorer-area {
  grid-area: explorer;
}
.main-area {
  grid-area: main;
}
.footer-area {
  grid-area: footer;
}

/* Mobile: drawer pour l'explorer */
@media (max-width: 768px) {
  .responsive-grid {
    grid-template-areas:
      "header"
      "main"
      "footer";
    grid-template-rows: 48px 1fr 28px;
    grid-template-columns: 1fr;
  }

  .explorer-area {
    position: fixed;
    top: 48px;
    left: 0;
    bottom: 28px;
    width: 280px;
    z-index: 40;
    background: rgb(var(--panel));
    box-shadow: 2px 0 12px rgb(0 0 0 / 0.2);
  }

  .mobile-drawer-closed {
    transform: translateX(-100%);
  }

  .mobile-drawer-open {
    transform: translateX(0);
  }
}
</style>
