<script setup lang="ts">
import { computed, resolveComponent, useSlots } from 'vue'
import { useInteractiveTag } from '../composables/useInteractiveTag'
import type { ChipKind, ChipLabelColor, IconName } from '../types'
import {
  M3_CHIP_BASE,
  M3_CHIP_INTERACTIVE,
  M3_CHIP_KINDS,
  M3_CHIP_LABEL_COLORS,
  M3_CHIP_LABEL_NEUTRAL,
} from '../utils/m3Variants'
import IconFa from './IconFa.vue'

/**
 * MD3 chip. `assist`, `filter` and `suggestion` are interactive (a button,
 * or a link with `to`/`href`); `label` is the non-interactive form for tags,
 * statuses and categories — a plain span, never in the tab order, tinted by
 * `color` or neutral without one.
 *
 * A filter chip reports its state through `aria-pressed` and shows a check
 * mark while selected.
 */
const props = withDefaults(defineProps<{
  label?: string
  kind?: ChipKind
  selected?: boolean
  color?: ChipLabelColor
  icon?: IconName
  to?: string
  href?: string
  target?: string
  disabled?: boolean
}>(), {
  label: undefined,
  kind: 'assist',
  selected: false,
  color: undefined,
  icon: undefined,
  to: undefined,
  href: undefined,
  target: undefined,
  disabled: false,
})

const slots = useSlots()
const interactive = useInteractiveTag(() => props, resolveComponent('NuxtLink'))

const isLabel = computed(() => props.kind === 'label')
const tag = computed(() => (isLabel.value ? 'span' : interactive.tag.value))
const component = computed(() => (isLabel.value ? 'span' : interactive.component.value))
const attrs = computed(() => (isLabel.value ? {} : interactive.attrs.value))

const showsCheck = computed(() => props.kind === 'filter' && props.selected)
const leadingIcon = computed<IconName | undefined>(() => (showsCheck.value ? ['fas', 'check'] : props.icon))

const classes = computed(() => {
  if (isLabel.value) {
    return [M3_CHIP_BASE, props.color ? M3_CHIP_LABEL_COLORS[props.color] : M3_CHIP_LABEL_NEUTRAL]
  }
  const look = M3_CHIP_KINDS[props.kind as Exclude<ChipKind, 'label'>]
  return [
    M3_CHIP_BASE,
    M3_CHIP_INTERACTIVE,
    props.selected ? look.selected : look.plain,
  ]
})
</script>

<template>
  <component
    :is="component"
    v-bind="attrs"
    :class="classes"
    :aria-pressed="kind === 'filter' && tag === 'button' ? String(selected) : undefined"
  >
    <span
      v-if="leadingIcon || slots.icon"
      class="inline-flex size-[1.125rem] items-center justify-center"
      :class="kind === 'assist' ? 'text-primary' : undefined"
      aria-hidden="true"
    >
      <slot v-if="!showsCheck" name="icon">
        <IconFa v-if="leadingIcon" :icon="leadingIcon" class="size-[1.125rem]" />
      </slot>
      <IconFa v-else :icon="['fas', 'check']" class="size-[1.125rem]" />
    </span>
    <slot>{{ label }}</slot>
  </component>
</template>
