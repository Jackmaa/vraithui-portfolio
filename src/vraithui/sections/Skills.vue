<template>
  <div class="skills-container font-mono">
    <!-- Cargo build animation -->
    <div v-if="compiling" class="mb-8">
      <div class="text-sm opacity-70 space-y-1">
        <div class="text-[rgb(var(--accent))]">$ {{ $t('sections.skills.compiling') }}</div>
        <div v-for="(line, i) in compileLines" :key="i" class="compile-line" :style="{ animationDelay: `${i * 0.3}s` }">
          <span class="text-green-400">{{ line.status }}</span>
          <span class="opacity-60"> {{ line.crate }}</span>
        </div>
        <div v-if="showCompiled" class="mt-2 text-green-400 font-bold">
          ✓ {{ $t('sections.skills.compiled') }}
        </div>
      </div>
    </div>

    <!-- Skills content (shown after compile animation) -->
    <div v-if="!compiling">
      <!-- Header -->
      <div class="mb-8">
        <GlitchText
          :text="$t('sections.skills.title')"
          class="text-4xl font-bold text-[rgb(var(--accent))] glow-text mb-2"
        />
        <p class="text-sm opacity-70">{{ $t('sections.skills.subtitle') }}</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="opacity-60 text-sm">
        <span class="animate-pulse">{{ $t('sections.skills.loading') }}</span>
      </div>

      <div v-else-if="error" class="text-red-400 text-sm">{{ $t('common.error') }}: {{ error }}</div>

      <!-- Skill categories -->
      <div v-else class="space-y-8">
        <div
          v-for="(cat, ci) in skillData"
          :key="cat.category"
          ref="categoryRefs"
          class="skill-category"
          :class="{ 'animate-in': visibleCategories.has(ci) }"
        >
          <h3 class="text-lg font-semibold text-[rgb(var(--accent))] mb-4 flex items-center gap-2">
            <span>{{ cat.icon }}</span>
            <span>{{ cat.category }}</span>
          </h3>

          <div class="space-y-3">
            <div
              v-for="skill in cat.skills"
              :key="skill.name"
              class="group"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm">{{ skill.name }}</span>
                <span class="text-xs opacity-50">{{ skill.level }}%</span>
              </div>
              <div class="relative h-2 bg-[rgb(var(--panel-2))] rounded-full overflow-hidden">
                <div
                  class="skill-bar h-full rounded-full transition-all duration-1000 ease-out"
                  :style="{
                    width: visibleCategories.has(ci) ? skill.level + '%' : '0%',
                    background: `linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent) / 0.6))`,
                  }"
                ></div>
              </div>
              <!-- Tooltip on hover -->
              <div class="text-xs opacity-0 group-hover:opacity-60 transition-opacity mt-1 pl-1">
                {{ skill.detail }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import GlitchText from "../effects/GlitchText.vue";
import { useLanguageStore } from "@/stores/languageStore";

const languageStore = useLanguageStore();

const skillData = ref([]);
const loading = ref(true);
const error = ref(null);
const compiling = ref(true);
const showCompiled = ref(false);
const categoryRefs = ref([]);
const visibleCategories = ref(new Set());

let observer = null;

const compileLines = [
  { status: "Compiling", crate: "skills v1.0.0" },
  { status: "Compiling", crate: "frontend v3.0.0" },
  { status: "Compiling", crate: "backend v2.1.0" },
  { status: "Compiling", crate: "devops v1.5.0" },
  { status: "Compiling", crate: "portfolio v2.1.0 (path+file:///home/vraith/portfolio)" },
];

const skillsPath = computed(() => {
  return `/content/skills.${languageStore.currentLocale}.json`;
});

async function fetchSkills() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(skillsPath.value);
    if (!response.ok) throw new Error("Failed to load skills data");
    skillData.value = await response.json();
    loading.value = false;

    await nextTick();
    setupObserver();
    window.dispatchEvent(new Event("resize"));
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
}

function setupObserver() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = categoryRefs.value.indexOf(entry.target);
          if (idx !== -1) {
            visibleCategories.value = new Set([...visibleCategories.value, idx]);
          }
        }
      });
    },
    { threshold: 0.2 }
  );

  nextTick(() => {
    if (Array.isArray(categoryRefs.value)) {
      categoryRefs.value.forEach((el) => {
        if (el && el.$el) observer.observe(el.$el);
        else if (el) observer.observe(el);
      });
    }
  });
}

// Watch for locale changes
watch(() => languageStore.currentLocale, () => {
  fetchSkills();
});

onMounted(async () => {
  // Cargo build animation
  setTimeout(() => {
    showCompiled.value = true;
  }, 1600);

  setTimeout(async () => {
    compiling.value = false;
    await fetchSkills();
  }, 2000);
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.skills-container {
  animation: fadeIn 0.5s ease-in-out;
  padding-block: 1rem;
}

.glow-text {
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
}

.compile-line {
  opacity: 0;
  animation: compileAppear 0.3s ease-out forwards;
}

@keyframes compileAppear {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.skill-category {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.skill-category.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.skill-bar {
  box-shadow: 0 0 8px rgb(var(--accent) / 0.3);
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
</style>
