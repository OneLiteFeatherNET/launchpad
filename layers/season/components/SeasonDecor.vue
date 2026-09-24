<script setup lang="ts">
/**
 * Decoration for the season in effect; renders nothing for most of the year
 * and nothing for a season with `decor: false`.
 *
 * It must not take part in the page: `fixed` keeps it out of the flow, so
 * nothing shifts when it appears, and `pointer-events-none` lets every click
 * through to what lies underneath. It must not be read out: the shapes carry
 * no information, so the whole layer is `aria-hidden`. It must be able to hold
 * still: the bats only appear when motion is welcome, not merely slowed.
 *
 * `z-30` sits above the page and below the navigation (z-50) and the mobile
 * menu's backdrop (z-40), so an open menu is never veiled by cobwebs. Colours
 * are role tokens at low opacity: they follow the season's scheme, and text
 * underneath keeps its contrast.
 */
const season = useSeason()

const decorated = computed(() => season.value?.decor === true)

/** One corner web, mirrored for the right-hand side. */
const WEB_RADIALS = 'M0 0 L100 100 M0 0 L100 40 M0 0 L40 100 M0 0 L100 0 M0 0 L0 100'
const WEB_THREADS = 'M0 22 Q14 26 22 0 M0 46 Q28 52 46 0 M0 70 Q42 78 70 0 M0 94 Q56 104 94 0'

const BAT = 'M32 6c3 0 5 3 5 6 4-6 10-9 16-8-4 3-5 8-4 12-4-1-8 1-11 4-2 2-4 4-6 4s-4-2-6-4'
  + 'c-3-3-7-5-11-4 1-4 0-9-4-12 6-1 12 2 16 8 0-3 2-6 5-6z'

const BAT_CLASS = 'absolute hidden animate-season-drift text-brand-purple/40 motion-safe:md:block'

/** Where each bat hangs and how its drift is offset. Three at most (spec). */
const BATS = [
  { position: 'top-[22%] left-[6%] h-6 w-6', delay: '[animation-delay:0s]' },
  { position: 'top-[38%] right-[5%] h-5 w-5', delay: '[animation-delay:-5s]' },
  { position: 'top-[64%] left-[3%] h-4 w-4', delay: '[animation-delay:-9s]' },
]
</script>

<template>
  <div
    v-if="decorated"
    aria-hidden="true"
    data-testid="season-decor"
    class="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none"
  >
    <template v-if="season?.id === 'halloween'">
      <svg
        v-for="side in ['-left-1', '-right-1 -scale-x-100']"
        :key="side"
        :class="['absolute -top-1 h-28 w-28 text-primary/25 sm:h-40 sm:w-40', side]"
        data-decor="web"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path :d="WEB_RADIALS" />
        <path :d="WEB_THREADS" />
      </svg>

      <!-- Bats stay off small screens, where a drifting shape crosses the
           reading column, and off entirely under reduced motion. Opt-in
           (motion-safe:md:block) rather than opt-out: `motion-reduce:hidden`
           sorts before `md:block` in Tailwind v4 and would lose to it. -->
      <svg
        v-for="bat in BATS"
        :key="bat.position"
        :class="[BAT_CLASS, bat.position, bat.delay]"
        data-decor="bat"
        viewBox="0 0 64 32"
        fill="currentColor"
      >
        <path :d="BAT" />
      </svg>
    </template>
  </div>
</template>
