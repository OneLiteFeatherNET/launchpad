# Design: Über-uns-Seite

## Context

Befunde am Stand `origin/main` (`4c21639`):

- Statische Texte liegen als Datensammlung je Sprache
  (`server_concept`, `sponsors`), Zugriff nur über `ContentRepository`, das
  jede Zeile ohne `path`/`stem` liefert (`withoutRoutes`).
- Die Organisation steht einmal in `nuxt.config.ts` (`schemaOrg.identity`,
  Produktion überschreibt nur `url` und `logo`); `foundingDate` ist dort
  `2019-09-01`. `usePageSeo` verfeinert den `WebPage`-Knoten der Seite und
  akzeptiert `schemaType: 'AboutPage'`.
- Die Zahlen stammen aus `useCommunityOverview()` (Wurzel-Composable), die
  Komponente `CommunityStrip` zeigt sie samt Link.
- Otis ist ein eigenes Projekt (`github.com/OneLiteFeatherNET/Otis`, Blog
  „Otis: Zentrale Spielerstammdaten“); die Säule darf es nennen.
- OpenCollective-Buchungen sind ohne Anmeldung abrufbar (GraphQL
  `account(slug: "onelitefeather").transactions` liefert 465 Einträge ohne
  Token); „öffentlich einsehbar“ trägt.

## Decisions

1. **Datensammlung statt Markdown.** Die Seite besteht aus Absätzen und vier
   gleich gebauten Säulen, nicht aus Fließtext mit Überschriften; JSON hat das
   Schema, das eine fehlende Säule beim Build meldet. Die Säulen tragen
   `icon` (Font-Awesome-Name), `title`, `text` und `to` (Pfad ohne Locale).
2. **Eigene Layer `about`.** Sie nennt keine andere Domäne; `pages/about.vue`
   setzt Layer-Komponenten und `CommunityStrip` zusammen und reicht die Zahlen
   hinein. Die Layer-Komponenten tragen Namen, die in keiner anderen Layer
   vorkommen.
3. **Eine Organisation.** Die Seite verweist per `@id` auf den Identitätsknoten
   (`<site.url>/#identity`) und legt keinen zweiten an. `foundingDate` wird
   an der einen Stelle geändert.
4. **`foundingDate: 2021`.** Der Wert `2019-09-01` stimmt nicht mit dem
   Gründungsjahr auf der Seite überein; die Seite nennt 2021, also ändert der
   Change den Wert. Das ist eine Inhaltsentscheidung der Betreiber und steht
   in der PR-Beschreibung.
5. **Mitmachen als Link-Liste in der Seite.** Die vier Ziele sind keine
   redaktionellen Inhalte; Discord kommt aus `runtimeConfig.public.discordUrl`
   (eine Stelle für die Einladung), Spielen/Bewerben sind lokalisierte
   Pfade, Unterstützen ist die OpenCollective-Adresse.
6. **Keine Blog-Links mit festen Slugs in den Säulen.** Die Säule „Technik“
   verlinkt auf die Blog-Übersicht, Säulen auf Übersichtsseiten, damit kein
   Link bricht, wenn ein Artikel umbenannt wird.

## Risks

- Der Edge-Cache hält die Zahlen bis zu rund 70 Minuten; für eine Über-uns-Seite
  ohne Uhrzeitlogik unkritisch.
