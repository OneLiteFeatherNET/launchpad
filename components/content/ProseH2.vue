<template>
  <h2 :id="props.id" class="text-2xl font-semibold mb-4 scroll-mt-24 break-words">
    <a
        v-if="props.id && generate"
        :href="`#${props.id}`"
        :aria-label="permalinkLabel"
        class="hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-sm break-words"
    >
      <slot />
    </a>
    <slot v-else />
  </h2>
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig, useI18n } from '#imports'

const props = defineProps<{ id?: string }>()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(() => props.id && ((typeof headings?.anchorLinks === 'boolean' && headings?.anchorLinks === true) || (typeof headings?.anchorLinks === 'object' && headings?.anchorLinks?.h2)))

const { t, te } = useI18n()
const permalinkLabel = computed(() => {
  const key = 'content.permalinkToHeading'
  return te(key) && props.id
    ? (t as any)(key, { id: props.id }) as string
    : `Permalink to heading ${props.id}`
})
</script>