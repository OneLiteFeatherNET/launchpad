# Spec Delta

## Purpose

Die erste Ansicht einer Seite wird nicht von Stylesheets blockiert und der
Einstieg lädt nur, was er für den ersten Paint und die Hydration braucht.

## ADDED Requirements

### Requirement: Kein blockierendes Entry-Stylesheet
Das HTML einer Seite unter `/en/**` und `/de/**` im Produktions-Build MUST
das für die erste Ansicht nötige CSS eingebettet enthalten. Es DARF kein
`<link rel="stylesheet">` geben, das den ersten Paint blockiert. Das übrige
CSS MUST nicht blockierend nachgeladen werden.

#### Scenario: Startseite
- **WHEN** `/en` vom Produktions-Build abgerufen wird
- **THEN** enthält das HTML ein `<style>` mit den Basisrollen und kein
  blockierendes `<link rel="stylesheet">` auf `/_nuxt/entry.*.css`

#### Scenario: Aussehen unverändert
- **WHEN** die erste Ansicht vor und nach der Änderung mobil und desktop,
  hell und dunkel, gerendert wird
- **THEN** unterscheiden sich die Screenshots nicht sichtbar

### Requirement: Begrenzte modulepreload-Links
Das HTML von `/en` MUST deutlich weniger `<link rel="modulepreload">`
enthalten als die 48 vor der Änderung; die Obergrenze legt `design.md` nach
der Messung fest und ein Test hält sie.

#### Scenario: Obergrenze
- **WHEN** `/en` vom Produktions-Build abgerufen wird
- **THEN** ist die Zahl der `modulepreload`-Links nicht größer als die
  festgelegte Obergrenze

### Requirement: Mobile-Verbesserung ist belegt
Die Pull-Request-Beschreibung MUST Lighthouse-12.8.2-Werte (Mobile, Median
mehrerer Läufe) vor und nach der Änderung für Performance, FCP, LCP und TBT
nennen. Desktop-Performance DARF nicht unter 98 fallen.

#### Scenario: Messung
- **WHEN** Lighthouse 12.8.2 (Mobile) gegen `pnpm preview:prod` läuft
- **THEN** stehen beide Messreihen in der Pull-Request-Beschreibung
