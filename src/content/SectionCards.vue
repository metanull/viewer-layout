<script setup>
import SmartLink from './SmartLink.vue'

// A landing page's grid of section cards: each names a section of the
// website, says what it holds, and offers one way in. Four presentations:
// the default 'cards', 'rows' with hover images, 'covers' as cropped images,
// and 'accordion' with collapsible sections.
defineProps({
  // { title, description, action, to?, href?, image?, alt?, number?, children? }
  // — `description` and `action` are texts the website already resolved; `to` a
  // route location, `href` an address; `image` the card's image URL (optional);
  // `alt` the image alt text; `number` formatted by the caller (Roman or decimal);
  // `children` (accordion only) subsections with their own `to`/`href`.
  cards: { type: Array, default: () => [] },
  variant: { type: String, default: 'cards', validate: (v) => ['cards', 'rows', 'covers', 'accordion'].includes(v) },
})
</script>

<template>
  <ul v-if="cards.length" :class="['mwnf-cards', `mwnf-cards--${variant}`]">
    <li v-for="card in cards" :key="card.href ?? card.title" :class="['mwnf-cards__card']">
      <!-- Default 'cards' variant: title, description, action link -->
      <template v-if="variant === 'cards'">
        <SmartLink class="mwnf-cards__link" :to="card.to" :href="card.href">
          <span class="mwnf-cards__title">{{ card.title }}</span>
          <span v-if="card.description" class="mwnf-cards__text">{{ card.description }}</span>
          <span v-if="card.action" class="mwnf-cards__action">{{ card.action }} →</span>
        </SmartLink>
      </template>

      <!-- 'rows' variant: hover image on the left, text on the right -->
      <template v-else-if="variant === 'rows'">
        <SmartLink class="mwnf-cards__link" :to="card.to" :href="card.href">
          <div v-if="card.image" class="mwnf-cards__image-container">
            <img class="mwnf-cards__image" :src="card.image" :alt="card.alt || ''" />
          </div>
          <div class="mwnf-cards__content">
            <span v-if="card.number" class="mwnf-cards__number">{{ card.number }}</span>
            <span class="mwnf-cards__title">{{ card.title }}</span>
            <span v-if="card.description" class="mwnf-cards__text">{{ card.description }}</span>
          </div>
        </SmartLink>
      </template>

      <!-- 'covers' variant: cropped image with number and title overlay -->
      <template v-else-if="variant === 'covers'">
        <SmartLink class="mwnf-cards__link" :to="card.to" :href="card.href">
          <div v-if="card.image" class="mwnf-cards__image-container">
            <img class="mwnf-cards__image" :src="card.image" :alt="card.alt || ''" />
          </div>
          <span v-if="card.number" class="mwnf-cards__number">{{ card.number }}</span>
          <span class="mwnf-cards__title">{{ card.title }}</span>
        </SmartLink>
      </template>

      <!-- 'accordion' variant: collapsible sections with children -->
      <template v-else-if="variant === 'accordion'">
        <details class="mwnf-cards__details">
          <summary class="mwnf-cards__summary">
            <span v-if="card.number" class="mwnf-cards__number">{{ card.number }}</span>
            <span class="mwnf-cards__title">{{ card.title }}</span>
          </summary>
          <ul v-if="card.children?.length" class="mwnf-cards__children">
            <li v-for="child in card.children" :key="child.href ?? child.title" class="mwnf-cards__child">
              <SmartLink class="mwnf-cards__child-link" :to="child.to" :href="child.href">
                {{ child.title }}
              </SmartLink>
            </li>
          </ul>
        </details>
      </template>
    </li>
  </ul>
</template>
