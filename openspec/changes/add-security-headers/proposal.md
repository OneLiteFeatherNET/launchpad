# Proposal: Sicherheits-Header und Report-Only-CSP

Ausgeliefert als `feat(security)`. Pull-Request-Titel:
`feat(security): send baseline security headers and a report-only csp`

## Why

Die Produktion (geprüft am 2026-11-22) sendet nur zwei Sicherheits-Header,
beide von Cloudflare gesetzt: `Strict-Transport-Security` und
`X-Content-Type-Options: nosniff`. Es fehlen:

- **Referrer-Policy**: Ohne sie gehen volle URLs an Dritte (Minecraft-Köpfe,
  OpenCollective-Avatare, BlueMap).
- **Permissions-Policy**: Keine Funktion der Seite braucht Kamera,
  Mikrofon, Standort oder Zahlung; sie sollten für die Seite und ihre Frames
  aus sein.
- **Clickjacking-Schutz**: Jede fremde Seite darf die Website einrahmen.
- **Content-Security-Policy**: keine. Eine scharfe Policy auf einmal
  einzuschalten riskiert eine kaputte Seite; deshalb zuerst nur beobachten.

## What Changes

- Auf jeder Antwort, Fehlerseiten eingeschlossen:
  `Referrer-Policy: strict-origin-when-cross-origin`, eine restriktive
  `Permissions-Policy`, `X-Content-Type-Options: nosniff` (jetzt auch aus der
  App, damit es nicht von der Zonen-Einstellung abhängt) und
  `Content-Security-Policy: frame-ancestors 'self'` (erzwungen).
- `Content-Security-Policy-Report-Only` mit einer Allowlist aus den echten
  Ressourcen der Seite. **Ohne** `report-uri`/`report-to`: Berichte werden
  vorerst nicht gesammelt; Verstöße sind nur in der Browser-Konsole sichtbar.
- Ein Nitro-Plugin setzt die Header, die Werte stehen in
  `shared/utils/securityHeaders.ts`.
- Tests halten die Quellenliste und die Header je Antwortklasse fest.

## Capabilities

### New Capabilities

- `security-headers`: Basis-Header und Report-Only-CSP.

### Modified Capabilities

Keine. Die Header sind statisch und ändern kein Cache-Verhalten.

## Impact

- `server/plugins/security-headers.ts` (neu), `shared/utils/securityHeaders.ts`
  (neu), `tests/architecture/security-headers.spec.ts` (neu).
- Keine neuen Abhängigkeiten, keine Änderung an `routeRules`.
- Spätere Folge (eigener Change): CSP erzwingen, sobald die Konsole über
  mehrere Wochen sauber bleibt.
