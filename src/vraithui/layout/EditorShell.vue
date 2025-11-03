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
import { ref, computed, onMounted } from "vue";
import files from "@/data/files.json";
import NvimTabline from "../components/NvimTabline.vue";
import Github from "../sections/Github.vue";
import NvimStatusline from "../components/NvimStatusline.vue";
import NvimExplorer from "../components/NvimExplorer.vue";
import CommandPalette from "../components/CommandPalette.vue";
import VraithConsole from "../components/VraithConsole.vue";
import CustomScrollbar from "../components/CustomScrollbar.vue";
import AboutMe from "../sections/AboutMe.vue";
import Projects from "../sections/Projects.vue";
import Home from "../sections/Home.vue";
import Contact from "../sections/Contact.vue";
import ParticlesBackground from "../effects/ParticlesBackground.vue";
import ScanlinesOverlay from "../effects/ScanlinesOverlay.vue";

import MobileControls from "../components/MobileControls.vue";

const componentsMap = {
  home: Home,
  about: AboutMe,
  projects: Projects,
  github: Github,
  contact: Contact,
};

const tabs = ref([]);
const active = ref(null);
const introCompleted = ref(false);
const showingIntro = computed(
  () => !introCompleted.value && active.value === "home"
);
const paletteOpen = ref(false);
const consoleOpen = ref(false);
const mobileExplorerOpen = ref(false);
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
  "oxford-maize",
  "rich-black",
];

const consoleCommands = computed(() => [
  { name: "help", desc: "Afficher l'aide" },
  { name: "theme list", desc: "Lister les thèmes" },
  ...themeNames.map((t) => ({
    name: `theme set ${t}`,
    desc: `Thème: ${t}`,
  })),
  { name: "open home", desc: "Ouvrir: home" },
  { name: "open about", desc: "Ouvrir: about" },
  { name: "open projects", desc: "Ouvrir: projects" },
  { name: "open github", desc: "Ouvrir: github" },
  { name: "ascii vraith", desc: "ASCII secret" },
  { name: "roll", desc: "Lancer un d20" },
  { name: "clear", desc: "Effacer la console" },
  { name: "exit", desc: "Fermer la console" },
  { name: "open contact", desc: "Ouvrir: contact" },
]);
// commandes exposées à la palette
// Commandes exposées à la palette
const paletteCommands = [
  ...["home", "about", "projects", "contact", "github"].map((n) => ({
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
  if (!tabs.value.find((t) => t.id === f.id)) tabs.value.push(f);
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

const activeTab = computed(() => {
  const tab = tabs.value.find((t) => t.id === active.value);
  if (!tab) return null;
  return {
    ...tab,
    component: componentsMap[tab.component] || "div",
  };
});

// Position de scroll actuelle (liée à la section active)
const currentScrollPosition = computed({
  get: () => scrollPositions.value[active.value] || 0,
  set: (val) => {
    if (active.value) {
      scrollPositions.value[active.value] = val;
    }
  },
});

function handleScroll(position) {
  if (active.value) {
    scrollPositions.value[active.value] = position;
  }
}
function setTheme(name) {
  if (!themeNames.includes(name)) return false;
  document.documentElement.setAttribute("data-theme", name);
  return true;
}

// thème toggle (entre cyberpunk et luxury par ex.)
function toggleTheme() {
  const root = document.documentElement;
  const order = [
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
    console.log("Commands: open <file>, theme set <name>, theme list, help");
    return;
  }
}

onMounted(() => {
  // Vérifier si l'intro a déjà été complétée
  const hasCompletedIntro = localStorage.getItem("vraith-intro-completed");
  introCompleted.value = hasCompletedIntro === "true";

  // Si l'intro n'est pas complétée, ouvrir Home automatiquement
  if (!introCompleted.value) {
    const homeFile = files.find((f) => f.id === "home");
    if (homeFile) open(homeFile);
  } else {
    // Sinon, ouvrir About par défaut
    const aboutFile = files.find((f) => f.id === "about");
    if (aboutFile) open(aboutFile);
  }

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

    open(f);
  });

  window.addEventListener("theme-list-request", () => {
    window.dispatchEvent(
      new CustomEvent("vraith-console-print", {
        detail: "Themes: " + themeNames.join(", "),
      })
    );
  });

  // Écouter la fin de l'intro pour fermer Home et ouvrir About
  window.addEventListener("intro-complete", () => {
    introCompleted.value = true;

    // Fermer l'onglet Home
    const homeTab = tabs.value.find((t) => t.id === "home");
    if (homeTab) {
      close("home");
    }

    // Ouvrir About
    const aboutFile = files.find((f) => f.id === "about");
    if (aboutFile) {
      open(aboutFile);
    }
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
