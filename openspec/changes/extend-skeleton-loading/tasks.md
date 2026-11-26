# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Commits unter `feat(ui): …`, Tests im selben Commit wie der Code, den
sie treiben. Voraussetzung: `add-skeleton-loading` ist auf `main`.

## 1. Bestandsaufnahme

- [ ] 1.1 Für Startseite, Team-Übersicht, Community-Seite und „Über uns“ im Code bestätigen, welche Abfragen sie nutzen und ob sie beim Seitenwechsel blockieren oder leer rendern; Abweichungen zu `design.md` festhalten

## 2. Team-Übersicht

- [ ] 2.1 Tests: Skeleton bei `pending`, Karten bei Daten, Server-HTML ohne `aria-busy`; rot sehen
- [ ] 2.2 `useTeamRoster` auf `PAGE_DATA_OPTIONS` mit `status`, `TeamRosterSkeleton` bauen; grün

## 3. Community-Seite und „Über uns“

- [ ] 3.1 Community-Seite (`useCommunityOverview`) wie 2.1/2.2
- [ ] 3.2 „Über uns“ (`useAbout`) wie 2.1/2.2, ohne blockierendes `await` auf dem Client

## 4. Startseite

- [ ] 4.1 Tests: je Abschnitt Platzhalter bei `pending`, Inhalt bei Daten, ausgeblendet bei leerem Ergebnis; Server-HTML mit LCP-Preload und ohne `aria-busy`; rot sehen
- [ ] 4.2 Abfragen der Startseite auf `PAGE_DATA_OPTIONS` umstellen, Abschnitts-Platzhalter bauen; grün

## 5. Prüfung und Abschluss

- [ ] 5.1 Browserprüfung nach `design.md`: Skeleton sofort nach Klick bei gedrosselter Content-Route, Überschriften ohne Sprung, Zurück ohne Skeleton
- [ ] 5.2 Screenshots der fertigen Seiten unverändert gegenüber `main`
- [ ] 5.3 Lighthouse mobil Startseite lokal: LCP und CLS nicht schlechter als `main`
- [ ] 5.4 `pnpm test`, Quality-Gate, `pnpm typecheck` und `pnpm build` laufen grün
- [ ] 5.5 Pull Request `feat(ui): show skeletons on the home, team, community and about pages` öffnen
