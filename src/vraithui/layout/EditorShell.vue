<template>
  <div
    class="h-screen w-full grid"
    :class="showingIntro ? 'intro-mode' : ''"
    style="grid-template-rows: 48px 1fr 28px; grid-template-columns: 240px 1fr"
  >
    <!-- Effets visuels -->
    <ParticlesBackground />
    <ScanlinesOverlay />
    <!-- Command Palette (flottante, on/off) -->
    <CommandPalette
      v-if="paletteOpen"
      :commands="paletteCommands"
      @close="paletteOpen = false"
      @command="handleCmd"
    />

    <!-- Header = zone 'Cursor' / quick actions -->
    <header
      v-show="!showingIntro"
      class="col-span-2 flex items-center gap-3 px-4 border-b"
      style="border-color: rgb(var(--border))"
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
    <aside
      v-show="!showingIntro"
      class="border-r overflow-hidden"
      style="border-color: rgb(var(--border))"
    >
      <NvimExplorer :files="files" @open="open" />
    </aside>

    <!-- Éditeur + Tabline -->
    <main
      class="relative overflow-hidden"
      :class="showingIntro ? 'col-span-2' : ''"
    >
      <NvimTabline
        v-show="!showingIntro"
        :tabs="tabs"
        :active="active"
        @close="close"
        @select="active = $event"
      />

      <!-- Zone de contenu avec CustomScrollbar -->
      <CustomScrollbar
        :height="showingIntro ? '100vh' : 'calc(100% - 2rem)'"
        :thumbMinSize="40"
        :key="active"
        v-model="currentScrollPosition"
        @scroll="handleScroll"
        class="bg-[rgb(var(--bg))]"
      >
        <div class="p-6 text-[rgb(var(--fg))]">
          <component :is="activeTab?.component || 'div'" />
        </div>
      </CustomScrollbar>

      <!-- Console flottante (⌘J) -->
      <VraithConsole
        v-if="consoleOpen"
        class="absolute bottom-0 left-0 right-0"
        :commands="consoleCommands"
        @close="consoleOpen = false"
      />
    </main>

    <!-- Statusline -->
    <footer v-show="!showingIntro" class="col-span-2">
      <NvimStatusline :mode="mode" :file="activeTab?.label" :git="'main'" />
    </footer>
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

const componentsMap = {
  AboutMe,
  Projects,
  Home,
  Contact,
  Github,
};

const tabs = ref([]);
const active = ref(null);
const introCompleted = ref(false);
const showingIntro = computed(
  () => !introCompleted.value && active.value === "home"
);
const scrollPositions = ref({}); // Mémoriser les positions de scroll par section
const paletteOpen = ref(false);
const consoleOpen = ref(false);
const mode = ref("NORMAL");

// Liste des thèmes dispos (17 thèmes)
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

// Commandes pour la console
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
</style>
