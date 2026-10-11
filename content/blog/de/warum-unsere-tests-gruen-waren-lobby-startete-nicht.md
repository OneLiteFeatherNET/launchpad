---
title: 'Warum unsere Tests grün waren und die Lobby trotzdem nicht startete'
alternativeTitle: 'Binärkompatibilität, ein NoSuchMethodError und ein Boot-Test'
description: 'Ein Dependency-Update, ein Build ohne Fehler und eine Lobby, die nicht startet: was rund um Titan 3.0 passiert ist, wie der Fix aussah und welcher Test seitdem den Start prüft.'
pubDate: '2026-10-27'
releaseDate: '2026-10-27'
headerImage: 'images/og/blog-de.png'
headerImageAlt: 'Titan: Lobby-Start und Boot-Test nach dem Minestom-Update'
slug: 'warum-unsere-tests-gruen-waren-lobby-startete-nicht'
translationKey: 'titan-3-0-boot-incident'
tags:
  - minecraft
  - titan
  - tests
author: themeinerlp

canonical: 'https://onelitefeather.net/de/blog/warum-unsere-tests-gruen-waren-lobby-startete-nicht'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/warum-unsere-tests-gruen-waren-lobby-startete-nicht'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/why-our-tests-were-green-lobby-did-not-start'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/why-our-tests-were-green-lobby-did-not-start'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'Warum unsere Tests grün waren und die Lobby trotzdem nicht startete'
    alternativeHeadline: 'Binärkompatibilität, ein NoSuchMethodError und ein Boot-Test'
    description: 'Ein Dependency-Update, ein Build ohne Fehler und eine Lobby, die nicht startet: der Vorfall rund um Titan 3.0 und seine Lehren.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-10-27T00:00:00+00:00'
---

## Vorwort

Am 10. Oktober 2026 haben wir Titan 2.6.0 und 3.0.0 veröffentlicht. An diesem Tag ist außerdem etwas passiert, das wir nicht kommen sahen: Nach einem Dependency-Update startete die Lobby nicht mehr, obwohl Build und Unit-Tests grün waren. Dieser Beitrag erzählt, was passiert ist, warum "grün" nicht "lauffähig" heißt und welche Konsequenzen wir gezogen haben. Er setzt den ersten Teil der Serie fort: [Titan 3.0: ein Lobby-Kern, mehrere Plattformen](/de/blog/titan-3-0-lobby-kern-mehrere-plattformen).
<!--more-->

## Was passiert ist

Titan lief nach dem Update von `aonyx-bom` auf 0.8.8 (#388) auf Minestom in der Version 2026.10.07-26.2. In dieser Minestom-Version ändert `ConnectionManager#getOnlinePlayers()` seinen Rückgabetyp von `Collection` zu `Set`.

Der LuckPerms-Loader, den Titan einbindet, war gegen die alte Signatur übersetzt. Beim Start schlug der Aufruf deshalb mit einer `NoSuchMethodError` fehl, und die Lobby kam nicht hoch. Die Analyse in der PR-Beschreibung zeigt den Unterschied im Bytecode:

```
ConnectionManager.getOnlinePlayers()Ljava/util/Collection;   alter Loader (LuckPerms 5.6, 6.0.0, 6.0.1)
ConnectionManager.getOnlinePlayers()Ljava/util/Set;          neuer Loader (LuckPerms 6.0.2)
```

Build und Unit-Tests liefen dabei grün durch. Das war der unangenehme Teil.

Solche Änderungen kommen bei uns als automatisierte Dependency-Updates herein, erkennbar am Commit-Präfix `fix(deps)`. Die Update-Regeln liegen in `renovate.json` im Repository. Ein Update wie dieses ist im Diff klein und in der Wirkung groß: Eine Versionsnummer ändert sich, und das Verhalten der Laufzeit zieht nach.

## Binär- und Quellkompatibilität, einfach erklärt

Zwei Begriffe helfen beim Verstehen:

- **Quellkompatibilität** heißt: Der Code, den man schreibt, lässt sich gegen eine neue Version übersetzen. Ein `Set` lässt sich überall dort verwenden, wo eine `Collection` erwartet wird. Unser eigener Code hätte die Änderung des Rückgabetyps also gar nicht bemerkt.
- **Binärkompatibilität** heißt: Ein bereits übersetztes Jar funktioniert auch mit einer neuen Bibliothek. Kompilierter Bytecode verweist nicht auf eine Klasse, sondern auf eine Methode mit Namen, Parametern und Rückgabetyp, dem sogenannten Descriptor. Ändert sich der Rückgabetyp, existiert genau diese Methode nicht mehr.

Das Problem lag weder in unserem Code noch beim Compiler. Die LuckPerms-Bibliothek war bereits übersetzt, und die Prüfung fand erst zur Laufzeit statt: Die JVM bricht beim Aufruf mit `NoSuchMethodError` ab, sobald der Code diese Stelle wirklich erreicht.

Ein Unit-Test prüft in der Regel einzelne Klassen, oft gegen Stubs, und startet keinen Minestom-Server. Der Aufruf, der beim Start fehlschlug, lief in unseren Tests deshalb nie. Ein grüner Build sagt also etwas über den Code aus, nicht über den Start.

## Der Hotfix in Titan

Die Lösung in Titan war ein Versionssprung: LuckPerms auf 6.0.2 (#401, gemergt am 10. Oktober um 17:42 UTC). Die 6.x-Loader ersetzen außerdem den statischen Einstieg `MinestomLoader.get()` durch `MinestomLoader.create(options).load().enable()`. Unser `LuckPermsPermissionService` wurde auf den neuen Einstieg umgestellt, der Shutdown-Hook wird jetzt explizit über den Options-Builder registriert.

Geprüft haben wir das nicht nur am Quelltext. Die PR-Beschreibung hält fest, dass die eingebetteten Loader der Versionen 5.6, 6.0.0, 6.0.1 und 6.0.2 mit `javap` verglichen wurden: Nur 6.0.2 ruft die `Set`-Variante auf. Der Fix ist Teil der Version 2.6.0.

## Die CloudNet-Bridge: derselbe Bruch an anderer Stelle

Die CloudNet-Bridge wird als Minestom-Extension geladen und war vom selben Versionssprung betroffen. Mit einer Release-Candidate-Version der Bridge startete der Server nach dem Update nicht mehr. Wir haben die Bridge gegen die neue Minestom-Version gebaut und das Jar auf dem Produktionsknoten ausgetauscht, ohne die Cloud neu zu starten.

Die Änderung haben wir upstream als [CloudNet PR #1906](https://github.com/CloudNetService/CloudNet/pull/1906) eingereicht: "update minestom to v2026.10.07-26.2", mit dem Fehler `NoSuchMethodError: ConnectionManager#getOnlinePlayers()` als Begründung. Der PR wurde am 11. Oktober 2026 gemergt. Auch unser Fork der CloudNet-Bridge enthält diesen Versionssprung.

## Der Boot-Test als Konsequenz

Der Fehler wurde beim echten Start sichtbar, nicht durch einen Test. Danach kam der Boot-Test: [PR #398](https://github.com/OneLiteFeatherNET/Titan/pull/398) mit dem Titel "boot the shipped jar and parse a real application.yaml" wurde 17 Minuten nach dem LuckPerms-Fix gemergt, um 17:59 UTC. Er startet das ausgelieferte Jar in einem eigenen Prozess und liest die echte `application.yaml` mit dem Produktionsparser. Das ist ein Smoke-Test im engeren Sinn: Er baut nichts neu, sondern prüft das Ergebnis, das ohnehin auf den Server kommt. Zum Zeitpunkt des Vorfalls gab es ihn auf dem Hauptzweig noch nicht, und die PR-Beschreibung des Fixes hält das ausdrücklich fest.

Der Boot-Test prüft genau das, was unsere Unit-Tests nicht prüfen konnten: ob das Artefakt, das wir ausliefern, überhaupt startet. Ein Start des ausgelieferten Jars hätte den Fehler vor dem Release sichtbar gemacht.

## Der Zeitablauf

Die Ereignisse lagen eng beieinander. Alle Zeiten sind UTC, laut GitHub-Metadaten der jeweiligen PRs und Releases:

- **10. Oktober, 17:42:** #401 mit LuckPerms 6.0.2 gemergt, der Fix für den Start.
- **10. Oktober, 17:59:** #398 mit dem Boot-Test gemergt.
- **10. Oktober, 22:08:** Release 2.6.0, der den Fix enthält.
- **10. Oktober, 22:14:** #407 gemergt, der Umbau aus dem ersten Teil. Das Release 3.0.0 folgte um 22:16.
- **10. Oktober, 22:54:** CloudNet PR #1906 eröffnet.
- **11. Oktober, 06:25:** CloudNet PR #1906 gemergt.

Der Fix für den Start war also schon im Release, bevor der Umbau zu 3.0.0 landete. Die Bridge-Seite zog einen Tag später nach.

## Was wir daraus mitnehmen

- **Ein Build ist kein Start.** Ein Test muss das Artefakt starten, das ausgeliefert wird, und nicht nur den Quelltext prüfen.
- **Binärkompatibilität bei Abhängigkeiten im Blick behalten.** Ein Versionssprung einer Bibliothek kann die Bytecode-Verträge anderer Bibliotheken brechen. Bei jedem Minestom-Update lohnt sich deshalb ein Blick auf die Loader-Versionen, die wir einbinden. Das ist unsere Einschätzung, keine Messung.
- **Plattformen hinter einem kleinen Vertrag halten.** Wer direkt gegen Minestom-Klassen übersetzt, wie es der Loader hier tat, ist für solche Brüche anfälliger als jemand, der nur über eine kleine Schnittstelle spricht. Die Einordnung dazu steht im [ersten Teil](/de/blog/titan-3-0-lobby-kern-mehrere-plattformen).

## Projekt Links

* Titan-Repository: <https://github.com/OneLiteFeatherNET/Titan>
* Fix in Titan: <https://github.com/OneLiteFeatherNET/Titan/pull/401>
* Boot-Test in Titan: <https://github.com/OneLiteFeatherNET/Titan/pull/398>
* Upstream-PR in CloudNet: <https://github.com/CloudNetService/CloudNet/pull/1906>
* Release 2.6.0: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v2.6.0>
* Release 3.0.0: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.0.0>
* Release 3.0.1: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.0.1>
