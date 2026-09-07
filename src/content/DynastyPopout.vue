<script setup>
import { computed } from 'vue'
import { md, mdInline } from '@metanull/viewer-core'
import { useI18n } from '@metanull/viewer-core/i18n'

// One dynasty popout — the fifty lines the item sheets repeat per dynasty
// (carpets/amulets ItemSheet.vue), islamicart's dynasty cards and its full
// DynastyDetail sheet folded into the same shape (decision D5): name, also
// known as, area, AH/AD dates, history as Markdown. A native <details> gives
// the collapsed/open toggle, keyboard included, as SectionCards' accordion
// variant already does.
const props = defineProps({
  /** The dynasty record: its id and the from_ah/to_ah/from_ad/to_ad numbers — not translated. */
  dynasty: { type: Object, required: true },
  /** Its translation in the record's language: name, also_known_as, area, history. */
  text: { type: Object, default: () => ({}) },
  dir: { type: String, default: '' },
})
const { t } = useI18n()

// AH/AD are calendar-era abbreviations, not prose — every reference item
// sheet prints them the same two letters regardless of language, the way
// "AD"/"BC" have their own catalogue entries but "AH" has never needed one.
const dates = computed(() => {
  const { from_ad: fromAd, to_ad: toAd, from_ah: fromAh, to_ah: toAh } = props.dynasty ?? {}
  if (fromAd == null && toAd == null) return ''
  const ah = fromAh != null || toAh != null ? `AH ${fromAh ?? '?'}–${toAh ?? '?'} / ` : ''
  return `${ah}AD ${fromAd ?? '?'}–${toAd ?? '?'}`
})
</script>

<template>
  <details class="mwnf-dynasty" :dir="dir || undefined">
    <summary class="mwnf-dynasty__summary" v-html="mdInline(text.name || dynasty.id)"></summary>
    <div class="mwnf-dynasty__body">
      <p class="mwnf-dynasty__eyebrow">{{ t('record.dynasty.heading') }}</p>
      <p v-if="text.also_known_as" class="mwnf-dynasty__field">
        <span class="mwnf-dynasty__label">{{ t('sheet.field.alsoKnownAs') }}:</span> {{ text.also_known_as }}
      </p>
      <p v-if="text.area" class="mwnf-dynasty__field">
        <span class="mwnf-dynasty__label">{{ t('sheet.field.area') }}:</span> {{ text.area }}
      </p>
      <p v-if="dates" class="mwnf-dynasty__dates">{{ dates }}</p>
      <div v-if="text.history" class="mwnf-dynasty__history">
        <p class="mwnf-dynasty__label">{{ t('sheet.field.history') }}</p>
        <div class="mwnf-sheet__block" v-html="md(text.history)"></div>
      </div>
    </div>
  </details>
</template>
