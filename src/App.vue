<template>
  <SpeedInsights />
  <Analytics />
  <EditorShell />
</template>

<script setup>
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import EditorShell from "./vraithui/layout/EditorShell.vue";
</script>
