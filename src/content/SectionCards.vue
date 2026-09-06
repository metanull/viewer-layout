<script setup>
import SmartLink from './SmartLink.vue'

// A landing page's grid of section cards: each names a section of the
// website, says what it holds, and offers one way in. The three standalone
// websites carried this grid three times, CSS included; the cards are the
// site's (which sections, in what words), the grid is this.
defineProps({
  // { title, description, action, to?, href? } — `description` and `action`
  // are texts the website already resolved; `to` a route location, `href` an
  // address.
  cards: { type: Array, default: () => [] },
})
</script>

<template>
  <ul v-if="cards.length" class="mwnf-cards">
    <li v-for="card in cards" :key="card.href ?? card.title" class="mwnf-cards__card">
      <SmartLink class="mwnf-cards__link" :to="card.to" :href="card.href">
        <span class="mwnf-cards__title">{{ card.title }}</span>
        <span v-if="card.description" class="mwnf-cards__text">{{ card.description }}</span>
        <span v-if="card.action" class="mwnf-cards__action">{{ card.action }} →</span>
      </SmartLink>
    </li>
  </ul>
</template>
