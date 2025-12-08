<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from '#imports'
import IconFa from '~/components/base/icons/IconFa.vue'

type Child = { textKey: string; path: string; icon?: string | [string, string] }

const props = defineProps<{
  textKey: string
  icon?: string | [string, string]
  children: Child[]
}>()

const { t } = useI18n()
const route = useRoute()
const isOpen = ref(false)
const buttonId = `nav-dropdown-${props.textKey}`
const menuId = `${buttonId}-menu`

const close = () => { isOpen.value = false }
const toggle = () => { isOpen.value = !isOpen.value }

const onEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')
</script>

<template>
  <div class="relative">
    <button
      :id="buttonId"
      type="button"
      class="relative inline-flex items-center gap-2 px-3 py-2 rounded-full text-[var(--color-text)] no-underline transition-colors hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
      :aria-expanded="isOpen"
      :aria-controls="menuId"
      aria-haspopup="menu"
      @click="toggle"
    >
      <IconFa v-if="icon" :icon="icon" class="h-4 w-4" />
      <span class="text-sm font-medium">{{ t(textKey) }}</span>
      <IconFa :icon="['fas','chevron-down']" class="h-3 w-3" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        :id="menuId"
        class="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg ring-1 ring-black/5 dark:border-[var(--color-border)] dark:bg-[var(--color-surface)]"
        role="menu"
        :aria-labelledby="buttonId"
      >
        <div class="py-2">
          <NuxtLink
            v-for="child in children"
            :key="child.path"
            :to="child.path"
            class="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text)] no-underline hover:bg-[var(--color-surface)]/70 dark:hover:bg-[var(--color-surface)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
            :class="isActive(child.path) ? 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]' : ''"
            role="menuitem"
            @click="close"
          >
            <IconFa v-if="child.icon" :icon="child.icon" class="h-4 w-4" />
            <span>{{ t(child.textKey) }}</span>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>
