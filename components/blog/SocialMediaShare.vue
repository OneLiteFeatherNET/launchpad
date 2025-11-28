<script setup lang="ts">
import IconFa from "~/components/ui/icons/IconFa.vue";
import { useAnalytics } from "~/composables/useAnalytics";

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
});
const { trackShare } = useAnalytics();

// The isLargePage prop is passed from the parent component

// Function to track share events (for future PostHog integration)
const trackShareEvent = (platform: string) => {
  trackShare(platform, {
    url: props.url,
    title: props.title,
    description: props.description,
    isLargePage: props.isLargePage
  })
};

// Function to add tracking parameter for large pages
const getShareUrl = (baseUrl: string, platform: string) => {
  // Check if this is one of the large pages that needs tracking
  if (props.isLargePage) {
    // Add tracking query parameter
    return `${baseUrl}?utm_source=${platform}&utm_medium=social&utm_campaign=share`;
  }
  return baseUrl;
};

// Share URLs for different platforms
const facebookShareUrl = computed(() => {
  const baseUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`;
  return getShareUrl(baseUrl, 'facebook');
});

const twitterShareUrl = computed(() => {
  const baseUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.title)}`;
  return getShareUrl(baseUrl, 'twitter');
});

const linkedinShareUrl = computed(() => {
  const baseUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.url)}`;
  return getShareUrl(baseUrl, 'linkedin');
});

const whatsappShareUrl = computed(() => {
  const baseUrl = `https://wa.me/?text=${encodeURIComponent(props.title + ' ' + props.url)}`;
  return getShareUrl(baseUrl, 'whatsapp');
});

const emailShareUrl = computed(() => {
  const baseUrl = `mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(props.description + '\n\n' + props.url)}`;
  return getShareUrl(baseUrl, 'email');
});
</script>

<template>
  <div class="social-media-share">
    <h3 class="text-lg font-bold mb-3 dark:text-white">{{ $t('article.share') }}</h3>
    <div class="flex space-x-3">
      <!-- Facebook -->
      <a :href="facebookShareUrl"
         target="_blank"
         rel="noopener noreferrer"
         class="social-button bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
         :aria-label="$t('article.share_on_facebook')"
         @click="trackShareEvent('facebook')"
         data-ph-capture-attribute-platform="facebook">
        <IconFa :icon="['fab','facebook-f']" class="h-6 w-6" aria-hidden="true" />
      </a>

      <!-- Twitter -->
      <a :href="twitterShareUrl"
         target="_blank"
         rel="noopener noreferrer"
         class="social-button bg-sky-500 hover:bg-sky-600 focus:ring-2 focus:ring-sky-400 focus:outline-none"
         :aria-label="$t('article.share_on_twitter')"
         @click="trackShareEvent('twitter')"
         data-ph-capture-attribute-platform="twitter">
        <IconFa :icon="['fab','twitter']" class="h-6 w-6" aria-hidden="true" />
      </a>

      <!-- LinkedIn -->
      <a :href="linkedinShareUrl"
         target="_blank"
         rel="noopener noreferrer"
         class="social-button bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
         :aria-label="$t('article.share_on_linkedin')"
         @click="trackShareEvent('linkedin')"
         data-ph-capture-attribute-platform="linkedin">
        <IconFa :icon="['fab','linkedin-in']" class="h-6 w-6" aria-hidden="true" />
      </a>

      <!-- WhatsApp -->
      <a :href="whatsappShareUrl"
         target="_blank"
         rel="noopener noreferrer"
         class="social-button bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
         :aria-label="$t('article.share_on_whatsapp')"
         @click="trackShareEvent('whatsapp')"
         data-ph-capture-attribute-platform="whatsapp">
        <IconFa :icon="['fab','whatsapp']" class="h-6 w-6" aria-hidden="true" />
      </a>

      <!-- Email -->
      <a :href="emailShareUrl"
         class="social-button bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none"
         :aria-label="$t('article.share_by_email')"
         @click="trackShareEvent('email')"
         data-ph-capture-attribute-platform="email">
        <IconFa :icon="['fas','envelope']" class="h-6 w-6" aria-hidden="true" />
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
