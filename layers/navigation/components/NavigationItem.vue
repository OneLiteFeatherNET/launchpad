<script setup lang="ts">
import { computed } from '#imports';
import {
  NAV_ITEM_ACTIVE,
  NAV_ITEM_BOTTOM,
  NAV_ITEM_DESKTOP,
  NAV_ITEM_INACTIVE,
  NAV_ITEM_MOBILE,
} from '../utils/navItemClasses';
const { t } = useI18n();

const props = withDefaults(defineProps<{
  textKey: string;
  path: string;
  icon?: string | [string, string];
  variant?: 'desktop' | 'mobile' | 'bottom';
}>(), {
  icon: undefined,
  variant: 'desktop'
});

const emit = defineEmits<{
  click: [];
}>();

const route = useRoute();

const isActive = computed(() => isCurrentNavPath(route.path, props.path));

const handleClick = () => emit('click');

// Detect external links (e.g. Discord invite)
const isExternal = computed(() => /^https?:\/\//i.test(props.path));

const baseClass = computed(() => ({
  desktop: NAV_ITEM_DESKTOP,
  mobile: NAV_ITEM_MOBILE,
  bottom: NAV_ITEM_BOTTOM,
})[props.variant]);
const iconClass = computed(() => (props.variant === 'desktop' ? 'h-4 w-4' : 'h-5 w-5'));
</script>

<template>
  <NuxtLink
    v-if="!isExternal"
    :to="path"
    :class="[baseClass, isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE]"
    :aria-current="isActive ? 'page' : undefined"
    @click="handleClick"
  >
    <IconFa v-if="icon" :icon="icon" :class="iconClass" />
    <span>{{ t(textKey) }}</span>
  </NuxtLink>
  <a
    v-else
    :href="path"
    target="_blank"
    rel="noopener noreferrer"
    :class="[baseClass, NAV_ITEM_INACTIVE]"
    @click="handleClick"
  >
    <IconFa v-if="icon" :icon="icon" :class="iconClass" />
    <span>{{ t(textKey) }}</span>
  </a>
</template>
