<template>
  <span class="glitch-wrapper" @mouseenter="trigger" :class="{ active: isGlitching }">
    <span class="glitch-text" :data-text="text">
      {{ text }}
    </span>
  </span>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  autoGlitch: {
    type: Boolean,
    default: false
  }
});

const isGlitching = ref(false);

function trigger() {
  if (isGlitching.value) return;
  
  isGlitching.value = true;
  setTimeout(() => {
    isGlitching.value = false;
  }, 600);
}

// Auto-glitch aléatoire si activé
if (props.autoGlitch) {
  setInterval(() => {
    if (Math.random() > 0.95) {
      trigger();
    }
  }, 2000);
}
</script>

<style scoped>
.glitch-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.glitch-text {
  position: relative;
  display: inline-block;
  color: rgb(var(--fg));
  transition: all 0.1s ease;
}

/* Effet glitch au hover */
.glitch-wrapper.active .glitch-text::before,
.glitch-wrapper.active .glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Layer rouge (décalage gauche) */
.glitch-wrapper.active .glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 rgb(var(--accent));
  clip: rect(24px, 550px, 90px, 0);
  animation: glitch-anim-1 0.6s infinite linear alternate-reverse;
}

/* Layer cyan (décalage droit) */
.glitch-wrapper.active .glitch-text::after {
  left: -2px;
  text-shadow: -2px 0 cyan, 2px 2px magenta;
  clip: rect(85px, 550px, 140px, 0);
  animation: glitch-anim-2 0.6s infinite linear alternate-reverse;
}

/* Animations de glitch */
@keyframes glitch-anim-1 {
  0% {
    clip: rect(132px, 9999px, 101px, 0);
  }
  10% {
    clip: rect(17px, 9999px, 94px, 0);
  }
  20% {
    clip: rect(40px, 9999px, 66px, 0);
  }
  30% {
    clip: rect(87px, 9999px, 82px, 0);
  }
  40% {
    clip: rect(137px, 9999px, 61px, 0);
  }
  50% {
    clip: rect(34px, 9999px, 14px, 0);
  }
  60% {
    clip: rect(121px, 9999px, 115px, 0);
  }
  70% {
    clip: rect(48px, 9999px, 78px, 0);
  }
  80% {
    clip: rect(78px, 9999px, 51px, 0);
  }
  90% {
    clip: rect(103px, 9999px, 46px, 0);
  }
  100% {
    clip: rect(84px, 9999px, 125px, 0);
  }
}

@keyframes glitch-anim-2 {
  0% {
    clip: rect(129px, 9999px, 36px, 0);
  }
  10% {
    clip: rect(36px, 9999px, 4px, 0);
  }
  20% {
    clip: rect(85px, 9999px, 66px, 0);
  }
  30% {
    clip: rect(91px, 9999px, 91px, 0);
  }
  40% {
    clip: rect(148px, 9999px, 138px, 0);
  }
  50% {
    clip: rect(38px, 9999px, 122px, 0);
  }
  60% {
    clip: rect(69px, 9999px, 54px, 0);
  }
  70% {
    clip: rect(98px, 9999px, 71px, 0);
  }
  80% {
    clip: rect(146px, 9999px, 34px, 0);
  }
  90% {
    clip: rect(134px, 9999px, 43px, 0);
  }
  100% {
    clip: rect(11px, 9999px, 108px, 0);
  }
}

/* Glow subtil pendant le glitch */
.glitch-wrapper.active .glitch-text {
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
}
</style>
