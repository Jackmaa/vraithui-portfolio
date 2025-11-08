<template>
  <div
    class="home-container fixed inset-0 z-[60] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] font-mono overflow-hidden"
  >
    <!-- Skip button -->
    <button
      v-if="!completed && !skipped"
      @click="skipIntro"
      class="absolute top-4 right-4 z-[70] px-3 py-1.5 text-xs border border-[rgb(var(--border))] rounded hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] transition-all"
    >
      Skip intro [ESC]
    </button>

    <!-- Matrix Rain (finale) -->
    <MatrixRain v-if="showMatrix" @complete="finishUnlock" />

    <!-- Main content -->
    <div
      v-if="!showMatrix"
      class="h-full flex flex-col items-center justify-center p-8"
    >
      <!-- Boot sequence -->
      <div v-if="phase === 'boot'" class="w-full max-w-2xl space-y-2 text-sm">
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

      <!-- Terminal game -->
      <div v-else-if="phase === 'game'" class="w-full max-w-2xl">
        <!-- ASCII Banner -->
        <pre
          class="text-[rgb(var(--accent))] text-center mb-6 text-xs glow-text"
        >
╔═══════════════════════════════════════════╗
║  RESTRICTED ACCESS - AUTHENTICATION REQ.  ║
╚═══════════════════════════════════════════╝</pre
        >

        <!-- Terminal output -->
        <div class="space-y-2 text-sm mb-4 max-h-64 overflow-auto">
          <div
            v-for="(line, i) in terminalLines"
            :key="i"
            class="terminal-line"
          >
            <span
              v-if="line.type === 'prompt'"
              class="text-[rgb(var(--accent))]"
              >vraith@portfolio:~$</span
            >
            <span v-if="line.type === 'input'" class="ml-2">{{
              line.text
            }}</span>
            <span
              v-if="line.type === 'output'"
              :class="
                line.error
                  ? 'text-red-400'
                  : line.success
                  ? 'text-green-400'
                  : 'opacity-80'
              "
            >
              {{ line.text }}
            </span>
          </div>
        </div>

        <!-- Progress indicator -->
        <div v-if="currentStep < steps.length" class="mb-4 text-xs opacity-60">
          Progress: {{ currentStep }}/{{ steps.length }}
        </div>

        <!-- Input -->
        <div class="flex items-center gap-2">
          <span class="text-[rgb(var(--accent))]">vraith@portfolio:~$</span>
          <input
            ref="inputRef"
            v-model="currentInput"
            @keydown.enter="executeCommand"
            @keydown.tab.prevent="autocomplete"
            class="flex-1 bg-transparent outline-none border-b border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] transition-colors px-2 py-1"
            :placeholder="currentHint"
          />
        </div>

        <!-- Hint -->
        <div v-if="showHint" class="mt-2 text-xs opacity-60">
          💡 Hint: {{ currentHint }}
        </div>
      </div>

      <!-- Welcome message (after completion) -->
      <div v-else-if="phase === 'welcome'" class="text-center space-y-4">
        <pre class="text-[rgb(var(--accent))] text-sm glow-text leading-tight">
 __     __        _ _   _     
 \ \   / / _ __ _(_) |_| |__  
  \ \ / / '_/ _` | |  _| '_ \ 
   \ V /| | | (_| | | |_| | | |
    \_/ |_|  \__,_|_|\__|_| |_|</pre
        >

        <div class="text-lg text-[rgb(var(--accent))]">Access Granted</div>
        <div class="text-sm opacity-70">Initializing portfolio...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import MatrixRain from "../components/Matrix.vue";

const phase = ref("boot"); // boot | game | welcome
const bootMessages = ref([
  { type: "init", text: "Connecting to vraith.dev..." },
  { type: "warn", text: "Unauthorized access detected" },
  { type: "scan", text: "Analyzing visitor credentials..." },
  { type: "error", text: "Access denied. Authorization required." },
]);

const terminalLines = ref([]);
const currentInput = ref("");
const currentStep = ref(0);
const inputRef = ref(null);
const completed = ref(false);
const skipped = ref(false);
const showMatrix = ref(false);
const showHint = ref(true);

// Game steps
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
      "████████████████████████████ 100%",
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

function addLine(text, type = "output", options = {}) {
  terminalLines.value.push({ text, type, ...options });
}

function executeCommand() {
  const cmd = currentInput.value.trim().toLowerCase();

  if (!cmd) return;

  // Add input to terminal
  addLine(cmd, "input");
  addLine("", "prompt");

  // Check command
  if (currentStep.value < steps.length) {
    const step = steps[currentStep.value];

    if (cmd === step.command) {
      // Correct command
      step.responses.forEach((response) => {
        addLine(response, "output", { success: true });
      });
      currentStep.value++;

      // Check if game complete
      if (currentStep.value >= steps.length) {
        setTimeout(() => {
          phase.value = "welcome";
          setTimeout(() => {
            showMatrix.value = true;
          }, 1500);
        }, 1000);
      }
    } else if (cmd === "help") {
      addLine("Available commands:", "output");
      addLine(`  ${step.command.padEnd(15)} - ${step.hint}`, "output");
    } else {
      addLine(`Command not recognized: ${cmd}`, "output", { error: true });
      addLine(`Type 'help' for available commands`, "output");
    }
  }

  currentInput.value = "";

  nextTick(() => {
    inputRef.value?.focus();
  });
}

function autocomplete() {
  if (currentStep.value < steps.length) {
    const step = steps[currentStep.value];
    currentInput.value = step.command;
  }
}

function skipIntro() {
  skipped.value = true;
  localStorage.setItem("vraith-intro-completed", "true");
  finishUnlock();
}

function finishUnlock() {
  completed.value = true;
  localStorage.setItem("vraith-intro-completed", "true");
  // Emit event pour que EditorShell ouvre la page about ou projects
  window.dispatchEvent(new CustomEvent("intro-complete"));
}

onMounted(() => {
  // Check if already completed
  const hasCompleted = localStorage.getItem("vraith-intro-completed");

  if (hasCompleted) {
    skipIntro();
    return;
  }

  // Boot sequence
  setTimeout(() => {
    phase.value = "game";
    addLine('System locked. Type "help" to proceed.', "output");
    addLine("", "prompt");

    nextTick(() => {
      inputRef.value?.focus();
    });
  }, bootMessages.value.length * 300 + 500);

  // ESC to skip
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !completed.value) {
      skipIntro();
    }
  });
});
</script>

<style scoped>
.boot-line {
  opacity: 0;
  animation: fadeInLine 0.3s ease-out forwards;
}

@keyframes fadeInLine {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.terminal-line {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.glow-text {
  text-shadow: 0 0 10px rgb(var(--accent) / 0.5);
}

input::placeholder {
  opacity: 0.4;
  font-style: italic;
}
</style>
