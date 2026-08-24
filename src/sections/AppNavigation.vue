<script setup>
import { computed, useSlots } from 'vue'
import { useLayoutText } from '../i18n/useLayoutText.js'

const props = defineProps({
  // Plain links: { label, href, active? }. No router coupling — websites pass
  // hrefs produced by their own router (hash URLs work as plain hrefs).
  links: { type: Array, default: () => [] },
  // Languages: 'en' or { code, label }.
  languages: { type: Array, default: () => [] },
  language: { type: String, default: '' },
})

const emit = defineEmits(['update:language'])

const slots = useSlots()
const lt = useLayoutText()

const normalizedLanguages = computed(() =>
  props.languages.map((l) => (typeof l === 'string' ? { code: l, label: l } : l)),
)

const visible = computed(() =>
  Boolean(slots.default || props.links.length || normalizedLanguages.value.length > 1),
)
</script>

<template>
  <nav v-if="visible" class="mwnf-nav" :aria-label="lt('layout.navigationLabel')">
    <slot>
      <ul v-if="links.length" class="mwnf-nav__links">
        <li v-for="link in links" :key="link.href ?? link.label">
          <a
            class="mwnf-nav__link"
            :class="{ 'mwnf-nav__link--active': link.active }"
            :href="link.href"
            :aria-current="link.active ? 'page' : undefined"
          >{{ link.label }}</a>
        </li>
      </ul>
    </slot>
    <label v-if="normalizedLanguages.length > 1" class="mwnf-nav__language">
      <span class="mwnf-nav__language-label">{{ lt('layout.languageLabel') }}</span>
      <select
        class="mwnf-nav__language-select"
        :value="language"
        @change="emit('update:language', $event.target.value)"
      >
        <option v-for="l in normalizedLanguages" :key="l.code" :value="l.code">{{ l.label }}</option>
      </select>
    </label>
  </nav>
</template>
