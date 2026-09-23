import { computed, toValue, type MaybeRefOrGetter } from 'vue'
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
 */
export function useInteractiveTag(options: MaybeRefOrGetter<InteractiveTagOptions>) {
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

  return { tag, attrs }
}
