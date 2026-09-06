<script setup>
import { useSlots } from 'vue'

// The line over a results list: what was searched for, and how many were
// found. Each count is rendered beside its label, never inside a text — a
// text carries no placeholder, and no plural form is chosen for the
// translator. `parts` is [{ label, count?, value? }]: "Objects found: 12",
// "out of 340 objects", "Search: pottery".
defineProps({
  parts: { type: Array, default: () => [] },
})
const slots = useSlots()
const hasActions = Boolean(slots.actions)
</script>

<template>
  <div v-if="parts.length || $slots.default || hasActions" class="mwnf-summary">
    <p v-if="parts.length" class="mwnf-summary__parts">
      <!-- The spaces between the spans are content, not layout: a reader
           that ignores the styling still hears "Objects found 12". -->
      <span v-for="(part, index) in parts" :key="index" class="mwnf-summary__part">
        <span v-if="part.label" class="mwnf-summary__label">{{ part.label }}</span>{{ ' ' }}<span v-if="part.count != null" class="mwnf-summary__count">{{ part.count }}</span>{{ ' ' }}<span v-if="part.value" class="mwnf-summary__value">{{ part.value }}</span>
      </span>
    </p>
    <slot />
    <div v-if="hasActions" class="mwnf-summary__actions"><slot name="actions" /></div>
  </div>
</template>
