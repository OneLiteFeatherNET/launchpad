<script setup lang="ts">
import { computed } from '#imports'
import IconFa from '~/components/base/icons/IconFa.vue'
import { useAnalytics } from '~/composables/useAnalytics'

type PlatformKey = 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email'

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isLargePage: {
    type: Boolean,
    default: false
  }
})

const { trackShare } = useAnalytics()

const trackShareEvent = (platform: PlatformKey) => {
  trackShare(platform, {
    url: props.url,
    title: props.title,
    description: props.description,
    isLargePage: props.isLargePage
  })
}

const getShareUrl = (baseUrl: string, platform: PlatformKey) => {
  if (props.isLargePage) {
    return `${baseUrl}?utm_source=${platform}&utm_medium=social&utm_campaign=share`
  }
  return baseUrl
}

const platforms = computed(() => {
  const facebook = getShareUrl(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`,
    'facebook'
  )
  const twitter = getShareUrl(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.title)}`,
    'twitter'
  )
  const linkedin = getShareUrl(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.url)}`,
    'linkedin'
  )
  const whatsapp = getShareUrl(
    `https://wa.me/?text=${encodeURIComponent(`${props.title} ${props.url}`)}`,
    'whatsapp'
  )
  const email = getShareUrl(
    `mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(`${props.description}\n\n${props.url}`)}`,
    'email'
  )

  return [
    {
      key: 'facebook' as PlatformKey,
      labelKey: 'article.share_on_facebook',
      href: facebook,
      icon: ['fab', 'facebook-f'] as const,
      class: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      target: '_blank' as const
    },
    {
      key: 'twitter' as PlatformKey,
      labelKey: 'article.share_on_twitter',
      href: twitter,
      icon: ['fab', 'twitter'] as const,
      class: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-400',
      target: '_blank' as const
    },
    {
      key: 'linkedin' as PlatformKey,
      labelKey: 'article.share_on_linkedin',
      href: linkedin,
      icon: ['fab', 'linkedin-in'] as const,
      class: 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600',
      target: '_blank' as const
    },
    {
      key: 'whatsapp' as PlatformKey,
      labelKey: 'article.share_on_whatsapp',
      href: whatsapp,
      icon: ['fab', 'whatsapp'] as const,
      class: 'bg-green-500 hover:bg-green-600 focus:ring-green-400',
      target: '_blank' as const
    },
    {
      key: 'email' as PlatformKey,
      labelKey: 'article.share_by_email',
      href: email,
      icon: ['fas', 'envelope'] as const,
      class: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
      target: undefined
    }
  ]
})
</script>

<template>
  <div class="social-media-share">
    <h3 class="text-lg font-bold mb-3 dark:text-white">{{ $t('article.share') }}</h3>
    <div class="flex space-x-3">
      <a
        v-for="platform in platforms"
        :key="platform.key"
        :href="platform.href"
        :target="platform.target"
        :rel="platform.target === '_blank' ? 'noopener noreferrer' : undefined"
        class="social-button focus:ring-2 focus:outline-none"
        :class="platform.class"
        :aria-label="$t(platform.labelKey)"
        :data-ph-capture-attribute-platform="platform.key"
        @click="trackShareEvent(platform.key)"
      >
        <IconFa :icon="platform.icon" class="h-6 w-6" aria-hidden="true" />
      </a>
    </div>
  </div>
</template>

<style scoped>
.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  /* Ensure perfect circle on very small screens */
  border-radius: 9999px;
  box-sizing: border-box;
  padding: 0;
  /* Prevent flexbox from shrinking the button into an oval on tiny viewports */
  flex: 0 0 auto;
  color: white;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.social-button:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  transform: translateY(-1px);
}

.social-button:active {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transform: translateY(0);
}
</style>
