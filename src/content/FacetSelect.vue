<script setup>
import { computed, useId } from 'vue'

// One labelled select for one facet: a placeholder as a disabled first
// option, as both legacies did, the options viewer-core's `facetOptions`
// produces, and nothing decided here about what they are.
const props = defineProps({
  label: { type: String, default: '' },
  /** [{ value, label }] */
  options: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  /** An "any" option with an empty value, so a selection can be cleared. */
  anyLabel: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  /** Hide the whole control when it has no option — a facet the records do not carry. */
  hideEmpty: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
const id = useId()
const visible = computed(() => !props.hideEmpty || props.options.length > 0)
</script>

<template>
  <label v-if="visible" class="mwnf-facet" :for="id">
    <span v-if="label" class="mwnf-facet__label">{{ label }}</span>
    <select
      :id="id"
      class="mwnf-facet__select"
      :value="String(modelValue ?? '')"
      :disabled="disabled"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-if="anyLabel" value="">{{ anyLabel }}</option>
      <option v-for="option in options" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
    </select>
  </label>
</template>
