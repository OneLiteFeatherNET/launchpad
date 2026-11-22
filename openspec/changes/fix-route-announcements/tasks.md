# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T. Branch von aktuellem `origin/main`.

## 1. Route-Announcer

- [ ] 1.1 [Haiku] `tests/a11y/route-announcer.spec.ts`: `app.vue` enthält `<NuxtRouteAnnouncer`, und zwar außerhalb von `NuxtLayout`. Rot sehen
- [ ] 1.2 [Haiku] `<NuxtRouteAnnouncer />` in `app.vue` einfügen; grün

## 2. Karussell

- [ ] 2.1 [Haiku] `tests/a11y/carousel-semantics.spec.ts`: `role="region"`, `aria-roledescription="carousel"`, Name aus `carousel.label`; Slides `role="group"`, `aria-roledescription="slide"`, Label aus `carousel.slide_position`; kein `tabindex="0"` ohne Namen; die i18n-Schlüssel existieren in en und de. Rot sehen
- [ ] 2.2 [Haiku] `role="region"` ergänzen, `tabindex="0"` am Rahmen entfernen; grün

## 3. Abschluss

- [ ] 3.1 [Haiku] `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline steigt nicht)
- [ ] 3.2 [Haiku] `NODE_ENV=production pnpm build`, Vorschau; im HTML von `/en` ist der Announcer vorhanden
- [ ] 3.3 [Haiku] `.nuxtrc`-Änderungen und `openspec/` nicht im Code-PR committen; Commits nur vom Typ `fix(a11y)`
- [ ] 3.4 [Haiku] Pull Request gegen `main` mit dem Titel `fix(a11y): announce page changes and label the carousel` öffnen. Beschreibung auf Englisch als kurze Domain-Story. Keine Session-Links oder Trailer
