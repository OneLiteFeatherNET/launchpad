<script setup lang="ts">
/**
 * Decoration for the season in effect; renders nothing for most of the year
 * and nothing for a season with `decor: false`.
 *
 * It must not take part in the page: `fixed` keeps it out of the flow, so
 * nothing shifts when it appears, and `pointer-events-none` lets every click
 * through to what lies underneath. It must not be read out: the shapes carry
 * no information, so the whole layer is `aria-hidden`. It must be able to hold
 * still: moving elements only appear when motion is welcome, not merely
 * slowed.
 *
 * `z-30` sits above the page and below the navigation (z-50) and the mobile
 * menu's backdrop (z-40), so an open menu is never veiled by decoration.
 * Colours are role tokens at low opacity: they follow the season's scheme,
 * and text underneath keeps its contrast.
 *
 * This component is only the frame. The actual shapes live one per season in
 * SeasonDecor<Name>.vue (design D4) — explicitly imported and mapped by id,
 * rather than resolved from a string, so the mapping stays type-checked and
 * a season without an entry is a build error, not a silent blank frame.
 */
import SeasonDecorHalloween from './SeasonDecorHalloween.vue'
import SeasonDecorNewYear from './SeasonDecorNewYear.vue'
import SeasonDecorSpring from './SeasonDecorSpring.vue'
import SeasonDecorWinter from './SeasonDecorWinter.vue'

const season = useSeason()

const decorated = computed(() => season.value?.decor === true)

/** One decoration component per season id that has `decor: true`. */
const DECORATIONS = {
  halloween: SeasonDecorHalloween,
  winter: SeasonDecorWinter,
  'new-year': SeasonDecorNewYear,
  spring: SeasonDecorSpring,
} as const

const decoration = computed(() => {
  const id = season.value?.id
  return id && id in DECORATIONS ? DECORATIONS[id as keyof typeof DECORATIONS] : null
})
</script>

<template>
  <div
    v-if="decorated"
    aria-hidden="true"
    data-testid="season-decor"
    class="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none"
  >
    <component :is="decoration" v-if="decoration" />
  </div>
</template>
