<script setup lang="ts">

</script>

<template>
  <footer class="container mx-auto dark:text-white border-t-2 my-4 py-4 px-4 lg:px-0">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4 lg:mx-16">
      <div>
        <h2 class="text-lg font-bold mb-2">{{ $t('footer.social_media') }}</h2>
        <ul class="space-y-1">
          <li><a href="https://github.com/OneLiteFeatherNET" v-posthog-capture="'github-click'" target="_blank" rel="noopener noreferrer" :aria-label="$t('footer.github_aria')" class="hover:text-primary dark:hover:text-blue-300 transition-colors">{{ $t('footer.github') }}</a></li>
          <li><a href="https://opencollective.com/onelitefeather" v-posthog-capture="'opencollective-click'" target="_blank" rel="noopener noreferrer" :aria-label="$t('footer.opencollective_aria')" class="hover:text-primary dark:hover:text-blue-300 transition-colors">{{ $t('footer.opencollective') }}</a></li>
        </ul>
      </div>
      <div>
        <h2 class="text-lg font-bold mb-2">{{ $t('footer.legal') }}</h2>
        <ul class="space-y-1">
          <li><NuxtLinkLocale to="/imprint" v-posthog-capture="'imprint-click'" class="hover:text-primary dark:hover:text-blue-300 transition-colors">{{ $t('footer.imprint') }}</NuxtLinkLocale></li>
          <li><NuxtLinkLocale to="/privacy" v-posthog-capture="'imprint-privacy'" class="hover:text-primary dark:hover:text-blue-300 transition-colors">{{ $t('footer.privacy_policy') }}</NuxtLinkLocale></li>
        </ul>
      </div>
      <div class="flex flex-col justify-between">
        <p class="mb-2">
          © {{ new Date().getFullYear() }} OneLiteFeather. {{ $t('footer.all_rights_reserved') }}
        </p>
        <p>
          {{ $t('footer.made_with_love').split('love')[0] }}<span class="text-red-500" aria-hidden="true">&hearts;</span><span class="sr-only">{{ $t('footer.love') }}</span>{{ $t('footer.made_with_love').split('love')[1] }}
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>

</style>
