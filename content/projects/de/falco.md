---
slug: 'falco'
translationKey: 'falco'
title: 'Falco: Minestom-Bibliothek für Chunks und Licht'
summary: 'Ein Anvil-Chunk-Loader, eine Lichtberechnung und eine Instanzimplementierung für Minestom.'
status: 'active'
releasedAt: '2026-07-31'
publishedAt: '2026-10-10'
updatedAt: '2026-10-10'
platforms:
  - 'Minestom'
license: 'AGPL-3.0'
links:
  docs: 'https://docs.onelitefeather.net/falco'
  source: 'https://github.com/OneLiteFeatherNET/Falco'
  issues: 'https://github.com/OneLiteFeatherNET/Falco/issues'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/falco'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/falco'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/falco'
---

## Was ist das?

Falco ist eine Sammlung von Java-Bibliotheken für [Minestom](https://github.com/Minestom/Minestom), kein Plugin für Paper oder einen anderen Server. Es besteht aus drei Modulen, die sich einzeln verwenden lassen: einem Anvil-Chunk-Loader, einer Block- und Himmelslicht-Berechnung und einer Instanzimplementierung, die ihre Chunks beim Abmelden freigibt.

## Was die Module tun

- **falco-anvil** liest und schreibt Anvil-Welten. Lesen, Dekomprimierung und das Parsen der NBT-Daten laufen parallel. Schlägt ein Lesevorgang fehl, wirft der Loader einen Fehler, statt den Chunk als fehlend zu melden. So kann der Server gespeicherte Daten nicht mit einem neu erzeugten Chunk überschreiben. Welten, die älter als der Snapshot 21w43a sind, werden abgelehnt.
- **falco-light** berechnet Block- und Himmelslicht. Jeder Aufruf ist thread-sicher, und die Engine ist an keine bestimmte Chunk-Implementierung gebunden.
- **falco-instance** stellt eine `Instance` und ihren `Chunk` bereit. Beim Abmelden entlädt sie jeden geladenen Chunk. Minestoms `InstanceManager.unregisterInstance` entlädt nur die Chunks eines `InstanceContainer`. Bei anderen Instanzen bleiben Chunks, Tick-Partitionen und Entities zurück. Für dieses Modul wird kein Geschwindigkeitsvorteil behauptet.

## Was du vor dem Einsatz wissen solltest

- **Die API ist experimentell.** Jeder öffentliche Typ trägt `@ApiStatus.Experimental`. Signaturen und Verhalten können sich in einem Minor-Release ändern.
- **Java 25 ist erforderlich.** Das Build zielt auf Java 25.
- **Minestom ist nicht enthalten.** Die Artefakte kompilieren gegen Minestom, bringen es aber nicht mit. Die Version wählst du selbst. Release 3.0.0 ist gegen Minestom `2026.08.28-26.2` gebaut und läuft nicht auf `26.1.2`.
- **Die Leistungswerte sind Messungen, keine Versprechen.** Die README nennt Benchmark-Ergebnisse. In einem Lauf las der Anvil-Loader Chunks auf zwei Threads 1,9-mal schneller als Minestoms eigener Loader. Ein zweiter Lauf hat diesen Faktor nicht bestätigt. Die Lichtberechnung war in sechs Szenarien 1,11- bis 1,71-mal schneller. Alle Werte stammen von vor dem Wechsel auf Minestom 26.2 und wurden dort nicht erneut gemessen.
- **Einrichtung.** [Schnellstart](https://docs.onelitefeather.net/falco/tutorials/load-your-first-world-with-falco), [Maven-Koordinaten](https://docs.onelitefeather.net/falco/how-to-guides/how-to/add-falco-to-your-build) und [Build-Anleitung](https://docs.onelitefeather.net/falco/how-to-guides/how-to/build-falco-from-source) stehen in der Dokumentation. Die Artefakte werden im Maven-Repository von OneLiteFeather unter `repo.onelitefeather.dev` veröffentlicht.
