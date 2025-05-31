<script setup lang="ts">
import NavigationBar from "~/components/base/navigation/NavigationBar.vue";
const route = useRoute()
const { t } = useI18n()
const head = useLocaleHead()
const title = computed(() => t(route.meta?.title ?? 'TDB'));
</script>

<template>
<Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
  <Head>
    <Title>{{ title }}</Title>
    <template v-for="link in head.link" :key="link.hid">
      <Link :id="link.hid" :rel="link.rel" :href="link.href" :hreflang="link.hreflang" />
    </template>
    <template v-for="meta in head.meta" :key="meta.hid">
      <Meta :id="meta.hid" :property="meta.property" :content="meta.content" />
    </template>
  </Head>
  <Body class="h-full dark:bg-gray-900">
    <NavigationBar />
    <main class="px-4 mx-auto sm:px-6 lg:px-8 w-screen h-full">
      <slot/>
    </main>
    <footer class="container mx-auto dark:text-white border-t-2 my-4 py-4 px-4 lg:px-0">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 lg:mx-16">
        <div>
          <h2 class="text-lg font-bold">Social Media</h2>
          <ul>
            <li><a href="https://github.com/OneLiteFeatherNET" target="_blank">GitHub</a></li>
            <li><a href="https://opencollective.com/onelitefeather" target="_blank">OpenCollective</a></li>
          </ul>
        </div>
        <div>
          <h2 class="text-lg font-bold">Legal</h2>
          <ul>
            <li><NuxtLink to="/imprint">Imprint</NuxtLink></li>
            <li><NuxtLink to="/privacy">Privacy Policy</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p>
            © {{ new Date().getFullYear() }} OneLiteFeather. All rights reserved.
          </p>
          <p>
            Made with <span class="text-red-500">&hearts;</span> by the OneLiteFeather Team and contributors.
          </p>
        </div>
      </div>
    </footer>
  </Body>
</Html>
</template>

<style scoped>

</style>