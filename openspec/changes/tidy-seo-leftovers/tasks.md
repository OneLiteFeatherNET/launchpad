# Tasks

Test zuerst, dann Code. Tests nach F.I.R.S.T. (reine Datei-Lesetests, kein
Server). Branch von aktuellem `origin/main`.

## 1. FAQPage-Markup

- [x] 1.1 [Haiku] `tests/seo/retired-rich-results.spec.ts`: kein Quelltext unter `layers/`, `pages/`, `layouts/`, `app.vue` enthält `'@type': 'FAQPage'`; ein Selbsttest zeigt, dass das Muster eine Beispielzeile trifft (sonst wäre die Regel leer). Rot sehen
- [x] 1.2 [Haiku] `useSchemaOrg`-Block und Kommentar in `layers/home/components/FaqSection.vue` und `layers/team/components/TeamFaqSection.vue` entfernen, ungenutzte Importe mit; `'FAQPage'` aus `schemaType` in `layers/content-core/types-seo.ts` streichen; verifiziert durch grüne Tests aus 1.1 und `pnpm exec vitest run tests/home tests/team tests/architecture`

## 2. favicon.ico

- [x] 2.1 [Haiku] `tests/seo/favicon-ico.spec.ts`: `public/favicon.ico` existiert, beginnt mit `00 00 01 00`, das ICO-Verzeichnis enthält 16 und 32 Pixel. Rot sehen
- [x] 2.2 [Haiku] `magick -background none public/favicon.svg -define icon:auto-resize=48,32,16 public/favicon.ico` ausführen und die Datei einchecken; verifiziert durch grüne Tests aus 2.1

## 3. Abschluss

- [x] 3.1 [Haiku] `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline steigt nicht)
- [x] 3.2 [Haiku] `NODE_ENV=production pnpm build`, `pnpm preview:prod`; per `curl`: `/favicon.ico` → 200, mehr als 78 Bytes; `/en` und `/en/team` enthalten kein `FAQPage` im JSON-LD, der FAQ-Abschnitt ist im HTML
- [x] 3.3 [Haiku] `.nuxtrc`-Änderungen und `openspec/config.yaml` nicht committen; Commits nur vom Typ `chore(seo)`
- [x] 3.4 [Haiku] Pull Request gegen `main` mit dem Titel `chore(seo): drop retired faqpage markup and serve a real favicon.ico` öffnen. Beschreibung auf Englisch als kurze Domain-Story (keine PR-Vorlage im Repo): warum FAQ-Markup nichts mehr bringt und einen zweiten Seitenknoten erzeugte, was `/favicon.ico` vorher lieferte, Messung im Preview. Keine Session-Links oder Trailer
