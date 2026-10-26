# Spec Delta

## ADDED Requirements

### Requirement: Das Kopieren der Serveradresse wird als Konversion erfasst
Kopiert ein Besucher im Block „So nimmst du teil“ einer Event-Detailseite
die Serveradresse erfolgreich, MUST die Seite über `trackEvent` genau ein
Event `event_server_address_copied` mit `event_slug`, `event_key` (der
`translationKey`), `locale` und `event_phase` senden. Schlägt das Kopieren
fehl oder fehlt die Clipboard-API, MUST NOT ein Event gesendet werden.

#### Scenario: Erfolgreiches Kopieren
- **WHEN** ein Besucher auf `/de/events/slender` „Adresse kopieren“ klickt und das Schreiben gelingt
- **THEN** wird `event_server_address_copied` mit `event_slug: slender`, `event_key: event-slender-2026`, `locale: de` und `event_phase: running` gesendet

#### Scenario: Kopieren schlägt fehl
- **WHEN** `navigator.clipboard.writeText` die Zusage ablehnt
- **THEN** wird kein `event_server_address_copied` gesendet und der Button zeigt nicht „Kopiert“

#### Scenario: Keine Clipboard-API
- **WHEN** der Browser kein `navigator.clipboard` hat
- **THEN** wird kein `event_server_address_copied` gesendet

### Requirement: Die Konversion folgt Einwilligung und Host-Sperre
Das Event `event_server_address_copied` MUST denselben Regeln unterliegen
wie jede andere PostHog-Erfassung: Hat der Besucher der Statistik
widersprochen oder läuft die Seite nicht auf dem Produktions-Host, erreicht
es PostHog nicht. Die Seite MUST NOT dafür Query, Cookies oder Header der
Anfrage im Render lesen.

#### Scenario: Widerspruch
- **WHEN** ein Besucher der Statistik widersprochen hat und die Adresse kopiert
- **THEN** erreicht kein Event PostHog

#### Scenario: Vorschau-Host
- **WHEN** die Adresse auf `localhost` oder einer Preview-URL kopiert wird
- **THEN** erreicht kein Event PostHog
