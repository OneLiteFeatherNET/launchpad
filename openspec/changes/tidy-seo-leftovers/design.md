# Design: Totes FAQ-Markup entfernen, echtes favicon.ico

## Context

Motivation: siehe `proposal.md`. Gelesen an `origin/main` `c28dda8`.

- `FaqSection.vue:33-53` und `TeamFaqSection.vue:30-50` rufen
  `useSchemaOrg(computed(() => [{ '@type': 'FAQPage', mainEntity: … }]))`
  mit `extractPlainText` für die Antworten auf. `FaqSection` hängt auf
  `pages/index.vue:74`, `TeamFaqSection` auf `pages/team/index.vue:80`.
- `@unhead/schema-org` behandelt einen rohen `{ '@type': 'FAQPage' }` als
  eigenen Knoten (kein `#webpage`-Fragment), also zwei Seitenknoten pro URL.
- `public/` enthält `favicon.svg` (1024×1024-Viewbox), kein `favicon.ico`.
  `nuxt.config.ts:47` und `app.vue:35` deklarieren nur das SVG.

## Goals / Non-Goals

**Goals:** kein Markup für einen eingestellten Rich-Result-Typ; eine echte
`/favicon.ico`.

**Non-Goals:** die FAQ-Inhalte oder ihre Darstellung ändern; Event- oder
SoftwareApplication-Markup anfassen; saisonale Favicons als ICO.

## Decisions

1. **Entfernen statt nur den Kommentar korrigieren.** Nur den Kommentar zu
   korrigieren ließe einen zweiten Seitenknoten im Graph, der Google nichts
   mehr bringt und andere Prüfungen (ein `WebPage` pro Seite) stört. Dass
   andere Suchmaschinen oder Assistenten `FAQPage` auswerten, ist nicht
   belegt; der sichtbare FAQ-Text bleibt für sie lesbar. Die Entscheidung ist
   umkehrbar: Wird FAQ-Markup wieder gebraucht, gehört es als
   `mainEntity` an den `#webpage`-Knoten, nicht als eigener Knoten.
2. **`extractPlainText` bleibt**, falls ihn noch andere Stellen nutzen; nur
   ungenutzte Importe in den beiden Komponenten fallen weg.
3. **favicon.ico einmalig erzeugt und eingecheckt**, nicht im Build: z. B.
   `magick -background none public/favicon.svg -define icon:auto-resize=48,32,16 public/favicon.ico`.
   Kein neues Build-Werkzeug, keine Abhängigkeit. Statische Dateien aus
   `public/` liefert Cloudflare direkt; der Nitro-Stub greift dann nicht mehr.
4. **Typ `chore(seo)`**: Aufräumen ohne neues Verhalten für Besucher. Die
   sichtbare Seite ändert sich nicht.

## Risks / Trade-offs

- Sollte Google FAQ-Ergebnisse wieder einführen, fehlt das Markup — bewusst
  in Kauf genommen (siehe Entscheidung 1).

## Open Questions

1. Einverstanden mit Entfernen statt Kommentar-Korrektur?
