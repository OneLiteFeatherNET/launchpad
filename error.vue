<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error?.statusCode === 404)

const title = computed(() => (isNotFound.value ? t('error.title_404') : t('error.title_generic')))
const message = computed(() => (isNotFound.value ? t('error.message_404') : t('error.message_generic')))

useHead(() => ({ title: title.value }))

const handleHome = () => clearError({ redirect: localePath('index') })
</script>

<template>
  <NuxtLayout>
    <div class="container mx-auto flex min-h-[60vh] max-w-screen-md flex-col items-center justify-center px-4 py-16 text-center">
      <p class="text-7xl font-extrabold tracking-tight text-[var(--color-secondary)]">
        {{ error?.statusCode || 500 }}
      </p>
      <h1 class="mt-4 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        {{ title }}
      </h1>
      <p class="mt-3 max-w-prose text-neutral-600 dark:text-neutral-400">
        {{ message }}
      </p>
      <button
        type="button"
        class="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2"
        @click="handleHome"
      >
        {{ t('navigation.back_home') }}
      </button>
    </div>
  </NuxtLayout>
</template>
