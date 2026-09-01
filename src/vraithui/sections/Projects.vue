<template>
  <div class="projects-container font-mono">
    <!-- Header -->
    <div class="mb-8">
      <GlitchText
        text="Projects"
        class="text-4xl font-bold text-[rgb(var(--accent))] glow-text mb-2"
      />
      <p class="text-sm opacity-70">
        {{ $t('sections.projects.subtitle', { count: projects.length }) }}
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
      <span class="animate-pulse">{{ $t('sections.projects.loading') }}</span>
    </div>

    <div v-else-if="error" class="text-red-400 text-sm">{{ $t('common.error') }}: {{ error }}</div>

    <template v-else>
      <!-- Featured lane: projects that have an image or a video -->
      <div v-if="lanes.featured.length" class="projects-grid">
        <ProjectCard
          v-for="project in lanes.featured"
          :key="project.id"
          :project="project"
        />
      </div>

      <!-- Compact lane: projects with neither. No placeholder media is
           fabricated for them; they are listed instead of shown. -->
      <section v-if="lanes.compact.length" class="compact-lane">
        <div class="compact-header">
          <h3 class="compact-title">
            {{ $t('sections.projects.more.title') }}
          </h3>
          <p class="compact-hint">{{ $t('sections.projects.more.hint') }}</p>
        </div>

        <div class="compact-list">
          <ProjectListRow
            v-for="project in lanes.compact"
            :key="project.id"
            :project="project"
          />
        </div>
      </section>
    </template>

    <!-- Empty state -->
    <div
      v-if="!loading && !error && filteredProjects.length === 0"
      class="text-center py-12 opacity-60"
    >
      <p>{{ $t('sections.projects.empty.message') }}</p>
      <button
        @click="activeFilter = 'all'"
        class="mt-3 text-[rgb(var(--accent))] hover:underline text-sm"
      >
        {{ $t('sections.projects.empty.reset') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import ProjectCard from "./ProjectCard.vue";
import ProjectListRow from "./ProjectListRow.vue";
import { partitionByMedia } from "./projectLanes";
import GlitchText from "../effects/GlitchText.vue";
import { useLanguageStore } from "@/stores/languageStore";
import { useI18n } from "vue-i18n";

const languageStore = useLanguageStore();
const { t } = useI18n();

const projects = ref([]);
const loading = ref(true);
const error = ref(null);
const activeFilter = ref("all");

// Computed path based on locale
const projectsPath = computed(() => {
  return `/content/projects.${languageStore.currentLocale}.json`;
});

const statuses = computed(() => [
  { value: "all", label: t('sections.projects.filters.all') },
  { value: "active", label: t('sections.projects.filters.active') },
  { value: "completed", label: t('sections.projects.filters.completed') },
  { value: "in-progress", label: t('sections.projects.filters.in-progress') },
]);

const filteredProjects = computed(() => {
  if (activeFilter.value === "all") return projects.value;
  return projects.value.filter((p) => p.status === activeFilter.value);
});

// Two render lanes, not placeholder media: a project with no image and no
// video is listed rather than shown as a card with a fabricated placeholder.
// It graduates to a card by acquiring media, with no data migration.
const lanes = computed(() => partitionByMedia(filteredProjects.value));

// Fetch projects
async function fetchProjects() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(projectsPath.value);
    if (!response.ok) {
      // Fallback to old path
      const fallbackResponse = await fetch("/projects.json");
      if (!fallbackResponse.ok) throw new Error("Failed to load projects.json");
      projects.value = await fallbackResponse.json();
      loading.value = false;
      await nextTick();
      window.dispatchEvent(new Event("resize"));
      return;
    }

    projects.value = await response.json();
    loading.value = false;

    // Force un re-sync de la scrollbar après le rendu
    await nextTick();
    window.dispatchEvent(new Event("resize"));
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
}

// Watch for locale changes
watch(() => languageStore.currentLocale, () => {
  fetchProjects();
});

onMounted(async () => {
  await fetchProjects();
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

.compact-lane {
  margin-top: 2.5rem;
}

.compact-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgb(var(--border));
}

.compact-title {
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--accent));
}

.compact-hint {
  font-size: 0.75rem;
  opacity: 0.6;
}

.compact-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
