<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})

const slots = useSlots()
const visible = computed(() => Boolean(slots.default || props.title || props.subtitle))
</script>

<template>
  <header v-if="visible" class="mwnf-header">
    <slot>
      <p v-if="title" class="mwnf-header__title">{{ title }}</p>
      <p v-if="subtitle" class="mwnf-header__subtitle">{{ subtitle }}</p>
    </slot>
  </header>
</template>
