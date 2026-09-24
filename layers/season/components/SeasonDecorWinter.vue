<script setup lang="ts">
/**
 * Winter's decoration: an ice crystal in both top corners and, from md up
 * and only when motion is welcome, up to six slowly falling snowflakes.
 * Colours are role tokens with opacity, same pattern as the other seasons.
 */

/** A six-spoke crystal, mirrored for the right-hand corner. */
const CRYSTAL = 'M50 8v84M16 28l68 44M16 72l68-44M50 8l-10 12M50 8l10 12M50 92l-10-12M50 92l10 12'
  + 'M16 28l4 15M16 28l15-4M84 28l-4 15M84 28l-15-4M16 72l4-15M16 72l15 4M84 72l-4-15M84 72l-15 4'

/** A small six-point snowflake, drifting slowly downward. */
const SNOWFLAKE = 'M8 0v16M1 4l14 8M1 12l14-8'

const SNOWFLAKE_CLASS = 'absolute hidden animate-season-fall text-tertiary/40 motion-safe:md:block'

/** Where each flake starts and how its fall is offset. Six at most (spec). */
const SNOWFLAKES = [
  { position: 'top-[8%] left-[15%] h-3 w-3', delay: '[animation-delay:-2s]' },
  { position: 'top-[4%] left-[42%] h-4 w-4', delay: '[animation-delay:-9s]' },
  { position: 'top-[10%] left-[68%] h-3 w-3', delay: '[animation-delay:-15s]' },
  { position: 'top-[2%] left-[85%] h-4 w-4', delay: '[animation-delay:-6s]' },
  { position: 'top-[14%] left-[28%] h-2 w-2', delay: '[animation-delay:-19s]' },
  { position: 'top-[6%] left-[55%] h-3 w-3', delay: '[animation-delay:-12s]' },
]
</script>

<template>
  <svg
    v-for="side in ['-left-1', '-right-1 -scale-x-100']"
    :key="side"
    :class="['absolute -top-1 h-24 w-24 text-primary/25 sm:h-32 sm:w-32', side]"
    data-decor="crystal"
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  >
    <path :d="CRYSTAL" />
  </svg>

  <!-- Snowflakes stay off small screens and off entirely under reduced
       motion, opt-in the same way the halloween bats are (motion-safe:md:
       block, not motion-reduce:hidden — see the comment on SeasonDecorHalloween's
       bats about Tailwind v4's variant order). -->
  <svg
    v-for="flake in SNOWFLAKES"
    :key="flake.position"
    :class="[SNOWFLAKE_CLASS, flake.position, flake.delay]"
    data-decor="snowflake"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  >
    <path :d="SNOWFLAKE" />
  </svg>
</template>
