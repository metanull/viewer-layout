<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  image: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  text: { type: String, default: '' },
})

const slots = useSlots()
const visible = computed(() => Boolean(slots.default || props.image || props.text))
</script>

<template>
  <section v-if="visible" class="mwnf-banner">
    <slot>
      <img v-if="image" class="mwnf-banner__image" :src="image" :alt="imageAlt" />
      <p v-if="text" class="mwnf-banner__text">{{ text }}</p>
    </slot>
  </section>
</template>
