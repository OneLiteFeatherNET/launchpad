<script setup lang="ts">
import type { EventDocument } from '../types'

/**
 * "How to take part", driven by the access mode: open events show the way in
 * (server address, Discord), sign-up and application events one action to
 * their form, invite-only events a note without an action. Outside a stated
 * sign-up window the action stays visible but disabled, next to the window,
 * so nobody wonders where the button went.
 *
 * `accessOpen` comes from the server with the page (design.md D4) — this
 * component never reads the clock. `discordUrl` is the site's invite, used
 * when the event names no Discord link of its own.
 */
const props = defineProps<{
  event: EventDocument
  accessOpen: boolean
  discordUrl: string
  serverAddress?: string
}>()

const { t } = useI18n()

const mode = computed(() => props.event.access?.mode ?? 'open')
const access = computed(() => props.event.access)
const joinDiscordUrl = computed(() => props.event.join?.discord || props.discordUrl)
const hasWindow = computed(() => Boolean(access.value?.opens || access.value?.closes))
const actionKey = computed(() => (mode.value === 'signup' ? 'events.join.signup' : 'events.join.apply'))

const addressClass
  = 'ms-1 rounded-extra-small bg-surface-container-highest px-2 py-0.5 font-mono text-on-surface'

const copied = ref(false)
const copyAddress = async () => {
  if (!props.serverAddress || !navigator.clipboard) return
  await navigator.clipboard.writeText(props.serverAddress)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <section aria-labelledby="event-join" class="space-y-4 rounded-large bg-surface-container p-6">
    <h2 id="event-join" class="text-title-large text-on-surface">{{ t('events.join.title') }}</h2>

    <div v-if="access?.requirements?.length">
      <h3 class="text-title-small text-on-surface">{{ t('events.join.requirements') }}</h3>
      <ul class="mt-1 list-disc ps-5 text-body-medium text-on-surface-variant">
        <li v-for="requirement in access.requirements" :key="requirement">{{ requirement }}</li>
      </ul>
    </div>

    <template v-if="mode === 'open'">
      <div
        v-if="event.join?.server && serverAddress"
        class="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <p class="text-body-medium text-on-surface-variant">
          {{ t('events.join.server') }}
          <code :class="addressClass">{{ serverAddress }}</code>
        </p>
        <CopyButton
          variant="tonal"
          :copied="copied"
          label-key="server.connect.copy_address"
          :accessible-label="t('server.connect.copy_aria', { address: serverAddress })"
          :on-copy="copyAddress"
          tracking-label="event-server-address"
        />
      </div>
      <M3Button
        v-if="event.join?.discord || !event.join?.server"
        variant="tonal"
        :icon="['fab', 'discord']"
        :href="joinDiscordUrl"
        target="_blank"
      >
        {{ t('events.join.discord') }}
        <span class="sr-only">{{ t('resources.opens_new_tab') }}</span>
      </M3Button>
    </template>

    <template v-else-if="mode === 'signup' || mode === 'application'">
      <p v-if="hasWindow" class="text-body-medium text-on-surface-variant">
        {{ t('events.join.window') }}
        <DateRange :start="access?.opens ?? event.event.startsAt" :end="access?.closes" />
      </p>
      <p v-if="!accessOpen" class="text-body-medium text-on-surface-variant">
        {{ t('events.join.window_closed') }}
      </p>
      <M3Button
        variant="filled"
        :href="access?.url"
        target="_blank"
        :disabled="!accessOpen"
      >
        {{ t(actionKey) }}
        <span v-if="accessOpen" class="sr-only">{{ t('resources.opens_new_tab') }}</span>
      </M3Button>
    </template>

    <p v-else class="text-body-medium text-on-surface-variant">{{ t('events.join.invite') }}</p>

    <p v-if="access?.note" class="text-body-medium text-on-surface-variant">{{ access.note }}</p>
  </section>
</template>
