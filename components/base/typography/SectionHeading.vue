<script setup lang="ts">
import { computed, useI18n, useSlots } from '#imports'

defineOptions({ name: 'SectionHeading' })

type Level = 1 | 2 | 3 | 4 | 5 | 6

const props = withDefaults(defineProps<{
  /** Semantic heading level (h1–h6). */
  level?: Level
  /** Optional alternative tag (e.g. div). If not h1–h6, role="heading" + aria-level is applied. */
  as?: string
  /** ID for anchor/permalink. */
  id?: string
  /** i18n key for the heading. If not set, the default slot is used. */
  i18nKey?: string
  /** Optional i18n parameters. */
  i18nParams?: Record<string, unknown>
  /** Whether to render a subtle permalink anchor when an id is present. */
  anchor?: boolean
  /** Optional aria-label (only needed when the heading has no visible text). */
  ariaLabel?: string
  /** ID for the optional description slot so aria-describedby can reference it. */
  descriptionId?: string
}>(), {
  level: 2,
  anchor: true,
})

const { t } = useI18n()

const tag = computed(() => props.as || `h${props.level}`)
const isSemanticHeading = computed(() => /^h[1-6]$/.test(String(tag.value)))

const headingId = computed(() => props.id)

const textFromI18n = computed(() => {
  if (!props.i18nKey) return ''
  try {
    // @ts-expect-error: t signature allows Record params
    return t(props.i18nKey, props.i18nParams || {}) as string
  } catch {
    return props.i18nKey
  }
})

const hasDefaultSlot = useSlots()?.default != null
const headingText = computed(() => hasDefaultSlot ? '' : textFromI18n.value)

</script>

<template>
  <!--
    Renders a semantic heading with optional i18n text or slot content.
    - If "as" is not h1–h6, role="heading" and aria-level are set for a11y.
    - A permalink anchor is rendered only when an id is present and anchor=true.
  -->
  <component
    :is="tag"
    :id="headingId || undefined"
    :role="!isSemanticHeading ? 'heading' : undefined"
    :aria-level="!isSemanticHeading ? (level as number) : undefined"
    :aria-describedby="$slots.description && props.descriptionId ? props.descriptionId : undefined"
    :aria-label="ariaLabel || undefined"
    class="font-bold tracking-tight text-neutral-900 dark:text-neutral-100 text-2xl md:text-3xl group/heading"
  >
    <!-- Content: prefer slot, otherwise i18n text -->
    <slot v-if="$slots.default" />
    <span v-else>{{ headingText }}</span>

    <!-- Permalink anchor (mouse only, not focusable / not needed for screen readers) -->
    <a
      v-if="anchor && headingId"
      class="ml-2 align-middle opacity-0 transition-opacity group-hover/heading:opacity-60 hover:opacity-100 focus:opacity-100"
      :href="`#${headingId}`"
      aria-hidden="true"
      tabindex="-1"
    >
      #
    </a>
  </component>

  <!-- Optional: description slot (subtitle) - intentionally generic styling -->
  <p v-if="$slots.description" :id="props.descriptionId || undefined" class="mt-2 text-base text-neutral-600 dark:text-neutral-300 md:text-lg">
    <slot name="description" />
  </p>
</template>

<style scoped>
</style>
