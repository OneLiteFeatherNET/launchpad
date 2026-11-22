# Design: Datumsangaben in einer festen Zeitzone

## Context

Siehe `proposal.md`. Bestandsaufnahme an `origin/main`:

| Stelle | Art des Werts | Heute | Künftig |
|---|---|---|---|
| `Top1`, `ArticleCard`, `AuthorPostList`, `pages/blog/[...slug].vue` | `pubDate`, Kalendertag (UTC 00:00) | `d()`, Zeitzone der Maschine | `formatCalendarDate` (UTC) |
| `CommunityPoiMeta` | `startedAt`/`updatedAt`, Kalendertag | `d()` | `formatCalendarDate` (UTC) |
| `CarouselItemBlog`, `CarouselItemNews` | Kalendertag | `toLocaleDateString` ohne Zone | `formatCalendarDate` (UTC) |
| `OpenCollectiveStats` | echter Zeitpunkt | `toLocaleDateString` ohne Zone | `formatInstant` (Europe/Berlin) |
| `DateRange`, `CarouselItemEvent`, `eventSessions` | echte Zeitpunkte | Zone explizit (Europe/Berlin) | unverändert |
| Zahlen (`Intl.NumberFormat`) | keine Daten | — | außerhalb des Umfangs |

## Goals / Non-Goals

**Goals:** gleiche Ausgabe auf Server und Client, unabhängig von der
Maschinenzone; ein Formatierer statt acht Varianten bei Kalenderdaten.

**Non-Goals:** `DateRange`/`eventSessions` umbauen; Zahlenformate; neue
datetimeFormats in der i18n-Konfiguration.

## Decisions

1. **Regel:** Ein Kalendertag (Frontmatter-Datum ohne Uhrzeit, als
   UTC-Mitternacht geparst) wird in `UTC` formatiert, sonst rutscht er je nach
   Zone auf den Nachbartag. Ein echter Zeitpunkt (Event-Beginn, API-Zeitstempel)
   wird in `Europe/Berlin` formatiert, wie die Events-Ebene es tut.
2. **Zwei benannte Funktionen statt einer mit Zonenparameter**, damit die
   Aufrufstelle die Art des Werts benennt und die Zone nicht vergessen werden
   kann. Beide liefern bei ungültigen Werten `''` und nehmen Intl-Optionen,
   ohne `timeZone` zu erlauben.
3. **`d()` wird ersetzt**, nicht konfiguriert: `d()` mit benannten Formaten
   würde die Zone je Format duplizieren und kann die Karussell-Optionen nicht
   ausdrücken. Standardformat bleibt das bisherige (`Intl`-Standard) für die
   Blog-Stellen, das Karussell behält `year/month short/day 2-digit`.
4. **Layer-Regel:** Formatierer liegt in `base` (nutzt nichts), Domänen
   nutzen ihn. Keine Komponente, da reine Funktionen genügen.
5. **Test:** Der Formatierer wird mit einer UTC-Mitternacht für `en` und `de`
   geprüft; die Ergebnisse hängen nicht von `TZ` ab (feste Eingabedaten, kein
   Systemzeit-Zugriff). Ein Repo-Lesetest verbietet `toLocale*String(` ohne
   `timeZone`.

## Risks / Trade-offs

- Das Standardformat von `d()` und `Intl.DateTimeFormat` ist identisch, die
  sichtbare Änderung beschränkt sich auf den Zonenfehler.
- Ein Zeitpunkt mit echter Uhrzeit, der fälschlich als Kalendertag formatiert
  wird, zeigt den UTC-Tag; die Regel in Entscheidung 1 hält die Zuordnung fest.

## Open Questions

Keine.
