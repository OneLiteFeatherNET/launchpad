<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NuxtLink } from '#components'

/**
 * One member as this component needs to draw it. Deliberately not `TeamMember`
 * from the team layer: importing that type would put the blog layer back into
 * a domain it must not know, and the component uses four fields of it.
 *
 * The page resolves slugs, avatars and role labels — it sits at the root and
 * may know both layers. What arrives here is finished presentation data.
 */
export type FeaturedMember = {
  slug: string
  name: string
  avatarUrl: string
  /** Already formatted; empty string renders no role line. */
  role: string
}

const props = defineProps<{ members: FeaturedMember[] }>()

const { t, locale } = useI18n()

/** A person link: avatar, name and role; outlined with the design system's state layer. */
const memberLinkClass
  = 'inline-flex items-center gap-3 rounded-medium border border-outline-variant px-3 py-2 '
    + 'state-layer focus-ring'
</script>

<template>
  <section
    v-if="props.members.length"
    class="mt-8 border-t border-outline-variant pt-6"
    :aria-labelledby="'featured-team-heading'"
  >
    <h2
      id="featured-team-heading"
      class="text-label-large uppercase text-on-surface-variant"
    >
      {{ t('blog.featured_team') }}
    </h2>
    <ul class="mt-3 flex flex-wrap gap-3">
      <li v-for="m in props.members" :key="m.slug">
        <NuxtLink
          :to="`/${locale}/team/${m.slug}`"
          :class="memberLinkClass"
        >
          <NuxtImg
            :src="m.avatarUrl"
            :alt="t('team.avatar_alt', { name: m.name })"
            width="32"
            height="32"
            fit="cover"
            format="avif,webp"
            quality="80"
            densities="x1 x2"
            class="h-8 w-8 rounded-small object-cover"
            loading="lazy"
            decoding="async"
          />
          <span class="min-w-0">
            <span class="block text-label-large text-on-surface">{{ m.name }}</span>
            <span v-if="m.role" class="block text-label-small text-on-surface-variant">
              {{ m.role }}
            </span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
