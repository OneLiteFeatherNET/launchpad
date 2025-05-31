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
      class=" hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 text-sm font-medium rounded-full transition-colors shadow-sm"
      :class="{ 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm': route.path === props.path,
       'text-gray-900 dark:text-gray-100 dark:bg-gray-800': route.path !== props.path }"
  >
  {{ $t(props.textKey) }}
  </NuxtLink>
  <NuxtLink
      v-if="props.mobile"
      :key="props.path"
      :to="props.path"
      class="block px-3 py-2 text-base font-medium rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm"
      :class="{ 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm':  route.path === props.path,
       'text-gray-900 dark:text-gray-100 dark:bg-gray-800': route.path !== props.path }"
      @click="emit('click-mobile')"
  >
    {{ $t(props.textKey) }}
  </NuxtLink>
</template>

<style scoped>

</style>