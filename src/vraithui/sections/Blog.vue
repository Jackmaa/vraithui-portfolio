<template>
  <div class="blog-container font-mono">
    <!-- Header -->
    <div class="mb-8">
      <GlitchText
        :text="$t('sections.blog.title')"
        class="text-4xl font-bold text-[rgb(var(--accent))] glow-text mb-2"
      />
      <p class="text-sm opacity-70">{{ $t('sections.blog.subtitle') }}</p>
      <div class="mt-2 text-xs opacity-40">$ git log --oneline --format="%h %ad %s"</div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="opacity-60 text-sm">
      <span class="animate-pulse">{{ $t('sections.blog.loading') }}</span>
    </div>

    <div v-else-if="error" class="text-red-400 text-sm">{{ $t('common.error') }}: {{ error }}</div>

    <!-- Empty -->
    <div v-else-if="posts.length === 0" class="opacity-60 text-sm">
      {{ $t('sections.blog.empty') }}
    </div>

    <!-- Post list (git log style) -->
    <div v-else class="space-y-1">
      <div
        v-for="post in posts"
        :key="post.hash"
        class="blog-entry"
      >
        <!-- Git log line -->
        <button
          @click="toggle(post.hash)"
          class="w-full text-left py-2 px-3 flex items-start gap-3 rounded transition-colors hover:bg-[rgb(var(--panel-2))]"
          :class="expanded.has(post.hash) ? 'bg-[rgb(var(--panel-2))]' : ''"
        >
          <span class="text-yellow-500 font-bold shrink-0">{{ post.hash }}</span>
          <span class="text-xs opacity-40 shrink-0 mt-0.5">{{ post.date }}</span>
          <span class="text-sm flex-1">{{ post.title }}</span>
          <span class="text-xs opacity-30 mt-0.5">{{ expanded.has(post.hash) ? '▼' : '▶' }}</span>
        </button>

        <!-- Expanded content -->
        <div
          v-if="expanded.has(post.hash)"
          class="blog-content ml-3 pl-6 py-4 border-l-2 border-[rgb(var(--accent))] mb-4"
        >
          <div class="text-sm leading-relaxed opacity-80 space-y-3" v-html="post.content"></div>

          <!-- Tags -->
          <div class="mt-4 flex items-center gap-2 flex-wrap">
            <span class="text-xs opacity-40">{{ $t('sections.blog.tags') }}:</span>
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="text-xs px-2 py-0.5 rounded border border-[rgb(var(--border))] opacity-60"
            >
              #{{ tag }}
            </span>
          </div>

          <button
            @click="toggle(post.hash)"
            class="mt-3 text-xs text-[rgb(var(--accent))] hover:underline"
          >
            {{ $t('sections.blog.collapse') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import GlitchText from "../effects/GlitchText.vue";
import { useLanguageStore } from "@/stores/languageStore";

const languageStore = useLanguageStore();

const posts = ref([]);
const loading = ref(true);
const error = ref(null);
const expanded = ref(new Set());

const blogPath = computed(() => {
  return `/content/blog.${languageStore.currentLocale}.json`;
});

function toggle(hash) {
  const next = new Set(expanded.value);
  if (next.has(hash)) {
    next.delete(hash);
  } else {
    next.add(hash);
  }
  expanded.value = next;
}

async function fetchPosts() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(blogPath.value);
    if (!response.ok) throw new Error("Failed to load blog posts");
    posts.value = await response.json();
    loading.value = false;

    await nextTick();
    window.dispatchEvent(new Event("resize"));
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
}

// Watch for locale changes
watch(() => languageStore.currentLocale, () => {
  fetchPosts();
});

onMounted(async () => {
  await fetchPosts();
});
</script>

<style scoped>
.blog-container {
  animation: fadeIn 0.5s ease-in-out;
  padding-block: 1rem;
}

.glow-text {
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
}

.blog-entry {
  animation: slideIn 0.3s ease-out;
}

.blog-content {
  animation: expandIn 0.3s ease-out;
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes expandIn {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 2000px;
  }
}

/* Style HTML content from blog posts */
.blog-content :deep(strong) {
  color: rgb(var(--accent));
  font-weight: 600;
}
</style>
