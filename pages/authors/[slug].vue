<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BackButton from '~/components/common/BackButton.vue';
import { useContentService } from '~/composables/content/useContentService';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const slug = route.params.slug as string;

// Fetch author data
const { data: author } = await useAsyncData(`author-${slug}`, async () => {
  try {
    const contentService = useContentService('nuxtContent');

    // First try to find the author in the standalone authors collection
    const authorCollection = `authors_${locale.value}`;
    const standaloneAuthor = await contentService.findBySlug(authorCollection, slug);

    if (standaloneAuthor) {
      return standaloneAuthor;
    }

    // If not found, try to find the author in the team collection
    const teamCollection = `team_${locale.value}`;
    const teamData = await contentService.queryFirst(teamCollection);
    if (teamData && teamData.ranks) {
      const allMembers = teamData.ranks.flatMap(rank => rank.members) || [];
      const teamMember = allMembers.find((member: any) => member.slug === slug);
      if (teamMember) {
        return teamMember;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error fetching author data for ${slug}:`, error);
    return null;
  }
});

// Fetch projects the author is involved in
const { data: authorProjects } = await useAsyncData(`author-projects-${slug}`, async () => {
  try {
    const contentService = useContentService('nuxtContent');
    const projectCollection = `projects_${locale.value}`;
    const projectsData = await contentService.queryFirst(projectCollection);
    const allProjects = projectsData?.projects || [];

    // Get the author's namespace and key
    const authorNamespace = author.value?.namespace || 'author';
    const authorKey = author.value?.key;

    if (!authorKey) {
      console.warn(`Author ${slug} does not have a key, cannot fetch projects`);
      return [];
    }

    return allProjects.filter((project: any) => {
      return project.authors && project.authors.some((a: any) => 
        a.namespace === authorNamespace && a.key === authorKey
      );
    });
  } catch (error) {
    console.error(`Error fetching projects for author ${slug}:`, error);
    return [];
  }
});

// Fetch blog posts by the author
const { data: authorPosts } = await useAsyncData(`author-posts-${slug}`, async () => {
  try {
    const contentService = useContentService('nuxtContent');
    const blogCollection = `blog_${locale.value}`;

    // Get the author's namespace and key
    const authorNamespace = author.value?.namespace || 'author';
    const authorKey = author.value?.key;

    if (!authorKey) {
      console.warn(`Author ${slug} does not have a key, cannot fetch blog posts`);
      return [];
    }

    // Query posts where the author reference matches the current author's namespace and key
    const allPosts = await contentService.queryAll(blogCollection);
    const posts = allPosts.filter((post: any) => 
      post.author && 
      post.author.namespace === authorNamespace && 
      post.author.key === authorKey
    );

    return posts;
  } catch (error) {
    console.error(`Error fetching blog posts for author ${slug}:`, error);
    return [];
  }
});

// Set page metadata
useHead({
  title: author.value ? author.value.name : t('author.not_found'),
  meta: [
    {
      name: 'description',
      content: author.value
        ? t('author.meta_description', { name: author.value.name })
        : t('author.not_found_description')
    }
  ]
});

// If author not found, return 404
if (!author.value) {
  throw createError({
    statusCode: 404,
    message: t('author.not_found'),
  });
}
</script>

<template>
  <div v-if="author" class="container mx-auto px-4 py-12">
    <BackButton />
    <div class="max-w-5xl mx-auto">
      <!-- Author Header -->
      <div class="bg-surface dark:bg-surface-dark rounded-lg shadow-md p-6 mb-8">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div class="flex-shrink-0">
            <NuxtImg
              v-if="author.avatar"
              :src="author.avatar"
              :alt="author.name"
              class="w-32 h-32 rounded-full object-cover"
              sizes="xs:128px sm:128px md:128px lg:128px xl:128px"
              width="128"
              height="128"
              format="webp"
              quality="80"
              loading="eager"
            />
            <div v-else class="w-32 h-32 rounded-full bg-surface-variant dark:bg-surface-variant-dark flex items-center justify-center">
              <span class="text-4xl text-on-surface-variant dark:text-on-surface-variant-dark">
                {{ author.name.charAt(0) }}
              </span>
            </div>
          </div>

          <div class="flex-1 text-center md:text-left">
            <h1 class="text-3xl font-bold text-on-surface dark:text-on-surface-dark mb-2">
              {{ author.name }}
            </h1>

            <p v-if="author.title" class="text-lg text-on-surface-variant dark:text-on-surface-variant-dark mb-4">
              {{ author.title }}
            </p>

            <div class="flex flex-wrap gap-4 justify-center md:justify-start">
              <a
                v-if="author.github"
                :href="`https://github.com/${author.github}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-primary dark:text-primary-dark hover:underline"
                :aria-label="$t('author.view_on_github', { name: author.name })"
              >
                <span>GitHub</span>
              </a>

              <a
                v-if="author.twitter"
                :href="`https://twitter.com/${author.twitter}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-primary dark:text-primary-dark hover:underline"
                :aria-label="$t('author.view_on_twitter', { name: author.name })"
              >
                <span>Twitter</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div v-if="author.about || author.bio" class="bg-surface dark:bg-surface-dark rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-bold text-on-surface dark:text-on-surface-dark mb-4">
          {{ $t('team.member.about') }}
        </h2>
        <p class="text-on-surface-variant dark:text-on-surface-variant-dark">
          {{ author.about || author.bio }}
        </p>
      </div>

      <!-- Projects Section -->
      <div v-if="authorProjects && authorProjects.length > 0" class="bg-surface dark:bg-surface-dark rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-bold text-on-surface dark:text-on-surface-dark mb-4">
          {{ $t('team.member.projects') }}
        </h2>

        <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li v-for="project in authorProjects" :key="project.namespace + ':' + project.key" class="border border-outline dark:border-outline-dark rounded-lg p-4">
            <NuxtLink :to="localePath(`/projects/${project.namespace}:${project.key}`)" class="block hover:underline">
              <h3 class="text-xl font-semibold text-on-surface dark:text-on-surface-dark">
                {{ project.name }}
              </h3>
              <p class="text-sm text-on-surface-variant dark:text-on-surface-variant-dark mt-2">
                {{ project.description }}
              </p>
              <!-- Affiliate link disclaimer -->
              <div v-if="project.isAffiliate" class="mt-2 text-sm text-warning dark:text-warning-dark">
                {{ $t('projects.affiliate_link') }}
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Blog Posts Section -->
      <div v-if="authorPosts && authorPosts.length > 0" class="bg-surface dark:bg-surface-dark rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-on-surface dark:text-on-surface-dark mb-4">
          {{ $t('team.member.blog_posts') }}
        </h2>

        <ul class="space-y-4">
          <li v-for="post in authorPosts" :key="post._path" class="border-b border-outline dark:border-outline-dark pb-4 last:border-b-0">
            <NuxtLink :to="localePath(post._path)" class="block hover:underline">
              <h3 class="text-xl font-semibold text-on-surface dark:text-on-surface-dark">
                {{ post.title }}
              </h3>
              <p class="text-sm text-on-surface-variant dark:text-on-surface-variant-dark mt-2">
                {{ post.description }}
              </p>
              <time
                :datetime="post.date"
                class="text-xs text-on-surface-variant dark:text-on-surface-variant-dark mt-2 block"
              >
                {{ new Date(post.date).toLocaleDateString() }}
              </time>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
