// Public API of the base layer. Components are auto-imported by name and need
// no export; this covers what a consumer imports explicitly.
export { useAnalytics } from './composables/useAnalytics'
export { LEGAL_LINK_CLASS, TEXT_LINK_CLASS } from './utils/textLinkClasses'
export type {
  ButtonVariant,
  CardVariant,
  ChipLabelColor,
  ChipKind,
  IconButtonSize,
  IconButtonVariant,
  IconName,
  InteractiveTagOptions,
  M3Color,
} from './types'
