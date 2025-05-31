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
  <Body>
    <NavigationBar />
    <main class="px-4 mx-auto sm:px-6 lg:px-8 w-screen dark:bg-gray-900 h-screen">
      <slot/>
    </main>

  </Body>
</Html>
</template>

<style scoped>

</style>