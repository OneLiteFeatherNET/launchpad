<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()

const slug = computed(() => route.params.slug as string)

// Load team data for current locale
const { data: teamData } = await useAsyncData(() => `team-profile-${locale.value}`, () => {
  // @ts-ignore provided by @nuxt/content
  return queryCollection('team_' + (locale?.value || 'de')).all()
}, { watch: [locale] })

const member = computed(() => {
  const doc = teamData.value?.[0] as { members?: any[] } | undefined
  const list = doc?.members || []
  return list.find((m: any) => m.slug === slug.value) || null
})

const avatarSrc = computed(() => {
  const m = member.value
  if (!m) return '/favicon.ico'
  if (m.avatarUrl) return m.avatarUrl
  if (m.mcName) return `https://mc-heads.net/avatar/${encodeURIComponent(m.mcName)}/256`
  return '/favicon.ico'
})

useHead(() => ({
  title: member.value ? `${member.value.name} — OneLiteFeather` : 'Team — OneLiteFeather',
  meta: [
    { name: 'description', content: member.value?.slogan || member.value?.role || 'Team profile' }
  ]
}))
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-10">
    <NuxtLink
      to="/"
      class="text-sm text-brand-600 dark:text-brand-400 hover:underline"
      :aria-label="$t('navigation.back_home')"
    >
      ← {{ $t('navigation.home') }}
    </NuxtLink>
    <div v-if="member" class="mt-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/80 p-6 md:p-8">
      <div class="flex items-start gap-5">
        <img :src="avatarSrc" :alt="t('team.avatar_alt', { name: member.name })" width="96" height="96" class="h-24 w-24 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 object-cover" />
        <div>
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{{ member.name }}</h1>
          <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">{{ member.role }}</p>
          <p v-if="member.slogan" class="mt-2 text-gray-700 dark:text-gray-300">“{{ member.slogan }}”</p>
        </div>
      </div>

      <div class="mt-6 prose dark:prose-invert max-w-none">
        <p>
          {{ $t('TDB') }}: Weitere Inhalte zum Profil folgen. Geplant sind u. a. Verknüpfungen zu Blog‑Beiträgen und Projekten.
        </p>
      </div>
    </div>

    <div v-else class="mt-10 text-center text-gray-700 dark:text-gray-300">
      <p>{{ $t('team.profile_not_found') }}</p>
    </div>
  </main>
</template>
