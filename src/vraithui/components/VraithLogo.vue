<template>
  <svg
    :class="['vraith-logo', animationClass]"
    :style="{ width: size, height: size }"
    viewBox="0 0 62 65"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      class="logo-path"
      d="M2 2L31.0607 63L60 2L41.0711 13.6937L44.954 16.587L31.0607 46.1225L17.046 16.4664L20.9289 13.754L2 2Z"
      :fill="fillColor"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
    />
  </svg>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  size: {
    type: String,
    default: "64px",
  },
  // Si true, utilise la couleur d'accent du thème, sinon utilise customColor
  useThemeColor: {
    type: Boolean,
    default: true,
  },
  // Couleur personnalisée (utilisée si useThemeColor = false)
  customColor: {
    type: String,
    default: "#00ff9f",
  },
  // Couleur du stroke
  strokeColor: {
    type: String,
    default: "currentColor",
  },
  strokeWidth: {
    type: [Number, String],
    default: 1,
  },
  animate: {
    type: String,
    default: "none", // 'none', 'float', 'pulse', 'glitch', 'spin', 'bounce'
  },
  glow: {
    type: Boolean,
    default: true,
  },
  // Intensité du glow (0-1)
  glowIntensity: {
    type: Number,
    default: 0.5,
  },
});

const fillColor = computed(() => {
  if (props.useThemeColor) {
    return "rgb(var(--accent))";
  }
  return props.customColor;
});

const animationClass = computed(() => {
  const classes = [];

  if (props.glow) classes.push("logo-glow");

  switch (props.animate) {
    case "float":
      classes.push("animate-float");
      break;
    case "pulse":
      classes.push("animate-pulse-custom");
      break;
    case "glitch":
      classes.push("animate-glitch");
      break;
    case "spin":
      classes.push("animate-spin");
      break;
    case "bounce":
      classes.push("animate-bounce-custom");
      break;
  }

  return classes.join(" ");
});
</script>

<style scoped>
.vraith-logo {
  transition: all 0.3s ease;
}

/* Glow dynamique basé sur la couleur du thème */
.logo-glow {
  filter: drop-shadow(0 0 20px rgba(var(--accent), v-bind(glowIntensity)));
}

/* Animation float (lévitation douce) */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-8px) rotate(1deg);
  }
  50% {
    transform: translateY(-4px) rotate(-1deg);
  }
  75% {
    transform: translateY(-6px) rotate(0.5deg);
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

/* Animation pulse */
@keyframes pulse-custom {
  0%,
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 20px rgba(var(--accent), v-bind(glowIntensity)));
  }
  50% {
    opacity: 0.8;
    filter: drop-shadow(
      0 0 30px rgba(var(--accent), calc(v-bind(glowIntensity) * 1.5))
    );
    transform: scale(1.02);
  }
}

.animate-pulse-custom {
  animation: pulse-custom 2s ease-in-out infinite;
}

/* Animation glitch cyberpunk */
@keyframes glitch {
  0%,
  90%,
  100% {
    transform: translate(0);
    filter: drop-shadow(0 0 20px rgba(var(--accent), v-bind(glowIntensity)));
  }
  92% {
    transform: translate(-3px, 2px);
    filter: drop-shadow(
      3px -2px 15px rgba(var(--accent), calc(v-bind(glowIntensity) * 1.5))
    );
  }
  94% {
    transform: translate(2px, -3px);
    filter: drop-shadow(
      -2px 3px 15px rgba(var(--accent), calc(v-bind(glowIntensity) * 1.5))
    );
  }
  96% {
    transform: translate(-1px, 1px);
  }
}

.animate-glitch {
  animation: glitch 3s infinite;
}

/* Animation spin */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 3s linear infinite;
}

/* Animation bounce */
@keyframes bounce-custom {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.animate-bounce-custom {
  animation: bounce-custom 1s ease-in-out infinite;
}

/* Hover effect - s'adapte au thème */
.vraith-logo:hover {
  transform: scale(1.05);
  filter: drop-shadow(
    0 0 30px rgba(var(--accent), calc(v-bind(glowIntensity) * 1.5))
  );
  cursor: pointer;
}

/* Animation au chargement */
.vraith-logo {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Variante stroke (contour uniquement) */
.vraith-logo.stroke-only path {
  fill: none;
  stroke: rgb(var(--accent));
}
</style>
