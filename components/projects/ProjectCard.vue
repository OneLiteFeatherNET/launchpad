<script setup lang="ts">
import { computed } from 'vue';
import { useProjectStatus } from '~/composables/useProjectStatus';

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  locale: {
    type: String,
    required: true
  }
});

// Import project status utilities
const { getStatusColor, getStatusTranslationKey } = useProjectStatus();

// Function to get Minecraft head URL
const getMinecraftHeadUrl = (username?: string) => {
  return username ? `https://mc-heads.net/avatar/${username}/100` : '/images/authors/placeholder.svg';
};

// Get status color
const statusColor = computed(() => {
  return getStatusColor(props.project.status);
});
</script>

<template>
  <div class="bg-surface dark:bg-surface-dark rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
    <NuxtLinkLocale :to="`/projects/${project.namespace}:${project.key}`" class="block">
      <div class="relative h-48 overflow-hidden">
        <NuxtImg 
          :src="project.image || '/images/projects/placeholder.svg'" 
          :alt="project.name"
          class="w-full h-full object-cover"
          sizes="xs:100vw sm:100vw md:50vw lg:33vw xl:33vw"
          width="800"
          height="400"
          format="webp"
          quality="80"
          loading="lazy"
        />

        <!-- Status badge -->
        <div 
          :class="[
            'absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium',
            `bg-${statusColor}-container dark:bg-${statusColor}-container-dark`,
            `text-on-${statusColor}-container dark:text-on-${statusColor}-container-dark`
          ]"
        >
          {{ $t(`projects.status.${getStatusTranslationKey(project.status)}`) }}
        </div>

        <!-- Affiliate badge if applicable -->
        <div 
          v-if="project.isAffiliate"
          class="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-warning-container dark:bg-warning-container-dark text-on-warning-container dark:text-on-warning-container-dark"
        >
          {{ $t('projects.affiliate_link') }}
        </div>
      </div>

      <div class="p-6">
        <h3 class="text-xl font-bold text-on-surface dark:text-on-surface-dark mb-2">{{ project.name }}</h3>
        <p class="text-on-surface-variant dark:text-on-surface-variant-dark mb-4">{{ project.description }}</p>

        <!-- GitHub link -->
        <div v-if="project.github" class="mb-4">
          <a :href="project.github" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-primary dark:text-primary-dark hover:underline">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
            </svg>
            {{ $t('projects.view_on_github') }}
          </a>
        </div>

        <!-- Authors -->
        <div v-if="project.authors && project.authors.length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-on-surface-variant dark:text-on-surface-variant-dark mb-2">{{ $t('projects.authors') }}:</h4>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="(author, authorIndex) in project.authors" 
              :key="authorIndex"
              class="flex items-center bg-surface-variant dark:bg-surface-variant-dark rounded-full px-3 py-1"
            >
              <NuxtImg 
                :src="getMinecraftHeadUrl(author.minecraftUsername)" 
                :alt="`${author.name}'s avatar`"
                class="w-6 h-6 rounded-full mr-2"
                sizes="24px"
                width="24"
                height="24"
                format="webp"
                quality="80"
                loading="lazy"
              />
              <span class="text-sm text-on-surface-variant dark:text-on-surface-variant-dark">{{ author.name }}</span>
              <span v-if="author.role" class="text-xs text-on-surface-variant dark:text-on-surface-variant-dark ml-1 opacity-75">({{ author.role }})</span>
            </div>
          </div>
        </div>
      </div>
    </NuxtLinkLocale>
  </div>
</template>
