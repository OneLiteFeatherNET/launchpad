<script setup lang="ts">
import ProjectCard from './ProjectCard.vue'
import type { ProjectSummary } from '../types'

defineProps<{
  projects: ProjectSummary[]
}>()

const { t } = useI18n()

const emptyClass
  = 'rounded-large border border-dashed border-outline-variant p-8 text-center '
    + 'text-body-medium text-on-surface-variant'
</script>

<template>
  <div>
    <ul
      v-if="projects.length"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <li v-for="project in projects" :key="project.slug" class="relative">
        <ProjectCard :project="project" />
      </li>
    </ul>
    <p v-else :class="emptyClass">
      {{ t('projects.overview.empty') }}
    </p>
  </div>
</template>
