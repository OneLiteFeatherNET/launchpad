<script setup lang="ts">
const { t, locale } = useI18n()
const { discordUrl } = useRuntimeConfig().public

defineI18nRoute({
  paths: { de: '/survival-regeln', en: '/survival-rules' }
})

const ruleKeys = [
  'survival.rule_1',
  'survival.rule_2',
  'survival.rule_3',
  'survival.rule_4',
  'survival.rule_5',
  'survival.rule_6',
  'survival.rule_7',
  'survival.rule_8'
]

usePageSeo({
  title: t('survival.title'),
  description: t('survival.description')
})

useBreadcrumbs(() => [
  { name: t('navigation.home'), url: `/${locale.value}` }, { name: t('survival.title') }
])
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10 md:py-14">
    <header>
      <h1 class="text-display-small font-bold text-on-surface">
        {{ t('survival.heading') }}
      </h1>
      <p class="mt-4 text-body-large text-on-surface-variant">
        {{ t('survival.intro') }}
      </p>
    </header>

    <ol class="mt-10 list-decimal space-y-3 pl-6 text-body-large text-on-surface">
      <li v-for="key in ruleKeys" :key="key">
        {{ t(key) }}
      </li>
    </ol>

    <p class="mt-10 text-body-large text-on-surface">
      {{ t('survival.closing') }}
    </p>
    <i18n-t keypath="survival.questions" tag="p" class="mt-3 text-body-large text-on-surface">
      <template #discord>
        <a
          :href="discordUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-extra-small text-primary underline underline-offset-2 focus-ring"
        >Discord</a>
      </template>
    </i18n-t>
  </div>
</template>
