<template>
  <div class="scanlines-overlay" :class="{ active: enabled }"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const enabled = ref(true);

// Toggle avec commande console (optionnel)
onMounted(() => {
  window.addEventListener("toggle-scanlines", () => {
    enabled.value = !enabled.value;
  });
});
</script>

<style scoped>
.scanlines-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.scanlines-overlay.active {
  opacity: 1;
}

/* Scanlines effet */
.scanlines-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgb(var(--fg) / 0.08),
    rgb(var(--fg) / 0.08) 1px,
    transparent 1px,
    transparent 2px
  );
  animation: scanline 8s linear infinite;
}

/* Animation de défilement subtile */
@keyframes scanline {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(10px);
  }
}

/* Vignette subtile sur les bords */
.scanlines-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgb(var(--bg) / 0.3) 100%
  );
}

/* Flicker aléatoire très subtil */
.scanlines-overlay.active {
  animation: flicker 3s infinite;
}

@keyframes flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.98;
  }
}

/* Responsive : moins visible sur mobile */
@media (max-width: 768px) {
  .scanlines-overlay::before {
    opacity: 0.3;
  }
}
</style>
