<template>
  <div class="p-2 text-sm text-[rgb(var(--fg))]">
    <div class="opacity-70 text-xs mb-2">EXPLORER</div>
    <ul class="space-y-1">
      <li v-for="f in files" :key="f.id">
        <button
          @click="$emit('open', f)"
          class="w-full text-left px-2 py-1 rounded hover:bg-[rgb(var(--panel-2))] transition-colors"
        >
          {{ f.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
<script setup>
defineProps({ files: Array });
defineEmits(["open"]);
</script>
