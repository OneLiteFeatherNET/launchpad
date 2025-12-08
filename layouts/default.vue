<script setup lang="ts">
import LayoutNavigationBar from '~/components/layout/navigation/NavigationBar.vue'
import LayoutFooter from '~/components/layout/Footer.vue'

const route = useRoute()
const { t } = useI18n()
const head = useLocaleHead()
// Only set a static <Title> when the route explicitly provides one via meta.
const routeTitle = computed(() => (route.meta?.title ? t(route.meta.title as string) : null))
</script>

<template>
  <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
  <Head>
    <Title v-if="routeTitle">{{ routeTitle }}</Title>
  </Head>
    <Body class="dark:bg-gray-900 overflow-x-hidden">
      <!-- Local wrapper ensures flex layout even if <Body> classes are not applied by the renderer -->
      <div class="min-h-screen flex flex-col">
        <LayoutNavigationBar />
        <main class="px-4 mx-auto sm:px-6 lg:px-8 w-full flex-1">
          <slot/>
        </main>
        <LayoutFooter />
      </div>
    </Body>
  </Html>
</template>

<style scoped>

</style>
