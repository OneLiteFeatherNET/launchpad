---
slug: 'apus'
translationKey: 'apus'
title: 'Apus: BlueMap-Karten für Minecraft-Welten auf Kubernetes'
summary: 'Rendert Minecraft-Welten mit BlueMap auf Kubernetes und hostet die fertigen Karten.'
status: 'active'
logo: '/images/projects/apus/icon.png'
logoAlt: 'Codeausschnitt aus bluemapmaps.bluemap.onelitefeather.net-v1.yaml'
socialImage: '/images/projects/apus/social.png'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Kubernetes'
  - 'Paper'
license: 'AGPL-3.0'
links:
  docs: 'https://github.com/OneLiteFeatherNET/Apus#readme'
  source: 'https://github.com/OneLiteFeatherNET/Apus'
  issues: 'https://github.com/OneLiteFeatherNET/Apus/issues'
maintainers:
  - 'themeinerlp'
  - 'theevilreaper'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/apus'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/apus'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/apus'
---

## Was ist das?

Apus rendert Minecraft-Welten mit [BlueMap](https://bluemap.bluecolored.de/) auf Kubernetes und hostet die fertigen Karten. Die Welten stammen aus sehr unterschiedlichen Quellen. Eine ETL-Schicht bringt sie in ein einheitliches Format, ein Operator startet Render- und Hosting-Jobs, und eine Oberfläche zeigt den Fortschritt, sodass niemand YAML von Hand schreiben muss.

Den Kern bildet der **World Bundle**: ein unveränderlicher, normalisierter Snapshot einer Welt in S3. Auf der Eingangsseite kennt die Ingest-Schicht BlueMap nicht. Auf der Ausgangsseite wissen Rendering und Hosting nichts über Pterodactyl oder ZIP-Uploads.

## Was es kann

- **Mehrere Quellen:** Connectoren für S3, Pterodactyl, Push und ZIP-Uploads. Eine neue Quelle braucht nur eine Implementierung von `WorldSourceConnector`.
- **Kubernetes-Operator:** sechs Custom Resources. Der Operator legt Jobs, Deployments, Ingresses und Buckets an.
- **Rendern und Hosten getrennt:** Der Renderer läuft als Job. Der Hosting-Server liest die fertigen Karten aus S3.
- **Fortschritt sichtbar:** Ein BlueMap-Addon gibt den Renderstand als JSON und als Prometheus-Metriken aus.
- **Oberfläche und API:** Eine Nuxt-4-Oberfläche für Mandanten und eine Verwaltungskonsole, dahinter eine REST- und SSE-API mit Micronaut.
- **Paper-Plugin:** `paper-worldpush` schickt Welten direkt von einem laufenden Paper-Server an Apus.

## Für wen ist das?

Für Netzwerke und Communities, die viele Welten als Karten veröffentlichen wollen und bereits einen Kubernetes-Cluster betreiben.

## Was du wissen solltest

- **Frühe Entwicklung (0.x).** Die aktuelle Version ist 0.9.1. Schnittstellen, CRDs und Konfiguration können sich zwischen den Minor-Versionen ändern. Ein stabiles 1.0 gibt es noch nicht.
- **Kubernetes ist Voraussetzung.** Der Operator setzt einen Cluster voraus.
- **JDK 25 zum Bauen.** Das Gradle-Build braucht JDK 25. Für die Oberfläche wird zusätzlich pnpm benötigt. Die Integrationstests brauchen Docker.
- **Dokumentation.** Die Anleitung steht im README. Das Design beschreibt die Spezifikation im Repository unter `docs/superpowers/specs/`.
