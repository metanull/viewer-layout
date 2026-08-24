<script setup>
import { computed, useSlots } from 'vue'
import { useLayoutText } from '../i18n/useLayoutText.js'

const props = defineProps({
  title: { type: String, default: '' },
  // { label, href }
  links: { type: Array, default: () => [] },
})

const slots = useSlots()
const lt = useLayoutText()
const visible = computed(() => Boolean(slots.default || props.links.length))
</script>

<template>
  <section v-if="visible" class="mwnf-hyperlinks" :aria-label="title || lt('layout.hyperlinksLabel')">
    <p v-if="title" class="mwnf-hyperlinks__title">{{ title }}</p>
    <slot>
      <ul class="mwnf-hyperlinks__list">
        <li v-for="link in links" :key="link.href ?? link.label">
          <a class="mwnf-hyperlinks__link" :href="link.href">{{ link.label }}</a>
        </li>
      </ul>
    </slot>
  </section>
</template>
