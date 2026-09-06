<script setup>
import { computed, getCurrentInstance } from 'vue'

// The one place a content component makes a link. This package has no
// router of its own — a website's links are `href`s its own router produced,
// and with hash history a `#/item/1` navigates as a plain anchor. A website
// that hands over a route location (`to`) instead gets a `RouterLink` when
// its application registered one, which every vue-router application has,
// and a plain anchor otherwise. Nothing here imports vue-router.
const props = defineProps({
  to: { type: [String, Object], default: null },
  href: { type: String, default: '' },
  external: { type: Boolean, default: false },
})

const RouterLink = getCurrentInstance()?.appContext.components.RouterLink ?? null
const useRouter = computed(() => Boolean(props.to && RouterLink))
const plainHref = computed(() => props.href || (typeof props.to === 'string' ? props.to : ''))
</script>

<template>
  <component :is="RouterLink" v-if="useRouter" :to="to" v-bind="$attrs"><slot /></component>
  <a
    v-else
    :href="plainHref || undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    v-bind="$attrs"
  ><slot /></a>
</template>
