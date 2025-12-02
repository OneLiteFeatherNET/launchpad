<script setup lang="ts">
// @ts-ignore-next-line: types for @vueuse/core may not be available in this environment
import { useClipboard } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import ServerAddressCard from './ServerAddressCard.vue'

type Props = {
  title?: string
  subtitle?: string
  javaAddress: string
  bedrockAddress?: string
  bedrockHost?: string
  bedrockPort?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  bedrockAddress: undefined,
  bedrockHost: undefined,
  bedrockPort: undefined
})

const { t } = useI18n()

// Prefer props if provided, otherwise fall back to i18n
const displayTitle = computed(() => props.title ?? t('server.connect.title'))
const displaySubtitle = computed(() => props.subtitle ?? t('server.connect.subtitle'))

// Separate clipboard instances so the "Copied!" state is independent per button
const { copy: copyJavaFn, copied: copiedJava, isSupported: isSupportedJava } = useClipboard()
const { copy: copyBedrockFn, copied: copiedBedrock, isSupported: isSupportedBedrock } = useClipboard()
const { copy: copyBedrockPortFn, copied: copiedBedrockPort, isSupported: isSupportedBedrockPort } = useClipboard()

// Aggregate check for Clipboard API support (show the notice only if neither instance is supported)
const isSupported = computed(() => isSupportedJava.value || isSupportedBedrock.value || isSupportedBedrockPort.value)

const bedrockHost = computed(() => props.bedrockHost || props.bedrockAddress?.split(':')[0] || '')
const bedrockPort = computed(() => props.bedrockPort || props.bedrockAddress?.split(':')[1] || '')
const bedrockFull = computed(() => (bedrockHost.value ? `${bedrockHost.value}${bedrockPort.value ? ':' + bedrockPort.value : ''}` : ''))

const onCopyJava = async () => {
  try {
    await copyJavaFn(props.javaAddress)
  } catch {
    // no-op
  }
}

const onCopyBedrock = async () => {
  try {
    await copyBedrockFn(bedrockFull.value)
  } catch {
    // no-op
  }
}

const onCopyBedrockPort = async () => {
  try {
    if (bedrockPort.value) await copyBedrockPortFn(bedrockPort.value)
  } catch {
    // no-op
  }
}
</script>

<template>
  <section id="connect" class="relative isolate w-full overflow-visible scroll-mt-24 md:scroll-mt-28">
    <!-- Note: Background images were removed (requirement). Aura/Glow remains. -->

    <!-- Foreground Content -->
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-20">
      <!-- Aura/Glow Wrapper -->
      <div class="relative mx-auto max-w-3xl">
        <!-- Decorative aura background (now via Tailwind utilities, incl. motion-reduce) -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute -inset-1 -z-10 rounded-3xl opacity-[0.58] blur-[38px] [background:conic-gradient(from_180deg_at_50%_50%,var(--color-brand-accent)_0deg,var(--color-brand-secondary)_120deg,var(--color-brand-orange)_240deg,var(--color-brand-accent)_360deg)] animate-aura-breathe motion-reduce:animate-none [will-change:transform]"
        >
          <!-- Blob 1 -->
          <div
            class="absolute inset-[-20%] rounded-[inherit] pointer-events-none mix-blend-screen opacity-[0.26] translate-x-[-10%] translate-y-[-8%] scale-[1.05] animate-blob-drift-1 motion-reduce:animate-none [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand-accent)_60%,white_40%)_0%,transparent_70%)] [will-change:transform,opacity]"
          />
          <!-- Blob 2 -->
          <div
            class="absolute inset-[-20%] rounded-[inherit] pointer-events-none mix-blend-screen opacity-[0.24] translate-x-[8%] translate-y-[6%] scale-[0.98] animate-blob-drift-2 motion-reduce:animate-none [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand-secondary)_60%,white_40%)_0%,transparent_70%)] [will-change:transform,opacity]"
          />
        </div>
        <div
          class="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/90 p-6 shadow-2xl shadow-black/20 backdrop-blur-md md:p-10 md:max-w-[105%] md:mx-[-2.5%]"
          role="region"
          :aria-labelledby="'server-connect-title'"
          :aria-describedby="'server-connect-subtitle'"
        >
        <div class="mb-6 text-center md:mb-8">
          <h2 id="server-connect-title" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-3xl">
            {{ displayTitle }}
          </h2>
          <p id="server-connect-subtitle" class="mt-2 text-base text-gray-600 dark:text-gray-400 md:text-lg">
            {{ displaySubtitle }}
          </p>
        </div>

        <div class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-6">
          <!-- Java Card -->
          <ServerAddressCard
            :title="t('server.connect.java')"
            :address="props.javaAddress"
            icon="desktop_windows"
            iconClass="text-emerald-600 dark:text-emerald-400"
            buttonClass="bg-emerald-600"
            :copied="copiedJava"
            :onCopy="onCopyJava"
          />

          <!-- Bedrock Card -->
          <ServerAddressCard
            :title="t('server.connect.bedrock')"
            :address="bedrockHost || ''"
            :secondary-value="bedrockPort || ''"
            :secondary-label="bedrockPort ? t('server.connect.port_label') : ''"
            icon="stadia_controller"
            iconClass="text-indigo-600 dark:text-indigo-400"
            buttonClass="bg-indigo-600"
            :copied="copiedBedrock"
            :onCopy="onCopyBedrock"
            :copied-secondary="copiedBedrockPort"
            :onCopySecondary="onCopyBedrockPort"
          />
        </div>

        <ClientOnly>
          <p v-if="!isSupported" class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {{ t('server.connect.clipboard_note') }}
          </p>
        </ClientOnly>
        <!-- Global live region removed because each button has its own feedback -->
        </div>
      </div>
    </div>
  </section>
</template>
