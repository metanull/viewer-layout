<script setup>
import { computed, ref } from 'vue'
import { md, searchGlossary } from '@metanull/viewer-core'
import { useI18n } from '@metanull/viewer-core/i18n'

// The glossary search box four item sheets and a theme page each wrote for
// themselves: an input, the hits viewer-core's searchGlossary finds as the
// visitor types, and the chosen definition rendered as Markdown (carpets and
// amulets ItemSheet.vue, water-in-islam Theme.vue). A native <details> gives
// the open/closed toggle for free, keyboard included, the way SectionCards'
// accordion variant already does.
const props = defineProps({
  language: { type: String, default: '' },
  entity: { type: String, default: 'glossary' },
  /**
   * Entry-name overrides. `tool`/`heading`/`instructions`/`definition`/
   * `close` all ship with viewer-i18n's `record` namespace; a site adding a
   * text this package cannot guarantee — an empty-result line, say — names
   * its own entry here instead of this component inventing a literal for it.
   */
  labels: { type: Object, default: () => ({}) },
  dir: { type: String, default: '' },
})

const texts = {
  tool: 'record.glossary.tool',
  heading: 'record.glossary.heading',
  instructions: 'record.glossary.instructions',
  definition: 'record.glossary.definition',
  close: 'record.glossary.close',
  ...props.labels,
}

const { t } = useI18n()

const input = ref('')
const selected = ref(null)
const activeIndex = ref(-1)

const hits = computed(() => (input.value.trim() ? searchGlossary(input.value, props.language, { entity: props.entity }) : []))
const showHits = computed(() => hits.value.length > 0 && !selected.value)
const definitionHtml = computed(() => (selected.value ? md(selected.value.definition) : ''))
const noResultsLabel = computed(() => (texts.noResults ? t(texts.noResults) : ''))
const showNoResults = computed(() => Boolean(noResultsLabel.value) && input.value.trim() && !selected.value && hits.value.length === 0)

function onInput() {
  selected.value = null
  activeIndex.value = -1
}
function choose(hit) {
  selected.value = hit
  input.value = hit.spelling
  activeIndex.value = -1
}
function onKeydown(event) {
  if (!showHits.value) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % hits.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + hits.value.length) % hits.value.length
  } else if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()
    choose(hits.value[activeIndex.value])
  } else if (event.key === 'Escape') {
    activeIndex.value = -1
  }
}
</script>

<template>
  <details class="mwnf-glossary-tool" :dir="dir || undefined">
    <summary class="mwnf-glossary-tool__toggle">{{ t(texts.tool) }}</summary>
    <div class="mwnf-glossary-tool__panel">
      <p class="mwnf-glossary-tool__heading">{{ t(texts.heading) }}</p>
      <p class="mwnf-glossary-tool__instructions">{{ t(texts.instructions) }}</p>
      <input
        v-model="input"
        type="text"
        class="mwnf-glossary-tool__input"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="showHits"
        :aria-label="t(texts.heading)"
        @input="onInput"
        @keydown="onKeydown"
      />
      <ul v-if="showHits" class="mwnf-glossary-tool__hits" role="listbox">
        <li
          v-for="(hit, index) in hits"
          :key="hit.id"
          role="option"
          :aria-selected="index === activeIndex"
          tabindex="0"
          :class="['mwnf-glossary-tool__hit', { 'mwnf-glossary-tool__hit--active': index === activeIndex }]"
          @click="choose(hit)"
          @keydown.enter="choose(hit)"
        >{{ hit.spelling }}</li>
      </ul>
      <p v-else-if="showNoResults" class="mwnf-glossary-tool__no-results">{{ noResultsLabel }}</p>
      <div v-if="selected" class="mwnf-glossary-tool__definition">
        <p class="mwnf-glossary-tool__definition-label">{{ t(texts.definition) }}</p>
        <div class="mwnf-sheet__block" v-html="definitionHtml"></div>
      </div>
    </div>
  </details>
</template>
