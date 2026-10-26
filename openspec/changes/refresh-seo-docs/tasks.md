# Tasks

Nur Doku, kein Code. Kurz halten: keine Kommentarwände, nur das nicht
offensichtliche Warum. Englisch wie die übrigen Dateien. Branch von aktuellem
`origin/main`.

## 1. Sofort möglich

- [x] 1.1 [Haiku] `AGENTS.md`, Abschnitt „Caching and SEO signals“: den Satz „`nuxt-schema-org` 6.3.2 is patched …“ ersetzen durch „`nuxt-schema-org` runs unpatched (6.4.3).“; vorher prüfen: `ls patches` schlägt fehl, `pnpm-workspace.yaml` hat keinen `patchedDependencies`-Eintrag
- [x] 1.2 [Haiku] `.claude/skills/nuxt-seo/references/schema-org-and-site-identity.md`: Satz „Neither key exists …“ korrigieren — `nuxtSiteConfig.description` existiert in beiden Locale-Dateien, `nuxtSiteConfig.name` nicht

## 2. Nach dem Merge von `fix-seo-brand-signals`

- [ ] 2.1 [Haiku] Dieselbe Referenz: Abschnitt „One WebSite at the domain root“ (Datei des Plugins, Fragment-Schlüssel `#website`, `tagDuplicateStrategy: 'replace'`, `isPartOf`-Merge, kein zweites `defineWebSite`, `url` nie auf `/en`, CI-Prüfung in `scripts/jsonld-checks.mjs`) — höchstens ~15 Zeilen
- [ ] 2.2 [Haiku] `.claude/skills/nuxt-seo/SKILL.md`: Zeile in der Emitter-Tabelle für den WebSite-Knoten; `AGENTS.md` um einen Satz mit Verweis darauf ergänzen
- [ ] 2.3 [Haiku] Prüfen, dass jeder in der Doku genannte Pfad existiert (`ls`)

## 3. Abschluss

- [ ] 3.1 [Haiku] `openspec/config.yaml` nicht committen; Commits nur vom Typ `docs(seo)`
- [ ] 3.2 [Haiku] Pull Request gegen `main` mit dem Titel `docs(seo): correct stale schema-org notes` öffnen. Beschreibung auf Englisch als kurze Domain-Story (keine PR-Vorlage im Repo): welche Aussage falsch war und woran man es sieht, was ein Agent jetzt über die WebSite-Identität findet. Keine Session-Links oder Trailer
