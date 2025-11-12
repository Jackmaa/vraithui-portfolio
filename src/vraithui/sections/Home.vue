<template>
  <div
    class="home-container fixed inset-0 z-[60] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] overflow-hidden"
  >
    <!-- Skip button (seulement pendant l'intro) -->
    <button
      v-if="!completed && !skipped && phase !== 'main'"
      @click="skipIntro"
      class="absolute top-4 right-4 z-[70] px-3 py-1.5 text-xs border border-[rgb(var(--border))] rounded hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] transition-all"
    >
      Skip intro [ESC]
    </button>

    <!-- Matrix Rain (transition finale) -->
    <MatrixRain v-if="showMatrix" @complete="finishUnlock" />

    <!-- Main content -->
    <div v-if="!showMatrix" class="h-full flex flex-col overflow-hidden">
      <!-- ============================================ -->
      <!-- PHASE 1 : Boot sequence                      -->
      <!-- ============================================ -->
      <div
        v-if="phase === 'boot'"
        class="flex items-center justify-center h-full"
      >
        <div class="w-full max-w-2xl space-y-2 text-sm px-8">
          <div
            v-for="(msg, i) in bootMessages"
            :key="i"
            class="boot-line"
            :style="{ animationDelay: `${i * 0.3}s` }"
          >
            <span
              :class="
                msg.type === 'error'
                  ? 'text-red-400'
                  : msg.type === 'warn'
                  ? 'text-yellow-400'
                  : 'text-green-400'
              "
            >
              [{{ msg.type.toUpperCase() }}]
            </span>
            {{ msg.text }}
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- PHASE 2 : Terminal game                      -->
      <!-- ============================================ -->
      <div
        v-else-if="phase === 'game'"
        class="flex items-center justify-center h-full"
      >
        <div class="w-full max-w-2xl px-8">
          <!-- ASCII Banner -->
          <pre
            class="text-[rgb(var(--accent))] text-center mb-6 text-xs glow-text"
          >
╔═══════════════════════════════════════════╗
║  RESTRICTED ACCESS - AUTHENTICATION REQ.  ║
╚═══════════════════════════════════════════╝</pre
          >

          <!-- Terminal output -->
          <div class="space-y-2 text-sm mb-4 max-h-64 overflow-auto">
            <div
              v-for="(line, i) in terminalLines"
              :key="i"
              class="terminal-line"
            >
              <span
                v-if="line.type === 'prompt'"
                class="text-[rgb(var(--accent))]"
                >vraith@portfolio:~$</span
              >
              <span v-if="line.type === 'input'" class="ml-2">{{
                line.text
              }}</span>
              <span
                v-if="line.type === 'output'"
                :class="
                  line.error
                    ? 'text-red-400'
                    : line.success
                    ? 'text-green-400'
                    : 'opacity-80'
                "
              >
                {{ line.text }}
              </span>
            </div>
          </div>

          <!-- Progress indicator -->
          <div
            v-if="currentStep < steps.length"
            class="mb-4 text-xs opacity-60"
          >
            Progress: {{ currentStep }}/{{ steps.length }}
          </div>

          <!-- Input -->
          <div class="flex items-center gap-2">
            <span class="text-[rgb(var(--accent))]">vraith@portfolio:~$</span>
            <input
              ref="inputRef"
              v-model="currentInput"
              @keydown.enter="executeCommand"
              @keydown.tab.prevent="autocomplete"
              class="flex-1 bg-transparent outline-none border-b border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] transition-colors px-2 py-1"
              :placeholder="currentHint"
            />
          </div>

          <!-- Hint -->
          <div v-if="showHint" class="mt-2 text-xs opacity-60">
            💡 Hint: {{ currentHint }}
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- PHASE 3 : Main interface (style Cursor AI)   -->
      <!-- ============================================ -->
      <div v-else-if="phase === 'main'" class="flex flex-col h-full">
        <!-- Header avec logo -->
        <header class="flex-shrink-0 py-12 md:py-16 lg:py-20">
          <div class="text-center space-y-4 md:space-y-6">
            <!-- Logo SVG -->
            <div class="flex justify-center">
              <VraithLogo
                size="clamp(80px, 15vw, 140px)"
                animate="float"
                :glowIntensity="0.6"
              />
            </div>

            <!-- Titre et sous-titre -->
            <div>
              <h1
                class="text-4xl md:text-5xl lg:text-6xl font-bold text-[rgb(var(--fg))] mb-2 tracking-tight"
              >
                Vraith
              </h1>
              <p class="text-sm md:text-base opacity-60">
                Developer Portfolio •
                <span
                  class="text-[rgb(var(--accent))] cursor-pointer hover:underline"
                  @click="navigateTo('about')"
                >
                  Explore
                </span>
              </p>
            </div>
          </div>
        </header>

        <!-- Main actions (style Cursor cards) -->
        <main
          class="flex-1 flex items-start justify-center p-4 md:p-8 pb-8 overflow-auto"
        >
          <div class="w-full max-w-5xl">
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              <!-- Card About Me -->
              <button @click="navigateTo('about')" class="cursor-card group">
                <div class="card-icon-wrapper">
                  <svg
                    class="card-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span class="card-label">About me</span>
              </button>

              <!-- Card Projects -->
              <button @click="navigateTo('projects')" class="cursor-card group">
                <div class="card-icon-wrapper">
                  <svg
                    class="card-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <span class="card-label">Projects</span>
              </button>

              <!-- Card GitHub -->
              <button @click="navigateTo('github')" class="cursor-card group">
                <div class="card-icon-wrapper">
                  <svg
                    class="card-icon"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                </div>
                <span class="card-label">GitHub</span>
              </button>

              <!-- Card Contact -->
              <button
                @click="navigateTo('contact')"
                class="cursor-card group md:col-span-2 lg:col-span-1"
              >
                <div class="card-icon-wrapper">
                  <svg
                    class="card-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span class="card-label">Contact</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import MatrixRain from "../components/Matrix.vue";
import VraithLogo from "../components/VraithLogo.vue";

const phase = ref("boot"); // boot | game | main
const bootMessages = ref([
  { type: "init", text: "Connecting to vraith.dev..." },
  { type: "warn", text: "Unauthorized access detected" },
  { type: "scan", text: "Analyzing visitor credentials..." },
  { type: "error", text: "Access denied. Authorization required." },
]);

const terminalLines = ref([]);
const currentInput = ref("");
const currentStep = ref(0);
const inputRef = ref(null);
const completed = ref(false);
const skipped = ref(false);
const showMatrix = ref(false);
const showHint = ref(true);

// Game steps
const steps = [
  {
    command: "scan",
    hint: "Type 'scan' to analyze the system",
    responses: [
      "[SCANNING] Analyzing system architecture...",
      "[FOUND] Weak point detected: /auth/bypass",
      "[HINT] Try: bypass",
    ],
  },
  {
    command: "bypass",
    hint: "Type 'bypass' to override security",
    responses: [
      "[BYPASS] Overriding security protocols...",
      "████████████████████████████ 100%",
      "[SUCCESS] Firewall disabled",
      "[HINT] Execute: access",
    ],
  },
  {
    command: "access",
    hint: "Type 'access' to unlock the portfolio",
    responses: ["[AUTH] Verifying credentials...", "[OK] Access granted.", ""],
  },
];

const currentHint = computed(() => {
  if (currentStep.value >= steps.length) return "";
  return steps[currentStep.value].hint;
});

function addLine(text, type = "output", options = {}) {
  terminalLines.value.push({ text, type, ...options });
}

function executeCommand() {
  const cmd = currentInput.value.trim().toLowerCase();

  if (!cmd) return;

  addLine(cmd, "input");
  addLine("", "prompt");

  if (currentStep.value < steps.length) {
    const step = steps[currentStep.value];

    if (cmd === step.command) {
      step.responses.forEach((response) => {
        addLine(response, "output", { success: true });
      });
      currentStep.value++;

      if (currentStep.value >= steps.length) {
        setTimeout(() => {
          showMatrix.value = true;
        }, 1000);
      }
    } else if (cmd === "help") {
      addLine("Available commands:", "output");
      addLine(`  ${step.command.padEnd(15)} - ${step.hint}`, "output");
    } else {
      addLine(`Command not recognized: ${cmd}`, "output", { error: true });
      addLine(`Type 'help' for available commands`, "output");
    }
  }

  currentInput.value = "";
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function autocomplete() {
  if (currentStep.value < steps.length) {
    const step = steps[currentStep.value];
    currentInput.value = step.command;
  }
}

function skipIntro() {
  skipped.value = true;
  localStorage.setItem("vraith-intro-completed", "true");
  finishUnlock();
}

function finishUnlock() {
  completed.value = true;
  showMatrix.value = false;
  phase.value = "main";
  localStorage.setItem("vraith-intro-completed", "true");
}

function navigateTo(section) {
  // Émettre un événement pour EditorShell
  window.dispatchEvent(
    new CustomEvent("open-file", { detail: { id: section } })
  );
}

// Handler pour raccourcis clavier - CRITIQUE pour palette/console
function handleKeydown(e) {
  // ESC pour skip intro (seulement si pas en phase main)
  if (e.key === "Escape" && !completed.value && phase.value !== "main") {
    skipIntro();
  }

  // Ctrl/Cmd+K pour palette (fonctionne PARTOUT, même sur Home)
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("toggle-palette", { detail: true }));
  }

  // Ctrl/Cmd+J pour console (fonctionne PARTOUT, même sur Home)
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("toggle-console"));
  }
}

onMounted(() => {
  // Check if already completed
  const hasCompleted = localStorage.getItem("vraith-intro-completed");

  if (hasCompleted) {
    skipIntro();
    return;
  }

  // Boot sequence
  setTimeout(() => {
    phase.value = "game";
    addLine('System locked. Type "help" to proceed.', "output");
    addLine("", "prompt");

    nextTick(() => {
      inputRef.value?.focus();
    });
  }, bootMessages.value.length * 300 + 500);

  // IMPORTANT : Ajouter les listeners pour les raccourcis
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  // Cleanup : retirer les listeners
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
/* Boot animation */
.boot-line {
  opacity: 0;
  animation: fadeInLine 0.3s ease-out forwards;
}

@keyframes fadeInLine {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Terminal */
.terminal-line {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.glow-text {
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
}

input::placeholder {
  opacity: 0.4;
  font-style: italic;
}

/* ============================================ */
/* CURSOR-STYLE CARDS                           */
/* ============================================ */

.cursor-card {
  @apply relative flex flex-col items-center justify-center;
  @apply p-8 md:p-10 lg:p-12;
  @apply bg-[rgb(var(--bg))]/50 backdrop-blur-sm;
  @apply border border-[rgb(var(--border))];
  @apply rounded-xl;
  @apply transition-all duration-300 ease-out;
  @apply outline-none;
  min-height: 180px;
}

.cursor-card:hover {
  @apply border-[rgb(var(--accent))];
  @apply bg-[rgb(var(--accent))]/5;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--accent), 0.15);
}

.cursor-card:active {
  transform: translateY(-2px);
}

.card-icon-wrapper {
  @apply mb-4 md:mb-6;
  @apply w-14 h-14 md:w-16 md:h-16;
  @apply flex items-center justify-center;
  @apply rounded-lg;
  @apply bg-[rgb(var(--fg))]/5;
  @apply transition-all duration-300;
}

.cursor-card:hover .card-icon-wrapper {
  @apply bg-[rgb(var(--accent))]/10;
  transform: scale(1.05);
}

.card-icon {
  @apply w-8 h-8 md:w-10 md:h-10;
  @apply text-[rgb(var(--fg))]/60;
  @apply transition-colors duration-300;
}

.cursor-card:hover .card-icon {
  @apply text-[rgb(var(--accent))];
}

.card-label {
  @apply text-base md:text-lg lg:text-xl;
  @apply font-medium;
  @apply text-[rgb(var(--fg))]/80;
  @apply transition-colors duration-300;
}

.cursor-card:hover .card-label {
  @apply text-[rgb(var(--fg))];
}

/* Kbd style */
.kbd {
  @apply inline-block px-2 py-1;
  @apply text-xs;
  @apply border border-[rgb(var(--border))];
  @apply rounded;
  @apply bg-[rgb(var(--fg))]/5;
  @apply font-mono;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cursor-card {
    min-height: 140px;
  }
}

/* Animation d'entrée pour les cards */
.cursor-card {
  animation: cardFadeIn 0.5s ease-out backwards;
}

.cursor-card:nth-child(1) {
  animation-delay: 0.1s;
}
.cursor-card:nth-child(2) {
  animation-delay: 0.2s;
}
.cursor-card:nth-child(3) {
  animation-delay: 0.3s;
}
.cursor-card:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar custom */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--border), 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--accent), 0.5);
}
</style>
