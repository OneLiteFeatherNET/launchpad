# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Commits unter `feat(ui): …`, Tests im selben Commit wie der Code, den
sie treiben.

## 1. Klärung

- [ ] 1.1 In der Nuxt-Doku der installierten Version prüfen, wie `lazy` bei `useAsyncData` auf Server und Client wirkt und wie `showError` auf dem Client eine 404-Fehlerseite zeigt; Ergebnis festhalten

## 2. Bausteine

- [ ] 2.1 Test: `SkeletonBlock` nutzt nur Tokens, animiert nicht bei reduzierter Bewegung, ist für Screenreader verborgen; rot sehen
- [ ] 2.2 `SkeletonBlock` und Varianten (Textzeile, Bild mit Seitenverhältnis) in `layers/base`; grün
- [ ] 2.3 i18n-Schlüssel für den Ladetext (de, en)

## 3. Blog als erste Seite

- [ ] 3.1 Tests: Artikelseite zeigt Skeleton bei `pending`, Inhalt bei Daten, Fehlerseite bei leerem Ergebnis; SSR-HTML ohne Skeleton, Status 404 bei unbekanntem Slug; rot sehen
- [ ] 3.2 `useBlogArticle` auf Client-`lazy` mit 404-Behandlung umstellen, `ArticleSkeleton` bauen; grün
- [ ] 3.3 Dasselbe für Blogübersicht und Autor:innenseite

## 4. Weitere Seiten

- [ ] 4.1 Events (Übersicht, Detail)
- [ ] 4.2 Projekte (Übersicht, Detail mit POIs)
- [ ] 4.3 Community-POI (Detail mit Projekten)
- [ ] 4.4 Teamprofil (mit Artikeln und Projekten)

## 5. Prüfung und Abschluss

- [ ] 5.1 Browserprüfung nach `design.md`: Skeleton sofort nach Klick bei gedrosselter Content-Route, kein Layout-Sprung, Zurück ohne Skeleton, 404 nach Navigation
- [ ] 5.2 Screenshots der fertigen Seiten unverändert gegenüber `main`
- [ ] 5.3 `pnpm test`, Quality-Gate, `pnpm typecheck` und `pnpm build` laufen grün
- [ ] 5.4 Pull Request `feat(ui): show skeletons while a page loads on client navigation` öffnen
