<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/** `href` is decided by the page: this layer knows no other domain. */
type Supporter = { name: string, image: string | null, href: string }

defineProps<{ supporters: Supporter[] }>()

const { t } = useI18n()

// Avatars are already sized by Open Collective, and the Cloudflare resizer
// answers 403 for that origin, so they are shown unprocessed.
const failedAvatars = reactive(new Set<string>())

const avatarClass
  = 'flex size-12 shrink-0 items-center justify-center rounded-medium bg-primary-container '
    + 'text-title-large font-bold text-on-primary-container'
</script>

<template>
  <section
    v-if="supporters.length"
    aria-labelledby="team-supporters-title"
    class="mt-8"
  >
    <SectionHeading id="team-supporters-title" :level="3" :anchor="false">
      {{ t('team.supporters.title') }}
    </SectionHeading>
    <p class="mt-2 max-w-2xl text-body-medium text-on-surface-variant">
      {{ t('team.supporters.intro') }}
    </p>
    <ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="supporter in supporters" :key="supporter.href">
        <M3Card variant="outlined" interactive class="h-full">
          <div class="flex items-center gap-3">
            <img
              v-if="supporter.image && !failedAvatars.has(supporter.href)"
              :src="supporter.image"
              alt=""
              width="48"
              height="48"
              class="size-12 shrink-0 rounded-medium bg-surface-container-highest object-cover"
              loading="lazy"
              decoding="async"
              @error="failedAvatars.add(supporter.href)"
            >
            <span v-else :class="avatarClass" aria-hidden="true">
              {{ supporter.name.charAt(0).toUpperCase() }}
            </span>
            <p class="min-w-0 truncate text-title-medium text-on-surface">
              <M3CardLink
                :to="supporter.href"
                :aria-label="t('team.supporters.link_aria', { name: supporter.name })"
              >
                {{ supporter.name }}
              </M3CardLink>
            </p>
          </div>
        </M3Card>
      </li>
    </ul>
  </section>
</template>
