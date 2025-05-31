<script setup lang="ts">
import NavigationBar from "~/components/base/navigation/NavigationBar.vue";
import FooterSection from "~/components/blog/page/footer/FooterSection.vue";
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
    <FooterSection />
  </Body>
</Html>
</template>

<style scoped>

</style>