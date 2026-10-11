<script setup lang="ts">
/**
 * `::gallery` with its images as YAML props:
 *
 *     ::gallery
 *     ---
 *     images:
 *       - src: /images/community-poi/yggdrasil/krone-innen.webp
 *         alt: "Huts inside the canopy"
 *         width: 1600
 *         height: 841
 *     ---
 *     ::
 *
 * A thin wrapper over the base MediaGallery: the block name is the only part
 * authors see, and the label falls back to a translated default.
 */
defineProps<{
  images: { src: string, alt: string, caption?: string, width?: number, height?: number }[]
  label?: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="not-prose my-6">
    <MediaGallery :images="images" :label="label || t('mdc.gallery.label')" />
  </div>
</template>
