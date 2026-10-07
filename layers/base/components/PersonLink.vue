<script setup lang="ts">
defineProps<{
  name: string
  to: string
  avatar?: string
  role?: string
}>()
</script>

<template>
  <div class="flex items-center gap-3">
    <NuxtImg
      v-if="avatar"
      :src="avatar"
      :alt="name"
      width="48"
      height="48"
      class="h-12 w-12 shrink-0 rounded-full border border-outline-variant object-cover"
      format="webp"
    />
    <div>
      <NuxtLink :to="to" class="text-label-large text-on-surface hover:underline focus-ring">
        {{ name }}
      </NuxtLink>
      <p v-if="role" class="text-label-small text-on-surface-variant">{{ role }}</p>
    </div>
  </div>
</template>
