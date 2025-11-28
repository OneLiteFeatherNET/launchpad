<script setup lang="ts">
import { computed, useI18n, useSlots } from '#imports'

defineOptions({ name: 'SectionHeading' })

type Level = 1 | 2 | 3 | 4 | 5 | 6

const props = withDefaults(defineProps<{
  /** Semantische Überschriftsebene (h1–h6). */
  level?: Level
  /** Optional ein alternativer Tag (z. B. div). Falls kein h1–h6, wird role="heading" + aria-level gesetzt. */
  as?: string
  /** ID für Sprungmarke/Permalink. */
  id?: string
  /** i18n-Key für die Überschrift. Wenn nicht gesetzt, wird der Slot verwendet. */
  i18nKey?: string
  /** optionale i18n-Parameter */
  i18nParams?: Record<string, unknown>
  /** Ob ein (visuell dezenter) Permalink-Anker gerendert werden soll, wenn eine id vorhanden ist. */
  anchor?: boolean
  /** Optionales aria-label (nur nötig, wenn die Überschrift keinen sichtbaren Text hätte). */
  ariaLabel?: string
  /** ID für die optionale Beschreibung (description-Slot), damit aria-describedby darauf verweisen kann. */
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
    // @ts-expect-error: t Signatur erlaubt Record params
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
    Rendert eine semantische Überschrift mit optionalem i18n-Text oder Slot.
    - Wenn "as" kein h1–h6 ist, setzen wir role="heading" und aria-level für A11y.
    - Ein Permalink-Anker wird nur gerendert, wenn eine id vorhanden ist und anchor=true.
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
    <!-- Inhalt: Slot bevorzugt, sonst i18n-Text -->
    <slot v-if="$slots.default" />
    <span v-else>{{ headingText }}</span>

    <!-- Permalink-Anker (für Maus, nicht im Fokusfluss / nicht für Screenreader notwendig) -->
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

  <!-- Optional: Beschreibung per Slot (Untertitel) - Styling bewusst generisch -->
  <p v-if="$slots.description" :id="props.descriptionId || undefined" class="mt-2 text-base text-neutral-600 dark:text-neutral-300 md:text-lg">
    <slot name="description" />
  </p>
</template>

<style scoped>
</style>
