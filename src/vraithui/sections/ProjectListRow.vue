<template>
  <article class="list-row group" :class="statusBorderClass">
    <!-- Name + meta -->
    <div class="row-head">
      <h3 class="row-name">{{ project.name }}</h3>
      <span class="row-meta">
        <span class="status-dot" :class="statusDotClass" aria-hidden="true"></span>
        <span class="sr-only">{{ statusLabel }}</span>
        <span v-if="project.year">{{ project.year }}</span>
      </span>
    </div>

    <!-- Tags -->
    <ul v-if="project.tags?.length" class="row-tags">
      <li v-for="tag in project.tags" :key="tag" class="row-tag">{{ tag }}</li>
    </ul>

    <!-- Links -->
    <div v-if="project.github || project.demo" class="row-links">
      <a
        v-if="project.github"
        :href="project.github"
        target="_blank"
        rel="noopener noreferrer"
        class="row-link"
      >
        {{ $t('sections.projects.actions.code') }}
      </a>
      <a
        v-if="project.demo"
        :href="project.demo"
        target="_blank"
        rel="noopener noreferrer"
        class="row-link"
      >
        {{ $t('sections.projects.actions.demo') }}
      </a>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();

// A dot rather than the card's badge pill: the row is one line of information,
// and a full badge would compete with the project name for it.
const statusDotClass = computed(() => {
  switch (props.project.status) {
    case "active":
      return "bg-green-400";
    case "completed":
      return "bg-blue-400";
    case "in-progress":
      return "bg-yellow-400";
    default:
      return "bg-gray-400";
  }
});

const statusBorderClass = computed(() => {
  switch (props.project.status) {
    case "active":
      return "hover:border-l-green-500/60";
    case "completed":
      return "hover:border-l-blue-500/60";
    case "in-progress":
      return "hover:border-l-yellow-500/60";
    default:
      return "hover:border-l-[rgb(var(--accent))]";
  }
});

// The filter labels and the status labels are the same words, so the existing
// keys are reused rather than duplicated under a second name.
const statusLabel = computed(() => {
  const known = ["active", "completed", "in-progress"];
  return known.includes(props.project.status)
    ? t(`sections.projects.filters.${props.project.status}`)
    : props.project.status || "";
});
</script>

<style scoped>
.list-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding: 0.75rem 1rem;
  border-left: 2px solid rgb(var(--border));
  background: rgb(var(--panel) / 0.35);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.list-row:hover {
  background: rgb(var(--panel) / 0.7);
}

.row-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  min-width: 12rem;
  flex: 1 1 auto;
}

.row-name {
  font-weight: 700;
  color: rgb(var(--fg));
  transition: color 0.2s ease;
}

.list-row:hover .row-name {
  color: rgb(var(--accent));
}

.row-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.6;
  white-space: nowrap;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.row-tag {
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid rgb(var(--border));
  color: rgb(var(--accent));
  opacity: 0.85;
}

.row-links {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
  padding-left: 1rem;
  border-left: 1px solid rgb(var(--border));
}

.row-link {
  font-size: 0.75rem;
  color: rgb(var(--fg));
  opacity: 0.7;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: color 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
}

.row-link:hover {
  color: rgb(var(--accent));
  opacity: 1;
  border-bottom-color: rgb(var(--accent));
}

.row-link:focus-visible {
  outline: 2px solid rgb(var(--accent));
  outline-offset: 2px;
  border-radius: 0.125rem;
}

@media (max-width: 640px) {
  /* Stack the row into three fixed bands -- name, tags, links -- so the
     action does not land on the tag line for some projects and its own line
     for others, purely on how many tags they happen to have. */
  .row-head,
  .row-tags,
  .row-links {
    flex-basis: 100%;
  }

  .row-links {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    padding-top: 0.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .list-row,
  .row-name,
  .row-link {
    transition: none;
  }
}
</style>
