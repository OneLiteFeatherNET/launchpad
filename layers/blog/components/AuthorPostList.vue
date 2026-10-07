<script setup lang="ts">
defineProps<{
  title: string
  posts: { slug: string, title: string, pubDate: Date | string }[]
}>()

const { locale, d } = useI18n()
</script>

<template>
  <section>
    <h2 class="text-title-large font-bold text-on-surface">{{ title }}</h2>
    <ul class="mt-3 space-y-2">
      <li v-for="post in posts" :key="post.slug" class="flex flex-wrap items-baseline gap-x-3">
        <NuxtLink
          :to="`/${locale}/blog/${post.slug}`"
          class="text-body-large text-primary hover:underline focus-ring"
        >
          {{ post.title }}
        </NuxtLink>
        <time
          class="text-body-small text-on-surface-variant"
          :datetime="new Date(post.pubDate).toISOString()"
        >
          {{ d(new Date(post.pubDate)) }}
        </time>
      </li>
    </ul>
  </section>
</template>
