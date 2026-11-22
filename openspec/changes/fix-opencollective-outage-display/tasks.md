# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T. (`fetch` gestubbt, kein Netz).
Branch von aktuellem `origin/main`, nach dem Merge dieser Proposal-PR.

## 1. API und Typen

- [ ] 1.1 [Haiku] `tests/shared/openCollective.spec.ts` und `tests/opencollective/stats-route.spec.ts`: Handler mit gestubbtem `fetch` für Erfolg, HTTP-Fehler, Netzwerkfehler, kaputtes JSON und JSON ohne `balance`; Ausfall liefert `available: false` ohne Zahlen. Rot sehen
- [ ] 1.2 [Haiku] `CollectiveUnavailable`/`CollectiveResult` in `layers/opencollective/types.ts`; `loadCollectiveStats` wirft ohne numerisches `balance`; Handler liefert `available` und loggt Slug und Meldung; verifiziert durch grüne Tests aus 1.1

## 2. Anzeige

- [ ] 2.1 [Haiku] `tests/opencollective/use-open-collective.spec.ts` (nuxt-Umgebung, `registerEndpoint`): verfügbar liefert Zahlen, Ausfall liefert `available: false`, nach `onMounted` wird bei Ausfall einmal neu geladen. Rot sehen
- [ ] 2.2 [Haiku] `useOpenCollective` ohne Nullen-Fallback, mit einmaligem `refresh()` bei Ausfall; `pages/index.vue` rendert den Abschnitt nur bei `available`; verifiziert durch grüne Tests aus 2.1

## 3. Abschluss

- [ ] 3.1 [Haiku] `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline steigt nicht), `NODE_ENV=production pnpm build`
- [ ] 3.2 [Haiku] `.nuxtrc`-Änderungen und `openspec/` nicht in den Code-PR; Commits nur vom Typ `fix(opencollective)`
- [ ] 3.3 [Haiku] Pull Request gegen `main` mit dem Titel `fix(opencollective): hide the funding goal when the stats are unavailable` öffnen. Beschreibung auf Englisch als kurze Domain-Story, keine Session-Links oder Trailer
