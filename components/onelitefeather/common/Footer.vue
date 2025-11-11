<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faFacebook, faGithub, faLinkedin, faTwitch, faYoutube} from "@fortawesome/free-brands-svg-icons";
const { t } = useI18n()
</script>

<template>
  <footer class="mt-auto bg-surface-container dark:bg-surface-container-dark">
    <!-- Hauptbereich -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo/Brand Section -->
        <div class="col-span-1 md:col-span-1">
          <h3 class="text-lg font-semibold text-on-surface dark:text-white mb-4">
            {{ t('footer.brand') }}
          </h3>
          <p class="text-sm text-on-surface-variant dark:text-white">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- Links Spalte 1 -->
        <div>
          <h4 class="text-sm font-semibold text-on-surface dark:text-white mb-4">
            {{ t('footer.services.title') }}
          </h4>
           <ul class="space-y-3">
             <li>
              <NuxtLink to="/minecraft" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                {{ t('footer.services.minecraft') }}
              </NuxtLink>
             </li>
             <li>
              <NuxtLink to="/blog" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                {{ t('footer.services.blogging') }}
              </NuxtLink>
             </li>
            <li>
              <NuxtLink to="/github" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                {{ t('footer.services.github') }}
              </NuxtLink>
            </li>
           </ul>
         </div>

         <!-- Links Spalte 2 -->
         <div>
          <h4 class="text-sm font-semibold text-on-surface dark:text-white mb-4">
            {{ t('footer.organization.title') }}
          </h4>
           <ul class="space-y-3">
             <li>
              <NuxtLink to="/about" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                {{ t('footer.organization.about') }}
              </NuxtLink>
             </li>
             <li>
              <NuxtLink to="/contact" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                {{ t('footer.organization.contact') }}
              </NuxtLink>
             </li>
           </ul>
         </div>

         <!-- Social Media -->
         <div>
          <h4 class="text-sm font-semibold text-on-surface dark:text-white mb-4">
            {{ t('footer.social.title') }}
          </h4>
          <div class="flex gap-3">
            <a href="https://twitch.tv/your-channel" target="_blank" rel="noopener" class="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark transition-colors">
              <FontAwesomeIcon :icon="faTwitch" class="w-5 h-5 text-on-surface-variant dark:text-white" />
            </a>
            <a href="https://youtube.com/your-channel" target="_blank" rel="noopener" class="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark transition-colors">
              <FontAwesomeIcon :icon="faYoutube" class="w-5 h-5 text-on-surface-variant dark:text-white" />
            </a>
            <a href="https://facebook.com/your-page" target="_blank" rel="noopener" class="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark transition-colors">
              <FontAwesomeIcon :icon="faFacebook" class="w-5 h-5 text-on-surface-variant dark:text-white" />
            </a>
            <a href="https://linkedin.com/company/your-company" target="_blank" rel="noopener" class="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark transition-colors">
              <FontAwesomeIcon :icon="faLinkedin" class="w-5 h-5 text-on-surface-variant dark:text-white" />
            </a>
            <a href="https://github.com/your-org" target="_blank" rel="noopener" class="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark transition-colors">
              <FontAwesomeIcon :icon="faGithub" class="w-5 h-5 text-on-surface-variant dark:text-white" />
            </a>
          </div>
         </div>
       </div>
     </div>

     <!-- Divider -->
     <div class="border-t border-outline-variant dark:border-outline-variant-dark"></div>

     <!-- Copyright Section -->
     <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
       <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-sm text-on-surface-variant dark:text-white">
          {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
        </p>
         <div class="flex gap-6">
          <NuxtLink to="/privacy" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
            {{ t('footer.privacy') }}
          </NuxtLink>
          <NuxtLink to="/imprint" class="text-sm text-on-surface-variant dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
            {{ t('footer.terms') }}
          </NuxtLink>
         </div>
       </div>
     </div>
   </footer>
</template>


<style scoped>

</style>