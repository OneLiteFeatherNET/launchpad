---
slug: 'cyano'
translationKey: 'cyano'
title: 'Cyano: Test-Framework für Minestom'
summary: 'Ein JUnit-5-Testmodul für Minestom-Server, ausgelagert aus dem nicht mehr gepflegten Microtus-Fork.'
status: 'active'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'Apache-2.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Cyano'
  issues: 'https://github.com/OneLiteFeatherNET/Cyano/issues'
maintainers:
  - 'theevilreaper'
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/cyano'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/cyano'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/cyano'
---

## Was ist das?

Cyano ist ein Testmodul für Minestom-Server. Es stammt aus dem Testmodul des Minestom-Forks Microtus, der nicht mehr gepflegt wird, und behält dessen Erweiterungen bei. Relevante Änderungen aus dem Upstream-Minestom übernimmt es ebenfalls. Cyano ist eine JUnit-5-Erweiterung für Integrationstests und kein Plugin für einen Server.

## Was du damit testen kannst

- **Spieler ohne Koordinaten erstellen.** `env.createPlayer(instance)` setzt den Spieler auf (0, 0, 0). Über eine `TestConnection` gibt es denselben Standardwert mit `connect(instance)`.
- **Instanzen zusammen mit ihren Spielern entfernen.** `env.destroyInstance(instance, true)` entfernt zuerst alle Spieler. Minestom verweigert das Zerstören einer Instanz, solange Spieler verbunden sind.
- **Bestehende Tests übernehmen.** Der Wechsel vom Minestom-Testmodul besteht darin, die Annotation durch `@ExtendWith(MicrotusExtension.class)` zu ersetzen. Die Erweiterungen sind optional; ohne sie bleibt das Verhalten unverändert.

## Für wen ist es gedacht?

Für Entwickler, die Minestom-Server oder -Bibliotheken mit JUnit 5 testen und sich auf die Erweiterungen des Microtus-Forks verlassen. Wer das nicht braucht, fährt mit dem Testmodul von Minestom selbst einfacher.

## Was du wissen solltest

- **Frühe Entwicklung (0.x).** Ein 1.0-Release gibt es noch nicht. Die aktuelle Version ist 0.7.8 vom 8. Oktober 2026. Vor 1.0 gibt es keine Stabilitätszusage, daher lohnt sich ein Blick in das Changelog vor jedem Upgrade.
- **Nicht auf Maven Central.** Die Koordinate lautet `net.onelitefeather:cyano`. Die Artefakte liegen im Maven-Repository von OneLiteFeather unter `repo.onelitefeather.dev`. Öffentlich verfügbar sind nur Versionen ab 0.7.4.
- **Java 25 ist erforderlich.** Das Build zielt auf Java 25.
- **Minestom folgt der Linie 26.2.** Die Version 0.7.8 aktualisiert die Abhängigkeit auf Minestom 2026.10.07-26.2.
