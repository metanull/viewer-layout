<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from '@metanull/viewer-core/i18n'

// One pagination for every list: first, previous, a window of pages, next,
// last, and the position — rendered beside the texts, never inside one,
// because a text that has to carry a number cannot be translated without
// carrying the number's place in the sentence too. Five implementations
// preceded it.
//
// `pageInfo` is what viewer-core's `paginate()` answers:
// { total, lastPage, currentPage, from, to, rows }.
const props = defineProps({
  pageInfo: { type: Object, required: true },
  /** How many page numbers are shown around the current one. */
  window: { type: Number, default: 5 },
  /** A "go to page" field after the numbers. */
  jump: { type: Boolean, default: false },
  /** Whether "First" and "Last" are offered. */
  ends: { type: Boolean, default: true },
})
const emit = defineEmits(['navigate'])
const { t } = useI18n()

const current = computed(() => props.pageInfo?.currentPage ?? 1)
const last = computed(() => props.pageInfo?.lastPage ?? 1)

const pages = computed(() => {
  const span = Math.max(1, props.window)
  let from = Math.max(1, current.value - Math.floor(span / 2))
  const to = Math.min(last.value, from + span - 1)
  from = Math.max(1, to - span + 1)
  const out = []
  for (let page = from; page <= to; page++) out.push(page)
  return out
})

const jumpTo = ref(String(current.value))
watch(current, (page) => {
  jumpTo.value = String(page)
})

function go(page) {
  const target = Math.min(Math.max(1, Number.parseInt(page, 10) || 1), last.value)
  if (target !== current.value) emit('navigate', target)
}
</script>

<template>
  <nav v-if="last > 1" class="mwnf-pagination" :aria-label="t('catalogue.pagination.page')">
    <button v-if="ends" type="button" class="mwnf-pagination__button" :disabled="current === 1" @click="go(1)">
      « {{ t('catalogue.pagination.first') }}
    </button>
    <button type="button" class="mwnf-pagination__button" :disabled="current === 1" @click="go(current - 1)">
      ‹ {{ t('core.pagination.previous') }}
    </button>
    <button
      v-for="page in pages"
      :key="page"
      type="button"
      class="mwnf-pagination__button mwnf-pagination__number"
      :class="{ 'mwnf-pagination__button--active': page === current }"
      :aria-current="page === current ? 'page' : undefined"
      @click="go(page)"
    >{{ page }}</button>
    <button type="button" class="mwnf-pagination__button" :disabled="current === last" @click="go(current + 1)">
      {{ t('core.pagination.next') }} ›
    </button>
    <button v-if="ends" type="button" class="mwnf-pagination__button" :disabled="current === last" @click="go(last)">
      {{ t('catalogue.pagination.last') }} »
    </button>
    <span class="mwnf-pagination__position">
      <template v-if="jump">
        <label class="mwnf-pagination__jump">
          <span>{{ t('catalogue.pagination.page') }}</span>
          <input
            v-model="jumpTo"
            class="mwnf-pagination__jump-field"
            type="number"
            min="1"
            :max="last"
            @keyup.enter="go(jumpTo)"
          />
        </label>
        <span>/ {{ last }}</span>
        <button type="button" class="mwnf-pagination__button" @click="go(jumpTo)">{{ t('catalogue.pagination.go') }}</button>
      </template>
      <template v-else>{{ current }} / {{ last }}</template>
    </span>
  </nav>
</template>
