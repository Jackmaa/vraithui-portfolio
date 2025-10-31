<template>
  <div class="github-container font-mono">
    <!-- Header -->
    <div class="mb-8">
      <GlitchText
        text="GitHub"
        class="text-4xl font-bold text-[rgb(var(--accent))] glow-text mb-2"
      />
      <p class="text-sm opacity-70">Real-time stats & learning journey</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left: GitHub Stats -->
      <div class="space-y-6">
        <!-- Stats Card -->
        <div
          class="stats-card border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--panel))] p-6"
        >
          <div class="text-xs opacity-60 mb-4">
            $ curl https://api.github.com/users/Jackmaa
          </div>

          <div v-if="loading" class="text-sm opacity-60">
            <span class="animate-pulse">Fetching data...</span>
          </div>

          <div v-else-if="error" class="text-red-400 text-sm">
            Error: {{ error }}
          </div>

          <div v-else class="space-y-4">
            <!-- Basic stats -->
            <div class="grid grid-cols-2 gap-4">
              <div class="stat-item">
                <div class="text-xs opacity-60">Public Repos</div>
                <div class="text-2xl font-bold text-[rgb(var(--accent))]">
                  {{ stats.public_repos }}
                </div>
              </div>
              <div class="stat-item">
                <div class="text-xs opacity-60">Followers</div>
                <div class="text-2xl font-bold text-[rgb(var(--accent))]">
                  {{ stats.followers }}
                </div>
              </div>
              <div class="stat-item">
                <div class="text-xs opacity-60">Following</div>
                <div class="text-2xl font-bold text-[rgb(var(--accent))]">
                  {{ stats.following }}
                </div>
              </div>
              <div class="stat-item">
                <div class="text-xs opacity-60">Gists</div>
                <div class="text-2xl font-bold text-[rgb(var(--accent))]">
                  {{ stats.public_gists }}
                </div>
              </div>
            </div>

            <!-- Bio -->
            <div
              v-if="stats.bio"
              class="pt-4 border-t border-[rgb(var(--border))]"
            >
              <div class="text-xs opacity-60 mb-2">Bio</div>
              <p class="text-sm opacity-90">{{ stats.bio }}</p>
            </div>

            <!-- Links -->
            <div class="pt-4 border-t border-[rgb(var(--border))] flex gap-3">
              <a
                href="stats.html_url"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  />
                </svg>
                View Profile
              </a>
            </div>
          </div>
        </div>

        <!-- Top Languages -->
        <div
          v-if="!loading && languages.length"
          class="languages-card border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--panel))] p-6"
        >
          <div class="text-xs opacity-60 mb-4">
            $ git log --format='%H %an' --all | wc -l
          </div>
          <div class="text-sm font-semibold mb-4">Most Used Languages</div>

          <div class="space-y-3">
            <div
              v-for="lang in languages"
              :key="lang.name"
              class="language-item"
            >
              <div class="flex items-center justify-between text-sm mb-1">
                <span>{{ lang.name }}</span>
                <span class="opacity-60">{{ lang.percentage }}%</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width: lang.percentage + '%',
                    background: lang.color,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Learning Timeline -->
      <div
        class="timeline-card border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--panel))] p-6"
      >
        <div class="text-xs opacity-60 mb-4">
          $ git log --graph --all --format=format:'%h - %s (%ar)'
        </div>
        <div class="text-sm font-semibold mb-6">Learning Journey</div>

        <div class="timeline space-y-6">
          <div
            v-for="(entry, index) in timeline"
            :key="index"
            class="timeline-entry"
          >
            <!-- Graph line -->
            <div class="timeline-graph">
              <div
                class="commit-dot"
                :style="{ background: entry.color }"
              ></div>
              <div v-if="index < timeline.length - 1" class="commit-line"></div>
            </div>

            <!-- Content -->
            <div class="timeline-content">
              <div class="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div class="text-sm font-semibold">{{ entry.title }}</div>
                  <div class="text-xs opacity-60">{{ entry.date }}</div>
                </div>
                <div class="commit-hash">{{ entry.hash }}</div>
              </div>

              <p class="text-sm opacity-80 mb-2">{{ entry.description }}</p>

              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tech in entry.technologies"
                  :key="tech"
                  class="tech-badge"
                >
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import GlitchText from "../effects/GlitchText.vue";

const stats = ref({});
const languages = ref([]);
const loading = ref(true);
const error = ref(null);

// Timeline data (customize this with your real journey)
const timeline = ref([
  {
    hash: "a3f8b2e",
    date: "January 2025",
    title: "Formation OnlineFormaPro - Fin",
    description:
      "Finalisation du CRM-Forma avec Symfony + Vue.js. Lead dev sur Nihon. Exploration de Java & Spring Boot.",
    technologies: ["Symfony", "Vue.js", "PostgreSQL", "Java", "Spring Boot"],
    color: "#00ff9f",
  },
  {
    hash: "7c4d9a1",
    date: "December 2024",
    title: "Full Stack Next.js",
    description:
      "Développement de Bakery App avec Next.js 16, Prisma, et système QR code. Authentification NextAuth.",
    technologies: ["Next.js 16", "TypeScript", "Prisma", "NextAuth"],
    color: "#bd00ff",
  },
  {
    hash: "2e91f5c",
    date: "November 2024",
    title: "React & PokéAPI",
    description:
      "Création du PokeAPIGame avec système de combat tour par tour et gestion d'état avancée.",
    technologies: ["React", "PokéAPI", "LocalStorage", "CSS"],
    color: "#ff006e",
  },
  {
    hash: "9b3c8d2",
    date: "October 2024",
    title: "Lead Developer Experience",
    description:
      "Gestion d'équipe (3 personnes) sur le projet Nihon. Architecture MVC, API REST, animations GSAP.",
    technologies: ["PHP", "MVC", "REST API", "GSAP", "Leadership"],
    color: "#00d9ff",
  },
  {
    hash: "4f7a1e9",
    date: "September 2024",
    title: "Portfolio Cyberpunk v1",
    description:
      "Premier portfolio avec esthétique cyberpunk/glitch. Animations avancées et design Figma.",
    technologies: ["HTML", "CSS", "SCSS", "GSAP", "Figma"],
    color: "#ffa500",
  },
  {
    hash: "8c2b6d4",
    date: "June 2024",
    title: "Début Formation Web",
    description:
      "Premiers pas en développement web. HTML, CSS, JavaScript fondamentaux. Découverte de Git.",
    technologies: ["HTML", "CSS", "JavaScript", "Git"],
    color: "#6366f1",
  },
]);

// Language colors (GitHub-like)
const languageColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  PHP: "#4F5D95",
  Vue: "#41b883",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Java: "#b07219",
  Python: "#3572A5",
};

// Fetch GitHub stats
async function fetchGitHubStats() {
  try {
    const response = await fetch("https://api.github.com/users/Jackmaa");
    if (!response.ok) throw new Error("GitHub API error");

    stats.value = await response.json();

    // Fetch repos for languages
    await fetchLanguages();

    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
}

// Fetch and calculate language stats
async function fetchLanguages() {
  try {
    const reposResponse = await fetch(
      "https://api.github.com/users/Jackmaa/repos?per_page=100"
    );
    const repos = await reposResponse.json();

    const langCount = {};
    let total = 0;

    repos.forEach((repo) => {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
        total++;
      }
    });

    // Convert to array and calculate percentages
    languages.value = Object.entries(langCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
        color: languageColors[name] || "#8b949e",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  } catch (err) {
    console.error("Error fetching languages:", err);
  }
}

onMounted(() => {
  fetchGitHubStats();
});
</script>

<style scoped>
.github-container {
  animation: fadeIn 0.5s ease-in-out;
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

.glow-text {
  text-shadow: 0 0 10px rgb(var(--accent) / 0.5);
}

.stat-item {
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: scale(1.05);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgb(var(--border));
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  text-decoration: none;
  color: rgb(var(--fg));
}

.action-btn:hover {
  border-color: rgb(var(--accent));
  background: rgb(var(--accent) / 0.1);
  transform: translateY(-2px);
}

/* Progress bars */
.progress-bar {
  width: 100%;
  height: 6px;
  background: rgb(var(--border) / 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

/* Timeline */
.timeline-entry {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 1rem;
  position: relative;
}

.timeline-graph {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.commit-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgb(var(--panel));
  flex-shrink: 0;
  z-index: 2;
}

.commit-line {
  width: 2px;
  flex-grow: 1;
  background: rgb(var(--border));
  margin-top: 4px;
}

.timeline-content {
  padding-bottom: 1rem;
}

.commit-hash {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
  color: rgb(var(--accent));
  padding: 0.25rem 0.5rem;
  border: 1px solid rgb(var(--border));
  border-radius: 4px;
  background: rgb(var(--accent) / 0.05);
}

.tech-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  background: rgb(var(--accent) / 0.1);
  border: 1px solid rgb(var(--accent) / 0.3);
  color: rgb(var(--accent));
}

/* Animations */
.timeline-entry {
  animation: slideInLeft 0.4s ease-out backwards;
}

.timeline-entry:nth-child(1) {
  animation-delay: 0.1s;
}
.timeline-entry:nth-child(2) {
  animation-delay: 0.2s;
}
.timeline-entry:nth-child(3) {
  animation-delay: 0.3s;
}
.timeline-entry:nth-child(4) {
  animation-delay: 0.4s;
}
.timeline-entry:nth-child(5) {
  animation-delay: 0.5s;
}
.timeline-entry:nth-child(6) {
  animation-delay: 0.6s;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
