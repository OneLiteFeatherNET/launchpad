<script setup lang="ts">
import type { Person } from '../types'

const props = defineProps<{ person: Person }>()
const { t } = useI18n()

const links = computed(() => Object.entries(props.person.links ?? {})
  .map(([key, href]) => ({ key, href: toSafeExternalUrl(href) }))
  .filter((link): link is { key: string, href: string } => link.href !== null))
</script>

<template>
  <M3Card as="section" variant="outlined" :aria-label="person.name">
    <div class="flex items-start gap-4">
      <NuxtImg
        v-if="person.avatar"
        :src="person.avatar"
        :alt="person.name"
        width="96"
        height="96"
        class="h-24 w-24 shrink-0 rounded-full border border-outline-variant object-cover"
        format="webp"
      />
      <div>
        <h2 class="text-headline-medium font-bold text-on-surface">{{ person.name }}</h2>
        <p v-if="person.role" class="text-label-large text-on-surface-variant">{{ person.role }}</p>
        <template v-if="person.kind === 'external'">
          <p v-if="person.bio" class="mt-3 text-body-large text-on-surface">{{ person.bio }}</p>
          <div v-if="links.length" class="mt-3 flex flex-wrap gap-2">
            <M3Chip
              v-for="link in links"
              :key="link.key"
              :label="link.key"
              :href="link.href"
              target="_blank"
              kind="assist"
              class="capitalize"
            />
          </div>
        </template>
        <M3Button
          v-else
          class="mt-3"
          variant="outlined"
          :to="person.profilePath"
        >
          {{ t('blog.author.profile') }}
        </M3Button>
      </div>
    </div>
  </M3Card>
</template>
