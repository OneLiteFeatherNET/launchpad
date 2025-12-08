<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NuxtLink } from '#components'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

type Props = {
  name: string
  role: string
  slogan?: string
  mcName?: string
  avatarUrl?: string
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  slogan: undefined,
  mcName: undefined,
  avatarUrl: undefined,
  href: undefined
})

const { t } = useI18n()

const profileHref = computed(() => props.href || (props.mcName ? `/team/${encodeURIComponent(props.mcName.toLowerCase())}` : undefined))

const avatarSrc = computed(() => {
  if (props.avatarUrl) return props.avatarUrl
  if (props.mcName) return `https://mc-heads.net/avatar/${encodeURIComponent(props.mcName)}/128`
  // Default to Steve's head for placeholder/empty slots
  return 'https://mc-heads.net/avatar/Steve/128'
})

const ariaLabel = computed(() => t('team.card_aria', { name: props.name, role: props.role }))
</script>

<template>
  <li class="snap-start shrink-0 w-72" role="listitem">
    <component
      :is="profileHref ? NuxtLink : 'div'"
      :to="profileHref"
      :aria-label="profileHref ? ariaLabel : undefined"
      class="group block h-full rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/80 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-zinc-900/60 hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div class="flex items-center gap-4">
        <img
          :src="avatarSrc"
          :alt="t('team.avatar_alt', { name })"
          width="64"
          height="64"
          class="h-16 w-16 rounded-xl ring-1 ring-black/5 dark:ring-white/5 object-cover bg-zinc-100 dark:bg-zinc-800"
          loading="lazy"
          decoding="async"
        />
        <div class="min-w-0">
          <h3 class="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{{ name }}</h3>
          <p class="truncate text-sm text-gray-600 dark:text-gray-400">{{ role }}</p>
        </div>
      </div>
      <p v-if="slogan" class="mt-3 line-clamp-3 text-sm text-gray-700 dark:text-gray-300">“{{ slogan }}”</p>
      <p v-if="profileHref" class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
        {{ t('team.view_profile') }}
        <FontAwesomeIcon :icon="faArrowUpRightFromSquare" class="h-3.5 w-3.5" aria-hidden="true" />
      </p>
    </component>
  </li>
  
</template>
