<script setup lang="ts">
import { definePageMeta } from '#imports'

const { t, locale } = useI18n()
const { discordUrl } = useRuntimeConfig().public
const { connect } = await useServerConnect()

const stepsClass = 'mt-4 max-w-3xl list-decimal space-y-3 pl-6 text-body-large text-on-surface-variant'
const javaParams = computed(() => ({ address: connect.value?.javaAddress ?? '' }))
const bedrockParams = computed(() => ({
  host: connect.value?.bedrockHost ?? '',
  port: connect.value?.bedrockPort ?? ''
}))

definePageMeta({
  layout: 'default'
})

usePageSeo({
  title: t('join.title'),
  description: t('join.description'),
  schemaType: 'WebPage',
  keywords: [
    'Minecraft Server',
    'Minecraft beitreten',
    'Java Edition',
    'Bedrock Edition',
    'Join Minecraft'
  ]
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` }, { name: t('navigation.join') }
])
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:py-14">
    <header class="max-w-3xl">
      <h1 class="text-display-small font-bold text-on-surface">
        {{ t('join.heading') }}
      </h1>
      <p class="mt-4 text-body-large text-on-surface-variant">
        {{ t('join.intro') }}
      </p>
    </header>

    <div class="mt-10">
      <ServerAddresses
        v-if="connect"
        :java-address="connect.javaAddress"
        :bedrock-host="connect.bedrockHost"
        :bedrock-port="connect.bedrockPort"
      />
    </div>

    <section class="mt-12" aria-labelledby="join-java">
      <h2 id="join-java" class="text-headline-medium font-bold text-on-surface">
        {{ t('join.java.heading') }}
      </h2>
      <ol :class="stepsClass">
        <li>{{ t('join.java.step_1') }}</li>
        <li>{{ t('join.java.step_2') }}</li>
        <li>{{ t('join.java.step_3', javaParams) }}</li>
        <li>{{ t('join.java.step_4') }}</li>
      </ol>
    </section>

    <section class="mt-12" aria-labelledby="join-bedrock">
      <h2 id="join-bedrock" class="text-headline-medium font-bold text-on-surface">
        {{ t('join.bedrock.heading') }}
      </h2>
      <ol :class="stepsClass">
        <li>{{ t('join.bedrock.step_1') }}</li>
        <li>{{ t('join.bedrock.step_2') }}</li>
        <li>{{ t('join.bedrock.step_3', bedrockParams) }}</li>
        <li>{{ t('join.bedrock.step_4') }}</li>
      </ol>
    </section>

    <section class="mt-12" aria-labelledby="join-help">
      <h2 id="join-help" class="text-headline-medium font-bold text-on-surface">
        {{ t('join.help.heading') }}
      </h2>
      <p class="mt-3 max-w-3xl text-body-large text-on-surface-variant">
        {{ t('join.help.text') }}
      </p>
      <ul class="mt-5 flex flex-wrap gap-3">
        <li v-if="discordUrl">
          <M3Button
            :href="discordUrl"
            target="_blank"
            variant="tonal"
            :icon="['fab', 'discord']"
          >
            {{ t('join.help.discord') }}
          </M3Button>
        </li>
        <li>
          <M3Button
            :to="`/${locale}#faq-heading`"
            variant="outlined"
            :icon="['fas', 'circle-info']"
          >
            {{ t('join.help.faq') }}
          </M3Button>
        </li>
      </ul>
    </section>
  </div>
</template>
