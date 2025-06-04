<script setup lang="ts">
import { useProjectStatus } from '~/composables/useProjectStatus';

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

// Import project status utilities
const { getStatusTranslationKey } = useProjectStatus();
</script>

<template>
  <header 
    class="relative" 
    role="banner" 
    aria-labelledby="project-title"
  >
    <!-- Project Image or Fallback -->
    <div 
      class="h-64 md:h-96 bg-primary-container dark:bg-primary-container-dark overflow-hidden"
      role="img"
      :aria-label="$t('projects.project_image_of', { name: project.name })"
    >
      <NuxtImg 
        v-if="project.image" 
        :src="project.image" 
        :alt="`${project.name} - ${project.description}`"
        class="w-full h-full object-cover"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw"
        width="1920"
        height="1080"
        format="webp"
        quality="80"
        loading="eager"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-4xl font-bold text-on-primary-container dark:text-on-primary-container-dark">{{ project.name }}</span>
      </div>
    </div>

    <!-- Project Title and Description -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 
        id="project-title" 
        class="text-4xl md:text-5xl font-bold text-on-surface dark:text-on-surface-dark mb-4"
      >
        {{ project.name }}
      </h1>
      <p class="text-xl text-on-surface-variant dark:text-on-surface-variant-dark max-w-4xl">
        {{ project.description }}
      </p>

      <!-- Status and GitHub Link -->
      <div class="flex flex-wrap gap-4 mt-6">
        <div 
          class="inline-flex items-center px-4 py-2 rounded-full bg-primary-container dark:bg-primary-container-dark text-on-primary-container dark:text-on-primary-container-dark"
          role="status"
          :aria-label="$t('projects.status') + ': ' + $t(`projects.status.${getStatusTranslationKey(project.status)}`)"
        >
          <span class="font-medium">{{ $t('projects.status') }}:</span>
          <span class="ml-2">{{ $t(`projects.status.${getStatusTranslationKey(project.status)}`) }}</span>
        </div>

        <a 
          v-if="project.github" 
          :href="project.github" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="inline-flex items-center px-4 py-2 rounded-full bg-surface-variant dark:bg-surface-variant-dark text-on-surface-variant dark:text-on-surface-variant-dark hover:bg-primary hover:text-on-primary transition-colors"
          :aria-label="$t('projects.view_project_on_github', { name: project.name })"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
          </svg>
          {{ $t('projects.view_on_github') }}
        </a>
      </div>
    </div>
  </header>
</template>
