<template>
  <!-- Skip button -->
  <button
    v-if="!completed && !skipped"
    @click="skipIntro"
    class="skip-btn absolute bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 text-sm text-[rgb(var(--fg))] bg-[rgb(var(--bg))]/80 backdrop-blur-sm border border-[rgb(var(--border))] rounded-full hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] transition-all whitespace-nowrap"
  >
    Skip intro [ESC]
  </button>

  <!-- Matrix Rain (final transition) -->
  <MatrixRain v-if="showMatrix" @complete="finishUnlock" />

  <!-- Phase content -->
  <div v-if="!showMatrix" class="h-full flex flex-col overflow-hidden">

    <!-- ============================================ -->
    <!-- PHASE 1 : Boot sequence                      -->
    <!-- ============================================ -->
    <div v-if="phase === 'boot'" class="flex items-center justify-center h-full">
      <div class="w-full max-w-2xl space-y-2 text-sm px-8">
        <div
          v-for="(msg, i) in bootMessages"
          :key="i"
          class="boot-line"
          :style="{ animationDelay: `${i * 0.3}s` }"
        >
          <span
            :class="
              msg.type === 'error'
                ? 'text-red-400'
                : msg.type === 'warn'
                ? 'text-yellow-400'
                : 'text-green-400'
            "
          >
            [{{ msg.type.toUpperCase() }}]
          </span>
          {{ msg.text }}
        </div>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- PHASE 2 : Terminal game                      -->
    <!-- ============================================ -->
    <div v-else-if="phase === 'game'" class="flex items-center justify-center h-full">
      <div class="w-full max-w-2xl px-8 rounded-lg" :class="{ 'terminal-alerted': showAlert }">

        <!-- ASCII Banner -->
        <pre class="text-[rgb(var(--accent))] text-center mb-6 text-xs glow-text" :class="{ 'banner-glitch': bannerGlitched }">{{ bannerText }}</pre>

        <!-- Terminal output -->
        <div ref="terminalOutputRef" class="space-y-2 text-sm mb-4 max-h-64 overflow-auto">
          <div v-for="(line, i) in terminalLines" :key="i" class="terminal-line">
            <span v-if="line.type === 'prompt'" class="text-[rgb(var(--accent))]">vraith@portfolio:~$</span>
            <span v-if="line.type === 'input'" class="ml-2">{{ line.text }}</span>
            <span
              v-if="line.type === 'output'"
              :class="line.error ? 'text-red-400' : line.success ? 'text-green-400' : 'opacity-80'"
            >{{ line.text }}</span>
            <span v-if="line.type === 'processing'" class="text-yellow-400 processing-dots">
              {{ line.text }}
            </span>
          </div>
        </div>

        <!-- Progress indicator -->
        <div v-if="currentStep < steps.length" class="mb-4 text-xs opacity-60">
          Progress: {{ currentStep }}/{{ steps.length }}
        </div>

        <!-- Input -->
        <div class="flex items-center gap-2" :class="isProcessing ? 'opacity-40' : ''">
          <span class="text-[rgb(var(--accent))]">vraith@portfolio:~$</span>
          <input
            ref="inputRef"
            v-model="currentInput"
            @keydown.enter="executeCommand"
            @keydown.tab.prevent="autocomplete"
            class="flex-1 bg-transparent outline-none border-b border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] transition-colors px-2 py-1"
            :placeholder="isProcessing ? '' : currentHint"
            :disabled="isProcessing"
          />
        </div>

        <!-- Hint -->
        <div v-if="showHint && !isLockedOut" class="mt-2 text-xs opacity-60">
          💡 Hint: {{ currentHint }}
        </div>

        <!-- Lockout countdown -->
        <div v-if="isLockedOut" class="mt-2 text-xs text-red-400 animate-pulse">
          ⚠ Terminal locked — restoring in {{ lockoutRemaining }}s
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import MatrixRain from "./Matrix.vue";

const emit = defineEmits(["complete"]);

// ─── Phase ───────────────────────────────────────────────────────────────────
const phase = ref("boot"); // boot | game

const bootMessages = ref([
  { type: "init",  text: "Connecting to vraith.dev..." },
  { type: "warn",  text: "Unauthorized access detected" },
  { type: "scan",  text: "Analyzing visitor credentials..." },
  { type: "error", text: "Access denied. Authorization required." },
]);

// ─── Terminal state ───────────────────────────────────────────────────────────
const terminalLines    = ref([]);
const currentInput     = ref("");
const currentStep      = ref(0);
const inputRef         = ref(null);
const terminalOutputRef = ref(null);
const completed        = ref(false);
const skipped          = ref(false);
const showMatrix       = ref(false);
const showHint         = ref(true);
const isProcessing     = ref(false);

// ─── Security alert state ─────────────────────────────────────────────────────
const wrongAttempts    = ref(0);
const isLockedOut      = ref(false);
const lockoutRemaining = ref(0);
const showAlert        = ref(false);

// ─── Banner glitch state ──────────────────────────────────────────────────────
const bannerGlitched = ref(false);
const BANNER_ORIGINAL =
  "\n╔═══════════════════════════════════════════╗\n║  RESTRICTED ACCESS - AUTHENTICATION REQ.  ║\n╚═══════════════════════════════════════════╝";
const bannerText = ref(BANNER_ORIGINAL);

// ─── Interval handles ─────────────────────────────────────────────────────────
let glitchInterval  = null;
let lockoutInterval = null;

// ─── Easter eggs ──────────────────────────────────────────────────────────────
const EASTER_EGGS = {
  whoami:           "vraith — unauthorized visitor  |  access level: NONE",
  ls:               "drwxr-xr-x  projects/    about/    contact/    [CLASSIFIED]/",
  "ls -la":         "drwxr-xr-x  projects/    about/    contact/    [CLASSIFIED]/",
  pwd:              "/restricted/zone/0x4f2a8b1c",
  "cat /etc/passwd":"Permission denied. Nice try.",
  ping:             "PING vraith.dev: 64 bytes from 127.0.0.1 — ttl=64  time=0.42ms",
  uname:            "Linux vraith.dev 6.x.x-portfolio #1 SMP PREEMPT",
};

// ─── Game steps ───────────────────────────────────────────────────────────────
const steps = [
  {
    command: "scan",
    hint: "Type 'scan' to analyze the system",
    responses: [
      "[SCANNING] Analyzing system architecture...",
      "[FOUND] Weak point detected: /auth/bypass",
      "[HINT] Try: bypass",
    ],
  },
  {
    command: "bypass",
    hint: "Type 'bypass' to override security",
    responses: [
      "[BYPASS] Overriding security protocols...",
      { type: "progressBar", total: 28, duration: 1400 },
      "[SUCCESS] Firewall disabled",
      "[HINT] Execute: access",
    ],
  },
  {
    command: "access",
    hint: "Type 'access' to unlock the portfolio",
    responses: ["[AUTH] Verifying credentials...", "[OK] Access granted.", ""],
  },
];

const currentHint = computed(() => {
  if (currentStep.value >= steps.length) return "";
  return steps[currentStep.value].hint;
});

// ─── Utilities ────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scrollToBottom() {
  nextTick(() => {
    if (terminalOutputRef.value) {
      terminalOutputRef.value.scrollTop = terminalOutputRef.value.scrollHeight;
    }
  });
}

function addLine(text, type = "output", options = {}) {
  terminalLines.value.push({ text, type, ...options });
  scrollToBottom();
}

async function typewriterAddLine(text, type = "output", options = {}) {
  terminalLines.value.push({ text: "", type, ...options });
  const lineIdx = terminalLines.value.length - 1;
  for (const char of text) {
    await sleep(14);
    terminalLines.value[lineIdx].text += char;
  }
  scrollToBottom();
}

async function animateProgressBar(config) {
  const { total, duration } = config;
  const stutterAt = Math.floor(total * 0.4);
  const lineIdx = terminalLines.value.length;

  terminalLines.value.push({ text: "░".repeat(total) + " 0%", type: "output", success: true });
  scrollToBottom();

  // Phase 1: fill to stutter point
  const phase1Ms = Math.floor((duration * 0.5) / stutterAt);
  for (let filled = 1; filled <= stutterAt; filled++) {
    await sleep(phase1Ms);
    const blocks = "█".repeat(filled) + "░".repeat(total - filled);
    terminalLines.value[lineIdx].text = `${blocks} ${Math.round((filled / total) * 100)}%`;
  }

  // Stutter — system hits resistance
  await sleep(350);

  // Phase 2: burst to 100%
  const phase2Ms = Math.floor((duration * 0.5) / (total - stutterAt));
  for (let filled = stutterAt + 1; filled <= total; filled++) {
    await sleep(phase2Ms);
    const blocks = "█".repeat(filled) + "░".repeat(total - filled);
    terminalLines.value[lineIdx].text = `${blocks} ${Math.round((filled / total) * 100)}%`;
  }
}

function triggerAlertFlash() {
  showAlert.value = true;
  setTimeout(() => { showAlert.value = false; }, 700);
}

function glitchBanner() {
  const GLITCH_CHARS = "░▒▓│─┼╬╫╪!?@#%$";
  const chars = BANNER_ORIGINAL.split("");
  const glitchable = chars
    .map((c, i) => (c !== "\n" ? i : -1))
    .filter((i) => i !== -1);
  const count = 2 + Math.floor(Math.random() * 3);
  const picked = [];
  while (picked.length < count) {
    const idx = glitchable[Math.floor(Math.random() * glitchable.length)];
    if (!picked.includes(idx)) picked.push(idx);
  }
  const glitched = [...chars];
  picked.forEach((idx) => {
    glitched[idx] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  });
  bannerGlitched.value = true;
  bannerText.value = glitched.join("");
  setTimeout(() => {
    bannerText.value = BANNER_ORIGINAL;
    bannerGlitched.value = false;
  }, 130);
}

// ─── Command execution ────────────────────────────────────────────────────────
async function executeCommand() {
  const cmd = currentInput.value.trim().toLowerCase();
  if (!cmd || isProcessing.value) return;

  addLine(cmd, "input");
  addLine("", "prompt");
  currentInput.value = "";

  // Special: clear terminal
  if (cmd === "clear") {
    terminalLines.value = [];
    nextTick(() => inputRef.value?.focus());
    return;
  }

  // Easter eggs — work at any step, never consume attempts
  if (cmd in EASTER_EGGS) {
    isProcessing.value = true;
    await typewriterAddLine(EASTER_EGGS[cmd], "output");
    isProcessing.value = false;
    nextTick(() => inputRef.value?.focus());
    return;
  }

  if (currentStep.value < steps.length) {
    const step = steps[currentStep.value];

    if (cmd === step.command) {
      // ── Correct command ──────────────────────────────────────────────────
      isProcessing.value = true;
      wrongAttempts.value = 0;

      const processingIdx = terminalLines.value.length;
      terminalLines.value.push({ text: "[PROCESSING]", type: "processing" });
      scrollToBottom();

      await sleep(500);
      terminalLines.value.splice(processingIdx, 1);

      for (const response of step.responses) {
        if (response?.type === "progressBar") {
          await animateProgressBar(response);
          await sleep(300);
        } else {
          await typewriterAddLine(response, "output", { success: true });
          await sleep(150);
        }
      }

      currentStep.value++;
      isProcessing.value = false;

      if (currentStep.value >= steps.length) {
        await sleep(1000);
        showMatrix.value = true;
      }

      nextTick(() => inputRef.value?.focus());

    } else if (cmd === "help") {
      // ── Help ─────────────────────────────────────────────────────────────
      addLine(`  required: ${step.command}  —  ${step.hint}`, "output");
      addLine("  other:    try whoami, ls, pwd, ping…", "output");
      nextTick(() => inputRef.value?.focus());

    } else {
      // ── Wrong command — security alert ───────────────────────────────────
      wrongAttempts.value++;
      triggerAlertFlash();
      isProcessing.value = true;
      const remaining = 3 - wrongAttempts.value;

      if (wrongAttempts.value >= 3) {
        await typewriterAddLine(
          "[SECURITY] Brute force detected. Locking terminal.",
          "output",
          { error: true }
        );
        isLockedOut.value = true;
        lockoutRemaining.value = 5;
        lockoutInterval = setInterval(() => {
          lockoutRemaining.value--;
          if (lockoutRemaining.value <= 0) {
            clearInterval(lockoutInterval);
            isLockedOut.value = false;
            isProcessing.value = false;
            wrongAttempts.value = 0;
            addLine("[SYSTEM] Terminal restored. Proceed with caution.", "output");
            nextTick(() => inputRef.value?.focus());
          }
        }, 1000);
      } else {
        await typewriterAddLine(
          `[ALERT] Unknown command: '${cmd}'. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
          "output",
          { error: true }
        );
        isProcessing.value = false;
        nextTick(() => inputRef.value?.focus());
      }
    }
  }
}

function autocomplete() {
  if (currentStep.value < steps.length) {
    currentInput.value = steps[currentStep.value].command;
  }
}

// ─── Skip / finish ────────────────────────────────────────────────────────────
function skipIntro() {
  skipped.value = true;
  localStorage.setItem("vraith-intro-completed", "true");
  finishUnlock();
}

function finishUnlock() {
  completed.value = true;
  showMatrix.value = false;
  localStorage.setItem("vraith-intro-completed", "true");
  emit("complete");
}

// ─── Keyboard handler (ESC only — Ctrl+K/J handled by parent) ────────────────
function handleKeydown(e) {
  if (e.key === "Escape" && !completed.value) {
    skipIntro();
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  if (localStorage.getItem("vraith-intro-completed")) {
    emit("complete");
    return;
  }

  // Boot → game transition
  setTimeout(() => {
    phase.value = "game";
    addLine('System locked. Type "help" to proceed.', "output");
    addLine("", "prompt");
    nextTick(() => inputRef.value?.focus());
  }, bootMessages.value.length * 300 + 500);

  window.addEventListener("keydown", handleKeydown);

  // Banner glitch — random interval 4–8s
  const scheduleGlitch = () => {
    glitchInterval = setTimeout(() => {
      if (phase.value === "game") glitchBanner();
      scheduleGlitch();
    }, 4000 + Math.random() * 4000);
  };
  scheduleGlitch();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  clearTimeout(glitchInterval);
  clearInterval(lockoutInterval);
});
</script>

<style scoped>
/* Terminal alert flash — red glow on wrong command */
.terminal-alerted {
  animation: alertFlash 0.7s ease-out;
}

@keyframes alertFlash {
  0%, 100% { box-shadow: none; }
  20%, 55%  { box-shadow: 0 0 0 2px rgb(239 68 68), 0 0 28px rgba(239, 68, 68, 0.3); }
}

/* Banner glitch — chromatic aberration on corrupted frame */
.banner-glitch {
  text-shadow: 2px 0 rgb(var(--accent)), -2px 0 rgba(239, 68, 68, 0.7);
  filter: brightness(1.3);
}

/* Skip intro button — fade in after 1.5s, then pulse glow twice */
.skip-btn {
  opacity: 0;
  animation: skipBtnReveal 3.5s ease-out forwards;
}

@keyframes skipBtnReveal {
  0%, 43%  { opacity: 0; box-shadow: none; }
  57%      { opacity: 1; box-shadow: none; }
  71%      { opacity: 1; box-shadow: 0 0 14px 2px rgba(var(--accent), 0.65); }
  85%      { opacity: 1; box-shadow: none; }
  92%      { opacity: 1; box-shadow: 0 0 10px 1px rgba(var(--accent), 0.35); }
  100%     { opacity: 1; box-shadow: none; }
}

/* Boot animation */
.boot-line {
  opacity: 0;
  animation: fadeInLine 0.3s ease-out forwards;
}

@keyframes fadeInLine {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Terminal line fade in */
.terminal-line {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Processing indicator — animated trailing dots */
.processing-dots::after {
  content: '';
  animation: processingDots 1.2s steps(4, end) infinite;
}

@keyframes processingDots {
  0%   { content: ''; }
  25%  { content: ' .'; }
  50%  { content: ' ..'; }
  75%  { content: ' ...'; }
  100% { content: ''; }
}

.glow-text {
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
}

input::placeholder {
  opacity: 0.4;
  font-style: italic;
}

/* Scrollbar */
::-webkit-scrollbar       { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(var(--border), 0.5); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(var(--accent), 0.5); }
</style>
