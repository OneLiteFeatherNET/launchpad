---
slug: 'aves'
translationKey: 'aves'
title: 'Aves: Minestom-Bibliothek mit Hilfswerkzeugen'
summary: 'Hilfswerkzeuge für Minestom: Inventare, Items, Karten, Dateien, Mehrsprachigkeit und allgemeine Helfer.'
status: 'active'
logo: '/images/projects/aves/icon.png'
logoAlt: 'Codeausschnitt aus GlobalInventoryBuilder.java'
socialImage: '/images/projects/aves/social.png'
releasedAt: '2025-03-25'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'AGPL-3.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Aves'
  issues: 'https://github.com/OneLiteFeatherNET/Aves/issues'
maintainers:
  - 'theevilreaper'
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/aves'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/aves'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/aves'
---

## Was ist das?

Aves ist eine Java-Bibliothek für Minestom, die wiederkehrende Aufgaben beim Bau eines Servers übernimmt: Dateien lesen und schreiben, Inventare aufbauen, Items und Karten erzeugen und Texte in mehreren Sprachen ausgeben. Es ist kein Plugin für Paper oder einen anderen Server, sondern ein Werkzeugkasten, den du in dein Minestom-Projekt einbindest.

## Was die Pakete bieten

- **inventory** enthält Inventar-Builder für globale, persönliche und übersetzte Inventare, seitenweise Inventare, Layouts, Klick-Handler und Slot-Hilfen.
- **item** erstellt Items, auch mit übersetzten Namen und Beschreibungen.
- **file** liest und schreibt Dateien, unter anderem mit GSON-Serialisierung.
- **i18n** verwaltet mehrsprachige Texte für Nachrichten im Spiel.
- **map** stellt eine Basisklasse für Karten und einen Kartenprovider bereit.
- **hotbar** enthält ein Layout für die Hotbar.
- **util** sammelt Hilfsfunktionen für Broadcasts, Komponenten, Futures, Spieler, Positionen, Strings, Zeitformate, Vektoren und Collections.

## Für wen ist das gedacht?

Für Entwickler, die einen Minestom-Server betreiben oder bauen und Inventare, Dateiverwaltung oder Mehrsprachigkeit nicht jedes Mal neu schreiben wollen. Titan und Cygnus, zwei weitere OneLiteFeather-Projekte, nutzen Aves als Abhängigkeit.

## Was du vor dem Einsatz wissen solltest

- **Nicht für den öffentlichen Einsatz gedacht.** Die README sagt ausdrücklich, dass Aves nur für interne Zwecke genutzt werden soll und nicht in öffentliche Repositories gehört. Wer es außerhalb des Projekts einsetzen will, sollte das vorher mit den Maintainern klären.
- **Die API ist nicht vollständig stabil.** Seitenweise Inventare, ihre Steuerelemente und drei Methoden des Broadcasters sind mit `@ApiStatus.Experimental` markiert und können sich ändern. `InventoryLayout` darf nicht erweitert werden.
- **Minestom ist nicht enthalten.** Aves kompiliert gegen Minestom und Adventure, bringt sie aber nicht mit. Die Minestom-Version legt das Mycelium-BOM von OneLiteFeather fest, das Aves einbindet. Prüfe, welche Version dein Build auflöst.
- **Java 25 ist erforderlich.** Das Build zielt auf Java 25.
- **Einrichtung.** Die Koordinate lautet `net.theevilreaper:aves`. Die Artefakte liegen im OneLiteFeather-Maven-Repository, das Zugangsdaten verlangt. Den Quellcode und die Versionshinweise findest du auf GitHub.
