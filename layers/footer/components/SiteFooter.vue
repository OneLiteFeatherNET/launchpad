<script setup lang="ts">
import { computed } from '#imports'
import { useI18n } from 'vue-i18n'
import { faFacebook, faGithub, faLinkedin, faTwitch, faYoutube } from '@fortawesome/free-brands-svg-icons'
const { t } = useI18n()
const appConfig = useAppConfig()

const versionLabel = computed(() =>
  appConfig.version ? t('footer.version', { version: appConfig.version }) : ''
)

const socialLinks = [
  { href: 'https://twitch.tv/onelitefeathernet', icon: faTwitch, labelKey: 'social.twitch' },
  { href: 'https://youtube.com/onelitefeathernet', icon: faYoutube, labelKey: 'social.youtube' },
  { href: 'https://facebook.com/onelitefeathernet', icon: faFacebook, labelKey: 'social.facebook' },
  {
    href: 'https://linkedin.com/company/onelitefeathernet',
    icon: faLinkedin,
    labelKey: 'social.linkedin',
  },
  { href: 'https://github.com/OneLiteFeatherNET', icon: faGithub, labelKey: 'social.github' },
]

const linkClass
  = 'rounded-extra-small text-body-medium text-on-surface-variant transition-colors '
    + 'hover:text-primary focus-ring'
const copyrightClass
  = 'flex flex-col items-center gap-1 text-body-medium text-on-surface-variant sm:items-start'
/** "Coming soon" entries: MD3's disabled content colour, not clickable. */
const placeholderClass = 'cursor-not-allowed text-body-medium text-on-surface/38'
</script>

<template>
  <footer class="mt-auto bg-surface-container-low" :aria-label="t('footer.aria_label')">
    <!-- Main section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <!-- Logo/Brand section -->
        <div class="col-span-1 sm:col-span-2 md:col-span-1">
          <h3 class="mb-4 text-title-medium text-on-surface">
            {{ t('footer.brand') }}
          </h3>
          <p class="text-body-medium text-on-surface-variant">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- Links column 1 -->
        <div>
          <h4 class="mb-4 text-title-small text-on-surface">
            {{ t('footer.services.title') }}
          </h4>
          <ul class="space-y-3">
            <li>
              <NuxtLinkLocale to="/blog" :class="linkClass">
                {{ t('footer.services.blogging') }}
              </NuxtLinkLocale>
            </li>
            <li>
              <a
                href="https://status.onelitefeather.net"
                target="_blank"
                rel="noopener noreferrer"
                :class="linkClass"
                :aria-label="t('footer.services.status')"
                :title="t('footer.services.status')"
              >
                {{ t('footer.services.status') }}
              </a>
            </li>
            <li>
              <NuxtLink
                to="https://github.com/OneLiteFeatherNET"
                :class="placeholderClass"
                aria-disabled="true"
                :title="t('footer.coming_soon')"
                @click.prevent
              >
                {{ t('footer.services.github') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Links column 2 -->
        <div>
          <h4 class="mb-4 text-title-small text-on-surface">
            {{ t('footer.organization.title') }}
          </h4>
          <ul class="space-y-3">
            <li>
              <!-- Placeholder: About (not available yet) -->
              <NuxtLink
                to="#"
                :class="placeholderClass"
                aria-disabled="true"
                :title="t('footer.coming_soon')"
                @click.prevent
              >
                {{ t('footer.organization.about') }}
              </NuxtLink>
            </li>
            <li>
              <!-- Placeholder: Contact (not available yet) -->
              <NuxtLink
                to="#"
                :class="placeholderClass"
                aria-disabled="true"
                :title="t('footer.coming_soon')"
                @click.prevent
              >
                {{ t('footer.organization.contact') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Social media -->
        <div>
          <h4 class="mb-4 text-title-small text-on-surface">
            {{ t('footer.social.title') }}
          </h4>
          <div class="flex flex-wrap gap-1">
            <M3IconButton
              v-for="link in socialLinks"
              :key="link.href"
              :href="link.href"
              target="_blank"
              :icon="link.icon"
              :label="t(link.labelKey)"
              :title="t(link.labelKey)"
            />
          </div>
        </div>
      </div>
    </div>

    <M3Divider decorative />

    <!-- Copyright section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div :class="copyrightClass">
          <p>
            {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
          </p>
          <p v-if="versionLabel">
            {{ versionLabel }}
          </p>
        </div>
        <div class="flex gap-6">
          <NuxtLinkLocale to="/privacy" :class="linkClass">
            {{ t('footer.privacy') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale to="/imprint" :class="linkClass">
            {{ t('footer.terms') }}
          </NuxtLinkLocale>
        </div>
      </div>
    </div>
  </footer>
</template>
