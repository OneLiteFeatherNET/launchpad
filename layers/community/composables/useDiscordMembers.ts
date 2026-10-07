/** Discord member count through the cached server route; `null` when it cannot be had. */
export function useDiscordMembers() {
  const { data } = useAsyncData<{ members: number | null }>(
    'community-discord-members',
    async () => {
      try {
        return await $fetch<{ members: number | null }>('/api/community/discord', { timeout: 5000 })
      } catch (err) {
        console.warn('[useDiscordMembers] failed to load the member count', err)
        return { members: null }
      }
    },
    { default: () => ({ members: null }) }
  )

  return { members: computed(() => data.value?.members ?? null) }
}
