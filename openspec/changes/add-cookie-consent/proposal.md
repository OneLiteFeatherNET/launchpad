# Proposal: Cookie-Banner „Wir verstreuen Kekse!“

Ausgeliefert als `feat(consent)`, Änderung der Entscheidung als `feat(consent): make statistics opt-out`.

## Why

PostHog lief bisher mit `opt_out_capturing_by_default: true`, also gar nicht,
bis eine Entscheidung vorlag, und es gab keinen Mechanismus, der sie einholt.
Die Statistik ist anonym und läuft auf EU-Servern. Der Repo-Owner hat
entschieden, dass sie standardmäßig läuft und Besucherinnen sie jederzeit
abschalten können (Opt-out). Das Banner informiert also und bietet die
Abschaltung an, es blockiert nichts.

## What Changes

- **PostHog erfasst standardmäßig.** `opt_out_capturing_by_default` entfällt
  aus `nuxt.config.ts`; `person_profiles: 'identified_only'` bleibt.
- **Neue Layer `layers/consent`** mit Composable, Banner, Schalter zum
  Wiederöffnen und einem Client-Plugin, das eine gespeicherte Abschaltung beim
  Start anwendet.
- **Banner** am unteren Rand, kein blockierendes Modal. Titel „Wir verstreuen
  Kekse!“, drei Aktionen: „Ich entscheide selbst!“ (öffnet die Einstellungen),
  „Keine Statistik-Kekse!“ (schaltet PostHog ab) und „Her mit den Keksen!“
  (bestätigt die Statistik). Abschalten und Zustimmen haben dieselbe
  Schaltflächen-Variante, damit Abschalten nicht schwerer ist.
- **Einstellungen im Banner** mit zwei Gruppen: „Notwendige Kekse“ (fest an,
  erklärt das Sprach-Cookie, das Einwilligungs-Cookie und die Sicherheits-
  Cookies von Cloudflare) und „Statistik-Kekse“ (PostHog, standardmäßig an,
  per Schalter abschaltbar). „Auswahl speichern“ übernimmt die Wahl.
- **Speicherung** in `olf_consent` (JSON `{ analytics, decidedAt }`, sechs
  Monate, `SameSite=Lax`, `Path=/`). Gelesen und geschrieben wird nur im
  Browser. Die Seiten werden am Cloudflare-Edge gecacht (`s-maxage=600`,
  SWR 3600), und eine Antwort mit `Set-Cookie` oder eine vom Cookie abhängige
  Seite darf es dort nicht geben. Deshalb verwendet das Modul `document.cookie`
  statt `useCookie`, das der Architekturtest für Layer untersagt.
- **PostHog** bekommt `opt_out_capturing()` bei Abschaltung und
  `opt_in_capturing()` bei Zustimmung. Ohne gespeicherte Entscheidung bleibt
  die Erfassung an.
- **Fußzeile**: Der Link „Cookie-Einstellungen“ öffnet das Banner erneut. Die
  Layout-Schicht reicht den Schalter über einen benannten Slot in die Fußzeile,
  damit die Domänen einander nicht importieren.
- Nicht in diesem Change: Änderungen an der Datenschutzseite, weitere Dienste,
  eine Zustimmung für Analyse im Server.

## Risiko

Statistik-Cookies laufen ohne vorherige Einwilligung. In Deutschland verlangt
§ 25 TDDDG für nicht zwingend erforderliche Zugriffe auf Endgeräte in der
Regel eine Einwilligung. Die Entscheidung des Repo-Owners ist bindend, die
rechtliche Einordnung sollte trotzdem geprüft werden, bevor das Banner
produktiv geht.

## Capabilities

### New Capabilities

- `cookie-consent`: Banner, Speicherung der Entscheidung, Abschaltung der
  PostHog-Erfassung, Wiederöffnen und Texte.

## Impact

- `layers/consent/` (neu), `layouts/default.vue`, `layers/footer/components/SiteFooter.vue`
  (benannter Slot)
- `i18n/locales/{de,en}.json` (Schlüssel `consent.*`)
- `nuxt.config.ts` (PostHog-Block ohne `opt_out_capturing_by_default`), `AGENTS.md` (Layer-Liste)
- `tests/consent/` (neu), bestehende Fußzeilen-Tests bleiben grün
- Keine neuen Abhängigkeiten.

Der Change ist ein Pull Request unter `feat(consent)`. Die Tests folgen
F.I.R.S.T.: keine Systemzeit (die Uhr wird injiziert), kein Netz, kein Warten,
jeder Test baut sein eigenes Fixture.
