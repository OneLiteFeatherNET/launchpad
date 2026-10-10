---
slug: 'otis'
translationKey: 'otis'
title: 'Otis: Spielerstammdaten für Minecraft-Netzwerke'
summary: 'Ein Micronaut-REST-Dienst, der Mojang-UUIDs, Spielernamen, Sprache und Beitrittszeiten zentral speichert.'
status: 'active'
releasedAt: '2025-08-06'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Velocity'
license: 'Apache-2.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Otis'
  issues: 'https://github.com/OneLiteFeatherNET/Otis/issues'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/otis'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/otis'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/otis'
---

## Was ist das?

Otis ist ein REST-Dienst auf Basis von [Micronaut](https://micronaut.io/). Er speichert Spielerstammdaten in einer Datenbank, und Plugins, Erweiterungen und Dienste aus unserem Ökosystem fragen sie per HTTP ab. Statt dass jedes Projekt eigene Spielerdaten führt, gibt es eine zentrale Quelle. Interne Dienste können so auch mit Spielern arbeiten, die gerade offline sind. Warum es Otis gibt und wie der Dienst aufgebaut ist, erklärt der [Blogbeitrag zu Spielerstammdaten](/de/blog/otis-zentrale-spielerstammdaten-minecraft).

Otis ist keine universelle Spielerdatenbank. Es speichert nur die Felder, die unser Team als fachlich relevant einstuft.

## Was Otis speichert

Pro Spieler hält Otis die Mojang-UUID, eine interne UUID für die Verwaltung der Dienste im Ökosystem, den Spielernamen, die Sprache (Standard `en-US`), den Zeitpunkt des ersten und des letzten Beitritts sowie eine Map mit Profil-Texturen.

Das Velocity-Plugin legt beim ersten Beitritt einen Datensatz an und aktualisiert ihn beim Beitritt und Verlassen des Servers.

## Schnittstelle

- `/otis` legt ein Profil an (`POST`), liest es per UUID (`GET /byId/{owner}`) oder Namen (`GET /byName/{name}`), löscht es (`DELETE /delete/{owner}`) und listet alle auf (`GET /all`).
- `/search` prüft, ob zu einer UUID oder einem Namen ein Profil existiert.

## Was du vor dem Einsatz wissen solltest

- **Unbekannte Spieler werden nicht nachgeschlagen.** Ist ein Spieler nicht registriert, wäre ein Aufruf bei einem Drittanbieter nötig. Otis kann diesen Fall derzeit nicht behandeln.
- **Otis kann ausfallen.** Der aufrufende Dienst muss selbst damit umgehen, wenn Otis nicht erreichbar ist.
- **Java 25 ist erforderlich.** Das Build zielt auf Java 25.
- **Eine Compose-Datei startet MariaDB.** Die Datei liegt im Repository unter `docker/` und startet eine MariaDB-Instanz.
- **Fehler folgen RFC 9457.** Seit Version 1.17.0 liefert Otis Fehler als Problem Details nach RFC 9457. Clients, die Fehlerantworten auswerten, solltest du prüfen.
- **Releases laufen regelmäßig.** Das erste öffentliche Release ist v1.0.1 vom August 2025, das neueste v1.17.0 vom Oktober 2026.
- **Die README ist die Referenz.** Eine eigene Dokumentationsseite gibt es noch nicht.

## Mehr dazu im Blog

Der Beitrag [Otis: Spielerstammdaten für Minecraft](/de/blog/otis-zentrale-spielerstammdaten-minecraft) beschreibt die Architektur, die Probleme dahinter und die Grenzen des Dienstes.
