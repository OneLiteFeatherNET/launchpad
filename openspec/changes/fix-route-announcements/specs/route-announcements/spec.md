# Spec Delta

## Purpose

Clientseitige Seitenwechsel sind für Screenreader wahrnehmbar.

## ADDED Requirements

### Requirement: Seitenwechsel werden angesagt
Die App-Hülle MUST einen `NuxtRouteAnnouncer` rendern, der nach einer
Navigation den Seitentitel in einer Live-Region ansagt. Er MUST weder den
Fokus verschieben noch den Skip-Link ersetzen.

#### Scenario: Announcer vorhanden
- **WHEN** `app.vue` gerendert wird
- **THEN** enthält sie `NuxtRouteAnnouncer`

#### Scenario: Navigation
- **WHEN** ein Nutzer clientseitig auf eine andere Seite wechselt
- **THEN** sagt die Live-Region den neuen Seitentitel an
