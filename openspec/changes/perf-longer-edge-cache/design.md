# Design: Statische Seiten einen Tag lang im Edge-Cache halten

## Context

Gelesen an `origin/main` `83fc3fe`. `cachedPageHeaders(seconds)` in
`nuxt.config.ts` setzt `cloudflare-cdn-cache-control: max-age=<s>,
stale-while-revalidate=86400` und für Browser `public, max-age=0,
must-revalidate`. `/en/**`, `/de/**` = 3600, Rechtsseiten = 86400.

### Inventar: Was ist zur Laufzeit uhrzeitabhängig?

Inhalt ist pro Build statisch. Zeitabhängig ist nur, was `new Date()` auf dem
Server auswertet:

| Quelle | Wirkung | betrifft |
| --- | --- | --- |
| `layers/season` (`useSeason`, Berlin-Zeit, 7 Stichtage/Jahr) | `data-season` auf `<html>`, `SeasonDecor` | **jede** Seite, aber nur an Stichtagen |
| `shared/utils/eventPhase.ts` (`useEvents`, `eventLists`) | Phase announced/running/past, Sichtbarkeit, 404 vor Ankündigung | `/<l>/events`, `/<l>/events/**` |
| Home: `useHomeContent`, `highlights.ts` (NEU-Fenster 30 Tage, Event-Slides, `releasedAt`) | Karussell | `/<l>` |
| Home: `useOpenCollective` (`server: true`, Nitro-Cache) | Spendenstand im HTML | `/<l>` |
| Community-Wand (`contributors.ts`: Events in Phase `past`) | Beitragende ändern sich mit der Zeit | `/<l>/community` |
| Blog `isReleasedAt` (`releaseDate`/`pubDate` in der Zukunft) | geplante Artikel erscheinen in Listen | `/<l>/blog`, `/<l>/blog/author/**` (und Home) |
| `SiteFooter`: `new Date().getFullYear()` | Jahreszahl | jede Seite, einmal im Jahr |

Nicht zeitabhängig: Blog-Artikel selbst (vor Freigabe 404, und 404 wird nie
gecacht), Team, About, Projekte, Community-POI, `join`, `survival-rules`,
`bluemap`, Rechtsseiten. (`new Date()` in diesen Bereichen dient nur
Sortierung/Formatierung ohne „jetzt“-Vergleich.)

## Decisions

1. **Zwei TTL-Klassen, 24 h nur per Opt-in.** Die Standardregel bleibt 3600;
   neue Seiten sind damit automatisch kurz. 24 h wird gezielt gesetzt:

   | Route | TTL |
   | --- | --- |
   | `/<l>` (Startseite), `/<l>/events`, `/<l>/events/**` | 1 h |
   | `/<l>/community`, `/<l>/blog` (Liste), `/<l>/blog/author/**` | 1 h |
   | `/<l>/blog/**` (Artikel), `/<l>/team/**`, `/<l>/about`, `/<l>/projects/**`, `/<l>/community-poi/**`, `/<l>/join`, `/<l>/survival-rules`, `/<l>/bluemap` | 24 h |
   | `/<l>/imprint`, `/<l>/privacy` | 24 h (unverändert) |

   Abweichung vom Maintainer-Plan: Blog-Liste und Autorenseiten bleiben 1 h,
   weil geplante Artikel dort erscheinen; Community bleibt 1 h wegen der
   Event-Phasen. Offen für Review.
2. **Spezifischere Regeln überschreiben allgemeinere** (Nitro-Routenregeln,
   wie bei den Rechtsseiten schon im Einsatz). Ob `/<l>/blog/**` auch
   `/<l>/blog` trifft, entscheidet der Test im Code-PR gegen die echte
   Routenauflösung, nicht gegen Zeilen-Text; im Zweifel werden Liste und
   Autoren-Pfade explizit auf 3600 gesetzt.
3. **Kein Purge im Deploy.** Cloudflare-Doku (Workers Cache, Cache Keys):
   „Each deployed version has its own cache, so a new deployment does not
   serve responses written by a previous version“ – ein Deployment startet
   mit kaltem Cache. Das gilt, solange `cache.cross_version_cache` nicht
   `true` ist; das Repo setzt es nicht (`nuxt.config.ts` enthält es nicht),
   und es darf nicht gesetzt werden. Quelle:
   https://developers.cloudflare.com/workers/cache/cache-keys/ (siehe auch
   https://developers.cloudflare.com/workers/cache/purge/). Die Aussage in
   `AGENTS.md` ist damit belegt. Kein Token, kein Skript, keine
   Dashboard-Änderung. Die Hit-Rate fällt nach jedem Deploy auf 0; da nur
   Release-PRs live gehen, ist das selten.
4. **Header-Form unverändert**: nie `s-maxage`/`must-revalidate` in der
   Edge-Direktive, SWR bleibt 86400, keine Nitro-`swr`/`cache`-Regeln,
   Fehler bleiben `no-store`.
5. **Tests**: `edge-cache-rules.spec.ts` prüft pro Zeile der Tabelle die TTL
   und, dass jede zeitabhängige Route (Spalte 1 h) nie 86400 trägt.
   `request-independent-render.spec.ts` bleibt unverändert grün.

## Risks / Trade-offs

- **Saisonwechsel** (20.3., 20.4., 20.10., 2.11., 1.12., 27.12., 6.1.):
  24-h-Seiten zeigen den alten Look bis zu 24 h länger; wegen SWR kann der
  erste Abruf nach Ablauf noch die alte Fassung liefern. Akzeptiert, weil
  rein kosmetisch. Gegenmittel bei Bedarf: manueller Purge am Stichtag;
  `NUXT_PUBLIC_SEASON` wirkt wie bisher erst für neu gerenderte Seiten.
- **Footer-Jahr** am 1.1. bis zu 24 h veraltet; vernachlässigt.
- **Inhaltsfehler** in Artikeln werden erst nach Ablauf oder Deploy korrigiert;
  ein Release-Deploy leert den Cache ohnehin.
- Ein neuer zeitabhängiger Render auf einer 24-h-Seite wäre ein stiller
  Fehler; der Test aus Entscheidung 5 und die Inventar-Tabelle sind die
  Leitplanken. Das Inventar ist ein Stand, kein Garant.

## Manual steps for the maintainer

Keine. Nach dem Release-Deploy optional:
`node scripts/cache-check.mjs --base https://onelitefeather.net --expect-hits`.
