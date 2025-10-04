<template>
  <div
    class="h-8 flex items-center gap-1 px-2 border-b"
    style="border-color: var(--border)"
  >
    <button
      v-for="t in tabs"
      :key="t.id"
      class="px-3 h-7 rounded text-xs border"
      :class="
        t.id === active
          ? 'bg-white/10 border-white/20'
          : 'border-transparent hover:bg-white/5'
      "
      @click="$emit('select', t.id)"
    >
      {{ t.label }}
      <span
        class="ml-2 opacity-60 cursor-pointer"
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
