<script setup lang="ts">
import { computed, ref, useI18n, watch } from '#imports'

type Sponsor = {
  name: string
  url: string
  description?: string
  badge?: string
  logo?: string
  icon?: [string, string] | string
}

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  sponsors: Sponsor[]
}>(), {
  title: undefined,
  subtitle: undefined
})

const { t } = useI18n()

const headingId = 'sponsoring-title'
const descriptionId = 'sponsoring-subtitle'
const sectionAria = computed(() => t('sponsor.section_aria'))

const displayTitle = computed(() => props.title ?? t('sponsor.title'))
const displaySubtitle = computed(() => props.subtitle ?? t('sponsor.subtitle'))

const enhancedSponsors = computed<Sponsor[]>(() => props.sponsors ?? [])

// Schema.org markup for the sponsor list lives in its own composable so
// this component stays focused on rendering.
useSponsorSchema(enhancedSponsors)

const resolveIcon = (icon?: Sponsor['icon']) => {
  if (!icon) return null
  if (Array.isArray(icon)) return icon
  if (typeof icon === 'string' && icon.includes(' ')) {
    const [prefix, name] = icon.split(' ')
    return [prefix, name] as [string, string]
  }
  return icon
}

const ariaLabelFor = (name: string) => t('sponsor.card_aria', { name })

const current = ref(0)
const next = () => {
  if (!enhancedSponsors.value.length) return
  current.value = (current.value + 1) % enhancedSponsors.value.length
}
const prev = () => {
  if (!enhancedSponsors.value.length) return
  current.value = (current.value - 1 + enhancedSponsors.value.length) % enhancedSponsors.value.length
}

const onSwipe = (direction: 'left' | 'right') => {
  direction === 'left' ? next() : prev()
}

const startX = ref<number | null>(null)
const handleTouchEnd = (event: TouchEvent) => {
  const endX = event.changedTouches?.[0]?.clientX ?? null
  if (startX.value == null || endX == null) return
  const delta = endX - startX.value
  if (Math.abs(delta) > 30) onSwipe(delta < 0 ? 'left' : 'right')
  startX.value = null
}

watch(
  () => enhancedSponsors.value.length,
  (len) => {
    if (!len) {
      current.value = 0
      return
    }
    if (current.value >= len) {
      current.value = 0
    }
  },
  { immediate: true }
)

const panelClass
  = 'relative rounded-extra-large border border-outline-variant bg-surface-container-low p-5 sm:p-6'

const sponsorCardClass
  = 'state-layer flex h-full flex-col rounded-large border border-outline-variant bg-surface p-5 '
    + 'transition-shadow duration-150 ease-standard hover:shadow-elevation-2'

/** Slide dots: small controls without an MD3 counterpart, like the home carousel's. */
const dotButtonClass
  = 'group grid size-6 cursor-pointer place-items-center rounded-full focus-ring'
const dotOtherClass = 'bg-on-surface-variant/40 group-hover:bg-on-surface-variant/70'

/** The contact card: the page's one call to sponsor, on the tertiary container. */
const contactCardClass
  = 'state-layer group relative flex h-full flex-col overflow-hidden rounded-extra-large '
    + 'bg-tertiary-container p-6 text-on-tertiary-container shadow-elevation-1 transition-shadow '
    + 'duration-150 ease-standard hover:shadow-elevation-3 focus-ring'
const contactPillClass
  = 'inline-flex items-center gap-2 rounded-full bg-tertiary px-4 py-2 text-label-large '
    + 'text-on-tertiary motion-safe:animate-[pulse_2.8s_ease-in-out_infinite]'
</script>

<template>
  <section
    id="sponsoring"
    class="relative isolate w-full"
    :aria-labelledby="headingId"
    :aria-describedby="descriptionId"
    :aria-label="sectionAria"
  >
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div class="mb-8 text-center">
        <SectionHeading :level="2" :id="headingId" :description-id="descriptionId">
          {{ displayTitle }}
          <template #description>
            {{ displaySubtitle }}
          </template>
        </SectionHeading>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:items-stretch">
        <div :class="panelClass">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-label-large text-on-surface-variant">{{ t('sponsor.title') }}</p>
            <div class="flex gap-1">
              <M3IconButton
                size="sm"
                :icon="['fas','chevron-left']"
                :label="t('carousel.prev')"
                @click="prev"
              />
              <M3IconButton
                size="sm"
                :icon="['fas','chevron-right']"
                :label="t('carousel.next')"
                @click="next"
              />
            </div>
          </div>

          <div
            class="relative mt-4 min-h-[260px] sm:min-h-[220px]"
            @touchstart.passive="startX = $event.changedTouches?.[0]?.clientX ?? null"
            @touchend.passive="handleTouchEnd($event)"
          >
            <Transition
              mode="out-in"
              enter-active-class="transition-opacity duration-200"
              leave-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <a
                :key="enhancedSponsors[current]?.name"
                :href="enhancedSponsors[current]?.url"
                target="_blank"
                rel="noopener noreferrer"
                class="block w-full rounded-large focus-ring"
                :aria-label="ariaLabelFor(enhancedSponsors[current]?.name || '')"
              >
                <div :class="sponsorCardClass">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-title-large text-on-surface">
                        {{ enhancedSponsors[current]?.name }}
                      </p>
                      <div
                        v-if="enhancedSponsors[current]?.logo || enhancedSponsors[current]?.icon"
                        class="mt-2"
                      >
                        <NuxtImg
                          v-if="enhancedSponsors[current]?.logo"
                          :src="enhancedSponsors[current]?.logo"
                          :alt="enhancedSponsors[current]?.name"
                          class="h-10 w-auto max-w-[180px] object-contain"
                          format="webp"
                          loading="lazy"
                        />
                        <IconFa
                          v-else-if="resolveIcon(enhancedSponsors[current]?.icon)"
                          :icon="resolveIcon(enhancedSponsors[current]?.icon) as any"
                          class="h-8 w-8 text-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <p
                        v-if="enhancedSponsors[current]?.description"
                        class="mt-1 text-body-medium text-on-surface-variant"
                      >
                        {{ enhancedSponsors[current]?.description }}
                      </p>
                    </div>
                    <M3Chip
                      v-if="enhancedSponsors[current]?.badge"
                      kind="label"
                      color="secondary"
                      class="shrink-0"
                      :label="enhancedSponsors[current]?.badge"
                    />
                  </div>
                  <span
                    class="mt-auto inline-flex items-center gap-2 text-label-large text-primary"
                  >
                    {{ t('sponsor.cta_link') }}
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            </Transition>
          </div>

          <div class="mt-4 flex justify-center gap-2">
            <button
              v-for="(s, idx) in enhancedSponsors"
              :key="s.name"
              type="button"
              :class="dotButtonClass"
              :aria-label="ariaLabelFor(s.name)"
              :aria-current="idx === current ? 'true' : undefined"
              @click="current = idx"
            >
              <span
                aria-hidden="true"
                class="size-3 rounded-full transition-colors duration-150 ease-standard"
                :class="idx === current ? 'bg-primary' : dotOtherClass"
              />
            </button>
          </div>
        </div>

        <a
          :href="'mailto:sponsoring@onelitefeather.net'"
          :class="contactCardClass"
          :aria-label="ariaLabelFor(t('sponsor.cta_title'))"
          data-ph-capture-attribute="cta"
          data-ph-capture-attribute-name="sponsor-contact"
        >
          <p class="text-label-large">
            {{ t('sponsor.cta_badge') }}
          </p>
          <p class="mt-2 text-headline-small font-bold">
            {{ t('sponsor.cta_title') }}
          </p>
          <p class="mt-2 text-body-medium">
            {{ t('sponsor.cta_description') }}
          </p>
          <div class="mt-auto flex items-end pt-6">
            <span :class="contactPillClass">
              {{ t('sponsor.cta_link') }}
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
