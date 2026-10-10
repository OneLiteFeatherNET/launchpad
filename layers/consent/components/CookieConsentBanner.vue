<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCookieConsent } from '../composables/useCookieConsent'

// Non-modal: the page stays usable behind the bar. Accept and reject share one
// variant on purpose, so refusing is never the harder choice.
const { t } = useI18n()
const { bannerVisible, analyticsAllowed, acceptAll, rejectAll, save } = useCookieConsent()

const settingsOpen = ref(false)
const analytics = ref(false)
const banner = ref<HTMLElement | null>(null)
const heading = ref<HTMLElement | null>(null)

// The button that opened the settings disappears, so focus moves to the
// heading of the new view rather than falling back to the document.
async function openSettings() {
  analytics.value = analyticsAllowed.value
  settingsOpen.value = true
  await nextTick()
  // The section is the scroll container; keep the new view's top visible.
  if (banner.value) banner.value.scrollTop = 0
  heading.value?.focus()
}

function saveSettings() {
  settingsOpen.value = false
  save({ analytics: analytics.value })
}

const headingId = 'cookie-consent-heading'
const necessaryId = 'cookie-consent-necessary'
const analyticsId = 'cookie-consent-analytics'
</script>

<template>
  <section
    v-if="bannerVisible"
    ref="banner"
    :aria-labelledby="headingId"
    class="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto overscroll-contain
      bg-surface-container-high text-on-surface shadow-elevation-3"
  >
    <div
      class="mx-auto flex max-w-5xl flex-col gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]
        sm:gap-4 sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <h2
        :id="headingId"
        ref="heading"
        tabindex="-1"
        class="text-title-large focus:outline-none"
      >
        {{ settingsOpen ? t('consent.banner.settings_title') : t('consent.banner.title') }}
      </h2>

      <template v-if="!settingsOpen">
        <p class="text-body-medium text-on-surface-variant">
          {{ t('consent.banner.body') }}
        </p>
        <div class="flex flex-wrap gap-3">
          <M3Button variant="outlined" @click="openSettings">
            {{ t('consent.banner.settings') }}
          </M3Button>
          <M3Button variant="tonal" @click="rejectAll">
            {{ t('consent.banner.reject_all') }}
          </M3Button>
          <M3Button variant="tonal" @click="acceptAll">
            {{ t('consent.banner.accept_all') }}
          </M3Button>
        </div>
      </template>

      <template v-else>
        <ul class="flex flex-col gap-3">
          <li
            class="flex items-start justify-between gap-4 rounded-medium bg-surface-container p-4"
          >
            <div>
              <p :id="necessaryId" class="text-title-small">
                {{ t('consent.banner.necessary_title') }}
              </p>
              <p class="text-body-small text-on-surface-variant">
                {{ t('consent.banner.necessary_description') }}
              </p>
            </div>
            <input
              type="checkbox"
              role="switch"
              checked
              disabled
              :aria-labelledby="necessaryId"
              class="mt-1 size-5 shrink-0 accent-primary"
            >
          </li>
          <li
            class="flex items-start justify-between gap-4 rounded-medium bg-surface-container p-4"
          >
            <div>
              <p :id="analyticsId" class="text-title-small">
                {{ t('consent.banner.analytics_title') }}
              </p>
              <p class="text-body-small text-on-surface-variant">
                {{ t('consent.banner.analytics_description') }}
              </p>
            </div>
            <input
              v-model="analytics"
              type="checkbox"
              role="switch"
              :aria-labelledby="analyticsId"
              class="mt-1 size-5 shrink-0 accent-primary"
            >
          </li>
        </ul>
        <div class="flex justify-end">
          <M3Button variant="filled" @click="saveSettings">
            {{ t('consent.banner.save') }}
          </M3Button>
        </div>
      </template>

      <NuxtLinkLocale
        to="/privacy"
        class="self-start rounded-extra-small text-label-large text-primary focus-ring"
      >
        {{ t('consent.banner.privacy_link') }}
      </NuxtLinkLocale>
    </div>
  </section>
</template>
