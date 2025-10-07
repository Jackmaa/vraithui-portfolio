<!-- components/CustomScrollbar.vue -->
<template>
  <div
    class="csb host"
    :style="{ height: heightStyle }"
    @wheel.passive="onWheel"
    ref="host"
  >
    <div class="csb viewport hide-native-scrollbar" ref="viewport">
      <slot />
    </div>

    <!-- track -->
    <div class="csb track" ref="track" @mousedown="onTrackDown">
      <!-- thumb -->
      <div
        class="csb thumb"
        :style="{
          height: thumbPx + 'px',
          transform: `translateY(${thumbTop}px)`,
        }"
        @mousedown.stop="onThumbDown"
        role="scrollbar"
        :aria-valuemin="0"
        :aria-valuemax="maxScroll"
        :aria-valuenow="scrollTop"
        tabindex="0"
        @keydown="onKey"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  height: { type: [Number, String], default: 300 }, // px or 'auto'
  thumbMinSize: { type: Number, default: 24 },
  modelValue: { type: Number, default: 0 }, // v-model: scrollTop
});
const emit = defineEmits(["update:modelValue", "scroll"]);

const host = ref(null);
const viewport = ref(null);
const track = ref(null);

const heightStyle = computed(() =>
  typeof props.height === "number" ? props.height + "px" : props.height
);
const state = ref({
  contentH: 0,
  viewportH: 0,
  trackH: 0,
  dragging: false,
  dragOffset: 0,
});
const scrollTop = ref(props.modelValue);

const maxScroll = computed(() =>
  Math.max(0, state.value.contentH - state.value.viewportH)
);
const thumbPx = computed(() => {
  if (!state.value.contentH) return props.thumbMinSize;
  const r = state.value.viewportH / state.value.contentH;
  return Math.max(props.thumbMinSize, Math.floor(r * state.value.trackH));
});
const thumbTop = computed(() => {
  const ratio = maxScroll.value ? scrollTop.value / maxScroll.value : 0;
  return Math.round((state.value.trackH - thumbPx.value) * ratio);
});

function syncSizes() {
  const vp = viewport.value;
  const tr = track.value;
  if (!vp || !tr) return;
  state.value.viewportH = vp.clientHeight;
  state.value.contentH = vp.scrollHeight;
  state.value.trackH = tr.clientHeight;
}

function setScroll(y) {
  const clamped = Math.max(0, Math.min(maxScroll.value, y));
  if (clamped === scrollTop.value) return;
  scrollTop.value = clamped;
  viewport.value.scrollTop = clamped;
  emit("update:modelValue", clamped);
  emit("scroll", clamped);
}

function onWheel(e) {
  setScroll(scrollTop.value + e.deltaY);
}

function onTrackDown(e) {
  const clickY = e.offsetY;
  const targetTop = clickY - thumbPx.value / 2;
  const ratio = targetTop / (state.value.trackH - thumbPx.value);
  setScroll(ratio * maxScroll.value);
}

let unlisten = () => {};
function onThumbDown(e) {
  state.value.dragging = true;
  const startY = e.clientY;
  const startTop = thumbTop.value;
  const move = (ev) => {
    const dy = ev.clientY - startY;
    const newTop = Math.max(
      0,
      Math.min(state.value.trackH - thumbPx.value, startTop + dy)
    );
    const ratio = newTop / (state.value.trackH - thumbPx.value);
    setScroll(ratio * maxScroll.value);
  };
  const up = () => {
    state.value.dragging = false;
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  window.addEventListener("mousemove", move, { passive: true });
  window.addEventListener("mouseup", up, { passive: true });
  unlisten = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
}

function onKey(e) {
  const step = 40;
  if (e.key === "ArrowDown") setScroll(scrollTop.value + step);
  else if (e.key === "ArrowUp") setScroll(scrollTop.value - step);
  else if (e.key === "PageDown")
    setScroll(scrollTop.value + state.value.viewportH - 10);
  else if (e.key === "PageUp")
    setScroll(scrollTop.value - (state.value.viewportH - 10));
  else if (e.key === "Home") setScroll(0);
  else if (e.key === "End") setScroll(maxScroll.value);
}

onMounted(() => {
  const ro = new ResizeObserver(() => syncSizes());
  ro.observe(viewport.value);
  ro.observe(track.value);
  syncSizes();

  viewport.value.addEventListener(
    "scroll",
    () => {
      if (!state.value.dragging) {
        const y = viewport.value.scrollTop;
        if (y !== scrollTop.value) {
          scrollTop.value = y;
          emit("update:modelValue", y);
          emit("scroll", y);
        }
      }
    },
    { passive: true }
  );

  setScroll(props.modelValue);

  onBeforeUnmount(() => {
    ro.disconnect();
    unlisten();
  });
});

watch(
  () => props.modelValue,
  (v) => {
    // Force sync des tailles avant de scroller (important si le contenu a changé)
    requestAnimationFrame(() => {
      syncSizes();
      setScroll(v);
    });
  }
);

// Expose syncSizes pour permettre un refresh manuel depuis le parent
defineExpose({
  syncSizes,
  setScroll,
});
</script>

<style scoped>
.csb.host {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 10px; /* contenu + track */
  background: rgb(var(--bg));
  color: rgb(var(--fg));
  border: 1px solid rgb(var(--border));
  border-radius: 10px;
  overflow: hidden; /* Important pour masquer tout débordement */
}

.csb.viewport {
  overflow-y: auto; /* auto au lieu de scroll pour éviter la scrollbar quand pas nécessaire */
  overflow-x: hidden;
  padding: 8px 12px;
  height: 100%; /* Important : forcer la hauteur */
  /* La classe .hide-native-scrollbar cachera visuellement la scrollbar */
}

.csb.track {
  position: relative;
  background: rgb(var(--panel));
  border-left: 1px solid rgb(var(--border));
  user-select: none;
}

.csb.thumb {
  position: absolute;
  left: 1px;
  right: 1px;
  background: rgb(var(--accent));
  border-radius: 8px;
  cursor: grab;
  outline: none;
  transition: background 0.15s ease;
}

.csb.thumb:hover {
  background: color-mix(in srgb, rgb(var(--accent)) 80%, white 20%);
}

.csb.thumb:active {
  cursor: grabbing;
  background: color-mix(in srgb, rgb(var(--accent)) 90%, white 10%);
}

.csb.thumb:focus-visible {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
}

/* Style global pour masquer scrollbar native */
.hide-native-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.hide-native-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}
</style>
