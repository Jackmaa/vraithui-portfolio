<template>
  <picture>
    <!-- WebP format (modern browsers) -->
    <source
      v-if="webpSrc"
      :srcset="getSrcSet(webpSrc)"
      :sizes="sizes"
      type="image/webp"
    />

    <!-- Fallback to original format -->
    <img
      :src="src"
      :srcset="srcset || getSrcSet(src)"
      :sizes="sizes"
      :alt="alt"
      :loading="loading"
      :decoding="decoding"
      :class="imgClass"
      @error="handleError"
    />
  </picture>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  webpSrc: {
    type: String,
    default: null
  },
  alt: {
    type: String,
    default: ''
  },
  loading: {
    type: String,
    default: 'lazy', // 'lazy' | 'eager'
    validator: (value) => ['lazy', 'eager'].includes(value)
  },
  decoding: {
    type: String,
    default: 'async' // 'async' | 'sync' | 'auto'
  },
  sizes: {
    type: String,
    default: '100vw'
  },
  srcset: {
    type: String,
    default: null
  },
  imgClass: {
    type: String,
    default: ''
  },
  // Auto-generate responsive srcset
  responsive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['error']);

// Generate responsive srcset if enabled
const getSrcSet = (baseSrc) => {
  if (!props.responsive || props.srcset) {
    return props.srcset || '';
  }

  // Auto-generate srcset for common viewport widths
  // This assumes you have multiple versions of the image
  // For now, we'll just return the original
  return '';
};

const handleError = (event) => {
  emit('error', event);
};
</script>

<style scoped>
img {
  max-width: 100%;
  height: auto;
}
</style>
