import { computed, toValue, type Component, type MaybeRefOrGetter } from 'vue'
import type { InteractiveTagOptions } from '../types'

/**
 * Which element an interactive primitive renders, and the attributes that
 * make it behave: `to` → NuxtLink, `href` → <a>, otherwise <button>.
 *
 * Shared by M3Button, M3IconButton, M3Chip and M3Card so every one of them
 * gets the same answers to the easy-to-forget parts — `type="button"` so a
 * button inside a form does not submit it, `rel="noopener noreferrer"` on a
 * link that opens a new tab, and a disabled link that really is inert: no
 * href, out of the tab order, `aria-disabled` for assistive technology.
 *
 * `linkComponent` is what renders an internal route. The caller passes
 * `resolveComponent('NuxtLink')` from its own SFC: Nuxt registers NuxtLink
 * through a compile-time transform of that call, not globally, so the bare
 * string 'NuxtLink' handed to `<component :is>` renders a literal
 * <nuxtlink> element that is no link at all.
 */
export function useInteractiveTag(
  options: MaybeRefOrGetter<InteractiveTagOptions>,
  linkComponent: Component | string,
) {
  const tag = computed(() => {
    const { to, href } = toValue(options)
    if (to) return 'NuxtLink'
    if (href) return 'a'
    return 'button'
  })

  const attrs = computed<Record<string, string | boolean | number | undefined>>(() => {
    const { to, href, target, type, disabled } = toValue(options)
    if (tag.value === 'button') {
      return { type: type ?? 'button', disabled: disabled || undefined }
    }
    if (disabled) {
      // A link has no disabled state; take away what makes it one.
      return { 'role': 'link', 'aria-disabled': 'true', 'tabindex': -1 }
    }
    const rel = target === '_blank' ? 'noopener noreferrer' : undefined
    return tag.value === 'NuxtLink'
      ? { to, target, rel }
      : { href, target, rel }
  })

  /** What to hand to `<component :is>`: the resolved link component or a tag. */
  const component = computed(() => (tag.value === 'NuxtLink' ? linkComponent : tag.value))

  return { tag, component, attrs }
}
