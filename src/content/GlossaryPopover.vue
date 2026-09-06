<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '@metanull/viewer-core/i18n'

// The definition of a glossary term the visitor clicked, as a popover fixed
// in a corner rather than a modal over the page (decision D4): the term is
// read beside the text it came from. `term` is what viewer-core's
// `useGlossaryPopup` answers — { word, spelling, definition } — and
// `definition` here is that text already rendered through the pipeline.
// Escape closes it, and focus goes back to where it was.
const props = defineProps({
  term: { type: Object, default: null },
  /** The rendered definition; `term.definition` as plain text when absent. */
  html: { type: String, default: '' },
  dir: { type: String, default: '' },
})
const emit = defineEmits(['close'])
const { t } = useI18n()

const closeButton = ref(null)
let opener = null

function close() {
  emit('close')
}
function onKey(event) {
  if (event.key === 'Escape') close()
}
watch(
  () => props.term,
  (term, previous) => {
    if (term && !previous) {
      opener = document.activeElement
      document.addEventListener('keydown', onKey)
      requestAnimationFrame(() => closeButton.value?.focus?.())
    } else if (!term && previous) {
      document.removeEventListener('keydown', onKey)
      opener?.focus?.()
      opener = null
    }
  },
  // A popover mounted with a term is open from the start, and listens from the start.
  { immediate: true },
)
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <aside v-if="term" class="mwnf-popover" role="dialog" :aria-label="t('record.glossary.heading')" :dir="dir || undefined">
    <div class="mwnf-popover__title">
      <span>{{ t('record.glossary.heading') }}</span>
      <button ref="closeButton" type="button" class="mwnf-popover__close" :aria-label="t('record.glossary.close')" @click="close">✕</button>
    </div>
    <div class="mwnf-popover__body">
      <p class="mwnf-popover__term">{{ term.spelling || term.word }}</p>
      <div v-if="html" class="mwnf-popover__definition mwnf-sheet__block" v-html="html"></div>
      <p v-else-if="term.definition" class="mwnf-popover__definition">{{ term.definition }}</p>
    </div>
  </aside>
</template>
