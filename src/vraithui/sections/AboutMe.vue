<template>
  <div class="about-container font-mono text-sm">
    <!-- Frontmatter (métadonnées en haut) -->

    <div
      v-if="frontmatter"
      class="frontmatter mb-8 p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))]"
    >
      <div class="text-xs opacity-60 mb-2">--- METADATA ---</div>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="(value, key) in frontmatter" :key="key">
          <span class="opacity-60">{{ key }}:</span>
          <span class="ml-2 text-[rgb(var(--accent))]">{{ value }}</span>
        </div>
      </div>
      <div class="text-xs opacity-60 mt-2">---</div>
    </div>

    <!-- Contenu Markdown parsé -->
    <div v-if="loading" class="opacity-60">
      <span class="animate-pulse">Loading about.md...</span>
    </div>

    <div v-else-if="error" class="text-red-400">Error: {{ error }}</div>
    <div v-else class="markdown-content space-y-6" v-html="htmlContent"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
const frontmatter = ref(null);
const markdownContent = ref("");
const loading = ref(true);
const error = ref(null);

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

    // Headers H1
    if (line.startsWith("# ")) {
      html += `<h1 class="text-4xl font-bold mb-4 text-[rgb(var(--accent))] glow-text">${parseInline(
        line.slice(2)
      )}</h1>`;
      i++;
    }
    // Headers H2
    else if (line.startsWith("## ")) {
      html += `<h2 class="text-2xl font-bold mt-8 mb-3 text-[rgb(var(--fg))] border-l-4 border-[rgb(var(--accent))] pl-3">${parseInline(
        line.slice(3)
      )}</h2>`;
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
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
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
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
}
</style>
