<script setup lang="ts">

const props = defineProps<{
  textKey: string;
  path: string;
  mobile?: Boolean
}>();
const emit = defineEmits(['click-mobile'])
const localePath = useLocalePath()
const route = useRoute()

</script>

<template>
  <NuxtLink
      v-if="!props.mobile"
      :key="props.path"
      :to="props.path"
      class=" hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 text-sm font-medium rounded-full transition-colors shadow-sm"
      :class="{ 'bg-secondary-container dark:bg-gray-800 text-secondary dark:text-white shadow-sm': route.path === props.path,
       'text-gray-900 dark:text-gray-100 dark:bg-gray-800': route.path !== props.path }"
      :aria-current="route.path === props.path ? 'page' : undefined"
  >
  {{ $t(props.textKey) }}
  </NuxtLink>
  <NuxtLink
      v-if="props.mobile"
      :key="props.path"
      :to="props.path"
      class="block px-3 py-2 text-base font-medium rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm"
      :class="{ 'bg-secondary-container dark:bg-gray-800 text-secondary dark:text-white shadow-sm':  route.path === props.path,
       'text-gray-900 dark:text-gray-100 dark:bg-gray-800': route.path !== props.path }"
      :aria-current="route.path === props.path ? 'page' : undefined"
      @click="emit('click-mobile')"
      role="menuitem"
  >
    {{ $t(props.textKey) }}
  </NuxtLink>
</template>

<style scoped>

</style>
