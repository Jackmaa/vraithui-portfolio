<template>
  <div class="projects-container font-mono">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-[rgb(var(--accent))] glow-text mb-2">
        Projects
      </h1>
      <p class="text-sm opacity-70">
        {{ projects.length }} projects · Filter by status or tech stack
      </p>
    </div>

    <!-- Filters -->
    <div class="filters mb-6 flex items-center gap-3 flex-wrap">
      <button
        v-for="status in statuses"
        :key="status.value"
        @click="activeFilter = status.value"
        class="px-3 py-1.5 text-xs rounded border transition-all"
        :class="
          activeFilter === status.value
            ? 'bg-[rgb(var(--accent))] text-black border-[rgb(var(--accent))] font-semibold'
            : 'border-[rgb(var(--border))] hover:border-[rgb(var(--accent))] opacity-70 hover:opacity-100'
        "
      >
        {{ status.label }}
      </button>
    </div>

    <!-- Projects Grid -->
    <div v-if="loading" class="opacity-60 text-sm">
      <span class="animate-pulse">Loading projects.json...</span>
    </div>

    <div v-else-if="error" class="text-red-400 text-sm">Error: {{ error }}</div>

    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading && !error && filteredProjects.length === 0"
      class="text-center py-12 opacity-60"
    >
      <p>No projects match this filter.</p>
      <button
        @click="activeFilter = 'all'"
        class="mt-3 text-[rgb(var(--accent))] hover:underline text-sm"
      >
        Reset filters
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import ProjectCard from "./ProjectCard.vue";

const projects = ref([]);
const loading = ref(true);
const error = ref(null);
const activeFilter = ref("all");

const statuses = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In Progress" },
];

const filteredProjects = computed(() => {
  if (activeFilter.value === "all") return projects.value;
  return projects.value.filter((p) => p.status === activeFilter.value);
});

onMounted(async () => {
  try {
    const response = await fetch("/projects.json");
    if (!response.ok) throw new Error("Failed to load projects.json");

    projects.value = await response.json();
    loading.value = false;

    // Force un re-sync de la scrollbar après le rendu
    await nextTick();
    window.dispatchEvent(new Event("resize"));
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
});
</script>

<style scoped>
.projects-container {
  animation: fadeIn 0.5s ease-in-out;
  padding-block: 1rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.glow-text {
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
