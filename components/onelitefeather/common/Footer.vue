<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faFacebook, faGithub, faLinkedin, faTwitch, faYoutube} from "@fortawesome/free-brands-svg-icons";
const { t } = useI18n()
</script>

<template>
  <footer class="mt-auto bg-[var(--color-surface)] dark:bg-[var(--color-surface)]" role="contentinfo" :aria-label="t('footer.aria_label')">
    <!-- Main section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <!-- Logo/Brand section -->
        <div class="col-span-1 sm:col-span-2 md:col-span-1">
          <h3 class="text-lg font-semibold text-[var(--color-text)] mb-4">
            {{ t('footer.brand') }}
          </h3>
          <p class="text-sm text-[var(--color-muted)]">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- Links column 1 -->
        <div>
          <h4 class="text-sm font-semibold text-[var(--color-text)] mb-4">
            {{ t('footer.services.title') }}
          </h4>
           <ul class="space-y-3">
             <li>
              <NuxtLinkLocale to="/blog" class="text-sm text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] transition-colors">
                {{ t('footer.services.blogging') }}
              </NuxtLinkLocale>
             </li>
             <li>
              <a href="https://status.onelitefeather.net" target="_blank" rel="noopener noreferrer" class="text-sm text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] transition-colors" :aria-label="t('footer.services.status')" :title="t('footer.services.status')">
                {{ t('footer.services.status') }}
              </a>
             </li>
            <li>
             <NuxtLink to="https://github.com/OneLiteFeatherNET" @click.prevent class="text-sm text-[var(--color-muted)] hover:text-[var(--color-brand-primary)] transition-colors" aria-disabled="true" title="Coming soon">
                {{ t('footer.services.github') }}
              </NuxtLink>
            </li>
           </ul>
         </div>

         <!-- Links column 2 -->
         <div>
          <h4 class="text-sm font-semibold text-[var(--color-text)] mb-4">
            {{ t('footer.organization.title') }}
          </h4>
           <ul class="space-y-3">
             <li>
             <!-- Placeholder: About (not available yet) -->
             <NuxtLink to="#" @click.prevent class="text-sm text-[var(--color-muted)] transition-colors cursor-not-allowed opacity-70" aria-disabled="true" title="Coming soon">
                {{ t('footer.organization.about') }}
              </NuxtLink>
             </li>
             <li>
             <!-- Placeholder: Contact (not available yet) -->
             <NuxtLink to="#" @click.prevent class="text-sm text-[var(--color-muted)] transition-colors cursor-not-allowed opacity-70" aria-disabled="true" title="Coming soon">
                {{ t('footer.organization.contact') }}
              </NuxtLink>
             </li>
           </ul>
         </div>

        <!-- Social media -->
        <div>
          <h4 class="text-sm font-semibold text-[var(--color-text)] mb-4">
            {{ t('footer.social.title') }}
          </h4>
          <div class="flex flex-wrap gap-3">
            <a href="https://twitch.tv/onelitefeathernet" target="_blank" rel="noopener noreferrer" class="p-2 rounded-full text-[var(--color-muted)] transition-colors cursor-not-allowed opacity-70" :aria-label="t('social.twitch')" :title="t('social.twitch')">
               <FontAwesomeIcon :icon="faTwitch" class="h-5 w-5 text-[var(--color-muted)]" />
             </a>
             <a href="https://youtube.com/onelitefeathernet" target="_blank" rel="noopener noreferrer" class="p-2 rounded-full text-[var(--color-muted)] transition-colors cursor-not-allowed opacity-70" :aria-label="t('social.youtube')" :title="t('social.youtube')">
               <FontAwesomeIcon :icon="faYoutube" class="h-5 w-5 text-[var(--color-muted)]" />
             </a>
             <a href="https://facebook.com/onelitefeathernet" target="_blank" rel="noopener noreferrer" class="p-2 rounded-full text-[var(--color-muted)] transition-colors cursor-not-allowed opacity-70" :aria-label="t('social.facebook')" :title="t('social.facebook')">
               <FontAwesomeIcon :icon="faFacebook" class="h-5 w-5 text-[var(--color-muted)]" />
             </a>
             <a href="https://linkedin.com/company/onelitefeathernet" target="_blank" rel="noopener noreferrer" class="p-2 rounded-full text-[var(--color-muted)] transition-colors cursor-not-allowed opacity-70" :aria-label="t('social.linkedin')" :title="t('social.linkedin')">
               <FontAwesomeIcon :icon="faLinkedin" class="h-5 w-5 text-[var(--color-muted)]" />
             </a>
             <a href="https://github.com/OneLiteFeatherNET" target="_blank" rel="noopener noreferrer" class="p-2 rounded-full transition-colors hover:bg-[var(--color-surface)]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]" :aria-label="t('social.github')" :title="t('social.github')">
               <FontAwesomeIcon :icon="faGithub" class="h-5 w-5 text-[var(--color-muted)]" />
             </a>
           </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-[var(--color-border)] dark:border-[var(--color-border)]"></div>

     <!-- Copyright section -->
     <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
       <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p class="text-sm text-[var(--color-muted)] dark:text-[var(--color-muted)]">
          {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
        </p>
         <div class="flex gap-6">
           <NuxtLinkLocale to="/privacy" class="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]">
             {{ t('footer.privacy') }}
           </NuxtLinkLocale>
           <NuxtLinkLocale to="/imprint" class="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]">
             {{ t('footer.terms') }}
           </NuxtLinkLocale>
         </div>
       </div>
     </div>
   </footer>
</template>


<style scoped>

</style>