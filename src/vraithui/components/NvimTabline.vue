<template>
  <div
    class="h-8 flex items-center gap-1 px-2 border-b bg-[rgb(var(--panel))]"
    :style="`border-color: rgb(var(--border))`"
  >
    <button
      v-for="t in tabs"
      :key="t.id"
      class="px-3 h-7 rounded text-xs border transition-colors"
      :style="
        t.id === active
          ? `background: rgb(var(--panel-2)); border-color: rgb(var(--border))`
          : `border-color: transparent`
      "
      :class="t.id !== active && 'hover:bg-[rgb(var(--panel-2))]'"
      @click="$emit('select', t.id)"
    >
      {{ t.label }}
      <span
        class="ml-2 opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
        @click.stop="$emit('close', t.id)"
        >×</span
      >
    </button>
  </div>
</template>

<script setup>
defineProps({ tabs: Array, active: String });
defineEmits(["select", "close"]);
</script>
