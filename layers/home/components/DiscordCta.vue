<script setup lang="ts">
defineProps<{
  /** Invite shortlink; always opens in a new tab. */
  href: string
  /** `null` or `0` leaves the count out. */
  members: number | null
}>()

const { t, locale } = useI18n()

const panelClass
  = 'flex flex-col gap-5 rounded-extra-large bg-surface-container p-6 md:flex-row '
    + 'md:items-center md:justify-between md:gap-8 md:p-10'

const formatCount = (value: number) => new Intl.NumberFormat(locale.value).format(value)
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 pt-4 md:pt-6" aria-labelledby="discord-cta-title">
    <div :class="panelClass">
      <div class="min-w-0">
        <h2 id="discord-cta-title" class="text-headline-medium font-bold text-on-surface">
          {{ t('home.discord.title') }}
        </h2>
        <p class="mt-2 max-w-prose text-body-large text-on-surface-variant">
          {{ t('home.discord.pitch') }}
        </p>
        <p v-if="members" class="mt-3 text-title-medium font-bold text-on-surface">
          {{ t('home.discord.members', { count: formatCount(members) }) }}
        </p>
      </div>
      <M3Button
        :href="href"
        target="_blank"
        :icon="['fab', 'discord']"
        class="shrink-0 self-start md:self-center"
      >
        {{ t('home.discord.cta') }}
      </M3Button>
    </div>
  </section>
</template>
