---
slug: 'feedback-fusion'
translationKey: 'feedback-fusion'
title: 'FeedbackFusion: Cloud-native Sammlung von Nutzerfeedback'
summary: 'Eine Rust-Anwendung, die Nutzerfeedback in großen Mengen sammelt und verwaltet. Sie läuft auf Kubernetes und speichert ihre Daten in einer Datenbank.'
status: 'active'
audience: 'external'
logo: '/images/projects/feedback-fusion/icon.png'
logoAlt: 'Codeausschnitt aus service.proto'
socialImage: '/images/projects/feedback-fusion/social.png'
releasedAt: '2024-07-06'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Kubernetes'
  - 'Docker'
license: 'MIT'
links:
  docs: 'https://onelitefeathernet.github.io/feedback-fusion/nightly/docs'
  source: 'https://github.com/OneLiteFeatherNET/feedback-fusion'
  issues: 'https://github.com/OneLiteFeatherNET/feedback-fusion/issues'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/feedback-fusion'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/feedback-fusion'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/feedback-fusion'
---

## Was ist das?

FeedbackFusion ist eine Cloud-native Anwendung in Rust, mit der sich Nutzerfeedback sammeln und verwalten lässt. Sie ist für den Betrieb auf Kubernetes gebaut und für große Mengen an Rückmeldungen ausgelegt. Das Repository enthält neben dem Server unter anderem ein Helm-Chart. Das Projekt steht unter der MIT-Lizenz.

## Funktionen

- **Zustandslos bis auf die Datenbank:** Die Anwendung speichert außer der Datenbankverbindung keinen Zustand und lässt sich deshalb gut in Kubernetes betreiben.
- **Mehrere Datenbanken:** Über den ORM rbatis werden MySQL, MariaDB, PostgreSQL und MSSQL unterstützt.
- **gRPC-API mit OIDC:** Die Schnittstelle nutzt gRPC für die Kommunikation und OIDC für die Anmeldung.
- **Frontend mit lit:** Die Oberfläche basiert auf lit und den Open-WC-Standards und ist nicht an ein bestimmtes Framework gebunden.

## Bereitstellung

FeedbackFusion gibt es als Helm-Chart und als Docker-Image. Mit Helm fügst du das Chart-Repository hinzu und installierst es:

```sh
helm repo add feedback-fusion https://onelitefeathernet.github.io/feedback-fusion
helm install feedback-fusion feedback-fusion/feedback-fusion
```

Alternativ startest du das Docker-Image `ghcr.io/onelitefeathernet/feedback-fusion` direkt mit Docker. Die Datenbank bindest du selbst an.

## Für wen ist das?

FeedbackFusion richtet sich an Teams, die Nutzerfeedback zu eigenen Diensten selbst sammeln und verwalten möchten und dafür eine Kubernetes-Umgebung betreiben. Wer am Projekt mitarbeiten möchte, findet im Repository die Anleitung für die Entwicklungsumgebung und die Tests. Fragen und Fehlerberichte gehören in die GitHub-Issues.
