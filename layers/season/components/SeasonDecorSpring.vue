<script setup lang="ts">
/**
 * Spring's decoration: a blossom branch in both top corners and, from md up
 * and only when motion is welcome, up to four slowly drifting petals.
 */

/** A curved twig with a few blossoms, mirrored for the right-hand corner. */
const BRANCH = 'M0 22c26-12 55-12 79 5 8 6 15 6 21-1'
const BLOSSOMS = [
  { cx: 20, cy: 16 },
  { cx: 42, cy: 24 },
  { cx: 66, cy: 22 },
  { cx: 86, cy: 14 },
]

/** A small drifting petal. */
const PETAL = 'M8 0c4 3 6 7 6 10a6 6 0 0 1-12 0c0-3 2-7 6-10z'

const PETAL_CLASS = 'absolute hidden animate-season-fall text-secondary/40 motion-safe:md:block'

/** Where each petal starts and how its drift is offset. Four at most (spec). */
const PETALS = [
  { position: 'top-[10%] left-[22%] h-3 w-3', delay: '[animation-delay:-3s]' },
  { position: 'top-[5%] left-[48%] h-4 w-4', delay: '[animation-delay:-11s]' },
  { position: 'top-[14%] left-[70%] h-3 w-3', delay: '[animation-delay:-17s]' },
  { position: 'top-[2%] left-[88%] h-3.5 w-3.5', delay: '[animation-delay:-7s]' },
]
</script>

<template>
  <svg
    v-for="side in ['-left-1', '-right-1 -scale-x-100']"
    :key="side"
    :class="['absolute -top-1 h-24 w-24 text-primary/25 sm:h-32 sm:w-32', side]"
    data-decor="branch"
    viewBox="0 0 100 100"
    fill="none"
  >
    <path :d="BRANCH" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <circle
      v-for="blossom in BLOSSOMS"
      :key="`${blossom.cx}-${blossom.cy}`"
      v-bind="blossom"
      r="4"
      fill="currentColor"
    />
  </svg>

  <!-- Petals stay off small screens and off entirely under reduced motion,
       opt-in the same way the halloween bats are (motion-safe:md:block, not
       motion-reduce:hidden — see the comment on SeasonDecorHalloween's bats
       about Tailwind v4's variant order). -->
  <svg
    v-for="petal in PETALS"
    :key="petal.position"
    :class="[PETAL_CLASS, petal.position, petal.delay]"
    data-decor="petal"
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <path :d="PETAL" />
  </svg>
</template>
