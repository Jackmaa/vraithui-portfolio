<template>
  <canvas ref="canvasRef" class="particles-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const canvasRef = ref(null);
let animationId = null;
let particles = [];

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

onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');

  // Set canvas size
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Get accent color from CSS variable
  const getAccentColor = () => {
    const accentStr = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim()
      .split(' ')
      .map(x => parseInt(x));
    return accentStr.length === 3 ? accentStr : [0, 255, 255];
  };

  let accentColor = getAccentColor();

  // Listen for theme changes
  const observer = new MutationObserver(() => {
    accentColor = getAccentColor();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // Create particles (nombre basé sur la taille de l'écran)
  const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas));
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections between nearby particles
    particles.forEach((particle, i) => {
      particle.update();
      particle.draw(ctx, accentColor);

      // Draw lines to nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particle.x - particles[j].x;
        const dy = particle.y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = (1 - distance / 120) * 0.15;
          ctx.strokeStyle = `rgba(${accentColor[0]}, ${accentColor[1]}, ${accentColor[2]}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();

  onBeforeUnmount(() => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resizeCanvas);
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
