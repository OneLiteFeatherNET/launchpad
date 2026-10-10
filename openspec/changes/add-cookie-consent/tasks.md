# Tasks: Cookie-Banner

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der Code.
Commits: `docs(openspec): propose add-cookie-consent` für diesen Ordner,
`feat(consent): add a cookie consent banner` für Code und Tests.

## 1. Logik

- [ ] 1.1 `tests/consent/controller.spec.ts`: Akzeptieren ruft `opt_in` und speichert `analytics: true` mit dem injizierten Zeitpunkt; Ablehnen ruft `opt_out` und speichert `analytics: false`; ohne Entscheidung ist das Banner sichtbar; mit gespeicherter Entscheidung verborgen; Wiederöffnen zeigt es erneut; Cookie-Parser verwirft kaputte Werte; rot sehen
- [ ] 1.2 `layers/consent/utils/` (Cookie-Parser und -Serialisierung, Controller), `composables/useCookieConsent.ts` (dünne Hülle um `useState` und `document`), `plugins/cookie-consent.client.ts` (wendet die gespeicherte Wahl an), `types.ts`, `index.ts`, `nuxt.config.ts`; verifiziert durch grüne Tests aus 1.1

## 2. Banner und Schalter

- [ ] 2.1 `tests/consent/banner.spec.ts`: Überschrift in Deutsch und Englisch, Akzeptieren und Ablehnen rufen den Controller, Einstellungen schalten die Statistik um, notwendige Gruppe ist deaktiviert, Speichern übernimmt die Wahl; rot sehen
- [ ] 2.2 `layers/consent/components/CookieConsentBanner.vue`, `CookieSettingsButton.vue`, `i18n/locales/{de,en}.json` (Schlüssel `consent.*`) umsetzen; verifiziert durch grüne Tests aus 2.1
- [ ] 2.3 `layouts/default.vue` bindet das Banner in `<ClientOnly>` ein und reicht den Schalter über den Slot `legal-actions` in `SiteFooter.vue`; `tests/architecture`, `tests/i18n`, `tests/footer` bleiben grün

## 3. Konfiguration und Doku

- [ ] 3.1 Kommentar im PostHog-Block von `nuxt.config.ts` auf zwei Zeilen kürzen (Zustimmung über die Consent-Schicht), `opt_out_capturing_by_default` bleibt; `AGENTS.md` führt `consent` in der Layer-Liste

## 4. Gesamtprüfung

- [ ] 4.1 `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline nicht erhöht) und `pnpm build` laufen grün
- [ ] 4.2 `pnpm preview` oder Browser-Prüfung: Banner auf `/de` und `/en`, Ablehnen und Akzeptieren, Wiederöffnen aus der Fußzeile, Ansicht bei 390 px Breite

## 5. Pull Request

- [ ] 5.1 Pull Request mit dem Titel `feat(consent): add a cookie consent banner` öffnen (Beschreibung auf Englisch: Zusammenfassung, Begründung, geprüft, Screenshot ausstehend)
