---
slug: 'xerus'
translationKey: 'xerus'
title: 'Xerus: Minispiel-API für Minestom'
summary: 'Eine Java-Bibliothek für Minispiele auf Minestom: Kits, Teams und ein Phasensystem für den Ablauf einer Runde.'
status: 'active'
logo: '/images/projects/xerus/icon.png'
logoAlt: 'Codeausschnitt aus Kit.java'
socialImage: '/images/projects/xerus/social.png'
releasedAt: '2025-03-25'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'AGPL-3.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Xerus'
  issues: 'https://github.com/OneLiteFeatherNET/Xerus/issues'
maintainers:
  - 'theevilreaper'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/xerus'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/xerus'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/xerus'
---

## Was ist das?

Xerus ist eine Java-Bibliothek, mit der du Minispiele für [Minestom](https://github.com/Minestom/Minestom) baust. Sie ist kein Plugin für Paper oder einen anderen Server, sondern eine API. Sie liefert die Bausteine, die fast jedes Minispiel braucht: Kits für die Ausrüstung, Teams für die Spieler und ein Phasensystem für den Ablauf einer Runde.

## Was die Bibliothek bietet

- **Kits** beschreiben, was ein Spieler erhält. Ein Kit wird auf einen Spieler angewendet, und ein Ereignis meldet jeden Wechsel.
- **Teams** gruppieren Spieler, auch mit einer Kapazitätsgrenze. Ein Verteiler teilt die Spieler auf die Teams auf.
- **Phasen** bilden den Spielablauf ab: Phasen mit Tick-Zähler sowie Reihen von Phasen, die linear oder zyklisch ablaufen. Jede Phase meldet ihr Ende über Callbacks.
- **Ereignisse** wie `GamePreLaunchEvent`, `GameFinishEvent` und `PlayerKitChangeEvent` erlauben, in den Ablauf einzugreifen.
- **Sprache:** Die Bibliothek bringt eine deutsche Sprachdatei mit. Wenn dein Projekt mehrere Sprachen unterstützt, prüfe Texte im Kontext der Spielersprache.

## Für wen ist sie gedacht?

Für Entwickler, die Minispiele auf Minestom bauen und Kits, Teams und Rundenabläufe nicht jedes Mal neu schreiben wollen. Wer einen Paper-Server betreibt, hat davon nichts. Die README schließt Paper ausdrücklich aus.

## Was du vor dem Einsatz wissen solltest

- **Breaking Changes stehen im CHANGELOG.** In 1.12.3 wurden mehrdeutige Farbkonstanten umbenannt, und der CHANGELOG markiert das als Breaking Change. Lies ihn vor jedem Upgrade. `Phase.setFinishedCallback` ist zum Entfernen markiert. Ersatz sind `addFinishedCallback` und `removeFinishedCallback`.
- **Java 25 ist erforderlich.** Das Build zielt auf Java 25.
- **Minestom ist nicht enthalten.** Die Version wählst du selbst. Xerus 1.12.4 wird über das Mycelium-BOM 1.8.9 gegen Minestom 2026.10.07-26.2 gebaut.
- **Maven-Koordinaten.** Sie lauten `net.theevilreaper:xerus`. Die Artefakte liegen im OneLiteFeather-Maven-Repository, das Zugangsdaten verlangt. Auf Maven Central ist Xerus nicht zu finden.
- **Dokumentation.** Eine eigene Dokumentationsseite gibt es nicht. Der Einstieg sind die README, die Javadoc im Build und die Tests im Repository.
- **Im Ökosystem.** Das Elytra-Rennen [Voyager](/de/projects/voyager) bindet Xerus ein.
