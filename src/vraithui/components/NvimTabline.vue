<template>
  <div
    class="h-8 flex items-center gap-1 px-2 border-b"
    style="border-color: var(--border)"
  >
    <button
      v-for="t in tabs"
      :key="t.id"
      class="tab-button px-3 h-7 rounded text-xs border transition-all duration-200 relative"
      :class="
        t.id === active
          ? 'tab-active border-[rgb(var(--accent))]'
          : 'border-transparent'
      "
      @click="$emit('select', t.id)"
    >
      {{ t.label }}
      <span
        class="ml-2 opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
        @click.stop="$emit('close', t.id)"
        >×</span
      >

      <!-- Indicateur visuel en bas pour l'onglet actif -->
      <span
        v-if="t.id === active"
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(var(--accent))]"
        style="border-radius: 2px 2px 0 0"
      ></span>
    </button>
  </div>
</template>

<script setup>
defineProps({ tabs: Array, active: String });
defineEmits(["select", "close"]);
</script>

<style scoped>
/* Onglet actif - Style marqué */
.tab-active {
  background: rgba(var(--accent), 0.15);
  color: rgb(var(--accent));
  font-weight: 600;
  box-shadow: 0 0 12px rgba(var(--accent), 0.3),
    inset 0 0 20px rgba(var(--accent), 0.05);
}

/* Effet de hover pour les onglets non-actifs (comme les boutons Contact) */
.tab-button:not(.tab-active):hover {
  border-color: rgb(var(--accent));
  background: rgba(var(--accent), 0.05);
  box-shadow: 0 0 12px rgba(var(--accent), 0.2);
}

/* Animation smooth sur tous les états */
.tab-button {
  position: relative;
}
</style>
