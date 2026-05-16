---
name: a11y-forms
description: >-
  Ensure forms are accessible on this Nuxt 4 site. Use when adding or
  changing any form field, validation, or error handling.
---

# Accessible Forms

Single topic: labelled, understandable, error-accessible forms.

- Every field has a programmatically associated `<label>`; related
  controls grouped with `<fieldset>`/`<legend>`.
- Errors linked via `aria-describedby` and announced — not colour-only.
- Appropriate input `type`/`autocomplete` for the data.

Verify: keyboard + screen-reader pass of the form, including the error
state; `pnpm lint` clean.
