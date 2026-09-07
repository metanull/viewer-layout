<script setup>
import DynastyPopout from './DynastyPopout.vue'

// The dynasties of one record, each its own popout — RelatedRecords' shape:
// a heading the caller already resolved (`sheet.field.dynasties` /
// `record.dynasty.list`, both "Dynasties", read at the call site) and a list
// built from records the caller passed rather than a lookup this package
// would have to own.
defineProps({
  heading: { type: String, default: '' },
  /** [{ id, from_ah, to_ah, from_ad, to_ad, ... }] */
  dynasties: { type: Array, default: () => [] },
  /** (dynasty) => the translation DynastyPopout's `text` prop wants; omit to pass the dynasty itself (already merged). */
  tr: { type: Function, default: null },
  dir: { type: String, default: '' },
})
</script>

<template>
  <section v-if="dynasties.length" class="mwnf-dynasty-list" :dir="dir || undefined">
    <h2 v-if="heading" class="mwnf-dynasty-list__heading">{{ heading }}</h2>
    <DynastyPopout
      v-for="dynasty in dynasties"
      :key="dynasty.id"
      :dynasty="dynasty"
      :text="tr ? tr(dynasty) : dynasty"
      :dir="dir"
    />
  </section>
</template>
