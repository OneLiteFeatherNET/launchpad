# Design: Sicherheits-Header und Report-Only-CSP

## Context

Motivation: siehe `proposal.md`. Gelesen an `origin/main` `83fc3fe`.

- `nuxt.config.ts` `routeRules` setzen Cache-Header über `cachedPageHeaders`.
  `server/plugins/error-response-headers.ts` überschreibt sie bei Status
  >= 400 und nutzt dafür zwei Hooks (`error` und `beforeResponse`).
- Eingebettet wird nur BlueMap (`pages/bluemap.vue`,
  `layers/base/components/BluemapFacade.vue`, `runtimeConfig.public.bluemapUrl`).
- Echte Fremdressourcen im Browser: `img.onelitefeather.net`, `mc-heads.net`
  und `images.opencollective.com` (Bilder); PostHog läuft über `/ingest`.
  Alles andere in Komponenten und Inhalten sind Links.

## Goals / Non-Goals

**Goals:** Basis-Header überall; eine CSP, die auf allen Seiten ohne Verstoß
bleibt, aber noch nichts blockiert.

**Non-Goals:** CSP erzwingen; Berichte sammeln; Nonces; Header für statische
Dateien aus `public/` (sie umgehen den Worker).

## Decisions

1. **Nitro-Plugin statt `routeRules`.** `routeRules`-Header laufen nicht für
   Antworten des Fehler-Handlers; Fehlerseiten sollen die Header aber tragen.
   Das Plugin hängt wie `error-response-headers.ts` an `error` und
   `beforeResponse`. Es setzt nur statische Werte, liest nichts aus der
   Anfrage und setzt kein `Set-Cookie`; das Edge-Caching bleibt unberührt, und
   ein Zusammenführen von Header-Objekten mehrerer Regeln entfällt.
2. **Werte in `shared/utils/securityHeaders.ts`**, von Nitro automatisch
   importiert und von Tests direkt lesbar.
3. **`frame-ancestors` als eigener, erzwungener Header.** In einer
   Report-Only-Policy wird die Direktive ignoriert. `'self'`, weil nichts die
   Seite legitim einbettet. Kein zusätzliches `X-Frame-Options`: alle
   aktuellen Browser kennen `frame-ancestors`.
4. **`X-Content-Type-Options` zusätzlich aus der App.** Cloudflare setzt es
   heute per Zone; die App soll nicht von dieser Einstellung abhängen. Ein
   doppelter, identischer Wert schadet nicht.
5. **Permissions-Policy als Verbotsliste** (Kamera, Mikrofon, Standort,
   Zahlung, USB u. a.). `fullscreen` bleibt für `self` und den BlueMap-Host,
   weil das Embed `allow="fullscreen"` nutzt.
6. **CSP mit `'unsafe-inline'` für Skripte und Styles.** Nuxt schreibt
   `window.__NUXT__` inline; Vue und Nuxt erzeugen Inline-Styles. Ein Nonce
   ist je Anfrage verschieden, die Seiten werden aber geteilt am Edge
   gecacht; Hashes ändern sich je Seite. Folge-Change: Hashes beim Build,
   wenn die CSP erzwungen werden soll. Bis dahin beobachtet die Policy
   Quellen (Hosts), nicht Inline-Code.
7. **Kein `report-uri`/`report-to`.** Entscheidung des Maintainers. Prüfung
   per Browser-Konsole: Chromium lief über `/en`, `/de`, Blog, Artikel,
   BlueMap, Events, Team, Projekte, Community und Datenschutz.
   Der Anfangsentwurf meldete `mc-heads.net` und `images.opencollective.com`
   (Team, Community); beide stehen jetzt in `img-src`, danach keine
   Verstöße.
8. **Typ `feat(security)`**: neues Verhalten für Antworten, nichts Kaputtes
   wird repariert.

## Risks / Trade-offs

- Report-Only schützt nicht vor XSS; `'unsafe-inline'` würde es auch
  erzwungen nicht. Bewusst, siehe Entscheidung 6.
- Neue Fremdquellen in Inhalten erzeugen Konsolenmeldungen, aber keine
  Fehler. Ohne Berichte fallen sie nur beim Testen auf.
- Nitros Fehler-Handler setzt für Fehlerantworten eigene, strengere
  `CSP` und `Referrer-Policy`; sie überschreiben unsere dort, was erwünscht ist.

## Open Questions

1. Soll die erzwungene CSP später Hashes im Build bekommen, oder reicht
   `'unsafe-inline'` dauerhaft?
