<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import SmartLink from './SmartLink.vue'

// A carousel of featured partner records: one showing at a time, rotated on a
// timer, with bullet controls. The site provides the records (filtered and
// shuffled on the server or in a view before passing here), image URLs,
// location names and descriptions. The carousel carries its own state: the
// current slide index and the timer.
const CAROUSEL_INTERVAL_MS = 8000

const props = defineProps({
  // Array of { id, name, logo, city, country, description, route } where route
  // is a router location object or { to } link prop.
  records: { type: Array, default: () => [] },
  headingEntry: { type: String, default: 'partner.featured' },
})

const current = ref(0)
let timer = null

function show(index) {
  current.value = index
  restart()
}

function restart() {
  if (timer) clearInterval(timer)
  if (props.records.length > 0) {
    timer = setInterval(() => {
      current.value = (current.value + 1) % props.records.length
    }, CAROUSEL_INTERVAL_MS)
  }
}

onMounted(restart)
onBeforeUnmount(() => timer && clearInterval(timer))
</script>

<template>
  <section v-if="records.length" class="mwnf-featured-partners">
    <h2 class="mwnf-featured-partners__heading">{{ $t(headingEntry) }}</h2>
    <div class="mwnf-featured-partners__carousel">
      <SmartLink
        v-for="(record, index) in records"
        v-show="index === current"
        :key="record.id"
        :to="record.route"
        class="mwnf-featured-partners__card"
      >
        <span v-if="record.logo" class="mwnf-featured-partners__image">
          <img :src="record.logo" :alt="record.name" class="mwnf-featured-partners__logo" />
        </span>
        <span class="mwnf-featured-partners__body">
          <span class="mwnf-featured-partners__name">{{ record.name }}</span>
          <span class="mwnf-featured-partners__location">
            <span v-if="record.city">{{ record.city }}, </span>{{ record.country }}
          </span>
          <span class="mwnf-featured-partners__description">{{ record.description }}</span>
        </span>
      </SmartLink>
    </div>
    <div v-if="records.length > 1" class="mwnf-featured-partners__controls">
      <button
        v-for="(record, index) in records"
        :key="record.id"
        class="mwnf-featured-partners__bullet"
        :class="{ 'mwnf-featured-partners__bullet--active': index === current }"
        :aria-label="`${$t('core.action.show')} ${record.name}`"
        @click="show(index)"
      ></button>
    </div>
  </section>
</template>
