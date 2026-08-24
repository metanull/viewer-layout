<script setup>
import { computed, useSlots } from 'vue'

const slots = useSlots()
const visible = computed(() => Boolean(slots.default))
</script>

<template>
  <main v-if="visible" id="mwnf-content" class="mwnf-content">
    <slot />
  </main>
</template>
