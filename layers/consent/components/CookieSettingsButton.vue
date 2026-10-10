<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCookieConsent } from '../composables/useCookieConsent'

const { t } = useI18n()
const { reopen } = useCookieConsent()
</script>

<template>
  <M3Button variant="text" @click="reopen">
    {{ t('consent.footer_link') }}
  </M3Button>
</template>
