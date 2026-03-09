<template>
  <div class="resume-container font-mono">
    <!-- Header -->
    <div class="resume-screen-header mb-6 flex items-start justify-between">
      <div>
        <GlitchText
          :text="$t('sections.resume.title')"
          class="text-4xl font-bold text-[rgb(var(--accent))] glow-text mb-2"
        />
        <p class="text-sm opacity-70">{{ $t('sections.resume.subtitle') }}</p>
      </div>
      <button
        @click="downloadPdf"
        class="download-btn shrink-0 px-3 py-1.5 text-xs rounded border border-[rgb(var(--accent))] text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))] hover:text-black transition-colors"
      >
        {{ $t('sections.resume.download') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="opacity-60 text-sm">
      <span class="animate-pulse">{{ $t('sections.resume.loading') }}</span>
    </div>

    <div v-else-if="error" class="text-red-400 text-sm">{{ $t('common.error') }}: {{ error }}</div>

    <!-- JSON-style resume -->
    <div v-else class="json-view text-sm leading-relaxed">
      <!-- Line numbers + content -->
      <div class="flex">
        <!-- Line numbers gutter -->
        <div class="line-numbers select-none pr-4 text-right opacity-30 shrink-0">
          <div v-for="n in totalLines" :key="n">{{ n }}</div>
        </div>

        <!-- JSON content -->
        <div class="flex-1 overflow-x-auto">
          <!-- Opening brace -->
          <div><span class="brace">{</span></div>

          <!-- Basics -->
          <div class="ml-4">
            <button @click="toggleSection('basics')" class="json-key hover:underline cursor-pointer">
              "basics"<span class="colon">:</span> <span class="brace">{{ collapsed.has('basics') ? '{...}' : '{' }}</span>
            </button>
          </div>
          <template v-if="!collapsed.has('basics')">
            <div class="ml-8" v-for="(val, key) in resume.basics" :key="key">
              <span class="json-key">"{{ key }}"</span><span class="colon">: </span><span class="json-string">"{{ val }}"</span><span class="comma">,</span>
            </div>
            <div class="ml-4"><span class="brace">}</span><span class="comma">,</span></div>
          </template>

          <!-- Experience -->
          <div class="ml-4">
            <button @click="toggleSection('experience')" class="json-key hover:underline cursor-pointer">
              "experience"<span class="colon">:</span> <span class="brace">{{ collapsed.has('experience') ? '[...]' : '[' }}</span>
            </button>
          </div>
          <template v-if="!collapsed.has('experience')">
            <div v-for="(exp, ei) in resume.experience" :key="ei" class="ml-8">
              <div><span class="brace">{</span></div>
              <div class="ml-4">
                <span class="json-key">"company"</span><span class="colon">: </span><span class="json-string">"{{ exp.company }}"</span><span class="comma">,</span>
              </div>
              <div class="ml-4">
                <span class="json-key">"position"</span><span class="colon">: </span><span class="json-string">"{{ exp.position }}"</span><span class="comma">,</span>
              </div>
              <div class="ml-4">
                <span class="json-key">"period"</span><span class="colon">: </span><span class="json-string">"{{ exp.period }}"</span><span class="comma">,</span>
              </div>
              <div class="ml-4">
                <span class="json-key">"description"</span><span class="colon">: </span><span class="json-string">"{{ exp.description }}"</span><span class="comma">,</span>
              </div>
              <div class="ml-4">
                <span class="json-key">"highlights"</span><span class="colon">: </span><span class="brace">[</span>
              </div>
              <div v-for="(h, hi) in exp.highlights" :key="hi" class="ml-8">
                <span class="json-string">"{{ h }}"</span><span v-if="hi < exp.highlights.length - 1" class="comma">,</span>
              </div>
              <div class="ml-4"><span class="brace">]</span></div>
              <div><span class="brace">}</span><span v-if="ei < resume.experience.length - 1" class="comma">,</span></div>
            </div>
            <div class="ml-4"><span class="brace">]</span><span class="comma">,</span></div>
          </template>

          <!-- Projects -->
          <template v-if="resume.projects">
          <div class="ml-4">
            <button @click="toggleSection('projects')" class="json-key hover:underline cursor-pointer">
              "projects"<span class="colon">:</span> <span class="brace">{{ collapsed.has('projects') ? '[...]' : '[' }}</span>
            </button>
          </div>
          <template v-if="!collapsed.has('projects')">
            <div v-for="(proj, pi) in resume.projects" :key="pi" class="ml-8">
              <div>
                <span class="brace">{</span>
                <span class="json-key"> "name"</span><span class="colon">: </span><span class="json-string">"{{ proj.name }}"</span><span class="comma">, </span>
                <span class="json-key">"stack"</span><span class="colon">: </span><span class="json-string">"{{ proj.stack }}"</span>
                <span class="brace"> }</span><span v-if="pi < resume.projects.length - 1" class="comma">,</span>
              </div>
              <div class="ml-4 text-xs opacity-40 -mt-0.5 mb-1">// {{ proj.description }}</div>
            </div>
            <div class="ml-4"><span class="brace">]</span><span class="comma">,</span></div>
          </template>
          </template>

          <!-- Education -->
          <div class="ml-4">
            <button @click="toggleSection('education')" class="json-key hover:underline cursor-pointer">
              "education"<span class="colon">:</span> <span class="brace">{{ collapsed.has('education') ? '[...]' : '[' }}</span>
            </button>
          </div>
          <template v-if="!collapsed.has('education')">
            <div v-for="(edu, ei) in resume.education" :key="ei" class="ml-8">
              <div><span class="brace">{</span></div>
              <div class="ml-4">
                <span class="json-key">"institution"</span><span class="colon">: </span><span class="json-string">"{{ edu.institution }}"</span><span class="comma">,</span>
              </div>
              <div class="ml-4">
                <span class="json-key">"degree"</span><span class="colon">: </span><span class="json-string">"{{ edu.degree }}"</span><span class="comma">,</span>
              </div>
              <div class="ml-4">
                <span class="json-key">"period"</span><span class="colon">: </span><span class="json-string">"{{ edu.period }}"</span><span class="comma">,</span>
              </div>
              <div class="ml-4">
                <span class="json-key">"details"</span><span class="colon">: </span><span class="json-string">"{{ edu.details }}"</span>
              </div>
              <div><span class="brace">}</span><span v-if="ei < resume.education.length - 1" class="comma">,</span></div>
            </div>
            <div class="ml-4"><span class="brace">]</span><span class="comma">,</span></div>
          </template>

          <!-- Certifications -->
          <div class="ml-4">
            <button @click="toggleSection('certifications')" class="json-key hover:underline cursor-pointer">
              "certifications"<span class="colon">:</span> <span class="brace">{{ collapsed.has('certifications') ? '[...]' : '[' }}</span>
            </button>
          </div>
          <template v-if="!collapsed.has('certifications')">
            <div v-for="(cert, ci) in resume.certifications" :key="ci" class="ml-8">
              <div>
                <span class="brace">{</span>
                <span class="json-key"> "name"</span><span class="colon">: </span><span class="json-string">"{{ cert.name }}"</span><span class="comma">, </span>
                <span class="json-key">"issuer"</span><span class="colon">: </span><span class="json-string">"{{ cert.issuer }}"</span><span class="comma">, </span>
                <span class="json-key">"year"</span><span class="colon">: </span><span class="json-string">"{{ cert.year }}"</span>
                <span class="brace"> }</span><span v-if="ci < resume.certifications.length - 1" class="comma">,</span>
              </div>
            </div>
            <div class="ml-4"><span class="brace">]</span><span class="comma">,</span></div>
          </template>

          <!-- Languages -->
          <div class="ml-4">
            <button @click="toggleSection('languages')" class="json-key hover:underline cursor-pointer">
              "languages"<span class="colon">:</span> <span class="brace">{{ collapsed.has('languages') ? '[...]' : '[' }}</span>
            </button>
          </div>
          <template v-if="!collapsed.has('languages')">
            <div v-for="(lang, li) in resume.languages" :key="li" class="ml-8">
              <div>
                <span class="brace">{</span>
                <span class="json-key"> "name"</span><span class="colon">: </span><span class="json-string">"{{ lang.name }}"</span><span class="comma">, </span>
                <span class="json-key">"level"</span><span class="colon">: </span><span class="json-string">"{{ lang.level }}"</span>
                <span class="brace"> }</span><span v-if="li < resume.languages.length - 1" class="comma">,</span>
              </div>
            </div>
            <div class="ml-4"><span class="brace">]</span></div>
          </template>

          <!-- Closing brace -->
          <div><span class="brace">}</span></div>
        </div>
      </div>
    </div>

    <!-- Print-only CV — hidden on screen, shown on print -->
    <div v-if="!loading && !error && resume.basics" class="print-cv">
      <div class="cv-page">
        <div class="cv-grid">
          <!-- LEFT SIDEBAR -->
          <aside class="cv-sidebar">
            <h1 class="cv-name">{{ resume.basics.name }}</h1>
            <p class="cv-title">{{ resume.basics.title }}</p>
            <div class="cv-divider"></div>

            <div class="cv-contact">
              <p>&gt; email: {{ resume.basics.email }}</p>
              <p>&gt; web: {{ resume.basics.website }}</p>
              <p>&gt; loc: {{ resume.basics.location }}</p>
            </div>
            <div class="cv-divider"></div>

            <h2 class="cv-section">// SKILLS</h2>
            <div v-for="skill in printSkills" :key="skill.name" class="cv-skill">
              <div class="cv-skill-name">{{ skill.name }}</div>
              <div class="cv-skill-bar">
                <span class="cv-bar-fill">{{ skillBar(skill.level).filled }}</span><span class="cv-bar-empty">{{ skillBar(skill.level).empty }}</span>
                <span class="cv-skill-pct">{{ skill.level }}%</span>
              </div>
            </div>
            <div class="cv-divider"></div>

            <h2 class="cv-section">// EDUCATION</h2>
            <div v-for="edu in resume.education" :key="edu.institution" class="cv-edu">
              <p class="cv-edu-school">{{ edu.institution }}</p>
              <p class="cv-edu-degree">{{ edu.degree }}</p>
              <p v-if="edu.period" class="cv-edu-period">{{ edu.period }}</p>
            </div>
            <div class="cv-divider"></div>

            <h2 class="cv-section">// LANGUAGES</h2>
            <div v-for="lang in resume.languages" :key="lang.name" class="cv-lang">
              <span class="cv-lang-name">{{ lang.name }}</span>
              <span class="cv-bar-fill">{{ langBar(lang.level) }}</span>
              <span class="cv-lang-level">{{ lang.level }}</span>
            </div>
          </aside>

          <!-- MAIN CONTENT -->
          <main class="cv-main">
            <h2 class="cv-section">// PROFILE</h2>
            <p class="cv-summary">{{ resume.basics.summary }}</p>

            <h2 class="cv-section">// PROJECTS</h2>
            <div v-for="proj in resume.projects" :key="proj.name" class="cv-project">
              <div class="cv-project-header">
                <span class="cv-project-name">{{ proj.name }}</span>
                <span class="cv-project-stack">[ {{ proj.stack }} ]</span>
              </div>
              <p class="cv-project-desc">{{ proj.description }}</p>
            </div>

            <h2 class="cv-section">// EXPERIENCE</h2>
            <div v-for="exp in resume.experience" :key="exp.company" class="cv-exp">
              <div class="cv-exp-header">
                <span class="cv-exp-company">{{ exp.company }}</span>
                <span class="cv-exp-period">{{ exp.period }}</span>
              </div>
              <p class="cv-exp-position">{{ exp.position }}</p>
              <p class="cv-exp-desc">{{ exp.description }}</p>
            </div>

            <h2 class="cv-section">// CERTIFICATIONS</h2>
            <div v-for="cert in resume.certifications" :key="cert.name" class="cv-cert">
              <span class="cv-cert-name">{{ cert.name }}</span>
              <span class="cv-cert-meta"> — {{ cert.issuer }}, {{ cert.year }}</span>
            </div>
          </main>
        </div>

        <footer class="cv-footer">
          ░░░░░ vraith.dev · Exclusive portfolio CV ░░░░░
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import GlitchText from "../effects/GlitchText.vue";
import { useLanguageStore } from "@/stores/languageStore";

const languageStore = useLanguageStore();

const resume = ref({});
const skills = ref([]);
const loading = ref(true);
const error = ref(null);
const collapsed = ref(new Set());

const resumePath = computed(() => {
  return `/content/resume.${languageStore.currentLocale}.json`;
});

const skillsPath = computed(() => {
  return `/content/skills.${languageStore.currentLocale}.json`;
});

function toggleSection(section) {
  const next = new Set(collapsed.value);
  if (next.has(section)) {
    next.delete(section);
  } else {
    next.add(section);
  }
  collapsed.value = next;
}

// Top 10 technical skills sorted by level (for print CV)
const printSkills = computed(() => {
  return skills.value
    .filter(cat => cat.category !== 'Soft Skills')
    .flatMap(cat => cat.skills)
    .sort((a, b) => b.level - a.level)
    .slice(0, 10);
});

function skillBar(level) {
  const total = 12;
  const filled = Math.round((level / 100) * total);
  return {
    filled: '\u2588'.repeat(filled),
    empty: '\u2591'.repeat(total - filled),
  };
}

function langBar(level) {
  const map = { Native: 12, Natif: 12, Bilingual: 11, Bilingue: 11, Fluent: 10, Courant: 10 };
  return '\u2588'.repeat(map[level] || 8);
}

// Approximate line count for line numbers
const totalLines = computed(() => {
  if (!resume.value.basics) return 1;
  let lines = 2; // opening/closing brace
  // basics
  lines += 2 + (collapsed.value.has('basics') ? 0 : Object.keys(resume.value.basics || {}).length + 1);
  // experience
  lines += 1;
  if (!collapsed.value.has('experience')) {
    (resume.value.experience || []).forEach((exp) => {
      lines += 7 + (exp.highlights || []).length;
    });
    lines += 1;
  }
  // projects
  if (resume.value.projects) {
    lines += 1;
    if (!collapsed.value.has('projects')) {
      lines += (resume.value.projects || []).length * 2 + 1;
    }
  }
  // education
  lines += 1;
  if (!collapsed.value.has('education')) {
    (resume.value.education || []).forEach(() => {
      lines += 6;
    });
    lines += 1;
  }
  // certifications
  lines += 1;
  if (!collapsed.value.has('certifications')) {
    lines += (resume.value.certifications || []).length + 1;
  }
  // languages
  lines += 1;
  if (!collapsed.value.has('languages')) {
    lines += (resume.value.languages || []).length + 1;
  }
  return lines;
});

function downloadPdf() {
  window.print();
}

async function fetchResume() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(resumePath.value);
    if (!response.ok) throw new Error("Failed to load resume data");
    resume.value = await response.json();
    loading.value = false;

    await nextTick();
    window.dispatchEvent(new Event("resize"));
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
}

async function fetchSkills() {
  try {
    const res = await fetch(skillsPath.value);
    if (res.ok) skills.value = await res.json();
  } catch {
    // Skills are non-critical — only used for print CV
  }
}

// Watch for locale changes
watch(() => languageStore.currentLocale, () => {
  fetchResume();
  fetchSkills();
});

onMounted(async () => {
  await fetchResume();
  fetchSkills();
});
</script>

<style scoped>
.resume-container {
  animation: fadeIn 0.5s ease-in-out;
  padding-block: 1rem;
}

.glow-text {
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
}

.json-view {
  background: rgb(var(--panel-2) / 0.3);
  border: 1px solid rgb(var(--border));
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
}

.line-numbers {
  min-width: 2rem;
  font-size: 0.75rem;
  line-height: 1.625rem;
  border-right: 1px solid rgb(var(--border));
  margin-right: 0.5rem;
}

.json-key {
  color: rgb(var(--accent));
}

.json-string {
  color: rgb(150 200 120);
}

.brace {
  color: rgb(var(--fg));
  opacity: 0.8;
}

.colon {
  color: rgb(var(--fg));
  opacity: 0.5;
}

.comma {
  color: rgb(var(--fg));
  opacity: 0.4;
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

/* Print CV — hidden on screen */
.print-cv {
  display: none;
}

/* ===== PRINT: Terminal-themed CV layout ===== */
@media print {
  .resume-screen-header,
  .json-view {
    display: none !important;
  }

  .resume-container {
    padding: 0 !important;
    animation: none !important;
  }

  .print-cv {
    display: block !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }

  .cv-page {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm;
    background: #0d1117;
    color: #e6edf3;
    font-family: 'JetBrains Mono', monospace;
    box-sizing: border-box;
  }

  .cv-grid {
    display: grid;
    grid-template-columns: 35% 65%;
  }

  .cv-sidebar {
    padding-right: 6mm;
    border-right: 1px solid rgba(0, 229, 255, 0.2);
  }

  .cv-main {
    padding-left: 6mm;
  }

  /* --- Identity --- */
  .cv-name {
    font-size: 18pt;
    font-weight: 700;
    color: #00e5ff;
    line-height: 1.2;
    margin-bottom: 2pt;
  }

  .cv-title {
    font-size: 9pt;
    color: #8b949e;
  }

  .cv-divider {
    border-top: 1px solid #30363d;
    margin: 3.5mm 0;
  }

  /* --- Contact --- */
  .cv-contact p {
    font-size: 7.5pt;
    color: #e6edf3;
    margin: 1.5pt 0;
  }

  /* --- Section headers --- */
  .cv-section {
    font-size: 9pt;
    font-weight: 700;
    color: #00e5ff;
    margin-bottom: 2.5mm;
    letter-spacing: 0.5pt;
  }

  /* --- Skills --- */
  .cv-skill {
    margin-bottom: 1.5mm;
  }

  .cv-skill-name {
    font-size: 7pt;
    color: #e6edf3;
    margin-bottom: 0.3mm;
  }

  .cv-skill-bar {
    font-size: 7pt;
    line-height: 1;
  }

  .cv-bar-fill {
    color: #00e5ff;
  }

  .cv-bar-empty {
    color: #30363d;
  }

  .cv-skill-pct {
    color: #8b949e;
    font-size: 6.5pt;
    margin-left: 2pt;
  }

  /* --- Education --- */
  .cv-edu {
    margin-bottom: 2.5mm;
  }

  .cv-edu-school {
    font-size: 7.5pt;
    color: #7ee787;
    font-weight: 600;
    margin-bottom: 0.5pt;
  }

  .cv-edu-degree {
    font-size: 7pt;
    color: #e6edf3;
    margin-bottom: 0.5pt;
  }

  .cv-edu-period {
    font-size: 6.5pt;
    color: #8b949e;
  }

  /* --- Languages --- */
  .cv-lang {
    font-size: 7.5pt;
    margin-bottom: 1.5mm;
    display: flex;
    align-items: baseline;
    gap: 3pt;
  }

  .cv-lang-name {
    color: #e6edf3;
    min-width: 18mm;
  }

  .cv-lang-level {
    color: #8b949e;
    font-size: 6.5pt;
  }

  /* --- Profile --- */
  .cv-summary {
    font-size: 7.5pt;
    color: #e6edf3;
    line-height: 1.5;
    margin-bottom: 4mm;
  }

  /* --- Projects --- */
  .cv-project {
    margin-bottom: 2.5mm;
  }

  .cv-project-header {
    display: flex;
    align-items: baseline;
    gap: 4pt;
    flex-wrap: wrap;
  }

  .cv-project-name {
    font-size: 8pt;
    font-weight: 700;
    color: #7ee787;
  }

  .cv-project-stack {
    font-size: 6.5pt;
    color: #8b949e;
  }

  .cv-project-desc {
    font-size: 7pt;
    color: #c9d1d9;
    margin-top: 0.5pt;
  }

  /* --- Experience --- */
  .cv-exp {
    margin-bottom: 3mm;
  }

  .cv-exp-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .cv-exp-company {
    font-size: 8pt;
    font-weight: 700;
    color: #7ee787;
  }

  .cv-exp-period {
    font-size: 6.5pt;
    color: #8b949e;
  }

  .cv-exp-position {
    font-size: 7.5pt;
    color: #00e5ff;
    margin-top: 0.5pt;
  }

  .cv-exp-desc {
    font-size: 7pt;
    color: #c9d1d9;
    line-height: 1.4;
    margin-top: 0.5pt;
  }

  /* --- Certifications --- */
  .cv-cert {
    font-size: 7.5pt;
    margin-bottom: 1.5mm;
  }

  .cv-cert-name {
    color: #7ee787;
    font-weight: 600;
  }

  .cv-cert-meta {
    color: #8b949e;
  }

  /* --- Footer --- */
  .cv-footer {
    text-align: center;
    font-size: 6.5pt;
    color: #484f58;
    margin-top: 4mm;
    padding-top: 2mm;
    border-top: 1px solid #21262d;
    letter-spacing: 1pt;
  }
}
</style>
