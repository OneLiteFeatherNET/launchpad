# Design: Spendenziel bei Ausfall ausblenden

## Context

Gelesen an `origin/main` `83fc3fe`.

- `server/api/opencollective.get.ts:21-24` fängt jeden Fehler und gibt
  Nullen zurück; `useOpenCollective.ts:28-45` tut dasselbe client- und
  serverseitig (`buildFallback`).
- `/api/**` ist per `routeRules` bereits `no-store` am Edge. Der Ausfall
  wird also nicht durch die API-Antwort verlängert, sondern durch das
  gecachte Start-HTML, das die Antwort eingebettet hat.
- `loadCollectiveStats` wirft bei jedem Fehler; der Nitro-Cache speichert
  Würfe nicht.

## Goals / Non-Goals

**Goals:** Nie eine erfundene Zahl anzeigen; ein Ausfall darf nicht über die
Cache-Zeit hinaus sichtbar bleiben, wo der Browser ihn korrigieren kann.

**Non-Goals:** `routeRules` ändern, Nitro `swr`/`cache` hinzufügen, den
Abschnitt neu gestalten, den Supporter-Endpoint (`/api/community/supporters`)
anfassen.

## Decisions

1. **Explizites `available`-Feld statt Nullen oder `null`-Felder.** Ein
   Diskriminator macht den Fall im Typ erzwingbar: Wer Zahlen liest, muss
   zuerst `available` prüfen. `CollectiveStats` bleibt unverändert;
   `CollectiveResult` ist die Vereinigung aus `CollectiveStats & { available: true }`
   und `CollectiveUnavailable` (`available: false`, `slug`, `link`). Der
   Server importiert die Typen nur über `#layers/opencollective/types`.
2. **Abschnitt ausblenden statt neutraler Call-to-Action.** Der Abschnitt
   besteht aus Zahlenkarten und einem Spenden-Link; ohne Zahlen bliebe eine
   Karte, die nur den Link wiederholt. Ausblenden ist das Ehrlichste und
   braucht keine neuen Texte in zwei Sprachen. Umkehrbar, falls ein
   Call-to-Action ohne Zahlen gewünscht wird.
3. **Antwort ohne numerisches `balance` ist ein Ausfall.** Eine gültige,
   aber leere JSON-Antwort würde sonst als „0 EUR“ durchgehen.
4. **Heilung im Browser statt kürzerer Edge-TTL.** Die Home-Seite darf
   weder Header noch Cookies lesen
   (`request-independent-render.spec.ts`), und Nitro-Cache-Regeln sind
   tabu. Also: Rendert der Server „nicht verfügbar“, ruft der Browser nach
   `onMounted` `refresh()` auf. Die API ist `no-store`, die Zahlen kommen
   dann live; scheitert auch das, bleibt der Abschnitt ausgeblendet. Es gibt
   keine Schleife (ein Versuch pro Seitenaufruf).
5. **Status der API-Antwort bleibt 200.** Der Client unterscheidet über
   `available`; ein 5xx würde im Browser zusätzliche Fehlerpfade öffnen und
   im Monitoring als Seitenfehler zählen.
6. **Log:** `console.warn('[opencollective] stats unavailable', { slug, error: message })`.
   Der Cloudflare-Log zeigt so Ursache und Quelle statt eines Stacks.

## Risks / Trade-offs

- Bei einem Ausfall fehlt der Abschnitt im initialen HTML, im Edge-Cache bis
  zu einer Stunde. Besser als falsche Zahlen; Besucher mit JavaScript sehen
  ihn nach dem Hydrieren.
- Während eines Ausfalls fragt jede API-Anfrage die Quelle neu an (Würfe
  werden nicht gecacht); begrenzt durch das 5-s-Timeout.

## Open Questions

1. Abschnitt ganz ausblenden (hier gewählt) oder Call-to-Action ohne Zahlen?
