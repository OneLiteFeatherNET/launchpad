# Design: Community-Seite

## Context

Motivation und Umfang: siehe `proposal.md`. Anforderungen: siehe `specs/`.

Befunde am Stand `origin/main` (`e6e3d3c`, Release 1.9.0):

- **Bauherren**: `community_poi.builders[]` ist `{ name, mcName?, link? }`
  (`content.config.ts`). `listCommunityPois(locale)` projiziert die Felder
  bereits samt `builders`, ohne `path`/`stem`. Heute nennen die Inhalte `blndr2`
  und `Svenko1`, jeweils mit `mcName`.
- **Platzierungen**: `events.results.placements[]` ist
  `{ place, name, mcName?, image?, imageAlt? }`. `listEvents(locale)` projiziert
  `event`, `unlisted` und `results`; die Detailseite zeigt Ergebnisse nur bei
  vergangenen Events. Im Repository liegt derzeit kein Event-Inhalt, die Wand
  hängt also heute nur an den Bauherren. Die Events-Regel ist trotzdem
  vollständig umzusetzen und zu testen.
- **Sichtbarkeit**: `isEventListedAt` und `eventPhaseAt` (`shared/utils/eventPhase.ts`)
  sind die eine Regel für Übersicht, Karussell und Sitemap.
- **OpenCollective**: `loadCollectiveStats` liest `https://opencollective.com/<slug>.json`
  und übernimmt nur `backersCount` (als `contributors`), Saldo und Ziel. Diese
  Schnittstelle nennt keine Namen; öffentliche Unterstützernamen gibt es dort
  nicht ohne Token (GraphQL).
- **Team**: `getTeamDocument(locale).members` enthält neben Mitgliedern auch
  Einträge mit `openPosition`; `useTeamRoster().memberCount` zählt nur echte
  Mitglieder.
- **Discord**: `https://1lf.link/discord` leitet auf
  `discord.com/invite/yzkf2H9UQD`. Der Endpunkt
  `GET /api/v10/invites/<code>?with_counts=true` liefert ohne Token
  `approximate_member_count`.
- **Muster**: `server/api/opencollective.get.ts` nutzt `defineCachedFunction`
  (`swr: false`, Fehler nicht gecacht) und liefert bei Fehler eine Rückfalleinheit
  mit Status 200; `layers/opencollective` ruft die Route per `useAsyncData` ab.
  `/api/**` hat `no-store` am Rand, der Zwischenspeicher liegt im Server.
- **Sitemap**: `strictSeo`; statische Seiten (`team`, `community-poi`) kommen
  ohne eigene Quelle über die Routen des i18n-Moduls in die Sitemap. Eine
  Seite `pages/community.vue` braucht also keine Quelle.

## Goals / Non-Goals

**Goals:** eine Seite mit Zahlen und Wand aus bereits öffentlichen Daten; Discord
darf ausfallen, ohne dass die Seite es merkt; Domänen kennen einander weiter nicht.

**Non-Goals:** Live-Spielerzahlen; Namen von Unterstützern; neue Inhaltsfelder;
Team-Profil-Links in der Wand; Pflege einer eigenen Mitwirkenden-Liste.

## Decisions

1. **Layer `community` hält Darstellung und reine Aggregation, sonst nichts.**
   `utils/contributors.ts` exportiert `buildCommunityOverview(input)`; sie nimmt
   schlichte Daten (POIs mit `slug`, `title`, `builders`; Events mit `slug`,
   `title`, `unlisted`, `event`, `results.placements`; Teamgröße; Sprache; `now`)
   und liefert `{ teamSize, buildCount, contributors }`. Die Typen
   (`CommunityPoiSource`, `CommunityEventSource`) sind in `types.ts` selbst
   definiert und strukturell kompatibel zu den Zeilen des Repositorys, statt
   Typen von `community-poi` oder `events` zu importieren. Die Layer-Regel
   (Domänen kennen sich nicht) bleibt ohne Ausnahme; `tests/architecture/module-boundaries.spec.ts`
   und `layer-name-collisions.spec.ts` lesen `layers/` dynamisch und erfassen
   die neue Layer ohne Änderung. `isEventListedAt` kommt aus `shared/utils`,
   nicht aus der Events-Layer.
2. **Zusammentragen in `composables/useCommunityOverview.ts` (Wurzelebene).**
   Wurzelcode darf jede Layer kennen. Eine `useAsyncData`-Abfrage (Schlüssel
   `community-overview-<locale>`) lädt `listCommunityPois`, `listEvents` und
   `getTeamDocument` parallel über `useContentRepository()`, bestimmt `now` im
   Handler und gibt das reine Ergebnis zurück. Das Ergebnis steht im Payload;
   der Browser fragt die Uhr nicht erneut (Hydrierung wie bei den Events). Beide
   Seiten, Startseite und Community-Seite, rufen dasselbe Composable und teilen
   so den Schlüssel. Ein Composable statt Logik in den Seiten, weil sonst zwei
   Seiten dieselbe Zusammenführung kopieren würden.
3. **Dedupe-Schlüssel `(mcName ?? name).trim().toLowerCase()`.** `mcName` ist die
   Identität im Spiel, der Name nur Anzeige; ohne `mcName` bleibt der Name. Der
   Anzeigename ist der des ersten Beitrags in der Eingabereihenfolge (POIs vor
   Events), damit er nicht von der Sortierung der Wand abhängt. Sortierung:
   Beiträge absteigend, dann `localeCompare` des Namens.
4. **Events zählen nur, wenn `isEventListedAt` gilt und die Phase `past` ist.**
   Das ist dieselbe Regel, nach der die Detailseite Ergebnisse zeigt. Ein
   `unlisted`- oder verborgenes Event wird vor jeder weiteren Verarbeitung
   verworfen, sodass seine Namen weder in der Zahl noch im Payload landen. Der
   Payload enthält nur `name`, `mcName`, Abzeichen (Art, Titel, Pfad,
   Platzierung): nie `path`/`stem` der Content-Zeile, nie `results`.
5. **Pfade bauen die Quellen selbst**: POI `/<locale>/community-poi/<slug>`,
   Event über `eventDetailPath` aus `shared/utils/eventRoutes`. Das ist dieselbe
   Schreibweise wie die Seiten und kommt ohne Schrägstrich am Ende.
6. **Unterstützer: nur eine Zahl.** Die öffentliche JSON-Schnittstelle liefert
   `backersCount`, keine Namen. Die Zahl steht als eigene fünfte Kachel
   „Unterstützer“ (nur wenn `contributors` nicht `null`), wird aber nicht zu den
   Mitwirkenden addiert: Eine Zahl ohne Namen lässt sich weder deduplizieren
   noch von Bauherren und Gewinnern unterscheiden, die Summe wäre also
   falsch oder doppelt gezählt. Die Zahl „Mitwirkende“ zählt deshalb nur
   benannte Personen. Dies ist eine Abweichung vom Wunsch, Unterstützer in die
   Mitwirkenden zu rechnen, begründet durch die Datenlage.
7. **Discord über Nitro, Abruf injizierbar.** `shared/utils/discordInvite.ts`
   (oberste Ebene von `shared/utils/`, damit Nitro es automatisch importiert)
   exportiert `loadDiscordMemberCount(fetcher, code)` und die Konstante
   `DISCORD_CACHE_TTL = 3600`. Sie wirft bei jedem Fehler (Status, kein
   JSON, keine Zahl), damit `defineCachedFunction` ihn nicht speichert. Die
   Route `server/api/community/discord.get.ts` umhüllt sie wie
   `opencollective.get.ts` mit `defineCachedFunction` (`swr: false`) und fängt
   den Fehler zu `{ members: null }`. Zeitgrenze `AbortSignal.timeout(5000)`;
   dazu die Cloudflare-Cache-Optionen wie bei OpenCollective. Der Code kommt
   aus privater `runtimeConfig.discordInviteCode` (Vorgabe `yzkf2H9UQD`,
   `NUXT_DISCORD_INVITE_CODE`); er ist kein Geheimnis, muss aber nicht in den
   Client.
8. **Client: `useDiscordMembers()` in der Layer** ruft `/api/community/discord`
   per `useAsyncData` (`timeout: 5000`) und fällt auf `{ members: null }`
   zurück, genau wie `useOpenCollective`. Die Seite rendert nach dem Abruf; die
   Kachel entfällt bei `null`.
9. **Darstellung mit M3-Bausteinen.** `CommunityStats` ist eine `<dl>` in einem
   Raster aus `M3Card`-Kacheln (Wert als `dd`, Beschriftung als `dt`); die Wand
   ist eine `<ul>` mit einem `<li>` je Person: Kopf (`NuxtImg`, `alt=""`, weil der
   Name daneben steht), Name und `M3Chip` (`kind="assist"`, `to`) je Beitrag.
   Der Kopf kommt aus `teamAvatarUrl({ mcName })`; ohne `mcName` bleibt der
   Steve-Rückfall des Helfers. Überschriften: `h1` Seitentitel, `h2` „Mitwirkende“.
   `CommunityStrip` (Startseite) ist ein schmaler Streifen mit denselben Zahlen
   und einem Link; er bekommt seine Daten als Props, ruft nichts selbst ab
   (`home-data-waterfall`-Regel).
10. **Navigation und SEO.** Eintrag `{ routeName: 'community', icon: ['fas', 'handshake'] }`
    nach „Events“ (Icon ist registriert). `usePageSeo` mit `schemaType: 'CollectionPage'`
    und Titel; `useBreadcrumbs`. Canonical und hreflang liefert wie bei den
    übrigen statischen Seiten das i18n-Modul; am Build zu belegen.

11. **Kleine Zahlen werden nicht gezeigt.** Die Seite soll zeigen, wie groß die
    Community ist; „2 Mitwirkende“ neben 308 Discord-Mitgliedern liest sich
    winzig und widerspricht dem Ziel. Die Kachel „Mitwirkende“ erscheint daher
    erst ab `MIN_CONTRIBUTORS_SHOWN = 10` (`layers/community/utils/thresholds.ts`)
    und nie im Streifen der Startseite; der Streifen zeigt Discord, Team,
    Bauten und Unterstützer. Kacheln mit `null` oder `0` entfallen. Die Wand
    bleibt, weil sie echte Personen würdigt; ihr Einleitungstext nennt keine
    Zahl, damit er bei wenigen Namen nicht widerspricht. `CommunityStats`
    erhält dafür die Eigenschaft `variant` (`page` | `strip`).

## Risks / Trade-offs

- **Leere Wand**: Mit den heutigen Inhalten stehen zwei Personen auf der Wand
  und keine Events. Die Seite wirkt dünn, bis Events Ergebnisse tragen; das
  ist ehrlich und ändert sich allein durch Inhalt.
- **Discord-Zahl ungenau und verzögert**: `approximate_member_count` ist
  ungefähr; Zwischenspeicher (1 h) plus Seitencache (bis ~70 min) addieren sich.
  Die Zahl wird unverändert und ohne Schätzhinweis gezeigt.
- **Discord-Schnittstelle kann sich ändern oder drosseln**: Dann entfällt die
  Kachel, mehr nicht.
- **Zusätzliche Abfragen auf der Startseite**: drei Content-Abfragen parallel
  zum Rest; die Startseite wird vom Rand zwischengespeichert.

## Open Questions

Keine: Umfang und Datenquellen sind vom Auftraggeber entschieden.
