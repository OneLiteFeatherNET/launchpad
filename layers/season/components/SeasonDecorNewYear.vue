<script setup lang="ts">
/**
 * New year's decoration: a star in both top corners and, from md up and only
 * when motion is welcome, up to five gently twinkling light points. No
 * fireworks, explosions or full-surface flashes (spec new-year-season) — the
 * twinkle only brightens and scales an element in place.
 */

/** A four-pointed star, mirrored for the right-hand corner. */
const STAR = 'M50 8l9 33 33 9-33 9-9 33-9-33-33-9 33-9z'

const LIGHT_CLASS = 'absolute hidden rounded-full animate-season-twinkle bg-secondary/70 motion-safe:md:block'

/** Where each light sits and how its twinkle is offset. Five at most (spec). */
const LIGHTS = [
  { position: 'top-[10%] left-[20%] h-2 w-2', delay: '[animation-delay:0s]' },
  { position: 'top-[5%] left-[45%] h-2.5 w-2.5', delay: '[animation-delay:-1.5s]' },
  { position: 'top-[12%] left-[62%] h-2 w-2', delay: '[animation-delay:-3s]' },
  { position: 'top-[3%] left-[80%] h-2.5 w-2.5', delay: '[animation-delay:-2.25s]' },
  { position: 'top-[16%] left-[35%] h-1.5 w-1.5', delay: '[animation-delay:-0.75s]' },
]
</script>

<template>
  <svg
    v-for="side in ['-left-1', '-right-1 -scale-x-100']"
    :key="side"
    :class="['absolute top-16 h-28 w-28 text-secondary/25 sm:h-36 sm:w-36', side]"
    data-decor="star"
    viewBox="0 0 100 100"
    fill="currentColor"
  >
    <path :d="STAR" />
  </svg>

  <!-- Light points stay off small screens and off entirely under reduced
       motion, opt-in the same way the halloween bats are (motion-safe:md:
       block, not motion-reduce:hidden — see the comment on SeasonDecorHalloween's
       bats about Tailwind v4's variant order). A background colour twinkles
       via opacity/scale only: no explosion, no full-surface flash. -->
  <span
    v-for="light in LIGHTS"
    :key="light.position"
    :class="[LIGHT_CLASS, light.position, light.delay]"
    data-decor="light"
  />
</template>
