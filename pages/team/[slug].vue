<script setup lang="ts">
import { computed } from 'vue';
import { useContentService } from '~/composables/content/useContentService';

const { locale, t } = useI18n();
const route = useRoute();
const slug = route.params.slug as string;
const localePath = useLocalePath();

// SEO optimization
definePageMeta({
  title: 'blog.team.member.title',
});

// Fetch team data based on current locale
const { data: teamData } = await useAsyncData(`team-${slug}`, () => {
  const collection = locale.value === 'de' ? 'team_de' : 'team_en';
  return queryCollection(collection).first();
});

// Find the team member by slug
const teamMember = computed(() => {
  const ranks = teamData.value?.ranks || [];
  for (const rank of ranks) {
    const member = rank.members.find(m => m.slug === slug);
    if (member) {
      return { ...member, rank: rank.name };
    }
  }
  return null;
});

// Check if an author exists for this team member
const contentService = useContentService('nuxtContent');
const authorCollection = `authors_${locale.value}`;
const { data: authorExists } = await useAsyncData(`author-exists-${slug}`, async () => {
  try {
    // First check if there's a standalone author with this slug
    const standaloneAuthor = await contentService.findBySlug(authorCollection, slug);
    if (standaloneAuthor) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error checking if author exists for ${slug}:`, error);
    return false;
  }
});

// If an author exists for this team member, redirect to the author page
if (authorExists.value) {
  navigateTo(localePath(`/authors/${slug}`));
}

// Fetch projects data to show member's projects
const { data: projectsData } = await useAsyncData(`projects-for-member-${slug}`, () => {
  const collection = locale.value === 'de' ? 'projects_de' : 'projects_en';
  return queryCollection(collection).first();
});

// Get projects where this member is an author
const memberProjects = computed(() => {
  const projects = projectsData.value?.projects || [];
  return projects.filter(project => 
    project.authors && project.authors.some(author => 
      author.name === teamMember.value?.name || 
      author.minecraftUsername === teamMember.value?.minecraftUsername
    )
  );
});

// Fetch blog posts data to show member's blog posts
const { data: blogPostsData } = await useAsyncData(`blog-posts-for-member-${slug}`, () => {
  const collection = locale.value === 'de' ? 'blog_de' : 'blog_en';
  return queryCollection(collection).first();
});

// Get blog posts where this member is an author
const memberBlogPosts = computed(() => {
  const posts = blogPostsData.value || [];
  return posts.filter(post => 
    post.schemaOrg && post.schemaOrg.some(schema => 
      schema.type === "BlogPosting" && 
      schema.author && 
      schema.author.name === teamMember.value?.name
    )
  );
});

// Redirect if team member not found
if (!teamMember.value) {
  navigateTo('/team');
}

// Function to get profile image URL
const getProfileImageUrl = computed(() => {
  if (!teamMember.value) return '';

  // If profileImage is provided, use it
  if (teamMember.value.profileImage) {
    return teamMember.value.profileImage;
  }

  // Otherwise use Minecraft head
  return `https://mc-heads.net/avatar/${teamMember.value.minecraftUsername}/200`;
});

// Set additional meta tags for SEO
useHead({
  meta: [
    { name: 'description', content: computed(() => teamMember.value?.bio || t('blog.team.member.description', { name: teamMember.value?.name })) },
    // Open Graph tags for social media sharing
    { property: 'og:title', content: computed(() => teamMember.value?.name || t('blog.team.member.title')) },
    { property: 'og:description', content: computed(() => teamMember.value?.bio || t('blog.team.member.description', { name: teamMember.value?.name })) },
    { property: 'og:type', content: 'profile' },
    { property: 'og:image', content: computed(() => getProfileImageUrl.value || '/logo.svg') },
    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: computed(() => teamMember.value?.name || t('blog.team.member.title')) },
    { name: 'twitter:description', content: computed(() => teamMember.value?.bio || t('blog.team.member.description', { name: teamMember.value?.name })) },
    { name: 'twitter:image', content: computed(() => getProfileImageUrl.value || '/logo.svg') },
  ],
  link: [
    { rel: 'canonical', href: computed(() => `https://blog.onelitefeather.net/${locale.value === 'de' ? '' : locale.value}/team/${slug}`) }
  ]
});
</script>

<template>
  <div v-if="teamMember" class="bg-white dark:bg-gray-900">
    <!-- Team Member Header -->
    <div class="py-16 px-4 sm:px-6 lg:px-8 bg-primary-container dark:bg-primary-container-dark">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
          <!-- Profile Image -->
          <div class="w-48 h-48 rounded-full overflow-hidden bg-surface dark:bg-surface-dark shadow-lg">
            <NuxtImg 
              :src="getProfileImageUrl" 
              :alt="teamMember.name" 
              class="w-full h-full object-cover"
              sizes="xs:192px sm:192px md:192px lg:192px xl:192px"
              width="200"
              height="200"
              format="webp"
              quality="80"
              loading="eager"
            />
          </div>

          <!-- Member Info -->
          <div class="text-center md:text-left">
            <h1 class="text-3xl font-bold text-on-primary-container dark:text-on-primary-container-dark">
              {{ teamMember.name }}
            </h1>
            <p class="mt-2 text-xl text-on-primary-container-variant dark:text-on-primary-container-variant-dark">
              {{ teamMember.rank }}
            </p>
            <p v-if="teamMember.quote" class="mt-4 text-lg italic text-on-primary-container-variant dark:text-on-primary-container-variant-dark">
              "{{ teamMember.quote }}"
            </p>
            <p class="mt-2 text-on-primary-container-variant dark:text-on-primary-container-variant-dark">
              {{ $t('team.member.joined') }}: {{ new Date(teamMember.joinDate).toLocaleDateString(locale) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Member Bio -->
    <div v-if="teamMember.bio" class="py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-bold text-on-surface dark:text-on-surface-dark mb-6">
          {{ $t('team.member.about') }}
        </h2>
        <div class="prose dark:prose-invert max-w-none">
          <p class="text-on-surface-variant dark:text-on-surface-variant-dark">
            {{ teamMember.bio }}
          </p>
        </div>
      </div>
    </div>

    <!-- Member's Projects -->
    <div v-if="memberProjects.length > 0" class="py-12 px-4 sm:px-6 lg:px-8 bg-surface-variant dark:bg-surface-variant-dark">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-bold text-on-surface-variant dark:text-on-surface-variant-dark mb-6">
          {{ $t('team.member.projects') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(project, index) in memberProjects" 
            :key="index"
            class="bg-surface dark:bg-surface-dark rounded-lg shadow-md overflow-hidden"
          >
            <NuxtLinkLocale :to="`/projects/${project.namespace}:${project.key}`" class="block">
              <div class="h-40 bg-primary-container dark:bg-primary-container-dark relative">
                <NuxtImg 
                  v-if="project.image" 
                  :src="project.image" 
                  :alt="project.name"
                  class="w-full h-full object-cover"
                  sizes="xs:100vw sm:100vw md:50vw lg:33vw xl:33vw"
                  width="800"
                  height="400"
                  format="webp"
                  quality="80"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-xl font-bold text-on-primary-container dark:text-on-primary-container-dark">{{ project.name }}</span>
                </div>

                <!-- Affiliate badge if applicable -->
                <div 
                  v-if="project.isAffiliate"
                  class="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-warning-container dark:bg-warning-container-dark text-on-warning-container dark:text-on-warning-container-dark"
                >
                  {{ $t('projects.affiliate_link') }}
                </div>
              </div>
              <div class="p-4">
                <h3 class="text-lg font-bold text-on-surface dark:text-on-surface-dark">{{ project.name }}</h3>
                <p class="text-sm text-on-surface-variant dark:text-on-surface-variant-dark mt-2">{{ project.description }}</p>
              </div>
            </NuxtLinkLocale>
          </div>
        </div>
      </div>
    </div>

    <!-- Member's Blog Posts -->
    <div v-if="memberBlogPosts.length > 0" class="py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-bold text-on-surface dark:text-on-surface-dark mb-6">
          {{ $t('team.member.blog_posts') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(post, index) in memberBlogPosts" 
            :key="index"
            class="bg-surface-variant dark:bg-surface-variant-dark rounded-lg shadow-md overflow-hidden"
          >
            <NuxtLinkLocale :to="`/blog/${post.slug}`" class="block">
              <div class="h-40 bg-primary-container dark:bg-primary-container-dark relative">
                <NuxtImg 
                  v-if="post.headerImage" 
                  :src="post.headerImage" 
                  :alt="post.title"
                  class="w-full h-full object-cover"
                  sizes="xs:100vw sm:100vw md:50vw lg:33vw xl:33vw"
                  width="800"
                  height="400"
                  format="webp"
                  quality="80"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-xl font-bold text-on-primary-container dark:text-on-primary-container-dark">{{ post.title }}</span>
                </div>
              </div>
              <div class="p-4">
                <h3 class="text-lg font-bold text-on-surface-variant dark:text-on-surface-variant-dark">{{ post.title }}</h3>
                <p class="text-sm text-on-surface-variant dark:text-on-surface-variant-dark mt-2">{{ post.description }}</p>
                <p class="text-xs text-on-surface-variant dark:text-on-surface-variant-dark mt-2 opacity-75">{{ post.pubDate }}</p>
              </div>
            </NuxtLinkLocale>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
