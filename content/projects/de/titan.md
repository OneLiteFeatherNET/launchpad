---
slug: 'titan'
translationKey: 'titan'
title: 'Titan: Lobbyserver auf Minestom'
summary: "Die Lobby des OneLiteFeather-Netzwerks mit Jump'n'Run, Elytra-Boost, Sitzen, Portalen, Navigator und Lobby-Wechsel."
status: 'active'
releasedAt: '2025-07-09'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
  - 'CloudNet'
license: 'Apache-2.0'
links:
  docs: 'https://github.com/OneLiteFeatherNET/Titan#readme'
  source: 'https://github.com/OneLiteFeatherNET/Titan'
  issues: 'https://github.com/OneLiteFeatherNET/Titan/issues'
  downloads:
    - label: 'GitHub Releases'
      url: 'https://github.com/OneLiteFeatherNET/Titan/releases'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/titan'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/titan'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/titan'
---

## Was ist das?

Titan ist der Lobbyserver, auf dem Spielerinnen und Spieler im OneLiteFeather-Netzwerk ankommen. Er basiert auf [Minestom](https://github.com/Minestom/Minestom), einer Java-Bibliothek für eigene Minecraft-Server, und ist für unseren eigenen Anwendungsfall gebaut.

## Was die Lobby kann

- **Jump'n'Run:** Ein zufälliger Parcours für eine Person, gestartet über Hotbar-Platz 0. Der Schwierigkeitsgrad steigt mit der Punktzahl. Es gibt die Modi Easy, Medium, Hard, Rainbow und Ultra. Eine Seitenleiste zeigt während eines Laufs Punktzahl, Rekord und die drei besten Ergebnisse des Modus.
- **Navigator und Portale:** Portale führen zu den Spielservern. Ein Portal kann ein Textschild mit der aktuellen Spielerzahl des Ziels tragen.
- **Lobby-Wechsel:** Eine Uhr in Hotbar-Platz 8 öffnet eine Übersicht der laufenden Lobbys mit ihrer Spielerzahl. Die Funktion gibt es nur in der CloudNet-Variante.
- **Elytra-Boost, Sitzen und Kitzeln:** Kleine Funktionen, die den Aufenthalt in der Lobby angenehmer machen.
- **Saisonale Lobby:** Zu festen Zeiten läuft eine andere Lobby-Welt, zum Beispiel eine Winterwelt im Dezember.

## Für wen ist das?

Für Betreiber, die eine Minestom-Lobby mit diesen Funktionen einsetzen oder darauf aufbauen möchten. Die Lobby besteht aus Feature-Modulen, die über Avaje Inject zusammengesetzt werden. Neue Funktionen lassen sich daher als eigenes Modul ergänzen, ohne den Kern zu ändern.

## Was du vor dem Einsatz wissen solltest

- **Gebaut für unseren Anwendungsfall.** Einstellungen, Welten und Portale passen zu unserem Netzwerk. Übernimm sie nicht ungeprüft für einen anderen Server.
- **Java 25 ist erforderlich.** Das Build zielt auf Java 25.
- **Zwei Varianten.** Die `cloudnet`-Variante läuft hinter CloudNet mit LuckPerms für Berechtigungen. Die `local`-Variante läuft eigenständig ohne Berechtigungs-Plugin, dort schlägt jede Berechtigungsprüfung für Spielerinnen und Spieler fehl.
- **Datenbank ist optional.** Ohne Datenbank bleiben Jump'n'Run-Rekorde nur im Arbeitsspeicher.
- **Erweiterungen.** Seit Version 3.0 lädt nur die `cloudnet`-Variante den Ordner `extensions/`.

Wie du den Server findest, steht auf der [Join-Seite](/de/join). Der Quellcode steht unter der Apache-Lizenz 2.0 auf [GitHub](https://github.com/OneLiteFeatherNET/Titan).
