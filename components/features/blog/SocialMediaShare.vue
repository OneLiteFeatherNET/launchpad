<script setup lang="ts">
import { computed, ref, onMounted } from '#imports'
import IconFa from '~/components/base/icons/IconFa.vue'
import { useAnalytics } from '~/composables/useAnalytics'

type PlatformKey = 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram' | 'bluesky' | 'mastodon' | 'reddit' | 'email' | 'copy' | 'native'

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
const { t } = useI18n()

const trackShareEvent = (platform: PlatformKey) => {
  trackShare(platform, {
    url: props.url,
    title: props.title,
    description: props.description,
    isLargePage: props.isLargePage
  })
}

const buildShareUrl = (baseUrl: string, platform: PlatformKey) => {
  if (props.isLargePage) {
    const sep = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${sep}utm_source=${platform}&utm_medium=social&utm_campaign=share`
  }
  return baseUrl
}

const encodedUrl = computed(() => encodeURIComponent(props.url))
const encodedTitle = computed(() => encodeURIComponent(props.title))

const platforms = computed(() => {
  const items = [
    {
      key: 'facebook' as PlatformKey,
      labelKey: 'article.share_on_facebook',
      href: buildShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`, 'facebook'),
      icon: ['fab', 'facebook-f'] as const,
      class: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    },
    {
      key: 'twitter' as PlatformKey,
      labelKey: 'article.share_on_twitter',
      // X (formerly Twitter) intent endpoint. The legacy twitter.com/intent/tweet still redirects,
      // but x.com/intent/post is the canonical form and avoids an extra hop.
      href: buildShareUrl(`https://x.com/intent/post?url=${encodedUrl.value}&text=${encodedTitle.value}`, 'twitter'),
      icon: ['fab', 'x-twitter'] as const,
      class: 'bg-black hover:bg-neutral-800 focus:ring-neutral-500'
    },
    {
      key: 'bluesky' as PlatformKey,
      labelKey: 'article.share_on_bluesky',
      href: buildShareUrl(`https://bsky.app/intent/compose?text=${encodedTitle.value}%20${encodedUrl.value}`, 'bluesky'),
      icon: ['fab', 'bluesky'] as const,
      class: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-400'
    },
    {
      key: 'linkedin' as PlatformKey,
      labelKey: 'article.share_on_linkedin',
      href: buildShareUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`, 'linkedin'),
      icon: ['fab', 'linkedin-in'] as const,
      class: 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600'
    },
    {
      key: 'telegram' as PlatformKey,
      labelKey: 'article.share_on_telegram',
      href: buildShareUrl(`https://t.me/share/url?url=${encodedUrl.value}&text=${encodedTitle.value}`, 'telegram'),
      icon: ['fab', 'telegram'] as const,
      class: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500'
    },
    {
      key: 'reddit' as PlatformKey,
      labelKey: 'article.share_on_reddit',
      href: buildShareUrl(`https://www.reddit.com/submit?url=${encodedUrl.value}&title=${encodedTitle.value}`, 'reddit'),
      icon: ['fab', 'reddit-alien'] as const,
      class: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
    },
    {
      key: 'whatsapp' as PlatformKey,
      labelKey: 'article.share_on_whatsapp',
      href: buildShareUrl(`https://wa.me/?text=${encodeURIComponent(`${props.title} ${props.url}`)}`, 'whatsapp'),
      icon: ['fab', 'whatsapp'] as const,
      class: 'bg-green-500 hover:bg-green-600 focus:ring-green-400'
    },
    {
      key: 'email' as PlatformKey,
      labelKey: 'article.share_by_email',
      href: `mailto:?subject=${encodedTitle.value}&body=${encodeURIComponent(`${props.description}\n\n${props.url}`)}`,
      icon: ['fas', 'envelope'] as const,
      class: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
    }
  ]
  return items
})

const copied = ref(false)
const canNativeShare = ref(false)
const copyButtonClass = 'bg-neutral-700 hover:bg-neutral-800 focus:ring-neutral-500'
const nativeButtonClass = 'bg-primary hover:opacity-90 focus:ring-primary'

onMounted(() => {
  canNativeShare.value = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
})

const copyLink = async () => {
  trackShareEvent('copy')
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.url)
    } else if (typeof document !== 'undefined') {
      const ta = document.createElement('textarea')
      ta.value = props.url
      ta.setAttribute('readonly', '')
      ta.style.position = 'absolute'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // ignore — clipboard permission denied, keep silent
  }
}

const nativeShare = async () => {
  trackShareEvent('native')
  try {
    await navigator.share({
      title: props.title,
      text: props.description || props.title,
      url: props.url
    })
  } catch {
    // user aborted or unsupported — ignore
  }
}
</script>

<template>
  <div class="social-media-share">
    <h3 class="text-lg font-bold mb-3 dark:text-white">{{ t('article.share') }}</h3>
    <div class="flex flex-wrap gap-3">
      <a
        v-for="platform in platforms"
        :key="platform.key"
        :href="platform.href"
        :target="platform.key === 'email' ? undefined : '_blank'"
        :rel="platform.key === 'email' ? undefined : 'noopener noreferrer'"
        class="social-button focus:ring-2 focus:outline-none"
        :class="platform.class"
        :aria-label="t(platform.labelKey)"
        :title="t(platform.labelKey)"
        :data-ph-capture-attribute-platform="platform.key"
        @click="trackShareEvent(platform.key)"
      >
        <IconFa :icon="platform.icon" class="h-5 w-5" aria-hidden="true" />
      </a>

      <button
        type="button"
        class="social-button focus:ring-2 focus:outline-none"
        :class="copyButtonClass"
        :aria-label="copied ? t('article.copied') : t('article.copy_link')"
        :title="copied ? t('article.copied') : t('article.copy_link')"
        data-ph-capture-attribute-platform="copy"
        @click="copyLink"
      >
        <IconFa
          :icon="copied ? ['fas', 'check'] : ['fas', 'link']"
          class="h-5 w-5"
          aria-hidden="true"
        />
      </button>

      <button
        v-if="canNativeShare"
        type="button"
        class="social-button focus:ring-2 focus:outline-none"
        :class="nativeButtonClass"
        :aria-label="t('article.share_native')"
        :title="t('article.share_native')"
        data-ph-capture-attribute-platform="native"
        @click="nativeShare"
      >
        <IconFa :icon="['fas', 'share-nodes']" class="h-5 w-5" aria-hidden="true" />
      </button>
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
  border-radius: 9999px;
  box-sizing: border-box;
  padding: 0;
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
