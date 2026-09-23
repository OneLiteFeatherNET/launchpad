<script setup lang="ts">
import { computed, resolveComponent, useSlots } from 'vue'
import { useInteractiveTag } from '../composables/useInteractiveTag'
import type { ButtonVariant, IconName } from '../types'
import { M3_BUTTON_BASE, M3_BUTTON_PADDING, M3_BUTTON_VARIANTS } from '../utils/m3Variants'
import IconFa from './IconFa.vue'

/**
 * MD3 common button. Renders a <button>, or a link when given `to` (internal)
 * or `href` (external). Colour, shape, type and states come from the
 * variant; callers add layout classes only (spacing, width, placement).
 */
const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  /** Leading icon; the `icon` slot takes precedence. */
  icon?: IconName
  to?: string
  href?: string
  target?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  variant: 'filled',
  icon: undefined,
  to: undefined,
  href: undefined,
  target: undefined,
  type: 'button',
  disabled: false,
})

const slots = useSlots()
const { component, attrs } = useInteractiveTag(() => props, resolveComponent('NuxtLink'))

const hasIcon = computed(() => Boolean(props.icon || slots.icon))
const classes = computed(() => {
  const padding = M3_BUTTON_PADDING[props.variant]
  return [
    M3_BUTTON_BASE,
    M3_BUTTON_VARIANTS[props.variant],
    hasIcon.value ? padding.withIcon : padding.plain,
  ]
})
</script>

<template>
  <component :is="component" v-bind="attrs" :class="classes">
    <span
      v-if="hasIcon"
      class="inline-flex size-[1.125rem] items-center justify-center"
      aria-hidden="true"
    >
      <slot name="icon">
        <IconFa v-if="icon" :icon="icon" class="size-[1.125rem]" />
      </slot>
    </span>
    <slot />
  </component>
</template>
