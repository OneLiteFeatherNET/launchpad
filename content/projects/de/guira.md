---
slug: 'guira'
translationKey: 'guira'
title: 'Guira: Minestom-Bibliothek für Setup-Abläufe'
summary: 'Eine Java-Bibliothek, mit der du Setup-Abläufe für Minestom-Server frei definierst.'
status: 'active'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'Apache-2.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Guira'
  issues: 'https://github.com/OneLiteFeatherNET/Guira/issues'
maintainers:
  - 'theevilreaper'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/guira'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/guira'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/guira'
---

## Was ist das?

Guira ist eine kleine Java-Bibliothek für [Minestom](https://github.com/Minestom/Minestom). Sie gibt keinen festen Ablauf vor. Du legst selbst fest, was ein Setup enthält, etwa Karten, Teams oder Regeln. Guira speichert und verwaltet diese Daten im Arbeitsspeicher.

## Was ein Setup-Ablauf hier bedeutet

- **Eigene Datentypen.** Ein Setup ist ein Objekt, das das Interface `SetupData` implementiert, mit den Methoden `save()`, `reset()`, `loadData()` und `getId()`. Für kartenbasierte Setups gibt es die Basisklasse `MapSetupData`.
- **Verwaltung pro UUID.** `SetupDataService` legt Setup-Daten unter einer UUID ab. Mit `add`, `get` und `remove` holst du sie wieder hervor oder entfernst sie.
- **Vorlagen für Kategorien.** `SetupCategories` bringt Vorlagen für die Kategorien Name, Erbauer und Spawn mit, jeweils mit Material und Textfarbe.
- **Ereignisse.** `SetupCreateEvent` und `SetupFinishEvent` markieren den Anfang und das Ende eines Setups.

## Was du wissen solltest

- **Guira löst keine Ereignisse aus.** Die Bibliothek ruft `SetupCreateEvent` und `SetupFinishEvent` nicht selbst auf. Du musst sie in deinem Plugin oder deiner Anwendung auslösen und behandeln.
- **Frühe Entwicklung (0.x).** Die neueste Version ist 0.10.6. Ein 1.0-Release gibt es noch nicht, deshalb kann sich die API zwischen den Versionen noch ändern.
- **Minestom ist nicht enthalten.** Die Bibliothek wird gegen Minestom kompiliert, bringt es aber nicht mit. Du wählst die Minestom-Version selbst.
- **Java 25 ist erforderlich.** Das Build zielt auf Java 25.
- **Einbindung.** Das Artefakt `net.onelitefeather:guira` wird im Maven-Repository von OneLiteFeather unter `repo.onelitefeather.dev` veröffentlicht. Der Quellcode steht auf GitHub unter der Apache-2.0-Lizenz.
