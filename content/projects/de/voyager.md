---
slug: 'voyager'
translationKey: 'voyager'
title: 'Voyager: Elytra-Rennen für Minestom'
summary: 'Ein Elytra-Minispiel für Minecraft: Spieler fliegen durch Ringe in der Luft, in Cups aus mehreren Strecken.'
status: 'active'
logo: '/images/projects/voyager/icon.png'
logoAlt: 'Codeausschnitt aus Voyager, Ring.java: der Record und seine Prüfungen beim Erzeugen eines Rings'
socialImage: '/images/projects/voyager/social.png'
releasedAt: '2026-03-31'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'AGPL-3.0'
links:
  docs: 'https://github.com/OneLiteFeatherNET/Voyager/tree/main/docs'
  source: 'https://github.com/OneLiteFeatherNET/Voyager'
  issues: 'https://github.com/OneLiteFeatherNET/Voyager/issues'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/voyager'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/voyager'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/voyager'
---

## Was ist das?

Voyager ist ein Elytra-Rennspiel für Minecraft, ein Minispiel im Stil von Mario Kart. Du fliegst mit Elytren durch Ringe in der Luft. Die Spieler treten in Cups an, die aus mehreren Strecken bestehen, und sammeln Punkte, indem sie mit hohem Tempo durch die Ringe fliegen.

Der Spielserver läuft auf [Minestom](https://github.com/Minestom/Minestom) und benötigt Java 25. Ein separater Setup-Server stellt die Befehle und Werkzeuge bereit, mit denen Strecken und Cups gebaut werden.

## Was es kann

- **Elytra-Physik auf dem Server.** Die Berechnung folgt den Formeln von Vanilla Minecraft, einschließlich des Schubs durch Feuerwerk.
- **Cups aus mehreren Strecken** mit Ringpunkten und Medaillen.
- **Wartelobby**, die den Cup startet oder abbricht.
- **Strecken und Cups als JSON** mit veröffentlichtem JSON-Schema. Sie werden zwischen den Runden neu geladen, ohne dass der Server neu startet.
- **Setup-Server** mit `/map`-Befehlen und einem Stab zum Platzieren der Ringe.
- **Berechtigungen** über LuckPerms und **Velocity** mit modernem Forwarding.

## Status

Voyager ist alpha-Software. Laut README wird gerade der erste geschlossene Playtest vorbereitet, deshalb ist das Spiel noch nicht öffentlich spielbar. Die Versionsnummern der Releases zeigen den Fortschritt des Codes, nicht eine öffentliche Freigabe. Die Anbindung der Datenbank für Spielerprofile und Ergebnisse, die Live-Rangliste und das Deployment sind laut Statustabelle noch in Arbeit.

## Ein Experiment mit KI-Agenten

Laut README entsteht das Projekt im Zusammenspiel von Mensch und KI. Ein Team aus 24 spezialisierten KI-Agenten, die mit Claude Code arbeiten, entwirft, implementiert und dokumentiert es, während ein menschlicher Spieldesigner die Richtung vorgibt. Das Projekt ist ausdrücklich ein Prototyp für diese Art, Spiele zu bauen.

## Lizenz und Mitarbeit

Voyager steht unter der GNU Affero General Public License v3.0. Die Dokumentation liegt im Repository unter `docs/`. Fehler und Vorschläge nimmt das Team über die [Issues](https://github.com/OneLiteFeatherNET/Voyager/issues) entgegen.
