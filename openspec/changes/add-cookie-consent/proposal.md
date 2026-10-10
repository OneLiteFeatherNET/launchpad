# Proposal: Cookie-Banner „Wir verstreuen Kekse!“

Ausgeliefert als `feat(consent)`.

## Why

PostHog startet mit `opt_out_capturing_by_default: true`, damit vor einer
Entscheidung nichts erfasst wird. Den Mechanismus, der diese Entscheidung
einholt, gibt es noch nicht: Die Konfiguration verweist ausdrücklich darauf.
Ohne ihn bleibt die Statistik ganz aus, obwohl sie anonym und auf EU-Servern
läuft. Die Seite setzt sonst nur das notwendige Sprach-Cookie.

## What Changes

- **Neue Layer `layers/consent`** mit Composable, Banner, Schalter zum
  Wiederöffnen und einem Client-Plugin, das die gespeicherte Wahl beim Start
  anwendet.
- **Banner** am unteren Rand, kein blockierendes Modal. Titel „Wir verstreuen
  Kekse!“, drei Aktionen: „Ich entscheide selbst!“, „Ich nehme alle Kekse!“,
  „Keine Kekse für mich!“. Annehmen und Ablehnen haben dieselbe Schaltflächen-
  Variante, damit Ablehnen nicht schwerer ist als Zustimmen.
- **Einstellungen im Banner** mit zwei Gruppen: „Notwendige Kekse“ (fest an,
  erklärt das Sprach-Cookie und das Einwilligungs-Cookie selbst) und
  „Statistik-Kekse“ (PostHog, standardmäßig aus).
- **Speicherung** in `olf_consent` (JSON, sechs Monate, `SameSite=Lax`,
  `Path=/`). Gelesen und geschrieben wird nur im Browser: Die Seiten sind am
  Edge gecacht, und eine Antwort mit `Set-Cookie` darf es dort nicht geben.
  Deshalb verwendet das Modul `document.cookie` statt `useCookie`, das der
  Architekturtest für Layer untersagt.
- **PostHog** bekommt `opt_in_capturing()` bei Zustimmung und
  `opt_out_capturing()` bei Ablehnung. Vor jeder Entscheidung bleibt die
  Erfassung aus.
- **Fußzeile**: Der Link „Cookie-Einstellungen“ öffnet das Banner erneut. Die
  Layout-Schicht reicht den Schalter über einen benannten Slot in die Fußzeile,
  damit die Domänen einander nicht importieren.
- Nicht in diesem Change: Änderungen an der Datenschutzseite, weitere Dienste,
  eine Zustimmung für Analyse im Server.

## Capabilities

### New Capabilities

- `cookie-consent`: Banner, Speicherung der Entscheidung, Wirkung auf PostHog,
  Wiederöffnen und Texte.

## Impact

- `layers/consent/` (neu), `layouts/default.vue`, `layers/footer/components/SiteFooter.vue`
  (benannter Slot)
- `i18n/locales/{de,en}.json` (Schlüssel `consent.*`)
- `nuxt.config.ts` (Kommentar zum PostHog-Block), `AGENTS.md` (Layer-Liste)
- `tests/consent/` (neu), bestehende Fußzeilen-Tests bleiben grün
- Keine neuen Abhängigkeiten.

Der Change ist ein einziger Pull Request unter `feat(consent)`. Die Tests
folgen F.I.R.S.T.: keine Systemzeit (die Uhr wird injiziert), kein Netz, kein
Warten, jeder Test baut sein eigenes Fixture.
