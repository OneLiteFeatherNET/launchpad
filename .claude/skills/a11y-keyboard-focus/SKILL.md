---
name: a11y-keyboard-focus
description: >-
  Ensure full keyboard operability and visible focus on this Nuxt 4
  site. Use when adding interactive elements, overlays, or menus.
---

# Keyboard & Focus

Single topic: everything operable by keyboard with visible focus.

- Every interactive element reachable/operable by keyboard; no
  interactive `div`/`span`.
- Visible `focus-visible:ring-*` on all focusable elements.
- Overlays/dialogs trap focus, restore on close, close on `Escape`.
- The skip link in `layouts/default.vue` still targets `#main-content`.

Verify: keyboard-only walk of the changed flow; `pnpm lint` clean.
