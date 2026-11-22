# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T. (feste Eingabedaten, keine
Systemzeit, kein Server). Branch von aktuellem `origin/main`.

## 1. Formatierer

- [ ] 1.1 [Haiku] `tests/base/format-date.spec.ts`: UTC-Mitternacht für `en` und `de` als Kalendertag, Zeitpunkt in Europe/Berlin, ungültiger Wert ergibt `''`. Rot sehen
- [ ] 1.2 [Haiku] `layers/base/utils/formatDate.ts` mit `formatCalendarDate` und `formatInstant`; grün

## 2. Aufrufstellen

- [ ] 2.1 [Haiku] `tests/i18n/date-formatting.spec.ts` erweitern: kein `toLocale*String(` ohne `timeZone`, kein `d(`-Aufruf auf Datumswerten in `layers/`, `pages/`. Rot sehen
- [ ] 2.2 [Haiku] `Top1`, `ArticleCard`, `AuthorPostList`, `pages/blog/[...slug].vue`, `CommunityPoiMeta`, `CarouselItemBlog`, `CarouselItemNews`, `OpenCollectiveStats` auf den Formatierer umstellen; nur die Datumslogik anfassen

## 3. Abschluss

- [ ] 3.1 [Haiku] `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline steigt nicht), `NODE_ENV=production pnpm build`
- [ ] 3.2 [Haiku] Commits nur vom Typ `fix(base)`; `.nuxtrc` nicht committen
- [ ] 3.3 [Haiku] Pull Request gegen `main` mit dem Titel `fix(base): show dates in one fixed time zone on server and client` öffnen; Beschreibung auf Englisch als kurze Domain-Story, keine Session-Links oder Trailer
