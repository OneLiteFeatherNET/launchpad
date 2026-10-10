# Tasks: Cookie-Banner

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der Code.
Commits: `docs(openspec): propose add-cookie-consent` für den ursprünglichen
Vorschlag, `feat(consent): add a cookie consent banner` für den ersten Code,
`feat(consent): make statistics opt-out` für die Umstellung auf Opt-out und
`docs(openspec): update add-cookie-consent` für diese Anpassung.

## 1. Logik

- [x] 1.1 `tests/consent/controller.spec.ts`: ohne Entscheidung gilt Statistik als erlaubt; Abschalten ruft `opt_out` und speichert `analytics: false`; Zustimmen ruft `opt_in` und speichert `analytics: true` mit dem injizierten Zeitpunkt; ohne Entscheidung ist das Banner sichtbar; mit gespeicherter Entscheidung verborgen; Wiederöffnen zeigt es erneut; gespeicherte Wahl wird beim Start angewendet, ohne Cookie-Schreibzugriff
- [x] 1.2 `layers/consent/utils/` (Cookie-Parser und -Serialisierung, Controller mit `analyticsAllowed`), `composables/useCookieConsent.ts` (dünne Hülle um `useState` und `document`), `plugins/cookie-consent.client.ts` (wendet die gespeicherte Wahl an), `types.ts`, `index.ts`, `nuxt.config.ts`; verifiziert durch grüne Tests aus 1.1

## 2. Banner und Schalter

- [x] 2.1 `tests/consent/banner.spec.ts`: Überschrift in Deutsch und Englisch, genau drei Aktionen, Zustimmen und Abschalten rufen den Controller, Abschalten und Zustimmen teilen die Variante, Einstellungen zeigen Statistik standardmäßig an, notwendige Gruppe ist deaktiviert, Speichern übernimmt die Wahl, kein modaler Dialog
- [x] 2.2 `layers/consent/components/CookieConsentBanner.vue`, `CookieSettingsButton.vue`, `i18n/locales/{de,en}.json` (Schlüssel `consent.*`) umsetzen; verifiziert durch grüne Tests aus 2.1
- [x] 2.3 `layouts/default.vue` bindet das Banner in `<ClientOnly>` ein und reicht den Schalter über den Slot `legal-actions` in `SiteFooter.vue`; `tests/architecture`, `tests/i18n`, `tests/footer` bleiben grün

## 3. Konfiguration und Doku

- [x] 3.1 `opt_out_capturing_by_default` aus dem PostHog-Block von `nuxt.config.ts` entfernen, Kommentar auf eine Zeile kürzen; `AGENTS.md` führt `consent` in der Layer-Liste
- [x] 3.2 Vorschlag und Spezifikation auf das Opt-out-Modell umstellen (Statistik standardmäßig an, Abschalten jederzeit), Cloudflare-Hosting und Edge-Cache im Vorschlag begründen

## 4. Gesamtprüfung

- [x] 4.1 `pnpm test`, `pnpm exec openspec validate add-cookie-consent --strict`, `pnpm quality` (Baseline nicht erhöht) und `pnpm build` laufen grün
- [x] 4.2 `pnpm preview` (http://localhost:8788) und Browser-Prüfung: Banner auf `/de` bei 1280 px und 390 px, „Keine Statistik-Kekse!“ blendet das Banner aus, nach Neuladen bleibt es verborgen, PostHog-Erfassung (`/ingest/ph/e/`) läuft über den same-origin Proxy und stoppt nach der Abschaltung; Konfigurations- und Flag-Anfragen bleiben, Wiederöffnen aus der Fußzeile

## 5. Pull Request

- [x] 5.1 Pull Request unter dem Titel `feat(consent): add a cookie consent banner` (Squash-Merge) mit englischer Beschreibung: Zusammenfassung, Opt-out-Entscheidung, Cloudflare-Hinweis, geprüft, Screenshots
