<template>
  <div class="about-container font-mono text-sm">
    <!-- Frontmatter (métadonnées en haut) -->
    <div
      v-if="frontmatter"
      class="frontmatter mb-8 p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))]"
    >
      <div class="text-xs opacity-60 mb-3">--- METADATA ---</div>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="(value, key) in frontmatter"
          :key="key"
          class="flex flex-col gap-1"
          :class="isLongField(key, value) ? 'col-span-2' : ''"
        >
          <span class="opacity-60 text-xs">{{ key }}:</span>
          <span class="text-[rgb(var(--accent))] break-all">{{ value }}</span>
        </div>
      </div>
      <div class="text-xs opacity-60 mt-3">---</div>
    </div>

    <!-- Contenu Markdown parsé -->
    <div v-if="loading" class="opacity-60">
      <span class="animate-pulse">Loading about.md...</span>
    </div>

    <div v-else-if="error" class="text-[rgb(var(--er))]">
      Error: {{ error }}
    </div>

    <div v-else class="markdown-content space-y-6" v-html="htmlContent"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const frontmatter = ref(null);
const markdownContent = ref("");
const loading = ref(true);
const error = ref(null);

// Détecter si un champ est "long" et devrait prendre 2 colonnes
function isLongField(key, value) {
  const longKeys = ["email", "github", "linkedin", "website", "url"];
  const isLongKey = longKeys.includes(key.toLowerCase());
  const isLongValue = String(value).length > 25;
  return isLongKey || isLongValue;
}

// Convertir le Markdown en HTML sécurisé
const htmlContent = computed(() => {
  if (!markdownContent.value) return "";
  return parseMarkdownToHTML(markdownContent.value);
});

// Parser Markdown vers HTML (sans VNodes)
function parseMarkdownToHTML(md) {
  const lines = md.split("\n");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headers H1 avec glitch
    if (line.startsWith("# ")) {
      const text = line.slice(2).trim();
      html += `<h1 class="glitch-title text-4xl font-bold mb-4 text-[rgb(var(--accent))] glow-text" data-text="${escapeHtml(
        text
      )}">${parseInline(text)}</h1>`;
      i++;
    }
    // Headers H2 avec glitch
    else if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      html += `<h2 class="glitch-title text-2xl font-bold mt-8 mb-3 text-[rgb(var(--fg))] border-l-4 border-[rgb(var(--accent))] pl-3" data-text="${escapeHtml(
        text
      )}">${parseInline(text)}</h2>`;
      i++;
    }
    // Headers H3
    else if (line.startsWith("### ")) {
      html += `<h3 class="text-xl font-bold mt-6 mb-2 text-[rgb(var(--fg))] opacity-90">${parseInline(
        line.slice(4)
      )}</h3>`;
      i++;
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      html += `<blockquote class="border-l-4 border-[rgb(var(--accent))] pl-4 py-2 my-4 italic opacity-80 bg-[rgb(var(--panel))] rounded-r">${parseInline(
        line.slice(2)
      )}</blockquote>`;
      i++;
    }
    // Liste
    else if (line.match(/^[\*\-]\s+/)) {
      html += '<ul class="space-y-2 ml-6">';

      while (i < lines.length && lines[i].match(/^[\*\-]\s+/)) {
        const itemText = lines[i].replace(/^[\*\-]\s+/, "");
        html += `<li class="flex items-start gap-2 before:content-['▹'] before:text-[rgb(var(--accent))] before:font-bold">${parseInline(
          itemText
        )}</li>`;
        i++;
      }

      html += "</ul>";
    }
    // HR
    else if (line.trim() === "---" || line.trim() === "***") {
      html += '<hr class="my-6 border-[rgb(var(--border))] opacity-30">';
      i++;
    }
    // Ligne vide
    else if (line.trim() === "") {
      i++;
    }
    // Paragraphe
    else if (line.trim()) {
      const paragraphLines = [];

      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].match(/^(#{1,3}\s|[\*\-]\s+|>\s+|---$|\*\*\*$)/)
      ) {
        paragraphLines.push(lines[i]);
        i++;
      }

      html += `<p class="leading-relaxed opacity-90 text-[rgb(var(--fg))]">${parseInline(
        paragraphLines.join(" ")
      )}</p>`;
    } else {
      i++;
    }
  }

  return html;
}

// Parser inline (bold, italic, links, code)
function parseInline(text) {
  let result = text;

  // Bold **text**
  result = result.replace(
    /\*\*([^\*]+)\*\*/g,
    '<strong class="text-[rgb(var(--accent))] font-semibold">$1</strong>'
  );

  // Italic *text*
  result = result.replace(
    /\*([^\*]+)\*/g,
    '<em class="italic opacity-80">$1</em>'
  );

  // Links [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[rgb(var(--accent))] hover:underline hover:glow-text transition-all cursor-pointer">$1</a>'
  );

  // Inline code `code`
  result = result.replace(
    /`([^`]+)`/g,
    '<code class="px-2 py-1 bg-[rgb(var(--panel))] rounded text-[rgb(var(--accent))] text-xs">$1</code>'
  );

  return result;
}

// Escape HTML pour data-text attribute
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Extraire le frontmatter YAML
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, content };

  const fm = {};
  const lines = match[1].split("\n");
  lines.forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length) {
      fm[key.trim()] = valueParts.join(":").trim();
    }
  });

  return { frontmatter: fm, content: match[2] };
}

// Fetch et parse
onMounted(async () => {
  try {
    const response = await fetch("/about.md");
    if (!response.ok) throw new Error("Failed to load about.md");

    const raw = await response.text();
    const { frontmatter: fm, content } = extractFrontmatter(raw);

    frontmatter.value = fm;
    markdownContent.value = content;
    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
});
</script>

<style scoped>
.glow-text {
  text-shadow: 0 0 10px rgb(var(--accent) / 0.5);
}

.about-container {
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

/* Animation pour les listes */
.markdown-content :deep(ul li) {
  animation: slideIn 0.3s ease-out backwards;
}

.markdown-content :deep(ul li:nth-child(1)) {
  animation-delay: 0.05s;
}
.markdown-content :deep(ul li:nth-child(2)) {
  animation-delay: 0.1s;
}
.markdown-content :deep(ul li:nth-child(3)) {
  animation-delay: 0.15s;
}
.markdown-content :deep(ul li:nth-child(4)) {
  animation-delay: 0.2s;
}
.markdown-content :deep(ul li:nth-child(5)) {
  animation-delay: 0.25s;
}
.markdown-content :deep(ul li:nth-child(6)) {
  animation-delay: 0.3s;
}
.markdown-content :deep(ul li:nth-child(7)) {
  animation-delay: 0.35s;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Styles pour le contenu HTML injecté */
.markdown-content :deep(a:hover) {
  text-shadow: 0 0 10px rgb(var(--accent) / 0.5);
}

/* === GLITCH EFFECT sur les titres H1 et H2 === */
.markdown-content :deep(.glitch-title) {
  position: relative;
  display: inline-block;
  cursor: pointer;
  transition: all 0.1s ease;
}

.markdown-content :deep(.glitch-title:hover)::before,
.markdown-content :deep(.glitch-title:hover)::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Layer 1 (décalage gauche) - utilise l'accent */
.markdown-content :deep(.glitch-title:hover)::before {
  left: 2px;
  text-shadow: -2px 0 rgb(var(--accent));
  clip: rect(24px, 9999px, 90px, 0);
  animation: glitch-anim-1 0.6s infinite linear alternate-reverse;
}

/* Layer 2 (décalage droit) - utilise l'accent avec variation */
.markdown-content :deep(.glitch-title:hover)::after {
  left: -2px;
  text-shadow: -2px 0 rgb(var(--accent) / 0.8), 2px 2px rgb(var(--accent) / 0.6);
  clip: rect(85px, 9999px, 140px, 0);
  animation: glitch-anim-2 0.6s infinite linear alternate-reverse;
  filter: hue-rotate(180deg);
}

/* Animations de glitch */
@keyframes glitch-anim-1 {
  0% {
    clip: rect(132px, 9999px, 101px, 0);
    transform: skew(0.1deg);
  }
  10% {
    clip: rect(17px, 9999px, 94px, 0);
    transform: skew(0.2deg);
  }
  20% {
    clip: rect(40px, 9999px, 66px, 0);
    transform: skew(0.3deg);
  }
  30% {
    clip: rect(87px, 9999px, 82px, 0);
    transform: skew(0.1deg);
  }
  40% {
    clip: rect(137px, 9999px, 61px, 0);
    transform: skew(0.2deg);
  }
  50% {
    clip: rect(34px, 9999px, 14px, 0);
    transform: skew(0.4deg);
  }
  60% {
    clip: rect(121px, 9999px, 115px, 0);
    transform: skew(0.2deg);
  }
  70% {
    clip: rect(48px, 9999px, 78px, 0);
    transform: skew(0.3deg);
  }
  80% {
    clip: rect(78px, 9999px, 51px, 0);
    transform: skew(0.1deg);
  }
  90% {
    clip: rect(103px, 9999px, 46px, 0);
    transform: skew(0.2deg);
  }
  100% {
    clip: rect(84px, 9999px, 125px, 0);
    transform: skew(0.3deg);
  }
}

@keyframes glitch-anim-2 {
  0% {
    clip: rect(129px, 9999px, 36px, 0);
    transform: skew(0.2deg);
  }
  10% {
    clip: rect(36px, 9999px, 4px, 0);
    transform: skew(0.3deg);
  }
  20% {
    clip: rect(85px, 9999px, 66px, 0);
    transform: skew(0.1deg);
  }
  30% {
    clip: rect(91px, 9999px, 91px, 0);
    transform: skew(0.4deg);
  }
  40% {
    clip: rect(148px, 9999px, 138px, 0);
    transform: skew(0.2deg);
  }
  50% {
    clip: rect(38px, 9999px, 122px, 0);
    transform: skew(0.3deg);
  }
  60% {
    clip: rect(69px, 9999px, 54px, 0);
    transform: skew(0.1deg);
  }
  70% {
    clip: rect(98px, 9999px, 71px, 0);
    transform: skew(0.2deg);
  }
  80% {
    clip: rect(146px, 9999px, 34px, 0);
    transform: skew(0.3deg);
  }
  90% {
    clip: rect(134px, 9999px, 43px, 0);
    transform: skew(0.1deg);
  }
  100% {
    clip: rect(11px, 9999px, 108px, 0);
    transform: skew(0.2deg);
  }
}

/* Glow subtil pendant le glitch */
.markdown-content :deep(.glitch-title:hover) {
  text-shadow: 0 0 10px rgb(var(--accent) / 0.5);
}
</style>
