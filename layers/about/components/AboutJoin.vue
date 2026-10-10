<script setup lang="ts">
defineProps<{
  discordUrl: string
}>()

const { t, locale } = useI18n()
</script>

<template>
  <ul class="flex flex-wrap gap-3">
    <li>
      <M3Button :to="`/${locale}#connect`" :icon="['fas', 'play']">
        {{ t('about.join.play') }}
      </M3Button>
    </li>
    <li>
      <M3Button
        :href="discordUrl"
        target="_blank"
        variant="tonal"
        :icon="['fab', 'discord']"
      >
        {{ t('about.join.discord') }}
      </M3Button>
    </li>
    <li>
      <M3Button :to="`/${locale}/team`" variant="tonal" :icon="['fas', 'users']">
        {{ t('about.join.apply') }}
      </M3Button>
    </li>
    <li>
      <M3Button
        href="https://opencollective.com/onelitefeather"
        target="_blank"
        variant="outlined"
        :icon="['fas', 'handshake']"
      >
        {{ t('about.join.support') }}
      </M3Button>
    </li>
  </ul>
</template>
