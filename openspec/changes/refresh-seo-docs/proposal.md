# Proposal: SEO-Doku an den Stand des Repos angleichen

Ausgeliefert als `docs(seo)`. Pull-Request-Titel:
`docs(seo): correct stale schema-org notes`

## Why

Agenten und Menschen lesen `AGENTS.md` und den `nuxt-seo`-Skill, bevor sie
SEO-Code anfassen. Zwei Aussagen dort stimmen nicht mehr, und die mit
`fix-seo-brand-signals` eingeführte Root-Identität ist nirgends beschrieben:

1. `AGENTS.md` („Caching and SEO signals“) sagt, `nuxt-schema-org` 6.3.2 sei
   über `patches/` gepatcht. Der Patch wurde mit #397 entfernt; installiert
   ist 6.4.3 ungepatcht, es gibt weder `patches/` noch einen Eintrag in
   `pnpm-workspace.yaml`.
2. `.claude/skills/nuxt-seo/references/schema-org-and-site-identity.md` sagt,
   weder `nuxtSiteConfig.name` noch `nuxtSiteConfig.description` existiere in
   den Locale-Dateien. `nuxtSiteConfig.description` existiert in `de.json`
   und `en.json`; nur `name` fehlt.
3. Nach `fix-seo-brand-signals` ersetzt ein Plugin den WebSite-Knoten des
   Moduls. Wer das nicht weiß, sucht den Knoten im Modul-Default oder fügt
   einen zweiten hinzu.

## What Changes

- `AGENTS.md`: den Patch-Satz ersetzen durch: `nuxt-schema-org` läuft
  ungepatcht; der WebSite-Knoten wird von
  `layers/content-core/plugins/site-identity.server.ts` auf Domain-Ebene
  gesetzt (ein Satz, Verweis auf den Skill).
- Skill-Referenz `schema-org-and-site-identity.md`: die falsche
  `nuxtSiteConfig`-Aussage korrigieren; neuer Abschnitt „One WebSite at the
  domain root“: warum (Googles Site-Name-Regeln, 302 auf `/`), wie
  (Fragment-Schlüssel `#website`, `tagDuplicateStrategy: 'replace'`,
  `isPartOf`-Merge), was man nicht tun soll (zweites `defineWebSite`, `url`
  auf `/en`), und dass `scripts/jsonld-checks.mjs` es in CI prüft.
- `SKILL.md` des Skills: in der Emitter-Tabelle eine Zeile für den
  WebSite-Knoten.

## Capabilities

### New Capabilities

- `agent-guidance`: Die Repository-Doku für Agenten beschreibt die
  SEO-Module so, wie sie installiert und verdrahtet sind.

### Modified Capabilities

Keine.

## Impact

- `AGENTS.md`, `.claude/skills/nuxt-seo/SKILL.md`,
  `.claude/skills/nuxt-seo/references/schema-org-and-site-identity.md`
- Nur Doku. Punkt 3 setzt voraus, dass `fix-seo-brand-signals` gemergt ist;
  Punkte 1 und 2 können sofort landen. Wird dieser Change vor dem Fix
  umgesetzt, entfällt Punkt 3 und kommt als eigener `docs`-Commit nach.
