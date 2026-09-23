<script setup lang="ts">
import { computed, ref, onMounted } from '#imports'
import { useAnalytics } from '#layers/base'

type PlatformKey = 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram' | 'bluesky' | 'reddit' | 'email' | 'copy' | 'native'

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
      icon: ['fab', 'facebook-f'] as [string, string],
    },
    {
      key: 'twitter' as PlatformKey,
      labelKey: 'article.share_on_twitter',
      // X (formerly Twitter) intent endpoint. The legacy twitter.com/intent/tweet still redirects,
      // but x.com/intent/post is the canonical form and avoids an extra hop.
      href: buildShareUrl(`https://x.com/intent/post?url=${encodedUrl.value}&text=${encodedTitle.value}`, 'twitter'),
      icon: ['fab', 'x-twitter'] as [string, string],
    },
    {
      key: 'bluesky' as PlatformKey,
      labelKey: 'article.share_on_bluesky',
      href: buildShareUrl(`https://bsky.app/intent/compose?text=${encodedTitle.value}%20${encodedUrl.value}`, 'bluesky'),
      icon: ['fab', 'bluesky'] as [string, string],
    },
    {
      key: 'linkedin' as PlatformKey,
      labelKey: 'article.share_on_linkedin',
      href: buildShareUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`, 'linkedin'),
      icon: ['fab', 'linkedin-in'] as [string, string],
    },
    {
      key: 'telegram' as PlatformKey,
      labelKey: 'article.share_on_telegram',
      href: buildShareUrl(`https://t.me/share/url?url=${encodedUrl.value}&text=${encodedTitle.value}`, 'telegram'),
      icon: ['fab', 'telegram'] as [string, string],
    },
    {
      key: 'reddit' as PlatformKey,
      labelKey: 'article.share_on_reddit',
      href: buildShareUrl(`https://www.reddit.com/submit?url=${encodedUrl.value}&title=${encodedTitle.value}`, 'reddit'),
      icon: ['fab', 'reddit-alien'] as [string, string],
    },
    {
      key: 'whatsapp' as PlatformKey,
      labelKey: 'article.share_on_whatsapp',
      href: buildShareUrl(`https://wa.me/?text=${encodeURIComponent(`${props.title} ${props.url}`)}`, 'whatsapp'),
      icon: ['fab', 'whatsapp'] as [string, string],
    },
    {
      key: 'email' as PlatformKey,
      labelKey: 'article.share_by_email',
      href: `mailto:?subject=${encodedTitle.value}&body=${encodeURIComponent(`${props.description}\n\n${props.url}`)}`,
      icon: ['fas', 'envelope'] as [string, string],
    }
  ]
  return items
})

const copied = ref(false)
const canNativeShare = ref(false)

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
    <h3 class="mb-3 text-title-large font-bold text-on-surface">{{ t('article.share') }}</h3>
    <div class="flex flex-wrap gap-3">
      <M3IconButton
        v-for="platform in platforms"
        :key="platform.key"
        variant="tonal"
        :href="platform.href"
        :target="platform.key === 'email' ? undefined : '_blank'"
        :icon="platform.icon"
        :label="t(platform.labelKey)"
        :title="t(platform.labelKey)"
        :data-ph-capture-attribute-platform="platform.key"
        @click="trackShareEvent(platform.key)"
      />

      <M3IconButton
        variant="tonal"
        :icon="copied ? ['fas', 'check'] : ['fas', 'link']"
        :label="copied ? t('article.copied') : t('article.copy_link')"
        :title="copied ? t('article.copied') : t('article.copy_link')"
        data-ph-capture-attribute-platform="copy"
        @click="copyLink"
      />

      <M3IconButton
        v-if="canNativeShare"
        variant="filled"
        :icon="['fas', 'share-nodes']"
        :label="t('article.share_native')"
        :title="t('article.share_native')"
        data-ph-capture-attribute-platform="native"
        @click="nativeShare"
      />
    </div>
  </div>
</template>
