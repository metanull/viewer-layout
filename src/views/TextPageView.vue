<script setup>
import { computed } from 'vue'
import { md, useDataPackage, useI18n, useLocale, I18nText } from '@metanull/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// A simple page with optional heading and body text (rendered as Markdown entry
// or plain text from a function), used by ten essay pages (About, Credits,
// SearchHowTo) on various sites. The body is rendered inside .mwnf-prose for
// readable styling.
const props = defineProps({
  spec: { type: Object, required: true },
})

const { t } = useI18n()
const pkg = useDataPackage()
const language = useLocale()

const heading = computed(() => (props.spec.heading ? t(props.spec.heading) : ''))

// Body: either an entry name (resolved through I18nText) or a function of a
// real context — `{ t, tr, language }`, the same shape `EssayView`'s spec
// functions read, so a page can render a per-record text (a website's own
// entity, looked up through `tr`) rather than only a static catalogue entry.
const bodyIsEntry = computed(() => typeof props.spec.body === 'string')
const bodyEntryName = computed(() => bodyIsEntry.value ? props.spec.body : null)
const bodyCtx = computed(() => ({
  t,
  tr: (name, recId) => pkg.tr(name, recId, language.value, 'en'),
  language: language.value,
}))
const bodyMarkdown = computed(() => {
  if (bodyIsEntry.value) return null
  if (typeof props.spec.body === 'function') {
    return md(props.spec.body(bodyCtx.value))
  }
  return null
})

const backLabel = computed(() => {
  if (props.spec.back === false) return null
  if (props.spec.back === true) {
    return t('core.action.back')
  }
  if (props.spec.back?.label) {
    return t(props.spec.back.label)
  }
  return null
})
</script>

<template>
  <div class="mwnf-text-page">
    <!-- Back link -->
    <div v-if="backLabel && (props.spec.back === true || props.spec.back?.to || props.spec.back?.href)" class="mwnf-text-page__back">
      <SmartLink :to="(props.spec.back === true ? {} : props.spec.back?.to)" :href="(props.spec.back === true ? '#' : props.spec.back?.href)">
        ← {{ backLabel }}
      </SmartLink>
    </div>

    <!-- Heading, if provided -->
    <h1 v-if="heading" class="mwnf-text-page__heading">{{ heading }}</h1>

    <!-- Body: render entry name through I18nText or markdown through md() -->
    <div class="mwnf-prose">
      <!-- I18nText's prop is keypath, the same as at every call site -->
      <I18nText v-if="bodyIsEntry" :keypath="bodyEntryName" />
      <div v-else-if="bodyMarkdown" v-html="bodyMarkdown" />
    </div>
  </div>
</template>
