<script setup lang="ts">
import { computed, ref, watch } from '#imports'
import ProjectStatusBadge from './ProjectStatusBadge.vue'
import type { ProjectSummary } from '../types'

const props = defineProps<{
  project: ProjectSummary
}>()

// The logo can be declared and still not arrive; fall back to the placeholder
// instead of the browser's broken-image glyph.
const logoFailed = ref(false)

watch(() => props.project.logo, () => {
  logoFailed.value = false
})

const { locale, t } = useI18n()

const href = computed(() => `/${locale.value}/projects/${props.project.slug}`)
const platforms = computed(() => (props.project.platforms ?? []).join(', '))
const detailAria = computed(() => t('projects.card.open_detail', { title: props.project.title }))

const logoClass = 'size-16 shrink-0 rounded-medium object-contain'
const placeholderClass
  = 'flex size-16 shrink-0 items-center justify-center rounded-medium '
    + 'bg-surface-container-highest text-on-surface-variant'
</script>

<template>
  <!-- One link per card: the title's, stretched over the whole card. -->
  <M3Card as="article" variant="outlined" interactive class="h-full">
    <div class="flex flex-1 flex-col gap-3">
      <div class="flex items-start justify-between gap-3">
        <NuxtPicture
          v-if="project.logo && !logoFailed"
          :src="project.logo"
          :alt="project.logoAlt ?? ''"
          width="64"
          height="64"
          fit="contain"
          loading="lazy"
          :img-attrs="{ class: logoClass }"
          format="avif,webp"
          @error="logoFailed = true"
        />
        <div v-else :class="placeholderClass">
          <IconFa :icon="['fas', 'code']" class="size-7" aria-hidden="true" />
        </div>
        <ProjectStatusBadge :status="project.status" />
      </div>

      <h3 class="text-title-large text-on-surface">
        <M3CardLink :to="href" :aria-label="detailAria">
          {{ project.title }}
        </M3CardLink>
      </h3>

      <p class="line-clamp-4 text-body-medium text-on-surface-variant">
        {{ project.summary }}
      </p>

      <p v-if="platforms" class="mt-auto pt-2 text-label-medium text-on-surface-variant">
        {{ platforms }}
      </p>
    </div>
  </M3Card>
</template>
