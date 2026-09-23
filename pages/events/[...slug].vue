<script setup lang="ts">
import { computed, definePageMeta } from '#imports'

const { t, locale } = useI18n()
const site = useSiteConfig()
const runtimeConfig = useRuntimeConfig()

definePageMeta({
  layout: 'default'
})

const { detail } = await useEventDetail()

const event = computed(() => detail.value?.event)
const phase = computed(() => detail.value?.phase)
const accessMode = computed(() => event.value?.access?.mode ?? 'open')
const title = computed(() => event.value?.title || t('events.title'))
const description = computed(() => event.value?.summary || t('events.description'))
const discordUrl = (runtimeConfig.public?.discordUrl as string | undefined)
  || 'https://1lf.link/discord'

usePageSeo({
  title: title.value,
  description: description.value,
  image: event.value?.thumbnail,
  imageAlt: event.value?.thumbnailAlt,
  schemaType: 'WebPage'
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` },
  { name: t('events.title'), url: `/${locale.value}/events` },
  { name: title.value }
])

// Deliberately plain: Google grants no Event rich result to online-only or
// members-only events, so this describes the event for semantic use rather
// than chasing a search feature (design.md D10).
useSchemaOrg(() => {
  if (!event.value) return []
  const url = new URL(eventDetailPath(locale.value, event.value.slug), site.url).toString()
  return [
    {
      '@type': 'Event',
      '@id': `${url}#event`,
      name: event.value.title,
      description: event.value.summary,
      url,
      startDate: new Date(event.value.event.startsAt).toISOString(),
      endDate: event.value.event.endsAt
        ? new Date(event.value.event.endsAt).toISOString()
        : undefined,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      location: { '@type': 'VirtualLocation', url },
      image: event.value.thumbnail
        ? new URL(event.value.thumbnail, site.url).toString()
        : undefined,
      organizer: { '@id': organizationId(site.url) }
    }
  ]
})

const pastHintClass = 'bg-surface-container-high text-on-surface-variant'
const liveHintClass = 'bg-secondary-container text-on-secondary-container'

const galleryImages = computed(() => event.value?.gallery ?? [])
const resources = computed(() => event.value?.resources ?? [])
</script>

<template>
  <div class="container mx-auto max-w-screen-lg px-4 py-6 md:px-6 md:py-10">
    <article v-if="event && detail && phase" class="space-y-8">
      <header class="space-y-4">
        <p>
          <M3Button variant="text" :icon="['fas', 'chevron-left']" :to="`/${locale}/events`">
            {{ t('events.title') }}
          </M3Button>
        </p>
        <!-- `block`: <picture> is inline by default, and space-y's margin on an
             inline box is ignored, which glued the chips to the image. -->
        <NuxtPicture
          v-if="event.thumbnail"
          class="block"
          :src="event.thumbnail"
          :alt="event.thumbnailAlt ?? ''"
          width="1280"
          height="720"
          sizes="xs:100vw md:1024px"
          fit="cover"
          format="avif,webp"
          :img-attrs="{ class: 'aspect-video w-full rounded-large object-cover' }"
        />
        <div class="flex flex-wrap gap-2">
          <M3Chip kind="label" :label="t(`events.type.${event.type}`)" />
          <EventPhaseChip :phase="phase" />
          <EventAccessChip :mode="accessMode" />
        </div>
        <h1 class="text-headline-large text-on-surface">{{ event.title }}</h1>
        <p class="text-body-large text-on-surface-variant">{{ event.summary }}</p>
        <p class="text-title-medium text-on-surface">
          <DateRange :start="event.event.startsAt" :end="event.event.endsAt" />
        </p>
        <p
          class="rounded-medium px-4 py-3 text-body-medium"
          :class="phase === 'past' ? pastHintClass : liveHintClass"
        >
          <template v-if="phase === 'announced'">
            {{ t('events.phase_hint.announced') }} <DateRange :start="event.event.startsAt" />
          </template>
          <template v-else>{{ t(`events.phase_hint.${phase}`) }}</template>
        </p>
      </header>

      <EventResults v-if="phase === 'past'" :results="event.results" />

      <section aria-labelledby="event-details" class="space-y-4">
        <h2 id="event-details" class="sr-only">{{ t('events.details') }}</h2>
        <EventBuildDetails v-if="event.type === 'build'" :build="event.build" />
        <EventPlayDetails v-else-if="event.type === 'play'" :play="event.play" />
        <EventAdventureDetails
          v-else-if="event.type === 'adventure'"
          :adventure="event.adventure"
        />
        <template v-else>
          <EventBetaDetails :subject="event.subject" :access-mode="accessMode" />
          <EventTestingBlock :testing="event.testing" :phase="phase" />
        </template>
      </section>

      <section v-if="event.body" class="prose prose-neutral max-w-none dark:prose-invert">
        <ContentRenderer :value="event" />
      </section>

      <section v-if="galleryImages.length" class="space-y-3">
        <h2 class="text-title-large text-on-surface">{{ t('events.gallery') }}</h2>
        <LazyMediaGallery :images="galleryImages" :label="t('events.gallery_aria')" />
      </section>

      <section v-if="resources.length" class="space-y-3">
        <h2 class="text-title-large text-on-surface">{{ t('events.resources') }}</h2>
        <LazyResourceList :resources="resources" :label="t('events.resources_aria')" />
      </section>

      <EventJoinBlock
        v-if="phase !== 'past'"
        :event="event"
        :access-open="detail.accessOpen"
        :discord-url="discordUrl"
        :server-address="detail.serverAddress"
      />
    </article>
  </div>
</template>
