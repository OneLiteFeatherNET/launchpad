<script setup lang="ts">
import { useI18n } from 'vue-i18n'

type Props = {
  title: string
  address: string
  icon: string
  iconClass?: string
  buttonClass?: string
  copied: boolean
  onCopy: () => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  iconClass: '',
  buttonClass: ''
})

const { t } = useI18n()
</script>

<template>
  <article class="group flex h-full flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-4 shadow-md ring-1 ring-zinc-200/70 dark:ring-zinc-800/70 transition hover:shadow-lg md:p-6">
    <header class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined [font-variation-settings:'FILL'_0,'wght'_500,'GRAD'_0,'opsz'_24]" :class="iconClass" aria-hidden="true">{{ icon }}</span>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
      </div>
    </header>
    <p class="mb-4 break-all font-mono text-base text-gray-900 dark:text-gray-100">
      <span class="underline decoration-gray-400 dark:decoration-gray-500 underline-offset-4 hover:decoration-emerald-500 dark:hover:decoration-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900">
        {{ address }}
      </span>
    </p>
    <div class="mt-auto flex items-center gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 active:scale-[0.98]"
        :class="buttonClass"
        :aria-label="t('server.connect.copy_aria', { address })"
        @click="onCopy"
      >
        <span class="material-symbols-outlined text-xl [font-variation-settings:'FILL'_0,'wght'_500,'GRAD'_0,'opsz'_24]" v-if="!copied" aria-hidden="true">content_copy</span>
        <span class="material-symbols-outlined text-xl [font-variation-settings:'FILL'_0,'wght'_500,'GRAD'_0,'opsz'_24]" v-else aria-hidden="true">check</span>
        <span v-if="!copied">{{ t('server.connect.copy') }}</span>
        <span v-else>{{ t('server.connect.copied') }}</span>
      </button>
      <!-- SR-only live region -->
      <span class="sr-only" aria-live="polite">{{ copied ? t('server.connect.copied') : '' }}</span>
    </div>
  </article>
</template>
