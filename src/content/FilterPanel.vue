<script setup>
import { useI18n } from '@metanull/viewer-core/i18n'

// The box the facet controls sit in. Two legacy shapes: the standalone
// panel, where the visitor sets several controls and applies them with a
// button (`mode: 'apply'`), and the DXA column, where choosing navigates and
// the only button resets (`mode: 'immediate'`). The controls are the
// default slot, because which they are is the site's.
defineProps({
  title: { type: String, default: '' },
  /** 'apply' — an Apply and a Reset button; 'immediate' — a Reset button only. */
  mode: { type: String, default: 'apply' },
  applyLabel: { type: String, default: '' },
  resetLabel: { type: String, default: '' },
  /** Disable every control, for a page with nothing to filter further. */
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['apply', 'reset'])
const { t } = useI18n()
</script>

<template>
  <form class="mwnf-filter" :class="`mwnf-filter--${mode}`" @submit.prevent="emit('apply')">
    <p v-if="title" class="mwnf-filter__title">{{ title }}</p>
    <fieldset class="mwnf-filter__controls" :disabled="disabled">
      <slot />
    </fieldset>
    <div class="mwnf-filter__actions">
      <button v-if="mode === 'apply'" type="submit" class="mwnf-filter__button mwnf-filter__button--apply">
        {{ applyLabel || t('core.action.apply') }}
      </button>
      <button type="button" class="mwnf-filter__button mwnf-filter__button--reset" @click="emit('reset')">
        {{ resetLabel || t('core.action.reset') }}
      </button>
    </div>
  </form>
</template>
