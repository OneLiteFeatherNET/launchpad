# Proposal: Totes FAQ-Markup entfernen, echtes favicon.ico

Ausgeliefert als `chore(seo)`. Pull-Request-Titel:
`chore(seo): drop retired faqpage markup and serve a real favicon.ico`

## Why

Zwei Reste aus dem SEO-Audit vom 2026-10-26, die nicht zu den Marken- und
Strukturdaten-Fixes in `fix-seo-brand-signals` gehören:

1. **FAQPage-Markup ohne Wirkung.** Google hat FAQ-Rich-Results am
   2026-05-07 eingestellt. `layers/home/components/FaqSection.vue` (Startseite)
   und `layers/team/components/TeamFaqSection.vue` (`/<locale>/team`)
   registrieren trotzdem je einen `FAQPage`-Knoten. Der Kommentar dort sagt
   noch, Google beschränke FAQ-Rich-Results auf Gesundheits- und
   Behördenseiten — veraltet. Außerdem ist `FAQPage` ein Seitentyp: Die Seite
   trägt damit neben ihrem `WebPage` (`#webpage`) einen zweiten,
   unverbundenen Seitenknoten, genau die Doppelung, die `usePageSeo` sonst
   vermeidet.
2. **`/favicon.ico` ist ein Platzhalter.** `public/` hat nur `favicon.svg`;
   `/favicon.ico` liefert Nitros 78-Byte-Data-URI-Stub. Browser und manche
   Crawler fragen `/favicon.ico` ohne `<link>` ab.

## What Changes

- Den `useSchemaOrg`-Block mit `FAQPage` in beiden FAQ-Komponenten
  entfernen, samt Kommentar und dem dann ungenutzten Import/Helper-Aufruf.
  Die sichtbaren FAQ-Abschnitte bleiben unverändert.
- `FAQPage` aus der `schemaType`-Union in
  `layers/content-core/types-seo.ts` streichen (kein Aufrufer nutzt es).
- `public/favicon.ico` (16, 32, 48 px) einmalig aus `public/favicon.svg`
  erzeugen und einchecken. Kein zusätzliches `<link>`; das SVG-Icon bleibt
  das deklarierte.
- Ein Test hält fest, dass kein Quelltext mehr `FAQPage` registriert und dass
  `public/favicon.ico` eine echte ICO-Datei ist.

## Capabilities

### New Capabilities

- `site-assets`: `/favicon.ico` ist eine echte Icon-Datei.

### Modified Capabilities

- `structured-data` (eingeführt mit `fix-seo-brand-signals`): kein
  Markup für eingestellte Rich-Result-Typen. Ist jener Change beim Archivieren
  noch nicht archiviert, entsteht die Capability hier neu.

## Impact

- `layers/home/components/FaqSection.vue`,
  `layers/team/components/TeamFaqSection.vue`,
  `layers/content-core/types-seo.ts`
- `public/favicon.ico` (neu)
- `tests/seo/` (neuer Test)
- Unabhängig von `fix-seo-brand-signals`; beide können in beliebiger
  Reihenfolge landen. Keine neuen Abhängigkeiten.
