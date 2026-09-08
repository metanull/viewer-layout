<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { sourceUrl } from '@metanull/viewer-core'
import { useI18n } from '@metanull/viewer-core/i18n'

// The "Source: <address>" line the MWNF notice asks for, wherever a page
// reads from a data package: under a record sheet's citation, and under an
// essay. `sourceUrl` is null until the website declares `site.origin`, so
// this renders nothing on a site that has not — the same gate the citation's
// own permalink now reads.
const props = defineProps({
  /** A route already resolved, or a raw location; defaults to the current page. */
  route: { type: [Object, String], default: null },
  labelEntry: { type: String, default: 'record.source.label' },
})

const { t } = useI18n()
const currentRoute = useRoute()
const url = computed(() => sourceUrl(props.route ?? currentRoute))
</script>

<template>
  <p v-if="url" class="mwnf-source-credit">
    <span class="mwnf-source-credit__label">{{ t(labelEntry) }}</span> <a :href="url">{{ url }}</a>
  </p>
</template>
