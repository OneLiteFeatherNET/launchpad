<script setup lang="ts">
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
const { $clientPosthog, $serverPosthog } = useNuxtApp();

// The isLargePage prop is passed from the parent component

// Function to track share events (for future PostHog integration)
const trackShareEvent = (platform: string) => {

  onMounted(() => {
    $clientPosthog?.capture('share_event', {
      platform,
      url: props.url,
      title: props.title,
      description: props.description,
      isLargePage: props.isLargePage
    });
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
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      </a>

      <!-- Twitter -->
      <a :href="twitterShareUrl" 
         target="_blank" 
         rel="noopener noreferrer" 
         class="social-button bg-sky-500 hover:bg-sky-600 focus:ring-2 focus:ring-sky-400 focus:outline-none" 
         :aria-label="$t('article.share_on_twitter')"
         @click="trackShareEvent('twitter')"
         data-ph-capture-attribute-platform="twitter">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      </a>

      <!-- LinkedIn -->
      <a :href="linkedinShareUrl" 
         target="_blank" 
         rel="noopener noreferrer" 
         class="social-button bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-600 focus:outline-none" 
         :aria-label="$t('article.share_on_linkedin')"
         @click="trackShareEvent('linkedin')"
         data-ph-capture-attribute-platform="linkedin">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
        </svg>
      </a>

      <!-- WhatsApp -->
      <a :href="whatsappShareUrl" 
         target="_blank" 
         rel="noopener noreferrer" 
         class="social-button bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none" 
         :aria-label="$t('article.share_on_whatsapp')"
         @click="trackShareEvent('whatsapp')"
         data-ph-capture-attribute-platform="whatsapp">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>

      <!-- Email -->
      <a :href="emailShareUrl" 
         class="social-button bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none" 
         :aria-label="$t('article.share_by_email')"
         @click="trackShareEvent('email')"
         data-ph-capture-attribute-platform="email">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
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
  border-radius: 50%;
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
