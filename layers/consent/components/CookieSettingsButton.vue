<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LEGAL_LINK_CLASS } from '#layers/base'
import { useCookieConsent } from '../composables/useCookieConsent'

const { t } = useI18n()
const { reopen } = useCookieConsent()
</script>

<template>
  <button type="button" :class="LEGAL_LINK_CLASS" @click="reopen">
    {{ t('consent.footer_link') }}
  </button>
</template>
