# Design: Lite-Unterstützer

## Context

Befund am Stand `origin/main` (Release 1.13.0): `loadCollectiveStats` nutzt
`<slug>.json` und übernimmt nur `backersCount`. Die Mitgliederliste
`https://opencollective.com/onelitefeather/members/all.json` ist öffentlich
und liefert pro Eintrag u. a. `name`, `image`, `profile`, `role`, `isActive`,
aber auch `totalAmountDonated`, `email`, `github`, `lastTransactionAt`.
Am 2026-10-07: 37 Einträge; `BACKER` aktiv 28, davon mehrere Einträge für
dieselbe Person (gleiches Profil) sowie fünf anonyme „Guest“-Konten, ein
„Incognito“-Konto und das Kollektiv selbst (zwei Profile). `image` ist meist
`null`, bei einzelnen ein Gravatar mit `default=404`.

## Decisions

1. **Auswahl**: Rolle `BACKER` und `isActive === true`. Ausgeschlossen: Name
   gleich dem Slug des Kollektivs (ohne Beachtung der Schreibweise) oder Profil
   gleich der Kollektiv-URL; anonyme Namen `guest`, `incognito`, `anonymous`
   (sie sagen nichts über eine Person und würden als fünfmal „Guest“ erscheinen).
   Entdoppelt wird nach Profil-URL (erster Eintrag gewinnt). Das Profil muss
   eine `https://opencollective.com/…`-URL sein, sonst fällt der Eintrag weg.
2. **Datenschutz durch Beschneidung auf dem Server**: Die Ausgabe ist
   `{ name, image, profile }`, aus drei Feldern aufgebaut, nie per Spread. Das
   Bild gilt nur von den vertrauten Hosts
   (`opencollective-production.s3.us-west-1.amazonaws.com`,
   `images.opencollective.com`); alles andere, auch Gravatar, wird `null`, damit
   der Avatar weder bricht noch einen fremden Host lädt. Reihenfolge:
   alphabetisch ohne Beachtung der Schreibweise, nicht nach Betrag.
3. **Lader mit eingespeistem Abruf** in `shared/utils/liteSupporters.ts` (oberste
   Ebene, Nitro erreicht keinen App-Code), wirft bei jedem Fehler; die Route
   fängt zu `{ supporters: [] }`. Cache wie `discord.get.ts`:
   `defineCachedFunction`, `swr: false`, 3600 s, dazu der Cloudflare-Cache am
   Abruf. Ein Fehler wird nie gespeichert.
4. **Orchestrierung**: `useLiteSupporters` (Layer `opencollective`) holt nur die
   Liste. Das Wurzel-Composable `useCommunityOverview` reicht sie in
   `buildCommunityOverview`; die Team-Seite bildet Links über ein
   Wurzel-Composable. Der Team-Layer kennt weder `community` noch
   `opencollective`; er bekommt eine einfache Liste `{ name, image, href }` per
   Prop.
5. **Zusammenführung**: Die Wand sucht für jeden Unterstützer zuerst eine
   vorhandene Person, deren `mcName` oder `name` (kleingeschrieben) passt; nur
   sonst entsteht eine neue Person mit Schlüssel = kleingeschriebener Name. Das
   Abzeichen „Unterstützer“ kommt nach Bau und Event dazu und verweist auf das
   OpenCollective-Profil.
6. **Anker**: `personAnchor(name)` (`shared/utils/personAnchor.ts`) bildet
   `person-<slug>` (NFKD ohne Akzente, nicht-alphanumerisch zu `-`). Die Karte
   eines Unterstützers nimmt den Anker aus dem Namen **des Unterstützers**, auch
   wenn sie zu einem Bauherrn mit anderem `mcName` gehört; so kann die
   Team-Seite den Anker allein aus dem Namen ableiten, ohne die Wand zu laden.
   Andere Karten nehmen den Anker aus ihrem Schlüssel.
7. **Kachel „Unterstützer“**: zeigt die Länge der gelisteten Liste, damit Zahl
   und sichtbare Namen übereinstimmen (OpenCollectives `backersCount` zählt
   anders: inaktive, Duplikate, Gäste). Ist die Liste leer (Fehler), gilt der
   OpenCollective-Wert als Rückfall. Die Zahl „Mitwirkende“ schließt
   Unterstützer ein; der Schwellwert `MIN_CONTRIBUTORS_SHOWN` bleibt.
8. **Avatar**: OpenCollective-Bild über `NuxtImg` (Host in `image.domains`),
   sonst ein Platzhalter mit Anfangsbuchstaben; kein Minecraft-Kopf für
   Unterstützer ohne `mcName`.

## Risks

- Die Mitgliederliste ist keine zugesicherte API; ein Formatwechsel ergibt eine
  leere Liste statt eines Fehlers der Seite.
- Doppelte Anker bei Namen, die zum selben Slug führen, sind möglich und
  unschädlich (der Link landet auf der ersten Karte).
