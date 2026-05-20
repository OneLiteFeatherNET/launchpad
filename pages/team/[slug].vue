<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGithub, faDiscord, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faGlobe, faLink } from '@fortawesome/free-solid-svg-icons'

const { t, locale } = useI18n()
const site = useSiteConfig()

const { member, avatarSrc } = useTeamProfile()

const linkIcons: Record<string, typeof faLink> = {
  github: faGithub,
  discord: faDiscord,
  linkedin: faLinkedinIn,
  website: faGlobe
}

const profileLinks = computed(() => {
  const links = (member.value?.links || {}) as Record<string, string>
  return Object.entries(links)
    .filter(([, href]) => Boolean(href))
    .map(([key, href]) => ({
      key,
      href,
      icon: linkIcons[key.toLowerCase()] || faLink
    }))
})

const rankLabel = computed(() => member.value?.rank ? t(`team.ranks.${member.value.rank}`) : null)

usePageSeo({
  title: member.value ? `${member.value.name} — OneLiteFeather` : t('team.profile_title_fallback'),
  description: member.value?.slogan || member.value?.role || t('team.profile_description_fallback'),
  image: member.value?.avatar || undefined,
  imageAlt: member.value ? t('team.avatar_alt', { name: member.value.name }) : undefined,
  schemaType: 'ProfilePage',
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}/` },
  { name: t('team.title'), url: `/${locale.value}/team` },
  { name: member.value?.name || t('team.title') }
])

// Person schema so the team member can earn its own knowledge panel.
// The stable `@id` is reused by Article.author across every blog post so
// Google can merge the entities into one identity in its graph.
useSchemaOrg(() => {
  if (!member.value) return []
  const profileUrl = member.value.slug
    ? personProfileUrl(site.url, locale.value, member.value.slug)
    : new URL(`/${locale.value}/team/`, site.url).toString()
  const avatar = avatarSrc.value?.startsWith('http')
    ? avatarSrc.value
    : new URL(avatarSrc.value || '/favicon.svg', site.url).toString()
  return [
    {
      '@type': 'Person',
      '@id': member.value.slug ? personId(site.url, member.value.slug) : undefined,
      name: member.value.name,
      url: profileUrl,
      image: avatar,
      jobTitle: member.value.role || undefined,
      description: member.value.slogan || member.value.role || undefined,
      worksFor: { '@id': organizationId(site.url) }
    }
  ]
})
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-10">
    <NuxtLink
      :to="`/${locale}/team`"
      class="text-sm text-primary dark:text-primary/80 hover:underline"
      :aria-label="$t('navigation.back_team')"
    >
      ← {{ $t('navigation.team') }}
    </NuxtLink>
    <div v-if="member" class="mt-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/80 p-6 md:p-8">
      <div class="flex items-start gap-5">
        <NuxtImg
          :src="avatarSrc"
          :alt="t('team.avatar_alt', { name: member.name })"
          width="96"
          height="96"
          fit="cover"
          format="avif,webp"
          quality="80"
          densities="x1 x2"
          class="h-24 w-24 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 object-cover"
        />
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{{ member.name }}</h1>
            <span
              v-if="rankLabel"
              class="rounded-full bg-brand-100 dark:bg-brand-900/40 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:text-brand-300"
            >{{ rankLabel }}</span>
          </div>
          <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">{{ member.role }}</p>
          <p v-if="member.slogan" class="mt-2 text-gray-700 dark:text-gray-300">"{{ member.slogan }}"</p>
          <p v-if="member.since" class="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {{ t('team.member_since', { year: member.since }) }}
          </p>
        </div>
      </div>

      <div v-if="member.bio" class="mt-6 prose dark:prose-invert max-w-none">
        <p>{{ member.bio }}</p>
      </div>

      <div v-if="profileLinks.length" class="mt-6 flex flex-wrap gap-3">
        <a
          v-for="link in profileLinks"
          :key="link.key"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg border border-zinc-200/70 dark:border-zinc-800/80 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          :aria-label="t('team.profile_link_aria', { name: member.name, platform: link.key })"
        >
          <FontAwesomeIcon :icon="link.icon" class="h-4 w-4" aria-hidden="true" />
          <span class="capitalize">{{ link.key }}</span>
        </a>
      </div>
    </div>

    <div v-else class="mt-10 text-center text-gray-700 dark:text-gray-300">
      <p>{{ $t('team.profile_not_found') }}</p>
    </div>
  </main>
</template>
