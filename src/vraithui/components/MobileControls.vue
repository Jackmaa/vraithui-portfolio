<template>
  <!-- Boutons flottants (FAB) visibles uniquement sur mobile -->
  <div
    class="mobile-controls fixed bottom-6 right-6 z-40 flex flex-col gap-3 md:hidden"
  >
    <!-- Menu Explorer (burger) -->
    <button
      @click="$emit('toggle-explorer')"
      :class="{ 'bg-[rgb(var(--accent))]': explorerOpen }"
      class="fab-button group"
      aria-label="Toggle file explorer"
    >
      <svg
        class="w-6 h-6 transition-transform"
        :class="{ 'rotate-90': explorerOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          v-if="!explorerOpen"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
        <path
          v-else
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <span class="fab-tooltip">Fichiers</span>
    </button>

    <!-- Console (⌘J) -->
    <button
      @click="$emit('toggle-console')"
      :class="{ 'bg-[rgb(var(--accent))]': consoleOpen }"
      class="fab-button group"
      aria-label="Toggle console"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span class="fab-tooltip">Console</span>
    </button>

    <!-- Command Palette (⌘K) -->
    <button
      @click="$emit('toggle-palette')"
      :class="{ 'bg-[rgb(var(--accent))]': paletteOpen }"
      class="fab-button group"
      aria-label="Open command palette"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <span class="fab-tooltip">Commandes</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  explorerOpen: Boolean,
  consoleOpen: Boolean,
  paletteOpen: Boolean,
});

defineEmits(["toggle-explorer", "toggle-console", "toggle-palette"]);
</script>

<style scoped>
.fab-button {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--panel-2));
  border: 1px solid rgb(var(--border));
  color: rgb(var(--fg));
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
}

.fab-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgb(var(--accent) / 0.3);
  border-color: rgb(var(--accent));
}

.fab-button:active {
  transform: scale(0.95);
}

/* Tooltip */
.fab-tooltip {
  position: absolute;
  right: 70px;
  background: rgb(var(--panel));
  border: 1px solid rgb(var(--border));
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
}

.fab-button:hover .fab-tooltip {
  opacity: 1;
}

/* Animation d'entrée */
.fab-button {
  animation: fabSlideIn 0.3s ease-out backwards;
}

.fab-button:nth-child(1) {
  animation-delay: 0.1s;
}
.fab-button:nth-child(2) {
  animation-delay: 0.2s;
}
.fab-button:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes fabSlideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
