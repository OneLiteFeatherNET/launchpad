---
title: 'Von 1.0 bis 3.0: fünfzehn Monate Titan, unser Lobby-Server'
alternativeTitle: 'Rückblick auf 67 Releases, 696 Commits und einen Umbau'
description: 'Ein Rückblick auf Titan, unseren quelloffenen Minestom-Lobbyserver: von Version 1.0 im Juli 2025 über die 2.x-Features bis zur Plattform-Trennung in 3.0 und dem, was als Nächstes kommt.'
pubDate: '2026-10-13'
releaseDate: '2026-10-13T10:00:00+02:00'
headerImage: 'images/og/blog-de.png'
headerImageAlt: 'Titan: Rückblick von Version 1.0 bis 3.0'
slug: 'titan-von-1-0-bis-3-0'
translationKey: 'titan-1-0-to-3-0'
tags:
  - minecraft
  - titan
  - rückblick
author: themeinerlp

canonical: 'https://onelitefeather.net/de/blog/titan-von-1-0-bis-3-0'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/titan-von-1-0-bis-3-0'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/titan-from-1-0-to-3-0'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/titan-from-1-0-to-3-0'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'Von 1.0 bis 3.0: fünfzehn Monate Titan, unser Lobby-Server'
    alternativeHeadline: 'Rückblick auf 67 Releases, 696 Commits und einen Umbau'
    description: 'Ein Rückblick auf Titan, unseren quelloffenen Minestom-Lobbyserver: von Version 1.0 im Juli 2025 bis zur Plattform-Trennung in 3.0.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-10-13T00:00:00+00:00'
---

## Vorwort

Das Erste, was man bei OneLiteFeather sieht, wenn man beitritt, ist [Titan](/de/projects/titan), unser Lobbyserver. Titan ist quelloffen (Apache-2.0), in Java geschrieben und basiert auf [Minestom](https://minestom.net), einer leichtgewichtigen Java-Bibliothek, mit der man Minecraft-Server von Grund auf baut. Dieser Beitrag blickt auf alles zurück, was zwischen Titan 1.0.0 im Juli 2025 und Titan 3.0.1 passiert ist, erschienen am 10. Oktober 2026.
<!--more-->

## Die Zahlen

- **67 GitHub-Releases**, davon 23 stabile, von v1.0.0 bis v3.0.1
- **696 Commits**
- **9 → 285 Testklassen**
- **4 → 25 Gradle-Module**
- **5 Mitwirkende**: @TheMeinerLP, @theEvilReaper, @Joltras, @yannicklamprecht und der Account von OneLiteFeather, dazu ein fleißiger Renovate-Bot

## Version 1: von der einfachen zur vernetzten Lobby (Juli 2025 – September 2026)

Titan 1.0 war eine kleine Minestom-Lobby mit vier Modulen, neun Testklassen und Java 24. Die 1.x-Reihe wuchs auf 55 Releases und legte das Fundament:

- **Elytra-Boost**: in 1.5 eingeführt, in 1.14 mit Feuerwerk so umgesetzt, wie es in Vanilla funktioniert.
- **LuckPerms-Integration** (1.8–1.10): Ränge und Rechte funktionieren in der Lobby genauso wie im restlichen Netzwerk.
- **Java 25** ab 1.9.
- **Tiefe CloudNet-Integration** (1.11–1.13): ein Extension-Bootstrap für CloudNet, ein LuckPerms-basierter Berechtigungsprüfer, saubere Shutdowns und Serverwechsel über die Bridge.
- **Ein AOT-Cache** für schnelleren Start, dazu automatisierte Releases mit release-please.

## Version 2: eine neu gebaute Lobby und viel darin (29. September – 10. Oktober 2026)

**2.0.0 war ein Umbau des Innenlebens.** Titan wurde in eigenständige *Feature-Säulen* aufgeteilt, ein Gradle-Modul pro Feature, verbunden über [Avaje Inject](https://avaje.io/inject/) und konfiguriert über avaje-config-Profile in einer einzigen `application.yaml`. Unsere eigene, handgeschriebene Modulplattform wich einfacher Dependency Injection: weniger Code, weniger Überraschungen.

Auf dieser Grundlage kam in 2.x innerhalb von knapp zwei Wochen ein Spielerfeature nach dem anderen:

- **Portale**, die du durchläufst oder durchfliegst, um den Server zu wechseln (2.0), mit **Live-Spielerzahlen** auf ihren Beschriftungen (2.1).
- **Saisons**: Die Lobby startet zu festen Zeiten in eine saisonale Welt (2.0).
- **Tageszeit nach der echten Uhr** (2.0).
- **Ein Jump'n'Run** in der Lobby (2.2) mit zufällig erzeugten Parcours, Highscores pro Modus und einer Top-3-Anzeige in der Sidebar (2.3). Als Landeblöcke kamen Treppen, Teppiche, Schnee, Köpfe, Blumentöpfe und Kerzen hinzu (2.5), dazu Kletterabschnitte mit Leitern, Ranken und Türmen, die mit deinem Punktestand wachsen (2.6). Die Schwierigkeit folgt einer sanften Kurve: `level = 1 − e^(−score / scale)`. Auf Feedback aus der Community hin verlangt *Medium* keine schmalen Sprünge über Zaun und Kerze mehr.
- **`/spawn`** und ein Spawn-Eintrag im Navigator (2.3).
- **Ein Lobby-Switcher** (2.6): Eine Uhr in deiner Hotbar listet jede Lobby mit ihrer Spielerzahl.

Hinter den Kulissen ergänzte 2.4 **OpenTelemetry-Tracing und Metriken**, damit wir sehen, was langsam ist, bevor du es merkst. 2.6 brachte außerdem einen **Boot-Smoke-Test**: CI startet jetzt das ausgelieferte Jar mit der echten Konfiguration. Er ist eine Konsequenz aus einem Vorfall am Release-Tag, an dem ein Bibliotheksupdate Build und Unit-Tests durchlief, die Lobby aber nicht starten ließ.

## Version 3: ein Kern, mehrere Plattformen (10. Oktober 2026)

**3.0.0 ist ein Breaking Change für alle, die Titan selbst betreiben.** Der Start läuft jetzt über einen kleinen Vertrag `ServerBootstrap`, den Java über den `ServiceLoader` auswählt. Minestom-Extensions, CloudNet und LuckPerms liegen jeweils in einem eigenen **Plattform-Modul**. 3.0.1 folgte am selben Abend und übersetzte den Lobby-Switcher ins Deutsche und Englische. Die Details folgen in zwei Deep-Dives: am 20. Oktober zur Plattform-Trennung in 3.0 und am 27. Oktober dazu, warum grüne Tests keine startende Lobby bedeuten.

## Was als Nächstes kommt

Einige Verbesserungen sind bereits in Review:

- Im Navigator verbindest du dich mit einem Linksklick, ein Rechtsklick teleportiert dich vor das passende Portal.
- Live-Spielerzahlen für jeden Modus im Navigator.
- Ein Fix, der jeder Lobby ihr echtes Spielerlimit an CloudNet meldet.

## Mitmachen

Titan wird wie der Rest unseres Minestom-Ökosystems offen entwickelt, zum Beispiel [Aves](/de/projects/aves), das die Menüs von Titan antreibt, und [Falco](/de/projects/falco), unsere Bibliothek für das Laden von Anvil-Chunks und die Beleuchtung.

- Code: [OneLiteFeatherNET/Titan auf GitHub](https://github.com/OneLiteFeatherNET/Titan)
- Releases: [Titan-Releases](https://github.com/OneLiteFeatherNET/Titan/releases)
- Changelog: [CHANGELOG.md](https://github.com/OneLiteFeatherNET/Titan/blob/main/CHANGELOG.md)

Wenn dir die Lobby, das Jump'n'Run oder unsere Open-Source-Arbeit gefällt, kannst du die Server und die Entwicklungszeit dahinter auf [OpenCollective](https://opencollective.com/onelitefeather) unterstützen. Fehlerberichte, Ideen und Pull Requests sind genauso willkommen, und viele Features aus 2.x haben als Spielerfeedback angefangen. Wir sehen uns in der Lobby!
