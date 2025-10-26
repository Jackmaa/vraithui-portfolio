<template>
  <article
    class="project-card group relative border rounded-lg overflow-hidden transition-all duration-300"
    :class="statusBorderClass"
  >
    <!-- Status badge -->
    <div class="absolute top-3 right-3 z-10">
      <span
        class="px-2 py-1 text-xs font-semibold rounded backdrop-blur-sm"
        :class="statusClass"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Image/Video container -->
    <div
      class="image-container relative h-40 bg-[rgb(var(--panel))] overflow-hidden cursor-pointer"
      @click="openLightbox"
      @mouseenter="playVideo"
      @mouseleave="pauseVideo"
    >
      <!-- Placeholder si pas d'image -->
      <div
        v-if="!project.image"
        class="w-full h-full flex items-center justify-center text-4xl opacity-20 font-bold"
      >
        {{ project.name.charAt(0) }}
      </div>

      <!-- Image statique -->
      <img
        v-if="project.image"
        :src="project.image"
        :alt="project.name"
        class="static-image w-full h-full object-cover transition-all duration-300"
        :class="{ 'opacity-0': isVideoPlaying && project.video }"
        @error="handleImageError"
      />

      <!-- Vidéo/GIF (apparaît au hover) -->
      <video
        v-if="project.video"
        ref="videoRef"
        :src="project.video"
        class="video-preview absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        :class="{ 'opacity-100': isVideoPlaying, 'opacity-0': !isVideoPlaying }"
        loop
        muted
        playsinline
      />

      <!-- Overlay gradient au hover -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
      >
        <div
          class="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
        >
          🔍 Click to expand
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-3">
      <!-- Title + Year -->
      <div class="flex items-start justify-between gap-2">
        <h3
          class="text-lg font-bold text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] transition-colors"
        >
          {{ project.name }}
        </h3>
        <span class="text-xs opacity-60 shrink-0">{{ project.year }}</span>
      </div>

      <!-- Description -->
      <p class="text-sm opacity-80 leading-relaxed line-clamp-3">
        {{ project.description }}
      </p>

      <!-- Tags -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in project.tags"
          :key="tag"
          class="px-2 py-1 text-xs rounded bg-[rgb(var(--panel))] border border-[rgb(var(--border))] text-[rgb(var(--accent))] font-mono"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Highlights (collapsible) -->
      <details v-if="project.highlights?.length" class="mt-3">
        <summary
          class="cursor-pointer text-xs opacity-70 hover:opacity-100 transition-opacity select-none"
        >
          Highlights ({{ project.highlights.length }})
        </summary>
        <ul class="mt-2 space-y-1 text-xs opacity-80">
          <li
            v-for="(highlight, i) in project.highlights"
            :key="i"
            class="flex items-start gap-2 before:content-['▹'] before:text-[rgb(var(--accent))]"
          >
            {{ highlight }}
          </li>
        </ul>
      </details>

      <!-- Actions -->
      <div
        class="flex items-center gap-3 pt-3 border-t border-[rgb(var(--border))]"
      >
        <a
          v-if="project.github"
          :href="project.github"
          target="_blank"
          rel="noopener noreferrer"
          class="action-link"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          Code
        </a>
        <a
          v-if="project.demo"
          :href="project.demo"
          target="_blank"
          rel="noopener noreferrer"
          class="action-link"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Demo
        </a>
      </div>
    </div>

    <!-- Glow effect au hover -->
    <div class="glow-border"></div>
  </article>

  <!-- Lightbox Modal -->
  <Teleport to="body">
    <div
      v-if="lightboxOpen"
      class="lightbox-overlay fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeLightbox"
    >
      <!-- Close button -->
      <button
        @click="closeLightbox"
        class="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light transition-colors"
        aria-label="Close lightbox"
      >
        ×
      </button>

      <!-- Project name -->
      <div class="absolute top-4 left-4 text-white">
        <h3 class="text-xl font-bold">{{ project.name }}</h3>
        <p class="text-sm opacity-70">{{ project.year }}</p>
      </div>

      <!-- Content -->
      <div class="max-w-6xl max-h-[90vh] relative">
        <!-- Image -->
        <img
          v-if="project.image && !project.video"
          :src="project.image"
          :alt="project.name"
          class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />

        <!-- Video -->
        <video
          v-else-if="project.video"
          :src="project.video"
          class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          controls
          autoplay
          loop
        />

        <!-- Navigation hint -->
        <div
          class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm"
        >
          Press ESC or click outside to close
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const videoRef = ref(null);
const isVideoPlaying = ref(false);
const lightboxOpen = ref(false);

const statusClass = computed(() => {
  switch (props.project.status) {
    case "active":
      return "bg-green-500/20 text-green-400 border border-green-500/30";
    case "completed":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "in-progress":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
  }
});

const statusBorderClass = computed(() => {
  switch (props.project.status) {
    case "active":
      return "border-green-500/20 hover:border-green-500/50";
    case "completed":
      return "border-blue-500/20 hover:border-blue-500/50";
    case "in-progress":
      return "border-yellow-500/20 hover:border-yellow-500/50";
    default:
      return "border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/50";
  }
});

const statusLabel = computed(() => {
  switch (props.project.status) {
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "in-progress":
      return "In Progress";
    default:
      return "Unknown";
  }
});

function playVideo() {
  if (props.project.video && videoRef.value) {
    videoRef.value.play();
    isVideoPlaying.value = true;
  }
}

function pauseVideo() {
  if (props.project.video && videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = 0;
    isVideoPlaying.value = false;
  }
}

function openLightbox() {
  if (props.project.image || props.project.video) {
    lightboxOpen.value = true;
    document.body.style.overflow = "hidden";
  }
}

function closeLightbox() {
  lightboxOpen.value = false;
  document.body.style.overflow = "";
}

function handleImageError(e) {
  e.target.style.display = "none";
}

// ESC pour fermer la lightbox
onMounted(() => {
  const handleEsc = (e) => {
    if (e.key === "Escape" && lightboxOpen.value) {
      closeLightbox();
    }
  };
  window.addEventListener("keydown", handleEsc);

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleEsc);
    document.body.style.overflow = "";
  });
});
</script>

<style scoped>
.project-card {
  position: relative;
  background: rgb(var(--panel));
  backdrop-filter: blur(10px);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--accent), 0.15);
}

.glow-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  box-shadow: inset 0 0 20px rgba(var(--accent), 0.3);
}

.project-card:hover .glow-border {
  opacity: 1;
}

.action-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid rgb(var(--border));
  color: rgb(var(--fg));
  transition: all 0.2s;
  text-decoration: none;
}

.action-link:hover {
  border-color: rgb(var(--accent));
  color: rgb(var(--accent));
  background: rgba(var(--accent), 0.1);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

details summary {
  list-style: none;
}

details summary::-webkit-details-marker {
  display: none;
}

details[open] summary {
  color: rgb(var(--accent));
}

/* Lightbox animations */
.lightbox-overlay {
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

.lightbox-overlay img,
.lightbox-overlay video {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Video hover effect */
.video-preview {
  pointer-events: none;
}

.static-image {
  transition: opacity 0.3s ease;
}
</style>
