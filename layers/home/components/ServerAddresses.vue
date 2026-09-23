<script setup lang="ts">
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

const panelClass
  = 'w-full rounded-extra-large bg-surface-container-low/95 p-6 shadow-elevation-4 '
    + 'backdrop-blur-md md:mx-0 md:max-w-full md:p-10 lg:mx-[-2.5%] lg:max-w-[105%]'
</script>

<template>
  <section id="connect" class="relative isolate w-full overflow-hidden scroll-mt-24 md:scroll-mt-28">
    <!-- Note: Background images were removed (requirement). Aura/Glow remains. -->

    <!-- Foreground Content -->
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-20">
      <!-- Aura/Glow Wrapper -->
      <div class="relative mx-auto w-full max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-3rem)] lg:max-w-3xl">
        <!-- Decorative aura background (now via Tailwind utilities, incl. motion-reduce) -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-2 md:inset-1 lg:-inset-2 -z-10 rounded-extra-large opacity-[0.52] lg:opacity-[0.58] blur-[22px] md:blur-[28px] lg:blur-[38px] [background:conic-gradient(from_180deg_at_50%_50%,var(--brand-magenta)_0deg,var(--brand-cyan)_120deg,var(--color-brand-orange)_240deg,var(--brand-magenta)_360deg)]"
        >
          <!-- Blob 1 -->
          <div
            class="absolute inset-[-4%] md:inset-[-6%] lg:inset-[-12%] rounded-extra-large pointer-events-none mix-blend-screen opacity-[0.24] translate-x-[-6%] translate-y-[-5%] scale-[0.98] md:scale-[1.02] lg:scale-[1.05] [background:radial-gradient(closest-side,color-mix(in_oklab,var(--brand-magenta)_60%,white_40%)_0%,transparent_70%)]"
          />
          <!-- Blob 2 -->
          <div
            class="absolute inset-[-4%] md:inset-[-6%] lg:inset-[-12%] rounded-extra-large pointer-events-none mix-blend-screen opacity-[0.22] translate-x-[5%] translate-y-[3%] scale-[0.9] md:scale-[0.95] lg:scale-[0.98] [background:radial-gradient(closest-side,color-mix(in_oklab,var(--brand-cyan)_60%,white_40%)_0%,transparent_70%)]"
          />
        </div>
        <div
          :class="panelClass"
          role="region"
          :aria-labelledby="'server-connect-title'"
          :aria-describedby="'server-connect-subtitle'"
        >
        <div class="mb-6 text-center md:mb-8">
          <h2 id="server-connect-title" class="text-headline-medium font-bold text-on-surface">
            {{ displayTitle }}
          </h2>
          <p id="server-connect-subtitle" class="mt-2 text-body-large text-on-surface-variant">
            {{ displaySubtitle }}
          </p>
        </div>

        <div class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-6">
          <!-- Java Card -->
          <ServerAddressCard
            :title="t('server.connect.java')"
            :address="props.javaAddress"
            icon="desktop_windows"
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
            :copied="copiedBedrock"
            :onCopy="onCopyBedrock"
            :copied-secondary="copiedBedrockPort"
            :onCopySecondary="onCopyBedrockPort"
          />
        </div>

        <ClientOnly>
          <p v-if="!isSupported" class="mt-4 text-center text-body-medium text-on-surface-variant">
            {{ t('server.connect.clipboard_note') }}
          </p>
        </ClientOnly>
        <!-- Global live region removed because each button has its own feedback -->
        </div>
      </div>
    </div>
  </section>
</template>
