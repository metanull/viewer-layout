<script setup>
import { useSlots } from 'vue'
import SmartLink from './SmartLink.vue'

// Records as rows: a thumbnail, the name, a line of metadata, a badge. The
// standalone websites' result row, which lived in each site's stylesheet.
// It shares one record contract with RecordGrid, so a page that wants tiles
// instead changes a component name and nothing about its data.
//
// The contract: { id, image?, imageAlt?, name (inline HTML), meta: [string],
// badge?, to? | href? }.
defineProps({
  records: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: '' },
})

const slots = useSlots()
const hasEmptySlot = Boolean(slots.empty)
</script>

<template>
  <div class="mwnf-list" :class="{ 'mwnf-list--loading': loading }" :aria-busy="loading ? 'true' : undefined">
    <p v-if="loading && loadingText" class="mwnf-list__status">{{ loadingText }}</p>
    <ul v-else-if="records.length" class="mwnf-list__rows">
      <li v-for="record in records" :key="record.id" class="mwnf-list__row">
        <SmartLink class="mwnf-list__link" :to="record.to" :href="record.href">
          <span class="mwnf-list__thumb">
            <img v-if="record.image" :src="record.image" :alt="record.imageAlt ?? ''" loading="lazy" />
          </span>
          <span class="mwnf-list__body">
            <span class="mwnf-list__name" v-html="record.name"></span>
            <span v-if="record.meta?.length || record.badge" class="mwnf-list__meta">
              <span v-for="(line, index) in record.meta ?? []" :key="index" class="mwnf-list__meta-item">{{ line }}</span>
              <span v-if="record.badge" class="mwnf-list__badge">{{ record.badge }}</span>
            </span>
          </span>
        </SmartLink>
      </li>
    </ul>
    <div v-else-if="hasEmptySlot" class="mwnf-list__empty"><slot name="empty" /></div>
  </div>
</template>
