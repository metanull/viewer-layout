<script setup>
import { useSlots } from 'vue'
import SmartLink from './SmartLink.vue'

// Timeline events as rows: seven sites hand-wrote this same list — a date, a
// one-line caption (a country, or Sharing History's own "Country | Theme"
// pair), a Markdown description, an optional image/item strip and a set of
// per-event actions ("View items from this period"). One contract, built by
// the view that knows the site's own event shape:
//
//   { id, date, caption?, description? (block HTML), media?: [{ image, alt?, to?, href?, caption? }],
//     actions?: [{ label, to?, href? }] }
//
// `caption` and `description` are rendered output — Markdown already run
// through viewer-core's `renderInline`/`renderBlock` by the caller, the same
// convention `RecordList`'s `name` and `RecordSheet`'s fields follow: this
// component renders what it is given, and decides nothing about Markdown.
defineProps({
  events: { type: Array, default: () => [] },
})

const slots = useSlots()
const hasEmptySlot = Boolean(slots.empty)
</script>

<template>
  <ul v-if="events.length" class="mwnf-timeline__rows">
    <li v-for="event in events" :key="event.id" class="mwnf-timeline__row">
      <div class="mwnf-timeline__date">
        <slot name="date" :event="event">{{ event.date }}</slot>
      </div>
      <div class="mwnf-timeline__body">
        <div v-if="event.caption || $slots.caption" class="mwnf-timeline__caption">
          <slot name="caption" :event="event"><span v-html="event.caption"></span></slot>
        </div>
        <div
          v-if="event.description"
          class="mwnf-timeline__description mwnf-sheet__block"
          v-html="event.description"
        ></div>
        <div v-if="event.media?.length || $slots.media" class="mwnf-timeline__media">
          <slot name="media" :event="event">
            <SmartLink
              v-for="(item, index) in event.media ?? []"
              :key="index"
              class="mwnf-timeline__media-item"
              :to="item.to"
              :href="item.href"
            >
              <img v-if="item.image" :src="item.image" :alt="item.alt ?? ''" loading="lazy" />
              <span v-if="item.caption" class="mwnf-timeline__media-caption" v-html="item.caption"></span>
            </SmartLink>
          </slot>
        </div>
        <div v-if="event.actions?.length || $slots.actions" class="mwnf-timeline__actions">
          <slot name="actions" :event="event">
            <SmartLink
              v-for="(action, index) in event.actions ?? []"
              :key="index"
              class="mwnf-timeline__action"
              :to="action.to"
              :href="action.href"
            >{{ action.label }} →</SmartLink>
          </slot>
        </div>
      </div>
    </li>
  </ul>
  <div v-else-if="hasEmptySlot" class="mwnf-timeline__empty"><slot name="empty" /></div>
</template>
