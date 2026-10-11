---
slug: 'ingot'
translationKey: 'ingot'
title: 'Ingot: selbst gehosteter Maven-Repository-Manager'
summary: 'Ein Maven-Repository-Manager für JVM-Projekte und ein Fork von Reposilite.'
status: 'active'
logo: '/images/projects/ingot/icon.png'
logoAlt: 'Codeausschnitt aus README.md'
socialImage: '/images/projects/ingot/social.png'
releasedAt: '2026-08-08'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'JVM'
  - 'Docker'
license: 'Apache-2.0'
links:
  docs: 'https://github.com/OneLiteFeatherNET/ingot#readme'
  source: 'https://github.com/OneLiteFeatherNET/ingot'
  issues: 'https://github.com/OneLiteFeatherNET/ingot/issues'
  downloads:
    - label: 'GitHub Releases'
      url: 'https://github.com/OneLiteFeatherNET/ingot/releases'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/ingot'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/ingot'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/ingot'
---

## Was ist das?

Ingot speichert, liefert und spiegelt Build-Artefakte für Maven-basierte Projekte im JVM-Ökosystem. Es spricht das normale Maven-HTTP-Protokoll, daher funktionieren `mvn deploy` und `gradle publish` ohne eigenes Plugin. Ingot läuft als einzelner JVM-Prozess mit kleinem Speicherbedarf.

## Ein Fork von Reposilite

Ingot ist ein Fork von [Reposilite](https://github.com/dzikoysk/reposilite) von dzikoysk und Mitwirkenden, veröffentlicht unter der Apache-2.0-Lizenz. Die Grundlage des Servers stammt aus dem Reposilite-Projekt. Ingot hat eigene Releases, eigene Maintainer und eine eigene Versionslinie ab 1.0.0. Es ist nicht mit Reposilite verbunden und wird von dessen Autoren nicht unterstützt. Urheber- und Änderungshinweise stehen in der [NOTICE-Datei](https://github.com/OneLiteFeatherNET/ingot/blob/main/NOTICE).

## Was sich gegenüber Reposilite ändert

- **Name und Artefakte:** Das Produkt heißt Ingot. Das Build erzeugt `ingot-*.jar` und veröffentlicht unter `net.onelitefeather.ingot`. Java-Pakete und Modulordner bleiben `reposilite-*` und `com.reposilite.*`, damit bestehende Reposilite-Plugins weiter kompilieren.
- **Docker-Image:** `ghcr.io/onelitefeathernet/ingot` ist ein Ersatz für das Reposilite-Image mit gleichem Entrypoint, gleichen Pfaden und gleichen Umgebungsvariablen. `INGOT_OPTS` ist neu, `REPOSILITE_OPTS` wird weiterhin gelesen. Das Dashboard kann in einem eigenen Container laufen.
- **Versionslinie:** Ingot zählt ab 1.0.0, unabhängig von Reposilite 3.5.28, aus dem die Quellen stammen. Der Funktionsumfang entspricht laut Projekt dem von 3.5.28.
- **Dashboard:** Version 1.1.0 hat das Dashboard auf Tailwind CSS v4 umgestellt und die Wurzelansicht zeigt jetzt die Sichtbarkeit der Repositories an.

## Was du vor dem Einsatz wissen solltest

- **Java 17 oder neuer** wird für das JAR vorausgesetzt. Das Docker-Image enthält Java 21.
- **Hosted und Proxy:** Hosted-Repositories für `releases`, `snapshots` und `private` sind eingebaut. Remote-Repositories lassen sich spiegeln, und abgerufene Artefakte lassen sich optional lokal speichern.
- **Dokumentation:** Die Anleitungen liegen als Markdown im Repository unter `reposilite-site/data/guides`. Eine veröffentlichte Dokumentationsseite gibt es noch nicht.
- **Einrichtung:** Der [Schnellstart](https://github.com/OneLiteFeatherNET/ingot#quickstart) beschreibt den Start aus dem Quellcode und mit Docker Compose.
