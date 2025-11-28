<script setup lang="ts">
const { t } = useI18n()

const { member, avatarSrc } = useTeamProfile()

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
      class="text-sm text-primary dark:text-primary/80 hover:underline"
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
