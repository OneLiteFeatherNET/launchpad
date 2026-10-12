---
title: 'Titan 3.0: ein Lobby-Kern, mehrere Plattformen'
alternativeTitle: 'Warum der Serverstart zur austauschbaren Plattform wurde'
description: 'Titan 3.0 trennt den Lobby-Kern vom Serverstart: Minestom-Extensions sind nur noch eine Plattform unter mehreren. Was sich geändert hat, warum und was dabei schwer war.'
pubDate: '2026-10-20'
releaseDate: '2026-10-20'
headerImage: 'images/og/blog-de.png'
headerImageAlt: 'Titan 3.0: Lobby-Kern mit austauschbaren Plattformen'
slug: 'titan-3-0-lobby-kern-mehrere-plattformen'
translationKey: 'titan-3-0-platforms'
tags:
  - minecraft
  - titan
  - architektur
author: themeinerlp

canonical: 'https://onelitefeather.net/de/blog/titan-3-0-lobby-kern-mehrere-plattformen'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/titan-3-0-lobby-kern-mehrere-plattformen'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/titan-3-0-one-lobby-core-several-platforms'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/titan-3-0-one-lobby-core-several-platforms'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'Titan 3.0: ein Lobby-Kern, mehrere Plattformen'
    alternativeHeadline: 'Warum der Serverstart zur austauschbaren Plattform wurde'
    description: 'Titan 3.0 trennt den Lobby-Kern vom Serverstart: Minestom-Extensions sind nur noch eine Plattform unter mehreren.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-10-20T00:00:00+00:00'
---

## Vorwort

Titan ist der Minestom-Server, auf dem unsere Lobby läuft. Dort kommen Spieler an, bevor sie zu einem Minispiel wechseln: Portale, Navigator, Spawn, Sitzen, Jump'n'Run und seit Kurzem eine Lobby-Auswahl. Der Code liegt im [Titan-Repository](https://github.com/OneLiteFeatherNET/Titan) und wird mit Gradle gebaut.

Am 10. Oktober 2026 erschienen die Versionen 2.6.0 und 3.0.0, am selben Tag folgte 3.0.1. Die 3.0.0 ist ein Breaking Change, denn der Start der Lobby hat sich grundlegend geändert. Dieser Beitrag beschreibt den alten Stand, den Weg zum neuen, was schwer war und was wir mitnehmen. Teil zwei der Serie erzählt, was beim Start nach dem Update passiert ist. Den Überblick über Titan seit Version 1.0 gibt der [Rückblick](/de/blog/titan-von-1-0-bis-3-0).
<!--more-->

## Vorher: ein Start für beide Varianten

Titan hat zwei Varianten. `apps/cloudnet` läuft im Betrieb unter CloudNet, `apps/local` ist für die Entwicklung auf dem eigenen Rechner gedacht. Bis Version 2.6.0 teilten sich beide denselben Einstieg. `TitanApplication.main` erzeugte immer einen `ExtensionBootstrap` aus minestom-extensions, lud den Ordner `extensions/`, baute danach den Feature-Kern auf und startete den Server zuletzt. Die `runtime` hing dafür fest an dieser Bibliothek. Auch die lokale Variante lud Extensions, die sie nicht brauchte.

Im Betrieb braucht man die Extensions tatsächlich, denn die CloudNet-Bridge und die Titan-Bridge laufen als Minestom-Extensions. Lokal kosten sie aber Startzeit und bringen Abhängigkeiten mit, die niemand braucht. Hinzu kam eine enge Kopplung: Das LuckPerms-Modul fragte den Extension-Manager direkt ab (`ExtensionBootstrap.getExtensionManager()`), auch dort, wo es gar keinen Loader gab.

Der Stand vor 3.0 in Stichworten:

- `runtime`: Einstieg und Startreihenfolge, abhängig von minestom-extensions
- `features/*`: Lobby-Funktionen als eigene Gradle-Module
- `core`, `common`, `persistence`, `bridge`, `setup`: gemeinsame Schnittstellen, Datenbank, Bridge und Setup
- `apps/cloudnet`, `apps/local`: die beiden Varianten

## Nachher: ein Vertrag, drei Wege

Im neuen Modell gibt es im Modul `core` einen Vertrag `ServerBootstrap` mit vier Methoden: `name()`, `init(Auth)`, `start(host, port)` und `loadedExtensions()`. Die `runtime` wählt beim Start über den `ServiceLoader` den Bootstrap aus:

- Keine Plattform gefunden: einfaches Minestom ohne Extensions.
- Genau eine gefunden: diese wird verwendet.
- Mehrere gefunden: Der Start bricht mit einer Fehlermeldung ab, die alle Namen nennt.

Die Plattformen liegen als eigene Module:

- `platform/extensions`: die Umsetzung des Vertrags über minestom-extensions, registriert über `META-INF/services`
- `platform/cloudnet`: die Zustellung von Spielern über den CloudNet-Nachrichtenkanal, aktiv, wenn im Service-Verzeichnis ein `.wrapper`-Ordner liegt
- `platform/luckperms`: liest die geladenen Extensions über den injizierten Bootstrap statt über die Bibliothek

Welche Plattform eine Variante einbindet, entscheidet die Variante selbst. `apps/cloudnet` bringt Extensions und CloudNet mit, `apps/local` startet ohne Extension-Loader. Außerdem legt `TitanStartup` die Reihenfolge fest: erst den Server initialisieren, dann den Exception-Handler installieren, dann den Bean-Scope bauen und erst zuletzt den Server starten. Dadurch betritt kein Spieler eine halb aufgebaute Lobby.

## Der Weg dorthin

Der Umbau war kein einzelner Schritt. Zwischen dem 25. September und dem 10. Oktober haben wir ihn als Kette gemergter PRs gebaut:

- **25. September:** #292 baut die Lobby um Feature-Module herum (rund 15.000 Zeilen neu, 3.600 entfernt). #297 und #301 ziehen die Konfiguration in `application.yaml` mit Profilen und über die avaje-config-Fassade nach.
- **27. September:** #304 lädt die Konfiguration zur Laufzeit neu. #306 fasst die Navigator-Ziele in einem Aves-Modul zusammen (877 Zeilen neu, 2.523 entfernt). #308 ersetzt die eigene Modulplattform durch Avaje-Inject-Beans (3.877 neu, 4.755 entfernt).
- **28. September:** #312 teilt Titan in `features/*` und App-Varianten, #313 bindet Berechtigungen über ein optionales DI-Modul an.
- **4. und 10. Oktober:** OpenTelemetry-Tracing für Lobby-Funktionen (#362, #363, dann #389 bis #395).
- **10. Oktober:** #398 startet das ausgelieferte Jar in einem Test, #403 schließt den Bean-Scope, wenn der Start fehlschlägt, und #407 macht den Extension-Bootstrap zur Plattform.

Allein PR #407 umfasst 50 geänderte Dateien mit +1.216 und −132 Zeilen in sechs Commits. Zwischen den Tags 2.6.0 und 3.0.0 liegen nur zwei Commits, die eigentliche Arbeit steckt in der Kette davor. Von 2.0.0 bis 3.0.0 sind es insgesamt 74 Commits. Seit dem 20. September tragen auf dem Hauptzweig neun Commits den Breaking-Change-Marker `!`.

Der Lobby-Switcher, eine Uhr auf Hotbar-Slot 8, die andere Lobbys mit Spielerzahlen zeigt, kam schon mit 2.6.0 dazu und ist kein Teil von 3.0.0. Mit 3.0.1 wurde der Name der Uhr pro Spielersprache gerendert, vorher stand er einmal in Englisch fest.

## Was schwer war

Beim Bauen zeigten sich drei harte Stellen.

**Abweichungen vom Design.** Der OpenSpec-Entwurf aus Version 2.6.0 sah für die Plattformauswahl einen zweiten Avaje-Scope vor. Umgesetzt haben wir einen `ServiceLoader`. `CloudNetEnvironment` blieb in `common`, denn ein Umzug nach `platform` hätte die Abhängigkeitsrichtung umgedreht. `TracedDeliver` wanderte nach `common`. `platform/cloudnet` bekam eine eigene Gradle-Gruppe, weil der gleiche Name wie `apps/cloudnet` einen zirkulären Task-Graphen erzeugte. `loadedExtensions()` liefert eine geordnete Liste statt eines Sets.

**Rebase-Konflikte.** #407 hing an #403 und musste mehrfach gegen einen wachsenden `main` rebased werden, weil Tracing, Jump'n'Run und der Lobby-Switcher parallel dort landeten.

**Testbarkeit.** `MinecraftServer.init` ist prozessglobal. Ein Unit-Test kann den Server deshalb nicht sauber mehrfach starten. Den Start prüfen wir heute über #398, der das ausgelieferte Jar in einem eigenen Prozess startet, und den Rest manuell am echten Server. Dass dieser Test erst nach dem Problem aus Teil zwei kam, ist eine eigene Geschichte.

Außerdem gab es Fehler im Umbau selbst, die wir in #407 korrigiert haben. Der Port wird jetzt wie bei `Integer.getInteger` gelesen. Extensions werden erst nach der Server-Initialisierung gemeldet. Ein Bind-Fehler wird geloggt und beendet den Prozess mit Exit-Code 1. Vorher konnte die JVM wegen nicht-daemonisierter Threads hängen bleiben.

## Was wir gelernt haben

Drei Dinge nehmen wir mit:

- **Große Umbauten in kleinen, gemergten Schritten.** Jeder Schritt war für sich lauffähig. Das machte die Rebases mühsam, hinterließ aber nie einen Stand, in dem nichts mehr startet.
- **Eine Plattform braucht einen kleinen Vertrag.** Für unsere Zwecke reichen ein `ServiceLoader` und ein Interface mit vier Methoden. Das ist unsere Einschätzung, keine Messung.
- **Ein Start des fertigen Artefakts schlägt viele Unit-Tests.** Wie wichtig das im Oktober wurde, erzählt der zweite Teil.

Für Betreiber ist die Änderung klar: Mit 3.0.0 lädt nur noch `apps/cloudnet` den Ordner `extensions/`. Lokale Läufe starten ohne Extension-Loader.

Teil zwei der Serie: [Warum unsere Tests grün waren und die Lobby trotzdem nicht startete](/de/blog/warum-unsere-tests-gruen-waren-lobby-startete-nicht).

## Projekt Links

* Repository: <https://github.com/OneLiteFeatherNET/Titan>
* Release 3.0.0: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.0.0>
* Release 3.0.1: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.0.1>
* Changelog: <https://github.com/OneLiteFeatherNET/Titan/blob/main/CHANGELOG.md>
