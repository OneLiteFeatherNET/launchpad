<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

type Props = {
  name: string
  role?: string | string[]
  slogan?: string
  mcName?: string
  slug?: string
  avatarUrl?: string
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  role: undefined,
  slogan: undefined,
  mcName: undefined,
  slug: undefined,
  avatarUrl: undefined,
  href: undefined
})

const { t } = useI18n()

const profileHref = computed(() => props.href || (props.mcName ? `/team/${encodeURIComponent(props.mcName.toLowerCase())}` : undefined))

// Upstream PNG (mc-heads.net at 128px) is routed through the Cloudflare
// Images provider, which reships it as AVIF/WebP at the displayed 64px box.
const avatarSrc = computed(() => teamAvatarUrl({
  mcName: props.mcName,
  slug: props.slug,
  avatarUrl: props.avatarUrl
}, 128))

const roleChips = computed(() => toRoleList(props.role))
const roleAriaText = computed(() => toRoleString(props.role))
const ariaLabel = computed(() => t('team.card_aria', { name: props.name, role: roleAriaText.value }))
</script>

<template>
  <li class="snap-start shrink-0 w-72">
    <!--
      With a profile the card links as a whole: the name carries the one
      link, stretched over the card, and keeps the full "name, role" label.
    -->
    <M3Card variant="outlined" :interactive="Boolean(profileHref)" class="h-full">
      <div class="flex items-center gap-4">
        <NuxtImg
          :src="avatarSrc"
          :alt="t('team.avatar_alt', { name })"
          width="64"
          height="64"
          fit="cover"
          format="avif,webp"
          quality="80"
          densities="x1 x2"
          class="h-16 w-16 rounded-medium bg-surface-container-highest object-cover"
          loading="lazy"
          decoding="async"
        />
        <div class="min-w-0">
          <h3 class="truncate text-title-large text-on-surface">
            <M3CardLink v-if="profileHref" :to="profileHref" :aria-label="ariaLabel">
              {{ name }}
            </M3CardLink>
            <template v-else>{{ name }}</template>
          </h3>
        </div>
      </div>
      <div v-if="roleChips.length" class="mt-3 flex flex-wrap gap-2">
        <M3Chip
          v-for="chip in roleChips"
          :key="chip"
          :label="chip"
          kind="label"
        />
      </div>
      <p v-if="slogan" class="mt-3 line-clamp-3 text-body-medium text-on-surface-variant">
        “{{ slogan }}”
      </p>
      <p
        v-if="profileHref"
        class="mt-3 inline-flex items-center gap-1 text-label-large text-primary"
        aria-hidden="true"
      >
        {{ t('team.view_profile') }}
        <FontAwesomeIcon :icon="faArrowUpRightFromSquare" class="h-3.5 w-3.5" />
      </p>
    </M3Card>
  </li>
</template>
