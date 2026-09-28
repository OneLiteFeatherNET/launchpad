<script setup lang="ts">
/**
 * Spring's decoration: a blossom branch in both top corners and, from md up
 * and only when motion is welcome, up to four slowly drifting petals.
 */

/** A curved twig, mirrored for the right-hand corner. */
const BRANCH = 'M0 22c26-12 55-12 79 5 8 6 15 6 21-1'

/**
 * Five-petal blossoms along the branch: each is five small circles on a
 * pentagon around a centre, plus a tiny centre dot in a different role, so
 * they read as flowers rather than plain dots (the earlier version's single
 * circle per position). Positions follow the branch curve.
 */
interface Point {
  cx: number
  cy: number
}

interface Blossom {
  centre: Point
  petals: Point[]
}

function blossomAt(cx: number, cy: number, petals: Point[]): Blossom {
  return { centre: { cx, cy }, petals }
}

const BLOSSOMS: Blossom[] = [
  blossomAt(18, 15, [
    { cx: 18, cy: 11.9 },
    { cx: 20.9, cy: 14 },
    { cx: 19.8, cy: 17.5 },
    { cx: 16.2, cy: 17.5 },
    { cx: 15.1, cy: 14 },
  ]),
  blossomAt(40, 23, [
    { cx: 40, cy: 19.9 },
    { cx: 42.9, cy: 22 },
    { cx: 41.8, cy: 25.5 },
    { cx: 38.2, cy: 25.5 },
    { cx: 37.1, cy: 22 },
  ]),
  blossomAt(64, 21, [
    { cx: 64, cy: 17.9 },
    { cx: 66.9, cy: 20 },
    { cx: 65.8, cy: 23.5 },
    { cx: 62.2, cy: 23.5 },
    { cx: 61.1, cy: 20 },
  ]),
  blossomAt(85, 13, [
    { cx: 85, cy: 9.9 },
    { cx: 87.9, cy: 12 },
    { cx: 86.8, cy: 15.5 },
    { cx: 83.2, cy: 15.5 },
    { cx: 82.1, cy: 12 },
  ]),
]
const PETAL_R = 2.8
const CENTRE_R = 1.4

/** A small pointed leaf, positioned and angled along the branch. */
const LEAF = 'M0 0C3-3 8-3 12 0C8 3 3 3 0 0Z'
const LEAVES = [
  { transform: 'translate(30 27) rotate(-15) scale(0.8)' }, { transform: 'translate(70 10) rotate(18) scale(0.8)' },
]

/** A small drifting petal. */
const PETAL = 'M8 0c4 3 6 7 6 10a6 6 0 0 1-12 0c0-3 2-7 6-10z'

// text-secondary reads dark and muted in the light scheme (it is tuned for
// text contrast, not for a bright petal), which is why the petals used to
// read as muddy mauve-grey. text-secondary-container keeps a soft, clearly
// pink surface in the light scheme and a still-rosy, if dimmer, one in dark.
const PETAL_CLASS = 'absolute hidden animate-season-fall text-secondary-container/70 motion-safe:md:block'

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
    :class="['absolute top-16 h-28 w-28 text-primary/40 sm:h-36 sm:w-36', side]"
    data-decor="branch"
    viewBox="0 0 100 100"
    fill="none"
  >
    <path :d="BRANCH" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path
      v-for="leaf in LEAVES"
      :key="leaf.transform"
      :d="LEAF"
      :transform="leaf.transform"
      fill="currentColor"
    />
    <g
      v-for="blossom in BLOSSOMS"
      :key="`${blossom.centre.cx}-${blossom.centre.cy}`"
      class="text-secondary/60"
    >
      <circle
        v-for="petal in blossom.petals"
        :key="`${petal.cx}-${petal.cy}`"
        :cx="petal.cx"
        :cy="petal.cy"
        :r="PETAL_R"
        fill="currentColor"
      />
      <circle
        :cx="blossom.centre.cx"
        :cy="blossom.centre.cy"
        :r="CENTRE_R"
        fill="currentColor"
        class="text-tertiary-container"
      />
    </g>
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
