---
slug: 'butterfly'
translationKey: 'butterfly'
title: 'Butterfly: Paper-Plugin und Minestom-Extension'
summary: 'Ein Paper-Plugin und eine Minestom-Extension, die Scoreboard-Teams und Chatformate aus LuckPerms setzen.'
status: 'active'
logo: '/images/projects/butterfly/icon.png'
logoAlt: 'Codeausschnitt aus Butterfly, default-config.yaml: Sortierung der Teams und Chat-Köpfe'
socialImage: '/images/projects/butterfly/social.png'
releasedAt: '2026-06-29'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Paper'
  - 'Minestom'
license: 'AGPL-3.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Butterfly'
  issues: 'https://github.com/OneLiteFeatherNET/Butterfly/issues'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/butterfly'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/butterfly'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/butterfly'
---

## Was ist das?

Butterfly übersetzt LuckPerms-Daten in das, was Spieler sehen. Für jeden Spieler liest es das Prefix aus LuckPerms und ordnet ihn einem Scoreboard-Team zu, dessen Präfix in der Spielerliste erscheint. Der Chat setzt dasselbe Rangzeichen vor den Namen. Butterfly gibt es als Paper-Plugin und als Minestom-Extension, die dieselbe Logik als Bibliothek bereitstellt.

## Funktionen

- **Scoreboard-Teams aus LuckPerms-Prefixen:** Die Teams sortieren sich über ein Zahlenpräfix, dessen Format `butterfly.teams.sort-format` bestimmt. Die Teamfarbe kommt aus der Gruppenberechtigung `color.<Gewicht>.<Farbe>`.
- **Chatformat:** Der Chat zeigt Prefix und Namen des Absenders. Davor steht optional der Spielerkopf; das ist standardmäßig aktiv und setzt Clients ab 1.21.9 voraus.
- **Chat-Tags nach Berechtigung:** MiniMessage-Tags wie Farben, Verläufe oder Klick-Aktionen wirken nur, wenn der Absender die passende Berechtigung `butterfly.chat.tag.<Typ>` hat. Andere Tags bleiben als Text stehen.
- **Konfiguration:** `config.yaml` im Datenordner, beim ersten Start mit Standardwerten angelegt.

## Voraussetzungen

- **Java 25** für beide Module.
- **LuckPerms:** Butterfly ist gegen die LuckPerms API 5.6-SNAPSHOT kompiliert. Eine Mindestversion nennt das Projekt nicht. Auf Paper wird Butterfly nach LuckPerms geladen. Als Minestom-Extension muss LuckPerms im selben Host laufen; ohne LuckPerms protokolliert Butterfly einen Fehler und bleibt inaktiv.
- **Paper:** gegen paper-api 26.1.2 gebaut, in der plugin.yml mit `api-version` 1.19 angegeben. Eine getestete Serverversion nennt das Projekt nicht.
- **Minestom:** gegen Minestom 2026.09.12-26.2 gebaut und im Ordner `extensions/` abgelegt.

## Vor dem Einsatz wissen

- Butterfly ist für den internen Gebrauch im OneLiteFeather-Netzwerk gedacht. Das README warnt ausdrücklich davor, es als fertiges Produkt für die Öffentlichkeit einzusetzen.
- Version 2.0.0 liest `flags.properties` nicht mehr. Einstellungen liegen seitdem in `config.yaml`. Auf Minestom wird die Teamkollision dort mit `butterfly.teams.collision` gesetzt.
- Ohne eine `butterfly.chat.tag.*`-Berechtigung verlieren Spieler ihre bisherige Chatformatierung. Mit `lp group default permission set butterfly.chat.tag.* true` gilt wieder das alte Verhalten.
