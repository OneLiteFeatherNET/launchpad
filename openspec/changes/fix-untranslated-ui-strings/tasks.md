# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T. (reine Datei-Lesetests, kein
Server). Branch von aktuellem `origin/main`.

## 1. Test

- [ ] 1.1 [Haiku] `tests/i18n/hardcoded-text.spec.ts`: Selbsttest des Musters plus Scan aller `.vue`-Templates (Ausnahmen: Eigennamen, `privacy`, `imprint`). Rot sehen

## 2. Beschriftungen

- [ ] 2.1 [Haiku] `carousel.more` und `carousel.details` in `en.json` und `de.json` anlegen; in `CarouselItemNews.vue` und `CarouselItemEvent.vue` per `t()` einsetzen (nur die Beschriftungszeilen); verifiziert durch grüne Tests aus 1.1 und `pnpm exec vitest run tests/i18n`

## 3. Abschluss

- [ ] 3.1 `pnpm build`, `pnpm test`, `pnpm quality`, `pnpm typecheck` laufen
- [ ] 3.2 Code-Pull-Request mit dem Titel `fix(i18n): translate hard-coded ui labels` öffnen
