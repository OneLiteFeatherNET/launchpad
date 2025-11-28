<script setup lang="ts">
import TeamMemberCard from './TeamMemberCard.vue'
import { useI18n } from 'vue-i18n'
import type { TeamMember } from '~/types/team'

type Props = {
  title?: string
  subtitle?: string
  members: TeamMember[]
  limit?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  limit: null
})

const { t } = useI18n()

const query = ref('')
const selectedRole = ref<string>('')
const visibleCount = ref<number | null>(props.limit)

const roles = computed(() => {
  const set = new Set(props.members.map(m => m.role).filter(Boolean))
  return Array.from(set)
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const r = selectedRole.value
  let list = props.members
  if (r) list = list.filter(m => m.role === r)
  if (q) list = list.filter(m => m.name.toLowerCase().includes(q))
  return list
})

const limited = computed(() => {
  if (!visibleCount.value) return filtered.value
  return filtered.value.slice(0, visibleCount.value)
})

const displayTitle = computed(() => props.title ?? t('team.title'))
const displaySubtitle = computed(() => props.subtitle ?? t('team.subtitle'))

const onWheel = (e: WheelEvent) => {
  const target = e.currentTarget as HTMLElement
  if (!target) return
  // Translate wheel movement to horizontal scroll while the pointer is over the list
  // - If horizontal intent: use deltaX
  // - Otherwise: map vertical deltaY to horizontal scroll
  const useX = Math.abs(e.deltaX) >= Math.abs(e.deltaY)
  const delta = useX ? e.deltaX : e.deltaY
  target.scrollLeft += delta
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-10 md:py-14">
    <div class="mb-6 md:mb-8 text-center">
      <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{{ displayTitle }}</h2>
      <p class="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-400">{{ displaySubtitle }}</p>
    </div>

    <div class="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex gap-3">
        <label class="sr-only" :for="'team-search'">{{ t('team.search_label') }}</label>
        <input
          :id="'team-search'"
          v-model="query"
          type="search"
          :placeholder="t('team.search_placeholder')"
          class="w-64 rounded-lg border border-zinc-300/70 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-900/70 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-700 dark:text-gray-300" :for="'team-role'">{{ t('team.filter_role') }}</label>
          <select
            :id="'team-role'"
            v-model="selectedRole"
            class="rounded-lg border border-zinc-300/70 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-900/70 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">{{ t('team.filter_role_all') }}</option>
            <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-700 dark:text-gray-300" :for="'team-limit'">{{ t('team.limit_label') }}</label>
        <select
          :id="'team-limit'"
          v-model.number="visibleCount"
          class="rounded-lg border border-zinc-300/70 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-900/70 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option :value="null">∞</option>
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>
    </div>

    <div
      class="-mx-4 px-4"
      :aria-label="t('team.scroll_area_aria')"
      role="region"
    >
      <ul
        class="team-scroll flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-color:theme(colors.zinc.400)_transparent] [scrollbar-width:thin]"
        role="list"
        :aria-label="t('team.list_label')"
        @wheel.prevent="onWheel"
      >
        <TeamMemberCard
          v-for="m in limited"
          :key="m.id"
          :name="m.name"
          :role="m.role"
          :slogan="m.slogan"
          :mc-name="m.mcName"
          :avatar-url="m.avatarUrl"
          :href="m.href ?? (m.slug ? `/team/${m.slug}` : undefined)"
        />
      </ul>
    </div>

    <p v-if="limited.length === 0" class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">{{ t('team.no_results') }}</p>
  </section>
</template>

<style scoped>
/* Improve horizontal scrollbar visibility on desktop while keeping it subtle */
:deep(.team-scroll::-webkit-scrollbar) { height: 10px; }
:deep(.team-scroll::-webkit-scrollbar-track) { background: transparent; }
:deep(.team-scroll::-webkit-scrollbar-thumb) {
  background: color-mix(in oklab, var(--color-brand-accent, #a1a1aa) 45%, transparent);
  border-radius: 999px;
}
</style>
