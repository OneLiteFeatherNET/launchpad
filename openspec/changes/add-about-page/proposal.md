# Proposal: Über-uns-Seite

Ausgeliefert als `feat(about)`.

## Why

Wer die Website zum ersten Mal besucht, findet nirgends in ein, zwei Absätzen,
wer OneLiteFeather ist und wofür das Netzwerk steht. Der Fußzeilen-Link „Über
uns“ führt deshalb auf die Community-Seite, die Zahlen zeigt, aber nichts
erklärt. Auch Suchmaschinen haben keine Seite, die die Organisation beschreibt.

## What Changes

- **Neue Seite `/<locale>/about`** („Über uns“ / „About us“), indexierbar, in
  der Sitemap, mit Schema.org `AboutPage`, deren `about` auf den vorhandenen
  Organization-Knoten der Seite zeigt (keine zweite Organisation).
- **Aufbau**: Wer wir sind, Was uns ausmacht (vier Säulen mit Symbol und Link),
  Zahlen (der vorhandene Community-Zahlenstreifen mit Link auf `/community`),
  Wie wir arbeiten, Mitmachen (Spielen, Discord, Bewerben, Unterstützen).
- **Inhalt in `@nuxt/content`**: neue Datensammlung `about`
  (`content/about/<locale>/home.json`) nach dem Muster von `server_concept`;
  Repository-Methode `getAboutDocument`, projiziert ohne `path`/`stem`.
  Beschriftungen der Oberfläche liegen in `i18n/locales/{de,en}.json`.
- **Neue Layer `layers/about`** (Komponenten, Typen, Composable). Die Zahlen
  kommen von der Seite (Orchestrierung), nicht aus der Layer.
- **Fußzeile**: „Über uns“ führt auf `/<locale>/about` statt auf `/community`.
- **Navigation**: „Über uns“ als Kind der Gruppe „Mehr“; die oberste Ebene
  bleibt bei höchstens sechs Einträgen.
- **Organization**: `foundingDate` wird von `2019-09-01` auf `2021` gesetzt,
  damit die strukturierten Daten dem Text der Seite („2021 gegründet“)
  entsprechen.
- Nicht in diesem Change: neue Zahlen, Team-Vorstellung, Zeitleiste.

## Capabilities

### New Capabilities

- `about-page`: Seite, Inhalt, Zahlen, Mitmachen, SEO und Fußzeilen-Link.

### Modified Capabilities

- `main-navigation`: Die Gruppe „Mehr“ enthält zusätzlich „Über uns“.

## Impact

- `layers/about/` (neu), `pages/about.vue` (neu)
- `content.config.ts`, `content/about/{de,en}/home.json` (neu)
- `layers/content-core/utils/content/{repository,nuxtContentAdapter}.ts`,
  `layers/content-core/{index,types}.ts`
- `layers/footer/components/SiteFooter.vue`, `layers/navigation/navItems.ts`,
  `i18n/locales/{de,en}.json`, `nuxt.config.ts` (`foundingDate`), `AGENTS.md`
- `tests/about/`, bestehende Tests für Fußzeile und Navigation (angepasst)
- Keine neuen Abhängigkeiten.
