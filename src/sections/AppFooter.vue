<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
})

const slots = useSlots()
const visible = computed(() => Boolean(slots.default || props.text))
</script>

<template>
  <footer v-if="visible" class="mwnf-footer">
    <slot>
      <p v-if="text" class="mwnf-footer__text">{{ text }}</p>
    </slot>
  </footer>
</template>
