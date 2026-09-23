<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, inject, ref } from 'vue'
import { GUIDE_TABS_KEY, guideIcon } from '../utils/guideIcons'

/**
 * One guide inside an event's markdown, optionally for a role:
 *
 *     :::event-guide{role="Survivor" icon="person-running"}
 *     Collect all **8 pages** …
 *     :::
 *
 * On its own, or before the enclosing `::event-guides` has switched to tabs,
 * it carries its own heading. Once shown as a tab panel, the tab names it and
 * the heading would only repeat it.
 */
const props = defineProps<{
  role?: string
  icon?: string
}>()

const { t } = useI18n()
const inTabs = inject<Ref<boolean>>(GUIDE_TABS_KEY, ref(false))
const heading = computed(() => props.role || t('events.guides.title'))
</script>

<template>
  <section class="not-prose space-y-3">
    <h3 v-if="!inTabs" class="flex items-center gap-2 text-title-large text-on-surface">
      <IconFa :icon="guideIcon(icon)" class="size-5 text-primary" aria-hidden="true" />
      {{ heading }}
    </h3>
    <div class="prose prose-neutral max-w-none dark:prose-invert">
      <slot />
    </div>
  </section>
</template>
