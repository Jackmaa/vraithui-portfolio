<template>
  <canvas ref="canvasRef" class="particles-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { debounce } from "../utils/debounce";

const canvasRef = ref(null);
let animationId = null;
let particles = [];
let lastFrameTime = 0;
const TARGET_FPS = 30;
const FRAME_DURATION = 1000 / TARGET_FPS; // ~33ms for 30 FPS

// Detect low-end devices
const isLowEndDevice = () => {
  // Check for mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Check hardware concurrency (CPU cores)
  const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

  return isMobile || prefersReducedMotion || lowCPU;
};

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
    // For spatial hashing
    this.gridX = 0;
    this.gridY = 0;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Wrap around edges
    if (this.x > this.canvas.width) this.x = 0;
    if (this.x < 0) this.x = this.canvas.width;
    if (this.y > this.canvas.height) this.y = 0;
    if (this.y < 0) this.y = this.canvas.height;
  }

  draw(ctx, accentColor) {
    ctx.fillStyle = `rgba(${accentColor[0]}, ${accentColor[1]}, ${accentColor[2]}, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Spatial hash grid for O(n) nearest neighbor search
class SpatialHashGrid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear() {
    this.grid.clear();
  }

  hash(x, y) {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);
    return `${gridX},${gridY}`;
  }

  insert(particle) {
    const key = this.hash(particle.x, particle.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(particle);
    particle.gridX = Math.floor(particle.x / this.cellSize);
    particle.gridY = Math.floor(particle.y / this.cellSize);
  }

  getNearby(particle) {
    const nearby = [];
    const gx = particle.gridX;
    const gy = particle.gridY;

    // Check 9 cells: current + 8 neighbors
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${gx + dx},${gy + dy}`;
        const cell = this.grid.get(key);
        if (cell) {
          nearby.push(...cell);
        }
      }
    }
    return nearby;
  }
}

onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");

  // Disable on low-end devices
  const lowEndDevice = isLowEndDevice();
  if (lowEndDevice) {
    canvas.style.display = 'none';
    return;
  }

  // Set canvas size
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Get accent color from CSS variable
  const getAccentColor = () => {
    const accentStr = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim()
      .split(" ")
      .map((x) => parseInt(x));
    return accentStr.length === 3 ? accentStr : [0, 255, 255];
  };

  let accentColor = getAccentColor();

  // Listen for theme changes with debouncing
  const updateThemeColor = debounce(() => {
    accentColor = getAccentColor();
  }, 100);

  const observer = new MutationObserver((mutations) => {
    // Only update if data-theme actually changed
    const themeChanged = mutations.some(
      mutation => mutation.attributeName === 'data-theme' &&
                  mutation.oldValue !== document.documentElement.getAttribute('data-theme')
    );

    if (themeChanged) {
      updateThemeColor();
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
    attributeOldValue: true
  });

  // Create particles (reduced count for better performance)
  const particleCount = Math.floor((canvas.width * canvas.height) / 20000);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas));
  }

  // Initialize spatial hash grid (120px is the connection distance)
  const spatialGrid = new SpatialHashGrid(120);

  // Animation loop with FPS throttling
  function animate(currentTime) {
    animationId = requestAnimationFrame(animate);

    // Throttle to 30 FPS
    const deltaTime = currentTime - lastFrameTime;
    if (deltaTime < FRAME_DURATION) {
      return;
    }
    lastFrameTime = currentTime - (deltaTime % FRAME_DURATION);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rebuild spatial grid each frame
    spatialGrid.clear();

    // Update and insert particles into grid
    particles.forEach((particle) => {
      particle.update();
      particle.draw(ctx, accentColor);
      spatialGrid.insert(particle);
    });

    // Draw connections using spatial hashing (O(n) instead of O(n²))
    const drawnConnections = new Set();
    particles.forEach((particle) => {
      const nearby = spatialGrid.getNearby(particle);

      nearby.forEach((other) => {
        if (particle === other) return;

        // Avoid drawing same connection twice
        const connectionId = particle < other
          ? `${particles.indexOf(particle)}-${particles.indexOf(other)}`
          : `${particles.indexOf(other)}-${particles.indexOf(particle)}`;

        if (drawnConnections.has(connectionId)) return;
        drawnConnections.add(connectionId);

        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = (1 - distance / 120) * 0.15;
          ctx.strokeStyle = `rgba(${accentColor[0]}, ${accentColor[1]}, ${accentColor[2]}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      });
    });
  }

  animate(0);

  onBeforeUnmount(() => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resizeCanvas);
    observer.disconnect();
    particles = [];
  });
});
</script>

<style scoped>
.particles-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.4;
}

/* Moins visible sur mobile pour la performance */
@media (max-width: 768px) {
  .particles-canvas {
    opacity: 0.2;
  }
}
</style>
