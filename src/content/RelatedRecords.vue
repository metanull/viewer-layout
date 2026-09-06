<script setup>
import RecordGrid from './RecordGrid.vue'
import RecordList from './RecordList.vue'

// The records related to the one on the page, as rows or tiles — the same
// two presentations as a results page, so a website's related block looks
// like its list. A `justification` in a record's `meta` reads like any
// other line. References the package does not hold are the site's to render
// in the default slot: a reference is shown as what it is, never dropped.
defineProps({
  heading: { type: String, default: '' },
  /** The RecordList / RecordGrid contract. */
  records: { type: Array, default: () => [] },
  /** 'list' | 'grid' */
  variant: { type: String, default: 'list' },
  actionLabel: { type: String, default: '' },
})
</script>

<template>
  <section v-if="records.length || $slots.default" class="mwnf-related">
    <h2 v-if="heading" class="mwnf-related__heading">{{ heading }}</h2>
    <RecordGrid v-if="variant === 'grid'" :records="records" :action-label="actionLabel" />
    <RecordList v-else :records="records" />
    <slot />
  </section>
</template>
