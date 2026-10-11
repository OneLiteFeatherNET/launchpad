<script setup lang="ts">
import { computed } from 'vue'
import { PROJECT_AUDIENCES } from '../types'
import {
  EMPTY_PROJECT_FILTER,
  isProjectFilterActive,
  togglePlatform,
  type PlatformFacet,
  type ProjectAudienceFilter,
  type ProjectFilter,
} from '../utils/projectFilter'

const props = defineProps<{
  filter: ProjectFilter
  facets: PlatformFacet[]
  shown: number
  total: number
}>()

const emit = defineEmits<{
  'update:filter': [filter: ProjectFilter]
}>()

const { t } = useI18n()

const audienceOptions = computed<Array<{ value: ProjectAudienceFilter, label: string }>>(() => [
  { value: 'all', label: t('projects.filter.audience.all') },
  ...PROJECT_AUDIENCES.map((audience) => ({
    value: audience,
    label: t(`projects.audience.label.${audience}`),
  })),
])

const active = computed(() => isProjectFilterActive(props.filter))

const chooseAudience = (audience: ProjectAudienceFilter) => {
  emit('update:filter', { ...props.filter, audience })
}

const choosePlatform = (platform: string) => {
  emit('update:filter', togglePlatform(props.filter, platform))
}

const reset = () => {
  emit('update:filter', EMPTY_PROJECT_FILTER)
}

const rowClass = 'flex flex-wrap items-center gap-2'
const labelClass = 'mr-1 text-label-large text-on-surface-variant'
</script>

<template>
  <div class="space-y-4">
    <div role="group" :aria-label="t('projects.filter.audience_label')" :class="rowClass">
      <span :class="labelClass" aria-hidden="true">{{ t('projects.filter.audience_label') }}</span>
      <M3Chip
        v-for="option in audienceOptions"
        :key="option.value"
        kind="filter"
        :label="option.label"
        :selected="filter.audience === option.value"
        @click="chooseAudience(option.value)"
      />
    </div>

    <div
      v-if="facets.length"
      role="group"
      :aria-label="t('projects.filter.platform_label')"
      :class="rowClass"
    >
      <span :class="labelClass" aria-hidden="true">{{ t('projects.filter.platform_label') }}</span>
      <M3Chip
        v-for="facet in facets"
        :key="facet.platform"
        kind="filter"
        :label="`${facet.platform} (${facet.count})`"
        :selected="filter.platforms.includes(facet.platform)"
        @click="choosePlatform(facet.platform)"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" class="text-body-medium text-on-surface-variant">
        {{ t('projects.filter.count', { shown, total }) }}
      </p>
      <M3Button v-if="active" variant="text" @click="reset">
        {{ t('projects.filter.reset') }}
      </M3Button>
    </div>
  </div>
</template>
