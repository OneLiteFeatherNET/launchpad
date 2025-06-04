<script setup lang="ts">
import { computed } from 'vue';
import { useProjectStatus } from '~/composables/useProjectStatus';

const { locale, t } = useI18n();
const { getStatusColor, getStatusTranslationKey } = useProjectStatus();

// SEO optimization
definePageMeta({
  title: 'blog.projects.title',
});

// Set additional meta tags for SEO
useHead({
  meta: [
    { name: 'description', content: computed(() => t('blog.projects.description')) },
    // Open Graph tags for social media sharing
    { property: 'og:title', content: computed(() => t('blog.projects.title')) },
    { property: 'og:description', content: computed(() => t('blog.projects.description')) },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/logo.svg' },
    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: computed(() => t('blog.projects.title')) },
    { name: 'twitter:description', content: computed(() => t('blog.projects.description')) },
    { name: 'twitter:image', content: '/logo.svg' },
  ],
  link: [
    { rel: 'canonical', href: computed(() => `https://blog.onelitefeather.net/${locale.value === 'de' ? '' : locale.value}/projects`) }
  ]
});

// Fetch projects data based on current locale
const { data: projectsData } = await useAsyncData('projects-list', () => {
  const collection = locale.value === 'de' ? 'projects_de' : 'projects_en';
  return queryCollection(collection).first();
});

// Get all projects
const projects = computed(() => projectsData.value?.projects || []);

// Function to get Minecraft head URL
const getMinecraftHeadUrl = (username: string) => {
  return `https://mc-heads.net/avatar/${username}/100`;
};

// Function to get profile image URL
const getProfileImageUrl = (author: any) => {
  // If profileImage is provided, use it
  if (author.profileImage) {
    return author.profileImage;
  }

  // Otherwise use Minecraft head
  return getMinecraftHeadUrl(author.minecraftUsername);
};

</script>

<template>
  <div class="bg-white dark:bg-gray-900">
    <!-- Page Header -->
    <div class="bg-primary-container dark:bg-primary-container-dark py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl sm:text-4xl font-bold text-on-primary-container dark:text-on-primary-container-dark mb-2 sm:mb-4">
          {{ $t('blog.projects.title') }}
        </h1>
        <p class="text-lg sm:text-xl text-on-primary-container dark:text-on-primary-container-dark max-w-4xl">
          {{ $t('blog.projects.description') }}
        </p>
      </div>
    </div>

    <!-- Projects Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div class="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-surface-variant -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory" style="-webkit-overflow-scrolling: touch;">
        <div 
          v-for="(project, index) in projects" 
          :key="index"
          class="bg-surface dark:bg-surface-dark rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex-shrink-0 w-[85%] sm:w-[70%] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] mr-4 snap-start"
        >
          <NuxtLinkLocale :to="`/projects/${project.namespace}:${project.key}`" class="block">
            <div class="relative h-48 overflow-hidden">
              <NuxtImg 
                v-if="project.image" 
                :src="project.image" 
                :alt="project.name"
                class="w-full h-full object-cover"
                sizes="xs:85vw sm:70vw md:50vw lg:33vw xl:33vw"
                width="800"
                height="400"
                format="webp"
                quality="80"
                loading="lazy"
              />
              <div v-else class="w-full h-full bg-primary-container dark:bg-primary-container-dark flex items-center justify-center">
                <span class="text-2xl font-bold text-on-primary-container dark:text-on-primary-container-dark">{{ project.name }}</span>
              </div>

              <!-- Status badge -->
              <div 
                :class="[
                  'absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium',
                  `bg-${getStatusColor(project.status)}-container dark:bg-${getStatusColor(project.status)}-container-dark`,
                  `text-on-${getStatusColor(project.status)}-container dark:text-on-${getStatusColor(project.status)}-container-dark`
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

            <div class="p-4 sm:p-6">
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
                    v-for="(author, authorIndex) in project.authors.slice(0, 3)" 
                    :key="authorIndex"
                    class="flex items-center"
                  >
                    <NuxtImg 
                      :src="getProfileImageUrl(author)" 
                      :alt="`${author.name}'s profile picture`"
                      class="w-6 h-6 rounded-full mr-1"
                      sizes="24px"
                      width="24"
                      height="24"
                      format="webp"
                      quality="80"
                      loading="lazy"
                    />
                    <span class="text-sm text-on-surface-variant dark:text-on-surface-variant-dark">{{ author.name }}</span>
                    <span v-if="authorIndex < project.authors.length - 1 && authorIndex < 2" class="mx-1 text-on-surface-variant dark:text-on-surface-variant-dark">,</span>
                  </div>
                  <span v-if="project.authors.length > 3" class="text-sm text-on-surface-variant dark:text-on-surface-variant-dark">
                    {{ $t('projects.and_more', { count: project.authors.length - 3 }) }}
                  </span>
                </div>
              </div>
            </div>
          </NuxtLinkLocale>
        </div>
      </div>
    </div>
  </div>
</template>
