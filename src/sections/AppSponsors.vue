<script setup>
import { computed, useSlots } from 'vue'
import { useI18n } from '@metanull/viewer-core/i18n'

const props = defineProps({
  title: { type: String, default: '' },
  // { name, href?, logo? }
  sponsors: { type: Array, default: () => [] },
})

const slots = useSlots()
const { t } = useI18n()
const visible = computed(() => Boolean(slots.default || props.sponsors.length))
</script>

<template>
  <section v-if="visible" class="mwnf-sponsors" :aria-label="title || t('layout.sponsors.label')">
    <p v-if="title" class="mwnf-sponsors__title">{{ title }}</p>
    <slot>
      <ul class="mwnf-sponsors__list">
        <li v-for="sponsor in sponsors" :key="sponsor.name">
          <component
            :is="sponsor.href ? 'a' : 'span'"
            class="mwnf-sponsors__item"
            :href="sponsor.href"
          >
            <img
              v-if="sponsor.logo"
              class="mwnf-sponsors__logo"
              :src="sponsor.logo"
              :alt="sponsor.name"
            />
            <template v-else>{{ sponsor.name }}</template>
          </component>
        </li>
      </ul>
    </slot>
  </section>
</template>
