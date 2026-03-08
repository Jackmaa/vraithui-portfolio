<template>
  <div
    class="home-container fixed inset-0 z-[60] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] overflow-hidden"
  >
    <!-- ============================================ -->
    <!-- Intro game (boot + terminal + matrix rain)   -->
    <!-- ============================================ -->
    <TerminalGame v-if="!introCompleted" @complete="onIntroComplete" />

    <!-- ============================================ -->
    <!-- Main interface (shown after intro)           -->
    <!-- ============================================ -->
    <div v-else class="flex flex-col h-full">
      <!-- Header with logo -->
      <header class="flex-shrink-0 py-12 md:py-16 lg:py-20">
        <div class="text-center space-y-4 md:space-y-6">
          <div class="flex justify-center">
            <VraithLogo
              size="clamp(80px, 15vw, 140px)"
              animate="float"
              :glowIntensity="0.6"
            />
          </div>

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

      <!-- Navigation cards -->
      <main
        class="flex-1 flex items-start justify-center p-4 md:p-8 pb-8 overflow-auto"
      >
        <div class="w-full max-w-5xl">
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            <!-- About Me -->
            <button @click="navigateTo('about')" class="cursor-card group">
              <div class="card-icon-wrapper">
                <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="card-label">About me</span>
            </button>

            <!-- Projects -->
            <button @click="navigateTo('projects')" class="cursor-card group">
              <div class="card-icon-wrapper">
                <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <span class="card-label">Projects</span>
            </button>

            <!-- GitHub -->
            <button @click="navigateTo('github')" class="cursor-card group">
              <div class="card-icon-wrapper">
                <svg class="card-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <span class="card-label">GitHub</span>
            </button>

            <!-- Contact -->
            <button
              @click="navigateTo('contact')"
              class="cursor-card group md:col-span-2 lg:col-span-1"
            >
              <div class="card-icon-wrapper">
                <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="card-label">Contact</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import TerminalGame from "../components/TerminalGame.vue";
import VraithLogo from "../components/VraithLogo.vue";

// Check localStorage immediately so TerminalGame never mounts if already done
const introCompleted = ref(!!localStorage.getItem("vraith-intro-completed"));

function onIntroComplete() {
  introCompleted.value = true;
}

function navigateTo(section) {
  window.dispatchEvent(new CustomEvent("open-file", { detail: { id: section } }));
}

// Global shortcuts — work even while TerminalGame is active
function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("toggle-palette", { detail: true }));
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("toggle-console"));
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
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

/* Card entrance animations */
.cursor-card {
  animation: cardFadeIn 0.5s ease-out backwards;
}

.cursor-card:nth-child(1) { animation-delay: 0.1s; }
.cursor-card:nth-child(2) { animation-delay: 0.2s; }
.cursor-card:nth-child(3) { animation-delay: 0.3s; }
.cursor-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scrollbar */
::-webkit-scrollbar       { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(var(--border), 0.5); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(var(--accent), 0.5); }

/* Responsive */
@media (max-width: 768px) {
  .cursor-card { min-height: 140px; }
}
</style>
