<script setup>
import { useRouter } from 'vue-router'
import SmartLink from './SmartLink.vue'

// A "back" navigation link that uses the browser history when available, or
// falls back to a provided route. The label defaults to 'core.action.back'.
const router = useRouter()

const props = defineProps({
  // Entry name for the back link label (defaults to 'core.action.back')
  label: { type: String, default: 'core.action.back' },
  // Fallback route when there is no history (router location object or href string)
  to: { type: [String, Object], default: null },
  href: { type: String, default: '' },
})

// Determine whether there is browser history to navigate back through.
function canGoBack() {
  return window.history.length > 1
}

function handleClick(e) {
  if (canGoBack()) {
    e.preventDefault()
    router.back()
  }
}
</script>

<template>
  <div class="mwnf-back-link">
    <SmartLink
      v-if="!canGoBack() && (to || href)"
      :to="to"
      :href="href"
      class="mwnf-back-link__button"
    >
      ↩ {{ $t(label) }}
    </SmartLink>
    <button v-else class="mwnf-back-link__button" @click="handleClick">
      ↩ {{ $t(label) }}
    </button>
  </div>
</template>
