<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

type Props = {
  title?: string
  subtitle?: string
  javaAddress: string
  bedrockAddress: string
  // Optional links (fallbacks are generated if not provided)
  javaLink?: string
  bedrockLink?: string
  // Background images (no longer used; kept for backward compatibility)
  backgroundImages?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  // No default images anymore — feature is no longer actively used
  backgroundImages: () => []
})

const { t } = useI18n()

// Prefer props if provided, otherwise fall back to i18n
const displayTitle = computed(() => props.title ?? t('server.connect.title'))
const displaySubtitle = computed(() => props.subtitle ?? t('server.connect.subtitle'))

// Separate clipboard instances so the "Copied!" state is independent per button
const { copy: copyJavaFn, copied: copiedJava, isSupported: isSupportedJava } = useClipboard()
const { copy: copyBedrockFn, copied: copiedBedrock, isSupported: isSupportedBedrock } = useClipboard()

// Aggregate check for Clipboard API support (show the notice only if neither instance is supported)
const isSupported = computed(() => isSupportedJava.value || isSupportedBedrock.value)

const onCopyJava = async () => {
  try {
    await copyJavaFn(props.javaAddress)
  } catch {
    // no-op
  }
}

const onCopyBedrock = async () => {
  try {
    await copyBedrockFn(props.bedrockAddress)
  } catch {
    // no-op
  }
}

const javaHref = computed(() => {
  // If a link is provided, use it — otherwise fall back to an external status page
  if (props.javaLink) return props.javaLink
  const host = props.javaAddress.split(':')[0]
  return `https://mcsrvstat.us/server/${encodeURIComponent(host)}`
})

const bedrockHref = computed(() => {
  if (props.bedrockLink) return props.bedrockLink
  const host = props.bedrockAddress.split(':')[0]
  return `https://mcsrvstat.us/bedrock/${encodeURIComponent(host)}`
})
</script>

<template>
  <section class="relative isolate w-full overflow-hidden">
    <!-- Note: Background images were removed (requirement). Aura/Glow remains. -->

    <!-- Foreground Content -->
    <div class="mx-auto max-w-6xl px-4 py-12 md:py-20">
      <!-- Aura/Glow Wrapper -->
      <div class="relative mx-auto max-w-3xl">
        <!-- Decorative aura background (subtle wave movement) -->
        <div aria-hidden="true" class="aura pointer-events-none absolute -inset-1 -z-10 rounded-3xl" />
        <div
          class="rounded-3xl border border-border/80 bg-surface/95 p-6 shadow-2xl shadow-black/20 backdrop-blur-md md:p-10"
          role="region"
          :aria-labelledby="'server-connect-title'"
        >
        <div class="mb-6 text-center md:mb-8">
          <h2 id="server-connect-title" class="text-2xl font-bold tracking-tight text-text md:text-3xl">
            {{ displayTitle }}
          </h2>
          <p class="mt-2 text-base text-muted md:text-lg">
            {{ displaySubtitle }}
          </p>
        </div>

        <div class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-6">
          <!-- Java Card -->
          <article class="group flex h-full flex-col rounded-2xl border border-border bg-surface/80 p-4 shadow-md ring-1 ring-border/70 transition hover:shadow-lg md:p-6">
            <header class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-accent" aria-hidden="true">desktop_windows</span>
                <h3 class="text-lg font-semibold text-text">{{ t('server.connect.java') }}</h3>
              </div>
            </header>
            <p class="mb-4 break-all font-mono text-base text-text">
              <a :href="javaHref" target="_blank" rel="noopener noreferrer" class="underline decoration-muted underline-offset-4 hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
                {{ props.javaAddress }}
              </a>
            </p>
            <div class="mt-auto flex items-center gap-3">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 font-medium text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98]"
                :aria-label="t('server.connect.copy_aria', { address: props.javaAddress })"
                @click="onCopyJava"
              >
                <span class="material-symbols-outlined text-xl" v-if="!copiedJava" aria-hidden="true">content_copy</span>
                <span class="material-symbols-outlined text-xl" v-else aria-hidden="true">check</span>
                <span v-if="!copiedJava">{{ t('server.connect.copy') }}</span>
                <span v-else>{{ t('server.connect.copied') }}</span>
              </button>
              <!-- SR-only live region (Java button only) -->
              <span class="sr-only" aria-live="polite">{{ copiedJava ? t('server.connect.copied') : '' }}</span>
            </div>
          </article>

          <!-- Bedrock Card -->
          <article class="group flex h-full flex-col rounded-2xl border border-border bg-surface/80 p-4 shadow-md ring-1 ring-border/70 transition hover:shadow-lg md:p-6">
            <header class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary" aria-hidden="true">stadia_controller</span>
                <h3 class="text-lg font-semibold text-text">{{ t('server.connect.bedrock') }}</h3>
              </div>
            </header>
            <p class="mb-4 break-all font-mono text-base text-text">
              <a :href="bedrockHref" target="_blank" rel="noopener noreferrer" class="underline decoration-muted underline-offset-4 hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
                {{ props.bedrockAddress }}
              </a>
            </p>
            <div class="mt-auto flex items-center gap-3">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 font-medium text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98]"
                :aria-label="t('server.connect.copy_aria', { address: props.bedrockAddress })"
                @click="onCopyBedrock"
              >
                <span class="material-symbols-outlined text-xl" v-if="!copiedBedrock" aria-hidden="true">content_copy</span>
                <span class="material-symbols-outlined text-xl" v-else aria-hidden="true">check</span>
                <span v-if="!copiedBedrock">{{ t('server.connect.copy') }}</span>
                <span v-else>{{ t('server.connect.copied') }}</span>
              </button>
              <!-- SR-only live region (Bedrock button only) -->
              <span class="sr-only" aria-live="polite">{{ copiedBedrock ? t('server.connect.copied') : '' }}</span>
            </div>
          </article>
        </div>

        <p v-if="!isSupported" class="mt-4 text-center text-sm text-muted">
          {{ t('server.connect.clipboard_note') }}
        </p>
        <!-- Global live region removed because each button has its own feedback -->
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

/*
  Wave/swimming effect for the aura behind the card
  - Base: static conic-gradient (no rotation)
  - Two additional soft radial "blobs" drifting slightly
  - Gentle "breathe" (scale/translate) to create a wave-like feeling
  - Respects prefers-reduced-motion
*/
.aura {
  /* Subtle visibility and soft edges */
  opacity: 0.58; /* slightly lower to increase text contrast against the card */
  filter: blur(38px);
  /* Base gradient in brand colors */
  background: conic-gradient(
    from 180deg at 50% 50%,
    var(--color-brand-accent) 0deg,
    var(--color-brand-secondary) 120deg,
    var(--color-brand-orange) 240deg,
    var(--color-brand-accent) 360deg
  );
  /* Gentle breathe instead of rotation (slightly faster) */
  animation: aura-breathe 5s ease-in-out infinite;
  will-change: transform;
}

.aura::before,
.aura::after {
  content: "";
  position: absolute;
  inset: -20%;
  border-radius: inherit;
  /* Soft, colored spots; transparency controlled via element opacity */
  background: radial-gradient(closest-side, var(--blob-color, var(--color-brand-accent)) 0%, transparent 70%);
  mix-blend-mode: screen;
  will-change: transform, opacity;
  pointer-events: none;
}

/* Blob 1: accent colors, shorter drift */
.aura::before {
  --blob-color: color-mix(in oklab, var(--color-brand-accent) 60%, white 40%);
  opacity: 0.26;
  transform: translate(-10%, -8%) scale(1.05);
  animation: blob-drift-1 8s ease-in-out infinite alternate;
}

/* Blob 2: secondary colors, longer counter drift */
.aura::after {
  --blob-color: color-mix(in oklab, var(--color-brand-secondary) 60%, white 40%);
  opacity: 0.24;
  transform: translate(8%, 6%) scale(0.98);
  animation: blob-drift-2 11s ease-in-out infinite alternate-reverse;
}

@keyframes aura-breathe {
  0%   { transform: translate3d(0, 0, 0) scale(1.00); }
  25%  { transform: translate3d(1.2%, -0.8%, 0) scale(1.015); }
  50%  { transform: translate3d(0.5%, 1.0%, 0) scale(1.03); }
  75%  { transform: translate3d(-1.0%, 0.6%, 0) scale(1.015); }
  100% { transform: translate3d(0, 0, 0) scale(1.00); }
}

@keyframes blob-drift-1 {
  0%   { transform: translate(-12%, -10%) scale(1.00); }
  50%  { transform: translate(4%, -2%)   scale(1.08); }
  100% { transform: translate(-12%, -10%) scale(1.00); }
}

@keyframes blob-drift-2 {
  0%   { transform: translate(10%, 8%)  scale(0.98); }
  50%  { transform: translate(-6%, 0%)  scale(1.06); }
  100% { transform: translate(10%, 8%)  scale(0.98); }
}

/* Reduce/disable motion for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .aura, .aura::before, .aura::after { animation: none !important; }
}
</style>
