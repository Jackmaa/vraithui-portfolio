<!-- src/vraithui/components/VraithConsole.vue -->
<template>
  <div
    class="bg-black/75 backdrop-blur border-t border-white/10 text-[rgb(var(--fg))]"
  >
    <div class="p-2 font-mono text-xs opacity-70">
      Vraith Console — type <help></help> for commands
    </div>
    <div
      class="h-40 overflow-auto px-3 py-2 font-mono text-sm scroll-theme"
      ref="logEl"
    >
      <div v-for="(l, i) in logs" :key="i">{{ l }}</div>
    </div>
    <div class="px-3 py-2 border-t border-white/10 flex items-center gap-2">
      <span class="opacity-60">❯</span>
      <input
        v-model="line"
        @keydown.enter="run"
        class="bg-transparent outline-none w-full"
        aria-label="console input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";

const props = defineProps({ commands: { type: Array, default: () => [] } });
const emit = defineEmits(["close"]);

const logs = ref([]);
const line = ref("");
const logEl = ref(null);

onMounted(() => {
  window.addEventListener("vraith-console-print", (e) => {
    if (e?.detail) println(String(e.detail));
  });
});

function println(s) {
  logs.value.push(s);
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTo(0, logEl.value.scrollHeight);
  });
}

const help = () => {
  println("Commands:");
  props.commands.forEach((c) =>
    println(`  - ${c.name || c.key} : ${c.desc || c.label || ""}`)
  );
};

function run() {
  const cmd = (line.value || "").trim();
  println(`$ ${cmd}`);
  if (!cmd) {
    line.value = "";
    return;
  }

  if (cmd === "help") {
    help();
  } else if (/^theme\s+list$/i.test(cmd)) {
    println("Themes available:");
    println((document?.documentElement ? "" : "") + "");
    // On ne connaît pas la liste ici → on écoute un event du shell
    window.dispatchEvent(new CustomEvent("theme-list-request"));
  }
  // theme set <name>
  else if (/^theme\s+set\s+([a-z0-9\-]+)$/i.test(cmd)) {
    const theme = cmd.split(/\s+/).pop();
    document.documentElement.setAttribute("data-theme", theme);
    println(`Theme switched to ${theme}`);
  } else if (/^open (home|about|projects|github)$/i.test(cmd)) {
    println("Opening section…");
    window.dispatchEvent(
      new CustomEvent("open-file", { detail: { id: cmd.split(" ").pop() } })
    );
  } else if (cmd === "ascii vraith") {
    println(`  __     __        _ _   _   _
  \\ \\   / /__ _ __(_) |_| |_(_)
   \\ \\ / / _ \\ '__| | __| __| |
    \\ V /  __/ |  | | |_| |_| |
     \\_/ \\___|_|  |_|\\__|\\__|_|`);
  } else if (cmd === "matrix") {
    println("Launching matrix rain… (press ESC to stop)");
  } else if (cmd === "roll") {
    const n = Math.floor(Math.random() * 20) + 1;
    println(`You rolled: d20 = ${n}`);
  } else if (cmd === "exit") {
    emit("close");
  } else {
    println('Unknown command. Type "help".');
  }

  line.value = "";
}
</script>
