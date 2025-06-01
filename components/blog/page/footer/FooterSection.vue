<script setup lang="ts">

</script>

<template>
  <footer class="container mx-auto dark:text-white border-t-2 my-4 py-4 px-4 lg:px-0">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 lg:mx-16">
      <div>
        <h2 class="text-lg font-bold">Social Media</h2>
        <ul>
          <li><a href="https://github.com/OneLiteFeatherNET" target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in a new tab)">GitHub</a></li>
          <li><a href="https://opencollective.com/onelitefeather" target="_blank" rel="noopener noreferrer" aria-label="OpenCollective (opens in a new tab)">OpenCollective</a></li>
        </ul>
      </div>
      <div>
        <h2 class="text-lg font-bold">Legal</h2>
        <ul>
          <li><NuxtLinkLocale to="/imprint">Imprint</NuxtLinkLocale></li>
          <li><NuxtLinkLocale to="/privacy">Privacy Policy</NuxtLinkLocale></li>
        </ul>
      </div>
      <div>
        <p>
          © {{ new Date().getFullYear() }} OneLiteFeather. All rights reserved.
        </p>
        <p>
          Made with <span class="text-red-500" aria-hidden="true">&hearts;</span><span class="sr-only">love</span> by the OneLiteFeather Team and contributors.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>

</style>
