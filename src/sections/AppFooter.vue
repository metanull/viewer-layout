<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  /** [{ label, href, external? }] rendered beside the text. */
  links: { type: Array, default: () => [] },
})

const slots = useSlots()
const visible = computed(() => Boolean(slots.default || props.text || props.links.length))
</script>

<template>
  <footer v-if="visible" class="mwnf-footer">
    <slot>
      <ul v-if="links.length" class="mwnf-footer__links">
        <li v-for="link in links" :key="link.href ?? link.label">
          <a
            class="mwnf-footer__link"
            :href="link.href"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener' : undefined"
          >{{ link.label }}</a>
        </li>
      </ul>
      <p v-if="text" class="mwnf-footer__text">{{ text }}</p>
    </slot>
  </footer>
</template>
