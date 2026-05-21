<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faGithub,
  faDiscord,
  faLinkedinIn,
  faXTwitter,
  faTwitter,
  faMastodon,
  faBluesky,
  faYoutube,
  faTwitch,
  faInstagram,
  faTiktok
} from '@fortawesome/free-brands-svg-icons'
import { faGlobe, faLink, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import UiChip from '~/components/base/Chip.vue'
import { toRoleList, toRoleString } from '~/utils/teamRoles'

const { t, locale } = useI18n()
const site = useSiteConfig()

const { member, avatarSrc } = await useTeamProfile()

const memberRoles = computed(() => toRoleList(member.value?.role))
const memberRoleText = computed(() => toRoleString(member.value?.role))

// Free-form `links` keys map to recognised brand icons; anything unknown
// falls back to a generic chain glyph. Keys are matched case-insensitively
// so the team JSON can use "GitHub"/"github" interchangeably.
const linkIcons: Record<string, typeof faLink> = {
  github: faGithub,
  discord: faDiscord,
  linkedin: faLinkedinIn,
  twitter: faTwitter,
  x: faXTwitter,
  mastodon: faMastodon,
  bluesky: faBluesky,
  youtube: faYoutube,
  twitch: faTwitch,
  instagram: faInstagram,
  tiktok: faTiktok,
  website: faGlobe,
  homepage: faGlobe,
  blog: faGlobe,
  email: faEnvelope,
  mail: faEnvelope
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

// Bio first (full description), then slogan, then role list as fallback.
// `image` uses the Cloudflare-rendered avatar so social previews show the
// player's head instead of the synthetic OG fallback.
usePageSeo({
  title: member.value ? member.value.name : t('team.profile_title_fallback'),
  description: member.value?.bio
    || member.value?.slogan
    || memberRoleText.value
    || t('team.profile_description_fallback'),
  image: avatarSrc.value && avatarSrc.value !== '/favicon.svg' ? avatarSrc.value : undefined,
  imageAlt: member.value ? t('team.avatar_alt', { name: member.value.name }) : undefined,
  ogType: 'profile',
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
      jobTitle: memberRoleText.value || undefined,
      description: member.value.bio || member.value.slogan || memberRoleText.value || undefined,
      sameAs: Object.values((member.value.links || {}) as Record<string, string>).filter(Boolean),
      worksFor: { '@id': organizationId(site.url) }
    }
  ]
})

// Custom OG image that puts the Minecraft head, the actual member name
// and their bio into the social preview, instead of the generic NuxtSeo
// banner that `usePageSeo` registers by default. Called after
// `usePageSeo` so the second `defineOgImage` call wins.
if (member.value) {
  const ogDescription = member.value.bio
    || member.value.slogan
    || memberRoleText.value
    || ''
  // Use the 3D-rendered head from mc-heads.net for the OG image — it
  // reads better at OG card sizes than the flat avatar. Satori fetches
  // this absolute URL at render time.
  const mcId = member.value.mcName || member.value.slug || 'Steve'
  const ogAvatar = member.value.avatarUrl
    || `https://mc-heads.net/head/${encodeURIComponent(mcId)}/256`
  defineOgImage('TeamMember', {
    name: member.value.name,
    description: ogDescription,
    roleText: memberRoleText.value || undefined,
    rankLabel: rankLabel.value || undefined,
    avatarUrl: ogAvatar
  })
}
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
          <div v-if="memberRoles.length" class="mt-2 flex flex-wrap gap-2">
            <UiChip
              v-for="chip in memberRoles"
              :key="chip"
              :label="chip"
              variant="outlined"
              as="span"
            />
          </div>
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
