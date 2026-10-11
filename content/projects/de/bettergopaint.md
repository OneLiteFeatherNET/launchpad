---
slug: 'bettergopaint'
translationKey: 'bettergopaint'
title: 'BetterGoPaint: Pinsel-Plugin für Paper'
summary: 'Ein Paper-Plugin, mit dem Bauende Terrain mit Pinseln und Blockpaletten malen. Jeder Strich ist eine FastAsyncWorldEdit-Bearbeitung und lässt sich mit //undo zurücknehmen.'
status: 'active'
audience: 'external'
logo: '/images/projects/bettergopaint/icon.png'
logoAlt: 'Codeausschnitt aus BetterGoPaint, DiscBrush.java: wie der Scheibenpinsel einen Strich anwendet'
socialImage: '/images/projects/bettergopaint/social.png'
releasedAt: '2024-05-13'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Paper'
license: 'GPL-3.0-or-later'
links:
  docs: 'https://docs.onelitefeather.net/bettergopaint'
  source: 'https://github.com/OneLiteFeatherNET/BetterGoPaint'
  issues: 'https://github.com/OneLiteFeatherNET/BetterGoPaint/issues'
  downloads:
    - label: 'Hangar'
      url: 'https://hangar.papermc.io/OneLiteFeather/BetterGoPaint'
    - label: 'Modrinth'
      url: 'https://modrinth.com/plugin/bettergopaint'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/bettergopaint'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/bettergopaint'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/bettergopaint'
---

## Was ist das?

BetterGoPaint malt Terrain auf Paper-Servern. Bauende halten eine Feder in der Hand, wählen einen Pinsel und eine Palette mit bis zu fünf Blöcken und klicken mit der rechten Maustaste auf den Boden. Jeder Strich ist eine [FastAsyncWorldEdit](https://modrinth.com/plugin/fastasyncworldedit)-Bearbeitung und lässt sich mit `//undo` zurücknehmen.

BetterGoPaint ist ein gepflegter Fork von [goPaint](https://github.com/Arcaniax-Development/goPaint_1.14) von Arcaniax.

## Was es kann

- **Elf Pinsel** für Kugeln, Sprühen und Spritzer, Scheiben, zusammenhängende Flächen, Klippen, Overlays und Underlays, Risse, Verläufe und gekrümmte Striche.
- **Blockpaletten** mit bis zu fünf Blöcken. Jeder Block eines Strichs wird aus der Palette gewählt.
- **Masken**, sodass ein Strich nur einen bestimmten Block ersetzt. Die globale Maske der WorldEdit-Sitzung (`//gmask`) wird beachtet.
- **Oberflächenmodi** `DIRECT`, `RELATIVE` und `DISABLED` bestimmen, welche Blöcke beim Malen als Oberfläche zählen.
- **Undo und Redo** für jeden Strich einzeln.
- **Eigener Pinsel pro Bauendem**: Größe, Palette und Einstellungen werden im Pinsel-Menü geändert.
- **Exportierte Pinsel**: Ein Pinsel lässt sich in ein beliebiges Nicht-Block-Item übertragen und an andere Bauende weitergeben.
- **Weltsteuerung**: Das Malen lässt sich in ausgewählten Welten mit `generic.disabled-worlds` abschalten.
- **Übersetzungen**: Englisch ist eingebaut, weitere Sprachen werden auf Crowdin gesammelt.

## Voraussetzungen

- Paper 26.1.1, 26.1.2, 26.2 oder 26.3 mit Java 25.
- FastAsyncWorldEdit 2.16 oder neuer. Das Plugin setzt es voraus.
- Auf Minecraft 1.21 bleibt man bei BetterGoPaint 1.1.x. Folia wird noch nicht unterstützt.

## Für wen es ist

Für Bauteams, die Landschaften und Terrain schneller formen wollen, und für Serverbetreibende, die ihren Bauenden solche Werkzeuge geben. Malen dürfen alle mit der Berechtigung `bettergopaint.use`, Operatoren haben sie ab Werk. Einrichtung, Befehle und Berechtigungen stehen in der [Dokumentation](https://docs.onelitefeather.net/bettergopaint).
