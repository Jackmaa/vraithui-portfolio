<template>
  <div class="matrix-container">
    <canvas ref="canvasRef" class="matrix-canvas"></canvas>
    <div class="matrix-overlay">
      <div class="unlock-message">
        <div
          class="text-4xl font-bold mb-4 text-[rgb(var(--accent))] glow-text"
        >
          SYSTEM UNLOCKED
        </div>
        <div class="text-sm opacity-70">Welcome to the portfolio...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits(["complete"]);
const canvasRef = ref(null);

let animationId = null;
let columns = [];
let drops = [];
let lastFrameTime = 0;
const TARGET_FPS = 30;
const FRAME_DURATION = 1000 / TARGET_FPS;

onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");

  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Matrix characters
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`";

  // Column setup
  const fontSize = 16;
  const numColumns = Math.floor(canvas.width / fontSize);

  // Initialize drops (one per column)
  for (let i = 0; i < numColumns; i++) {
    drops[i] = Math.random() * -100; // Start above screen
  }

  // Get colors from CSS variables
  const rootStyle = getComputedStyle(document.documentElement);

  const accentColor = rootStyle
    .getPropertyValue("--accent")
    .trim()
    .split(" ")
    .map((x) => parseInt(x));

  const bgColor = rootStyle
    .getPropertyValue("--bg")
    .trim()
    .split(" ")
    .map((x) => parseInt(x));

  function draw(currentTime) {
    animationId = requestAnimationFrame(draw);

    // Throttle to 30 FPS
    const deltaTime = currentTime - lastFrameTime;
    if (deltaTime < FRAME_DURATION) {
      return;
    }
    lastFrameTime = currentTime - (deltaTime % FRAME_DURATION);

    // Semi-transparent background for trail effect (uses theme bg color)
    ctx.fillStyle = `rgba(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]}, 0.05)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Matrix text
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      // Random character
      const char = chars[Math.floor(Math.random() * chars.length)];

      // Color with accent
      const alpha = Math.min(1, drops[i] / 20);
      ctx.fillStyle = `rgba(${accentColor[0]}, ${accentColor[1]}, ${accentColor[2]}, ${alpha})`;

      // Draw character
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillText(char, x, y);

      // Reset drop when it reaches bottom or randomly
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      // Move drop down
      drops[i]++;
    }
  }

  // Start animation
  draw(0);

  // Fade out after 3 seconds
  setTimeout(() => {
    const overlay = document.querySelector(".matrix-overlay");
    if (overlay) {
      overlay.style.opacity = "1";
    }
  }, 1000);

  // Complete after 4 seconds
  setTimeout(() => {
    emit("complete");
  }, 4000);

  // Handle resize
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", handleResize);

  onBeforeUnmount(() => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener("resize", handleResize);
  });
});
</script>

<style scoped>
.matrix-container {
  position: fixed;
  inset: 0;
  background: rgb(var(--bg));
  z-index: 9999;
}

.matrix-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.matrix-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, transparent 30%, rgb(var(--bg)) 100%);
  opacity: 0;
  transition: opacity 1s ease-in;
  pointer-events: none;
}

.unlock-message {
  text-align: center;
  animation: fadeInScale 1s ease-out;
  color: rgb(var(--fg));
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.glow-text {
  text-shadow: 0 0 10px rgb(var(--accent) / 0.8),
    0 0 20px rgb(var(--accent) / 0.6), 0 0 30px rgb(var(--accent) / 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    text-shadow: 0 0 10px rgb(var(--accent) / 0.8),
      0 0 20px rgb(var(--accent) / 0.6), 0 0 30px rgb(var(--accent) / 0.4);
  }
  50% {
    text-shadow: 0 0 20px rgb(var(--accent) / 1),
      0 0 30px rgb(var(--accent) / 0.8), 0 0 40px rgb(var(--accent) / 0.6);
  }
}
</style>
