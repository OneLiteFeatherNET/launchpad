<script setup lang="ts">

import FooterSection from "~/components/blog/page/footer/FooterSection.vue";
import NavigationBar from "~/components/blog/base/navigation/NavigationBar.vue";
import Footer from "~/components/onelitefeather/common/Footer.vue";

const route = useRoute()
const { t } = useI18n()
const head = useLocaleHead()
const title = computed(() => t(route.meta?.title ?? 'TDB'));
</script>

<template>
  <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
  <Head>
    <Title>{{ title }}</Title>
    <
  </Head>
    <Body class="h-full dark:bg-gray-900">
      <NavigationBar />
      <main class="px-4 mx-auto sm:px-6 lg:px-8 w-full h-full">
        <slot/>
      </main>
    <Footer />
  </Body>
  </Html>
</template>

<style scoped>

</style>