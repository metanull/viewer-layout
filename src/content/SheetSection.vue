<script setup>
// A headed block under a sheet — a description, a history, the dynasty
// cards, a list of links. `html` is rendered output from viewer-core's
// pipeline; the default slot is for anything that is not one text.
defineProps({
  heading: { type: String, default: '' },
  html: { type: String, default: '' },
  dir: { type: String, default: '' },
})
</script>

<template>
  <section class="mwnf-sheet-section" :dir="dir || undefined">
    <h2 v-if="heading" class="mwnf-sheet-section__heading">{{ heading }}</h2>
    <div v-if="html" class="mwnf-sheet-section__body mwnf-sheet__block" v-html="html"></div>
    <slot />
  </section>
</template>
