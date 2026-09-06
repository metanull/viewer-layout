<script setup>
import { ref, useSlots } from 'vue'
import SmartLink from './SmartLink.vue'

// Records as tiles: a square image, and a card over it on hover with the
// name and the metadata — the DXA websites' ObjectGrid, which four sites
// carried. Below a narrow width the card is shown under the image instead,
// because there is no hover to reveal it, as legacy did at 974px.
//
// Same contract as RecordList: { id, image?, imageAlt?, name (inline HTML),
// meta: [string], badge?, to? | href? }. A `date` line longer than
// `dateCutoff` characters is cut, as legacy's `cutOff` did at 80.
const props = defineProps({
  records: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  dateCutoff: { type: Number, default: 80 },
})

const slots = useSlots()
const hasEmptySlot = Boolean(slots.empty)
const hovered = ref(null)

function cut(line) {
  const text = String(line ?? '')
  return text.length > props.dateCutoff ? `${text.slice(0, props.dateCutoff - 1)}[...]` : text
}
</script>

<template>
  <div class="mwnf-grid" :class="{ 'mwnf-grid--loading': loading }" :aria-busy="loading ? 'true' : undefined">
    <p v-if="loading && loadingText" class="mwnf-grid__status">{{ loadingText }}</p>
    <ul v-else-if="records.length" class="mwnf-grid__tiles">
      <li
        v-for="record in records"
        :key="record.id"
        class="mwnf-grid__tile"
        :class="{ 'mwnf-grid__tile--hover': hovered === record.id }"
        @mouseenter="hovered = record.id"
        @mouseleave="hovered = null"
        @focusin="hovered = record.id"
        @focusout="hovered = null"
      >
        <span class="mwnf-grid__media">
          <img v-if="record.image" class="mwnf-grid__image" :src="record.image" :alt="record.imageAlt ?? ''" loading="lazy" />
          <span v-else class="mwnf-grid__image mwnf-grid__image--empty" aria-hidden="true"></span>
        </span>
        <div class="mwnf-grid__card">
          <SmartLink class="mwnf-grid__card-media" :to="record.to" :href="record.href" tabindex="-1" aria-hidden="true">
            <img v-if="record.image" :src="record.image" alt="" />
          </SmartLink>
          <div class="mwnf-grid__card-body">
            <p class="mwnf-grid__name" v-html="record.name"></p>
            <p v-for="(line, index) in record.meta ?? []" :key="index" class="mwnf-grid__meta">{{ cut(line) }}</p>
            <p v-if="record.badge" class="mwnf-grid__badge">{{ record.badge }}</p>
            <SmartLink class="mwnf-grid__action" :to="record.to" :href="record.href">
              {{ actionLabel || record.name.replace(/<[^>]+>/g, '') }} ›
            </SmartLink>
          </div>
        </div>
      </li>
    </ul>
    <div v-else-if="hasEmptySlot" class="mwnf-grid__empty"><slot name="empty" /></div>
  </div>
</template>
