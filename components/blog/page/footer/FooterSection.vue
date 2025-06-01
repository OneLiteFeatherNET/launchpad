<script setup lang="ts">

</script>

<template>
  <footer class="container mx-auto dark:text-white border-t-2 my-4 py-4 px-4 lg:px-0">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 lg:mx-16">
      <div>
        <h2 class="text-lg font-bold">{{ $t('footer.social_media') }}</h2>
        <ul>
          <li><a href="https://github.com/OneLiteFeatherNET" v-posthog-capture="'github-click'" target="_blank" rel="noopener noreferrer" :aria-label="$t('footer.github_aria')">{{ $t('footer.github') }}</a></li>
          <li><a href="https://opencollective.com/onelitefeather" v-posthog-capture="'opencollective-click'" target="_blank" rel="noopener noreferrer" :aria-label="$t('footer.opencollective_aria')">{{ $t('footer.opencollective') }}</a></li>
        </ul>
      </div>
      <div>
        <h2 class="text-lg font-bold">{{ $t('footer.legal') }}</h2>
        <ul>
          <li><NuxtLinkLocale to="/imprint" v-posthog-capture="'imprint-click'">{{ $t('footer.imprint') }}</NuxtLinkLocale></li>
          <li><NuxtLinkLocale to="/privacy" v-posthog-capture="'imprint-privacy'">{{ $t('footer.privacy_policy') }}</NuxtLinkLocale></li>
        </ul>
      </div>
      <div>
        <p>
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
