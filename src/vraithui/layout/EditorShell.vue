<template>
  <div
    class="h-screen w-full grid responsive-grid"
    :class="showingIntro ? 'intro-mode' : ''"
  >
    <!-- Effets visuels (desktop + mobile acceptable) -->
    <ParticlesBackground />

    <!-- Command Palette (flottante, on/off) -->
    <CommandPalette
      v-if="paletteOpen"
      :commands="paletteCommands"
      @close="paletteOpen = false"
      @command="handleCmd"
    />

    <!-- Header -->
    <header
      v-show="!showingIntro"
      class="header-area flex items-center gap-3 px-4 border-b border-[rgb(var(--border))]"
    >
      <!-- Burger menu (mobile only, < 768px) -->
      <button
        class="burger-menu md:hidden btn btn-ghost btn-sm"
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

      <!-- Desktop palette shortcut (desktop only, >= 768px) -->
      <button
        class="palette-button hidden md:inline-flex btn btn-ghost btn-sm"
        @click="paletteOpen = true"
        title="Palette (⌘K)"
      >
        ⌘K
      </button>

      <div class="opacity-70 text-sm truncate">
        VraithUI · Nvim/Cursor shell
      </div>
      <div class="ml-auto flex items-center gap-3">
        <LanguageToggle />
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
      v-show="!showingIntro"
      class="explorer-area border-r border-[rgb(var(--border))] overflow-auto scroll-theme transition-transform"
      :class="{
        'mobile-drawer-open': mobileExplorerOpen,
        'mobile-drawer-closed': !mobileExplorerOpen,
      }"
    >
      <NvimExplorer :files="files" @open="openFile" />
    </aside>

    <!-- Éditeur + Tabline / Main -->
    <main class="main-area relative overflow-hidden">
      <NvimTabline
        v-show="!showingIntro"
        :tabs="tabs"
        :active="active"
        @close="close"
        @select="active = $event"
      />

      <!-- Contenu : utilise CustomScrollbar sur desktop, section native sur mobile -->
      <CustomScrollbar
        v-if="useCustomScrollbar"
        :height="showingIntro ? '100vh' : 'calc(100% - 2rem)'"
        :thumbMinSize="40"
        :key="active"
        v-model="currentScrollPosition"
        @scroll="handleScroll"
        class="bg-[rgb(var(--bg))]"
      >
        <div class="p-6 text-[rgb(var(--fg))] min-h-[60vh]">
          <component :is="activeTab?.component || 'div'" />
        </div>
      </CustomScrollbar>

      <section
        v-else
        class="h-[calc(100%-2rem)] p-4 md:p-6 overflow-auto scroll-theme text-[rgb(var(--fg))]"
      >
        <component :is="activeTab?.component || 'div'" />
      </section>

      <!-- Console flottante (⌘J) -->
      <VraithConsole
        v-if="consoleOpen"
        class="absolute bottom-0 left-0 right-0"
        @close="consoleOpen = false"
      />
    </main>

    <!-- Statusline -->
    <footer class="footer-area" v-show="!showingIntro">
      <NvimStatusline :mode="mode" :file="activeTab?.label" :git="'main'" />
    </footer>

    <!-- Mobile Controls (FABs) -->
    <MobileControls
      v-show="!showingIntro"
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick, markRaw } from "vue";
import files from "@/data/files.json";
import { useThemeStore } from "@/stores/themeStore";
import { useCommandStore } from "@/stores/commandStore";
import { useLanguageStore } from "@/stores/languageStore";

/* Components */
import NvimTabline from "../components/NvimTabline.vue";
import NvimStatusline from "../components/NvimStatusline.vue";
import NvimExplorer from "../components/NvimExplorer.vue";
import CommandPalette from "../components/CommandPalette.vue";
import VraithConsole from "../components/VraithConsole.vue";
import CustomScrollbar from "../components/CustomScrollbar.vue";
import MobileControls from "../components/MobileControls.vue";
import LanguageToggle from "../components/LanguageToggle.vue";

/* Sections / Pages */
import Home from "../sections/Home.vue";
import AboutMe from "../sections/AboutMe.vue";
import Projects from "../sections/Projects.vue";
import Github from "../sections/Github.vue";
import Contact from "../sections/Contact.vue";

/* Effects */
import ParticlesBackground from "../effects/ParticlesBackground.vue";


/* Stores */
const themeStore = useThemeStore();
const commandStore = useCommandStore();
const languageStore = useLanguageStore();

/* Map des composants – markRaw pour éviter réactivité lourde */
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

const introCompleted = ref(false);
const showingIntro = computed(
  () => !introCompleted.value && active.value === "home"
);

/* Scroll positions par onglet */
const scrollPositions = ref({});
const currentScrollPosition = computed({
  get: () => scrollPositions.value[active.value] || 0,
  set: (val) => {
    if (active.value) scrollPositions.value[active.value] = val;
  },
});

/* Console & Palette commands - generated from command store */
const paletteCommands = computed(() => {
  const commands = [];

  // Add all registered commands
  commandStore.allCommands.forEach(cmd => {
    commands.push({
      name: cmd.name,
      desc: cmd.description,
    });
  });

  // Add dynamic theme set commands
  themeStore.themeNames.forEach(themeName => {
    commands.push({
      name: `theme set ${themeName}`,
      desc: `Set theme: ${themeName}`,
    });
  });

  return commands;
});

/* Utility: decide whether to use CustomScrollbar */
const useCustomScrollbar = computed(() => {
  return typeof window !== "undefined" ? window.innerWidth >= 768 : true;
});
/* Tab helpers */
function openFileObject(tabObj) {
  const tab = {
    id: tabObj.id,
    label: tabObj.label || tabObj.id,
    component: componentMap[tabObj.id] || "div",
  };
  if (!tabs.value.find((t) => t.id === tab.id)) tabs.value.push(tab);
  active.value = tab.id;
}

function open(f) {
  openFileObject(f);
}

function openFile(f) {
  open(f);
  mobileExplorerOpen.value = false;
}

function close(id) {
  tabs.value = tabs.value.filter((t) => t.id !== id);
  if (active.value === id) active.value = tabs.value.at(-1)?.id || null;
}

const activeTab = computed(() => tabs.value.find((t) => t.id === active.value));

function handleScroll(position) {
  if (active.value) scrollPositions.value[active.value] = position;
}

/* Theme functions - now using themeStore */
function toggleTheme() {
  themeStore.toggleMode();
}

/* Command handler - now using commandStore */
function handleCmd(cmd) {
  // Execute command through store
  const result = commandStore.execute(cmd);

  // Handle specific actions from command result
  if (result.action === 'navigate' && result.section) {
    // Navigate to section
    const file = files.find((f) => f.id === result.section);
    if (file) {
      open(file);
    }
  } else if (result.action === 'close-console') {
    // Close console with slight delay for UX
    setTimeout(() => {
      consoleOpen.value = false;
    }, 300);
  }

  // Auto-open console if command requires it
  if (result.requiresConsole && !consoleOpen.value) {
    consoleOpen.value = true;
  }
}

/* Event listeners */
function onKeydown(e) {
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
}

function onOpenFileEvent(e) {
  const id = e?.detail?.id;
  if (!id) return console.warn("[console] open-file sans id");
  const f = files.find((x) => x.id === id);
  if (!f) return console.warn(`[console] fichier introuvable: ${id}`);
  open(f);
}

// Removed onThemeListRequest - no longer needed with commandStore

function onIntroComplete() {
  introCompleted.value = true;
  localStorage.setItem("vraith-intro-completed", "true");
  const homeTab = tabs.value.find((t) => t.id === "home");
  if (homeTab) close("home");
  const aboutFile = files.find((f) => f.id === "about");
  if (aboutFile) open(aboutFile);
}

onMounted(() => {
  // Initialize language store FIRST
  languageStore.initialize();

  const hasCompletedIntro = localStorage.getItem("vraith-intro-completed");
  introCompleted.value = hasCompletedIntro === "true";

  if (!introCompleted.value) {
    const homeFile = files.find((f) => f.id === "home");
    if (homeFile) open(homeFile);
  } else {
    const aboutFile = files.find((f) => f.id === "about");
    if (aboutFile) open(aboutFile);
  }

  window.addEventListener("keydown", onKeydown);
  window.addEventListener("open-file", onOpenFileEvent);
  window.addEventListener("intro-complete", onIntroComplete);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("open-file", onOpenFileEvent);
  window.removeEventListener("intro-complete", onIntroComplete);
});
</script>

<style scoped>
.intro-mode {
  grid-template-rows: 1fr !important;
  grid-template-columns: 1fr !important;
}

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

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Ensure mutually exclusive buttons */
.burger-menu {
  display: flex;
}

.palette-button {
  display: none;
}

@media (min-width: 768px) {
  .burger-menu {
    display: none !important;
  }

  .palette-button {
    display: inline-flex !important;
  }
}

.main-area > .custom-scrollbar,
.main-area > section {
  height: calc(100% - 2rem);
}
</style>
