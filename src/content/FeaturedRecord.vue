<script setup>
import { computed, useSlots } from 'vue'
import SmartLink from './SmartLink.vue'

// The "item on display" of a landing page: one record, its image, a few
// lines about it, and the way to its page. `name` is inline HTML from
// viewer-core's pipeline (a record's name is Markdown); every other text is
// plain.
const props = defineProps({
  image: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  name: { type: String, default: '' },
  meta: { type: Array, default: () => [] },
  action: { type: String, default: '' },
  to: { type: [String, Object], default: null },
  href: { type: String, default: '' },
  heading: { type: String, default: '' },
})

const slots = useSlots()
const visible = computed(() => Boolean(props.name || props.image || slots.default))
</script>

<template>
  <section v-if="visible" class="mwnf-featured">
    <h2 v-if="heading" class="mwnf-featured__heading">{{ heading }}</h2>
    <slot>
      <SmartLink class="mwnf-featured__link" :to="to" :href="href">
        <span v-if="image" class="mwnf-featured__media">
          <img class="mwnf-featured__image" :src="image" :alt="imageAlt" loading="eager" />
        </span>
        <span class="mwnf-featured__body">
          <span v-if="eyebrow" class="mwnf-featured__eyebrow">{{ eyebrow }}</span>
          <span class="mwnf-featured__name" v-html="name"></span>
          <span v-for="(line, index) in meta" :key="index" class="mwnf-featured__meta">{{ line }}</span>
          <span v-if="action" class="mwnf-featured__action">{{ action }} →</span>
        </span>
      </SmartLink>
    </slot>
  </section>
</template>
