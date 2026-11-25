---
title: 'minecraft2shell: Lücke im Minecraft-Client über Server-Ressourcenpakete'
alternativeTitle: 'Was Spielerinnen, Spieler und Server-Betreiber jetzt tun sollten'
description: 'Eine Lücke im Minecraft-Client (Java Edition 26.3, Windows) lässt sich über Server-Ressourcenpakete auslösen. Was ihr jetzt tun solltet.'
pubDate: '2026-11-25'
releaseDate: '2026-11-25T12:00:00+01:00'
slug: 'minecraft2shell-luecke-im-minecraft-client'
translationKey: 'minecraft2shell-vulnerability-in-the-minecraft-client'
tags:
  - minecraft
  - security
  - hardening
author: themeinerlp
canonical: 'https://onelitefeather.net/de/blog/minecraft2shell-luecke-im-minecraft-client'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/minecraft2shell-luecke-im-minecraft-client'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/minecraft2shell-vulnerability-in-the-minecraft-client'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/minecraft2shell-vulnerability-in-the-minecraft-client'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'minecraft2shell: Lücke im Minecraft-Client über Server-Ressourcenpakete'
    alternativeHeadline: 'Was Spielerinnen, Spieler und Server-Betreiber jetzt tun sollten'
    description: 'Ein Proof of Concept zeigt Codeausführung im Minecraft-Client 26.3 über Server-Ressourcenpakete und Schriftdateien. Mojang hat die Schriftbibliothek ersetzt, eine öffentliche Aussage gibt es nicht. So schützt ihr euch.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-11-25T12:00:00+01:00'
---
Am **22. November 2026** wurde das GitHub-Repository [bikini/minecraft2shell](https://github.com/bikini/minecraft2shell) veröffentlicht. Es zeigt einen Proof of Concept (PoC) für Codeausführung im offiziellen, von Mojang signierten Minecraft-Java-Edition-Client 26.3 unter Windows. Dieser Beitrag hat zwei Teile: **Für Spielerinnen und Spieler**, die Minecraft auf dem eigenen Rechner spielen, und **Für Server-Betreiber**, die Server anbieten.

> **Stand 25. November 2026: Mojang hat die Schriftbibliothek in 26.3 am 24. November ausgetauscht, eine öffentliche Aussage gibt es bisher nicht.** Ältere Versionen sind laut Mojangs Versionsdaten unverändert. Uns sind keine Angriffe in freier Wildbahn bekannt.

## Was passiert ist

Ein Server kann Spielerinnen und Spielern ein Ressourcenpaket anbieten. Ein solches Paket enthält unter anderem Schriften. Der PoC nutzt dafür speziell gebaute TrueType-Schriften. Nachdem das Paket geladen ist, schickt der Server gewöhnlichen Text, etwa in die Aktionsleiste. Beim Darstellen dieses Textes verarbeitet die mitgelieferte Schriftbibliothek FreeType (in 26.3 in Version 2.14.3) Hinting-Anweisungen aus den Schriftdateien. Dabei schreibt FreeType über seinen eigenen Speicherbereich hinaus. Das ist ein Speicherfehler, und der PoC macht daraus die Ausführung von Code.

Der PoC selbst öffnet nur den Windows-Taschenrechner und beendet das Spiel. Derselbe Weg könnte aber jedes Programm mit den Rechten der angemeldeten Person starten. Dann wären Dateien, gespeicherte Anmeldedaten und Sitzungen erreichbar.

Der PoC umgeht die Abfrage für Ressourcenpakete nicht. Bei einem Server, dem ihr nicht vertraut, müsst ihr das Paket zuerst annehmen. Ist der Server-Eintrag so eingestellt, dass Pakete ohne Nachfrage geladen werden, entfällt die Abfrage.

## Welche Versionen betroffen sind

[Mojangs Versionsdaten](https://piston-meta.mojang.com/mc/game/version_manifest_v2.json) nennen für jede Version die verwendete Schriftbibliothek. Die Tabelle fasst sie zusammen:

| Version | Schriftbibliothek laut Mojang-Metadaten | Status |
|---|---|---|
| 26.3 | `lwjgl-freetype 3.4.3-mojang-2.15.0` (FreeType 2.15.0) | Am 24. November 2026 ersetzt, vorher FreeType 2.14.3. FreeType 2.15.0 enthält die Korrektur. |
| 26.1 und 26.2 | `lwjgl-freetype 3.4.1` (FreeType 2.14.1) | Unverändert, ohne die Korrektur. Als betroffen behandeln. |
| 1.20.5 bis 1.21.11 | `lwjgl-freetype 3.3.3` (FreeType 2.13.2) | Unverändert, ohne die Korrektur. Als betroffen behandeln. |
| 1.20.4 und älter | keine FreeType-Bibliothek | Diese Angriffsroute gibt es dort nicht. |

Wir haben die Bibliotheken von Mojangs Download-Server miteinander verglichen. Die neue Datei für 26.3 meldet FreeType 2.15.0, wurde am 24. November 2026 gebaut und trägt eine Signatur von Mojang. Die alte meldet FreeType 2.14.3. Das FreeType-Projekt hat die fehlerhafte Grenzprüfung schon am [22.](https://github.com/freetype/freetype/commit/1803559c4ee407d0bcbf2a67dbe96690cee869d2) und [23. April 2026](https://github.com/freetype/freetype/commit/7d600a022e1d813e85a8c94ffd395f6135872267) korrigiert. Diese Korrektur steckt in 2.15.0, aber in keiner der Versionen 2.13.2, 2.14.1 und 2.14.3.

Den PoC haben wir nicht ausgeführt, weder gegen die alte noch gegen die neue Bibliothek. Dass die älteren Minecraft-Versionen praktisch angreifbar sind, ist damit nicht bewiesen, und Mojang hat es nicht bestätigt. Ihnen fehlt aber dieselbe Korrektur, und ein [Artikel von minecraft.pl](https://minecraft.pl/en/news/minecraft2shell-unpatched-rce-vulnerability-in-minecraft-java) führt sie als betroffen auf. Behandelt sie deshalb als betroffen.

Mojang liefert dieselbe Bibliothek auch für Linux und macOS aus, wie die Metadaten zeigen. Der PoC funktioniert nur unter Windows. Keine Quelle bestätigt oder widerlegt eine Lücke auf den anderen Plattformen. Aktualisiert deshalb auch dort und verlasst euch nicht auf „Ich nutze Linux“.

Für diese Lücke kennen wir keine CVE-Nummer. Wir kennen auch keine Berichte über Angriffe in freier Wildbahn (Stand 25. November 2026). Der PoC ist öffentlich, das kann sich ändern. Der PoC betrifft die Java Edition.

## Für Spielerinnen und Spieler

### Minecraft 26.3 aktualisieren

Schließt das Spiel und den offiziellen Launcher vollständig und startet beides neu. Der Launcher lädt beim Start die geänderten Versionsdaten nach.

Zur Kontrolle: Im Spielordner sollte unter `libraries/org/lwjgl/lwjgl-freetype/` ein Ordner `3.4.3-mojang-2.15.0` liegen. Der Spielordner liegt unter Windows in `%APPDATA%\.minecraft`.

### Andere Launcher und Modpacks

Drittanbieter-Launcher behalten eigene Versionsdaten. Prism Launcher und die Modrinth App sind Beispiele dafür. Wir haben keine Aussagen dieser Projekte zur Lücke gefunden. Aktualisiert den Launcher und prüft, welche `lwjgl-freetype`-Version eure Installation nutzt. Modpacks auf älteren Versionen bleiben bei der alten Bibliothek.

### Ressourcenpakete nur von Servern, denen ihr vertraut

Ihr findet die Einstellung unter „Mehrspieler“. Wählt dort den Server-Eintrag, klickt auf „Bearbeiten“ und stellt „Server-Ressourcenpakete“ auf einen dieser Werte:

- „Abfrage“: Vor dem Laden fragt das Spiel nach.
- „Aktiviert“: Das Paket lädt ohne Nachfrage.
- „Deaktiviert“: Pakete dieses Servers werden nicht geladen.

Stellt Server, denen ihr nicht vollständig vertraut, auf „Abfrage“ oder „Deaktiviert“. Lehnt Pakete von Servern ab, die ihr nicht kennt. Verlangt ein Server das Paket und vertraut ihr ihm nicht, tretet nicht bei.

Das senkt das Risiko, behebt die Lücke aber nicht. Das leistet erst das Update.

### Mods gegen die Lücke

Es gibt Community-Mods, die das Schrift-Hinting abschalten, zum Beispiel [minecraft2shell-fix](https://github.com/sunrisemc-tw/minecraft2shell-fix). Wir haben sie nicht geprüft. Bevorzugt das offizielle Update. Eine Mod aus unbekannter Quelle ist selbst Code, dem ihr vertrauen müsst.

## Für Server-Betreiber

Euer Server ist nicht das Ziel. Das Ziel sind die PCs eurer Spielerinnen und Spieler. Gleichzeitig ist euer Ressourcenpaket genau der Weg, über den die Lücke ausgelöst wird. Darum müssen eure Spielerinnen und Spieler dem Paket vertrauen können.

### Euer Ressourcenpaket absichern

Hostet das Paket so, dass nur ihr es ändern könnt. Tragt außerdem in der `server.properties` einen SHA-1-Hash ein. Der Client lehnt dann ein ausgetauschtes Paket ab. Ersetzt die Platzhalter durch eure Werte:

```properties
resource-pack=https://example.org/pack.zip
resource-pack-sha1=0000000000000000000000000000000000000000
require-resource-pack=false
```

Beschränkt außerdem den Zugriff auf Konsole, RCON, `server.properties` und auf Plugins, die Pakete oder Text an Spielerinnen und Spieler schicken können. Prüft Plugins, die eigene Ressourcenpakete verschicken.

### Spieler informieren

Bittet eure Community, auf 26.3 zu aktualisieren. Läuft euer Server auf einer älteren Version (1.20.5 bis 26.2) und spielen eure Spielerinnen und Spieler mit dem passenden älteren Client, dann bekommen sie die neue Bibliothek nicht. Überlegt deshalb, ob ihr ein Ressourcenpaket wirklich verlangen müsst.

### Euer eigener PC

Admins sind auch Spieler. Auf einem Admin-PC liegen SSH-Schlüssel, Panel-Zugänge und Tokens. Aktualisiert deshalb zuerst den eigenen Client. Testet außerdem unbekannte Server nicht mit dem Rechner, von dem aus ihr administriert.

## Wem ihr vertraut, wenn etwas „gefixt“ ist

Kaum jemand von euch kann selbst nachprüfen, ob die Lücke geschlossen ist. Dafür müsstet ihr den Quelltext der Schriftbibliothek lesen und die ausgelieferte Datei untersuchen können. Ihr verlasst euch also darauf, dass andere das richtig gemacht haben. In der Informatik heißt das Vertrauen, und damit ist etwas sehr Konkretes gemeint: **Wem ihr vertraut, dem gebt ihr Kontrolle ab.**

Ein Vergleich aus dem Alltag: Ihr bringt das Auto wegen der Bremsen in die Werkstatt. Danach steht auf der Rechnung „Bremsen erneuert“. Nachsehen könnt ihr das nicht. Ihr fahrt trotzdem los, weil ihr der Werkstatt vertraut. Die Rechnung zeigt, wer gearbeitet hat. Sie beweist nicht, dass die Arbeit fehlerfrei ist.

Bei dieser Lücke gebt ihr an mehreren Stellen Kontrolle ab:

- **An Mojang:** Ihr vertraut darauf, dass die neue Bibliothek den Fehler behebt. Die Signatur an der Datei entspricht der Rechnung der Werkstatt. Sie belegt, dass die Datei von Mojang stammt, und sagt nichts darüber, ob sie fehlerfrei ist.
- **An euren Launcher:** Er entscheidet, welche Dateien er herunterlädt und startet.
- **An jeden Server, dessen Ressourcenpaket ihr annehmt:** Mit „Aktiviert“ gebt ihr die Entscheidung dauerhaft ab. Mit „Abfrage“ behaltet ihr sie.
- **An die Autoren von Mods:** Ihr Code läuft mit euren Rechten. Das gilt auch für Mods, die gegen genau diese Lücke helfen sollen.
- **An uns:** Wir haben Dateien und Quelltext verglichen, den PoC aber nicht ausgeführt. Ihr könnt unsere Angaben nachprüfen, die Quellen stehen unten. Tut ihr das nicht, vertraut ihr auch uns.

Ohne Vertrauen könnte niemand einen Computer benutzen. Wichtig ist, dass ihr die Entscheidung bewusst trefft: Wem gebe ich Kontrolle, wie viel, und was passiert schlimmstenfalls, wenn ich mich irre? Mojang müsst ihr vertrauen, wenn ihr Minecraft spielen wollt. Einem Server, den ihr seit fünf Minuten kennt, müsst ihr nicht vertrauen.

## Kurz zusammengefasst

- Die Lücke betrifft die Java Edition. Der PoC zeigt sie für 26.3 unter Windows.
- Mojang hat die Schriftbibliothek in 26.3 am 24. November ersetzt. Eine öffentliche Aussage fehlt.
- Aktualisiert Minecraft 26.3 und prüft, ob der Ordner `3.4.3-mojang-2.15.0` existiert.
- Behandelt die Versionen 1.20.5 bis 26.2 als betroffen, bis das Gegenteil feststeht.
- Ressourcenpakete nur von Servern, denen ihr vertraut. Setzt andere auf „Abfrage“ oder „Deaktiviert“.
- Vertrauen heißt Kontrolle abgeben. Entscheidet bewusst, wem ihr sie gebt.
- Als Betreiber: Tragt für euer Paket einen SHA-1-Hash ein und sorgt dafür, dass nur ihr es ändern könnt.

## Quellen und weiterlesen

- [bikini/minecraft2shell](https://github.com/bikini/minecraft2shell): das PoC-Repository und die Primärquelle. Es enthält einen funktionierenden Proof of Concept. Wir empfehlen, den Code nicht auszuführen.
- [Mojang-Versionsmanifest](https://piston-meta.mojang.com/mc/game/version_manifest_v2.json): Mojangs Versionsdaten, in denen die Schriftbibliothek je Version steht.
- [oss-security-Ankündigung zu FreeType 2.15.0](https://openwall.com/lists/oss-security/2026/10/13/1): die Ankündigung der FreeType-Version vom 12. Oktober 2026.
- [Korrektur in FreeType vom 22. April 2026](https://github.com/freetype/freetype/commit/1803559c4ee407d0bcbf2a67dbe96690cee869d2): die Änderung im FreeType-Quelltext, die in 2.15.0 enthalten ist.
- [minecraft.pl-Nachricht](https://minecraft.pl/en/news/minecraft2shell-unpatched-rce-vulnerability-in-minecraft-java): ein Nachrichtenartikel vom 24. November 2026, der ältere Versionen als betroffen nennt.
- [freetype.org](https://freetype.org/): die Projektseite der Schriftbibliothek FreeType.
