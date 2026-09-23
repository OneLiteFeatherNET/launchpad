<script setup lang="ts">
import { computed } from 'vue'
import { useInteractiveTag } from '../composables/useInteractiveTag'
import type { IconButtonSize, IconButtonVariant, IconName } from '../types'
import {
  M3_ICON_BUTTON_BASE,
  M3_ICON_BUTTON_SIZES,
  M3_ICON_BUTTON_VARIANTS,
} from '../utils/m3Variants'
import IconFa from './IconFa.vue'

/**
 * MD3 icon button. An icon alone says nothing to a screen reader, so the
 * accessible name is the required `label` prop — leaving it out is a type
 * error. (Not `ariaLabel`: vue-tsc reads `aria-label="…"` at a call site as
 * the plain HTML attribute, so a required `ariaLabel` prop could never be
 * satisfied in kebab case.)
 *
 * Pass `selected` to make it a toggle: it then carries `aria-pressed` and
 * the selected/unselected looks of its variant. Leave it undefined for a
 * plain action button.
 */
const props = withDefaults(defineProps<{
  icon: IconName
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  selected?: boolean
  to?: string
  href?: string
  target?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  variant: 'standard',
  size: 'md',
  selected: undefined,
  to: undefined,
  href: undefined,
  target: undefined,
  type: 'button',
  disabled: false,
})

const { tag, attrs } = useInteractiveTag(() => props)

const isToggle = computed(() => props.selected !== undefined)
const classes = computed(() => {
  const look = M3_ICON_BUTTON_VARIANTS[props.variant]
  const state = !isToggle.value ? look.plain : props.selected ? look.selected : look.unselected
  return [
    M3_ICON_BUTTON_BASE,
    M3_ICON_BUTTON_SIZES[props.size].box,
    state,
  ]
})
</script>

<template>
  <component
    :is="tag"
    v-bind="attrs"
    :class="classes"
    :aria-label="label"
    :aria-pressed="isToggle && tag === 'button' ? String(selected) : undefined"
  >
    <IconFa :icon="icon" :class="M3_ICON_BUTTON_SIZES[size].icon" aria-hidden="true" />
  </component>
</template>
