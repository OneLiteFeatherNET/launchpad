/**
 * Lite supporters as plain `{ name, image, href }` for the team page, each
 * linking to its card on the community wall. Lives at the root because the
 * team layer may not know the opencollective or community layers.
 */
export function useLiteSupporterLinks() {
  const { locale } = useI18n()
  const { supporters } = useLiteSupporters()

  return computed(() => supporters.value.map((supporter) => ({
    name: supporter.name,
    image: supporter.image,
    href: `/${locale.value}/community#${personAnchor(supporter.name)}`
  })))
}
