<script setup>
import { computed } from 'vue'
import { mdInline, useI18n } from '@metanull/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// A page of categorized links: groups of related links, each with a heading,
// used by DXA's RelatedContent and sharinghistory's ExhibitionFurtherReading
// and its chapter see-also block. The spec declares groups statically or
// computed dynamically, an optional back link, and a title. `label`/`note`
// are Markdown (a bibliography entry's italicised title, say), rendered
// inline through `mdInline` — the record convention, `''` for a missing
// text. Slots: `before` (above the groups), `group` given `{ group }` (the
// default renders the heading and its links; a citation list with no
// links/headings of the usual shape composes its own here), `after` (below).
const props = defineProps({
  spec: { type: Object, required: true },
})

const { t } = useI18n()

// Resolve groups: either an array or a function of the context.
const groups = computed(() => {
  const list = typeof props.spec.groups === 'function'
    ? props.spec.groups({})
    : (props.spec.groups ?? [])
  // Filter out groups with no links; render only those that have content.
  return (list ?? []).filter((group) => group.links?.length > 0)
})

const title = computed(() => (props.spec.title ? t(props.spec.title) : ''))
const backLabel = computed(() => (props.spec.back?.label ? t(props.spec.back.label) : ''))
// Default empty message if spec.empty is not provided; use a key that exists in viewer-i18n.
const emptyMessage = computed(() => t(props.spec.empty ?? 'catalogue.results.noResults'))
</script>

<template>
  <div class="mwnf-link-list">
    <!-- Back link, if provided -->
    <div v-if="props.spec.back && backLabel" class="mwnf-link-list__back">
      <SmartLink :to="props.spec.back.to" :href="props.spec.back.href">
        ← {{ backLabel }}
      </SmartLink>
    </div>

    <!-- Title, if provided -->
    <h1 v-if="title" class="mwnf-link-list__title">{{ title }}</h1>

    <slot name="before" />

    <!-- Groups of links -->
    <div v-if="groups.length" class="mwnf-link-list__groups">
      <section v-for="(group, index) in groups" :key="index" class="mwnf-link-list__group">
        <slot name="group" :group="group">
          <!-- Group heading -->
          <h2 v-if="group.heading" class="mwnf-link-list__heading">
            {{ t(group.heading) }}
          </h2>

          <!-- Links in the group -->
          <ul v-if="group.links?.length" class="mwnf-link-list__links">
            <li v-for="(link, linkIndex) in group.links" :key="linkIndex" class="mwnf-link-list__item">
              <SmartLink class="mwnf-link-list__link" :to="link.to" :href="link.href">
                <span v-html="mdInline(link.label)"></span>
              </SmartLink>
              <!-- Optional note under the link -->
              <div v-if="link.note" class="mwnf-link-list__note" v-html="mdInline(link.note)"></div>
            </li>
          </ul>
        </slot>
      </section>
    </div>

    <!-- Empty state, if no groups have links -->
    <div v-else class="mwnf-link-list__empty">
      {{ emptyMessage }}
    </div>

    <slot name="after" />
  </div>
</template>
