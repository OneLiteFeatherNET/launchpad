# Spec Delta

## Purpose

Jede Antwort der Website trägt Basis-Sicherheits-Header; eine Content
Security Policy beobachtet die Ressourcen, ohne etwas zu blockieren.

## ADDED Requirements

### Requirement: Basis-Header auf jeder Antwort
Jede Antwort der App, Fehlerantworten eingeschlossen, SHALL
`Referrer-Policy: strict-origin-when-cross-origin`,
`X-Content-Type-Options: nosniff`, eine `Permissions-Policy` mit
abgeschalteten Funktionen (mindestens Kamera, Mikrofon, Standort, Zahlung,
USB) und `Content-Security-Policy: frame-ancestors 'self'` tragen. Die
Header DÜRFEN weder `Set-Cookie` noch Cache-Direktiven setzen.

#### Scenario: Seite
- **WHEN** `/en` abgerufen wird
- **THEN** enthält die Antwort alle vier Header

#### Scenario: Fehler
- **WHEN** eine nicht vorhandene Seite abgerufen wird
- **THEN** enthält die Antwort `Referrer-Policy` und `X-Content-Type-Options`

### Requirement: CSP nur beobachtend, ohne Berichte
Die Policy SHALL als `Content-Security-Policy-Report-Only` gesendet werden,
mit Quellen für `'self'`, `img.onelitefeather.net`, `mc-heads.net`,
`images.opencollective.com` und das BlueMap-Embed. Sie DARF kein `report-uri`
und kein `report-to` enthalten.

#### Scenario: Quellenliste
- **WHEN** die Quellenliste gelesen wird
- **THEN** entspricht sie genau der in `shared/utils/securityHeaders.ts` dokumentierten
- **AND** enthält keinen Platzhalter und kein `unsafe-eval`

#### Scenario: Keine Verstöße
- **WHEN** die Seiten `/en`, `/de`, Blog, BlueMap, Events, Team in Chromium geladen werden
- **THEN** meldet die Konsole keinen CSP-Verstoß
