---
title: 'minecraft2shell: Lücke im Minecraft-Client über Server-Ressourcenpakete'
alternativeTitle: 'Was Spielerinnen, Spieler und Server-Betreiber jetzt tun sollten'
description: 'Eine Lücke im Minecraft-Client (Java Edition 26.3, Windows) lässt sich über Server-Ressourcenpakete auslösen. Was ihr jetzt tun solltet.'
pubDate: '2026-11-25'
updatedDate: '2026-11-26'
releaseDate: '2026-11-25T12:00:00+01:00'
headerImage: 'images/blog/minecraft2shell-vulnerability-in-the-minecraft-client.webp'
headerImageAlt: 'Schaubild: Ein Ressourcenpaket mit einer Schrift, ein Schriftzeichen, das über die Grenze seines Speicherbereichs hinausgeschoben wird, und der Windows-Taschenrechner'
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

> **Update 26. November 2026: Mojang hat auch 26.1 und 26.2 nachgebessert.** Die Versionen 26.1 bis 26.3 laden jetzt eine Schriftbibliothek mit der Korrektur. 1.20.5 bis 1.21.11 sind weiterhin unverändert. Eine öffentliche Aussage von Mojang gibt es bisher nicht. Uns sind keine Angriffe in freier Wildbahn bekannt. Details im [Update](#update-26-november-2026).

## Update: 26. November 2026

Am 25. November 2026 gegen 16:30 Uhr hat Mojang die Versionsdaten von 26.1, 26.1.1, 26.1.2 und 26.2 geändert. Dasselbe gilt für ihre Vorabversionen, etwa 26.1-rc-1. Sie laden seitdem `lwjgl-freetype 3.4.1-mojang-2.15.0.3` statt `3.4.1`.

Wir haben die neue Bibliothek für Windows wie schon die für 26.3 von Mojangs Download-Server geladen und untersucht, ohne sie auszuführen. Sie meldet FreeType 2.15.0, wurde am 25. November 2026 gebaut und trägt eine Signatur von Mojang. Damit enthält sie dieselbe Korrektur wie die Bibliothek für 26.3.

Was das für euch heißt:

- **26.1 bis 26.3:** Startet Spiel und Launcher neu, dann bekommt ihr die korrigierte Bibliothek. Wie ihr das prüft, steht unter [Minecraft aktualisieren](#minecraft-aktualisieren).
- **1.20.5 bis 1.21.11:** Diese Versionen laden weiterhin `lwjgl-freetype 3.3.3`. Die Datei ist identisch mit der aus dem öffentlichen Maven-Repository und enthält die Korrektur nicht. Behandelt diese Versionen weiter als betroffen.
- Den PoC haben wir weiterhin nicht ausgeführt. Belegt ist die Korrektur über die Versionsangabe der Bibliothek und den Quelltext von FreeType 2.15.0.

## Was passiert ist

Ein Server kann Spielerinnen und Spielern ein Ressourcenpaket anbieten. Ein solches Paket enthält unter anderem Schriften. Der PoC nutzt dafür speziell gebaute TrueType-Schriften. Nachdem das Paket geladen ist, schickt der Server gewöhnlichen Text, etwa in die Aktionsleiste. Beim Darstellen dieses Textes verarbeitet die mitgelieferte Schriftbibliothek FreeType (in 26.3 in Version 2.14.3) Hinting-Anweisungen aus den Schriftdateien. Dabei schreibt FreeType über seinen eigenen Speicherbereich hinaus. Das ist ein Speicherfehler, und der PoC macht daraus die Ausführung von Code.

Der PoC selbst öffnet nur den Windows-Taschenrechner und beendet das Spiel. Derselbe Weg könnte aber jedes Programm mit den Rechten der angemeldeten Person starten. Dann wären Dateien, gespeicherte Anmeldedaten und Sitzungen erreichbar.

Der PoC umgeht die Abfrage für Ressourcenpakete nicht. Bei einem Server, dem ihr nicht vertraut, müsst ihr das Paket zuerst annehmen. Ist der Server-Eintrag so eingestellt, dass Pakete ohne Nachfrage geladen werden, entfällt die Abfrage.

### Einfach erklärt

Stellt euch ein Regal mit zehn nummerierten Fächern vor, das euch gehört. Daneben stehen die Regale anderer Leute. Jemand gibt euch einen Zettel: „Schiebe den Inhalt aller Fächer bis Nummer 14 ein Stück weiter.“ Ihr zählt nicht nach, wie viele Fächer euer Regal hat, und glaubt dem Zettel. Bei Fach 11 bis 14 greift ihr deshalb in das Regal nebenan und bringt dort alles durcheinander.

Genau das passiert hier. Das Regal ist der Speicher für ein Schriftzeichen, und der Zettel steckt in der Schriftdatei. Im Regal nebenan liegen Daten, mit denen das Programm steuert, was es als Nächstes tut. Wer bestimmen kann, was dort landet, kann bestimmen, was das Programm tut.

## Welche Versionen betroffen sind

[Mojangs Versionsdaten](https://piston-meta.mojang.com/mc/game/version_manifest_v2.json) nennen für jede Version die verwendete Schriftbibliothek. Die Tabelle fasst sie zusammen:

| Version | Schriftbibliothek laut Mojang-Metadaten | Status |
|---|---|---|
| 26.3 | `lwjgl-freetype 3.4.3-mojang-2.15.0` (FreeType 2.15.0) | Am 24. November 2026 ersetzt, vorher FreeType 2.14.3. FreeType 2.15.0 enthält die Korrektur. |
| 26.1 und 26.2 | `lwjgl-freetype 3.4.1-mojang-2.15.0.3` (FreeType 2.15.0) | Am 25. November 2026 ersetzt, vorher FreeType 2.14.1. Enthält die Korrektur. |
| 1.20.5 bis 1.21.11 | `lwjgl-freetype 3.3.3` (FreeType 2.13.2) | Unverändert, ohne die Korrektur. Als betroffen behandeln. |
| 1.20.4 und älter | keine FreeType-Bibliothek | Diese Angriffsroute gibt es dort nicht. |

Wir haben die Bibliotheken von Mojangs Download-Server miteinander verglichen. Die neue Datei für 26.3 meldet FreeType 2.15.0, wurde am 24. November 2026 gebaut und trägt eine Signatur von Mojang. Die alte meldet FreeType 2.14.3. Das FreeType-Projekt hat die fehlerhafte Grenzprüfung schon am [22.](https://github.com/freetype/freetype/commit/1803559c4ee407d0bcbf2a67dbe96690cee869d2) und [23. April 2026](https://github.com/freetype/freetype/commit/7d600a022e1d813e85a8c94ffd395f6135872267) korrigiert. Diese Korrektur steckt in 2.15.0, aber in keiner der Versionen 2.13.2, 2.14.1 und 2.14.3.

Den PoC haben wir nicht ausgeführt, weder gegen die alte noch gegen die neue Bibliothek. Dass die Versionen 1.20.5 bis 1.21.11 praktisch angreifbar sind, ist damit nicht bewiesen, und Mojang hat es nicht bestätigt. Ihnen fehlt aber dieselbe Korrektur, und ein [Artikel von minecraft.pl](https://minecraft.pl/en/news/minecraft2shell-unpatched-rce-vulnerability-in-minecraft-java) führt sie als betroffen auf. Behandelt sie deshalb als betroffen.

Mojang liefert dieselbe Bibliothek auch für Linux und macOS aus, wie die Metadaten zeigen. Der PoC funktioniert nur unter Windows. Keine Quelle bestätigt oder widerlegt eine Lücke auf den anderen Plattformen. Aktualisiert deshalb auch dort und verlasst euch nicht auf „Ich nutze Linux“.

Für diese Lücke kennen wir keine CVE-Nummer. Wir kennen auch keine Berichte über Angriffe in freier Wildbahn (Stand 25. November 2026). Der PoC ist öffentlich, das kann sich ändern. Der PoC betrifft die Java Edition.

## Für Spielerinnen und Spieler

### Minecraft aktualisieren

Schließt das Spiel und den offiziellen Launcher vollständig und startet beides neu. Der Launcher lädt beim Start die geänderten Versionsdaten nach.

Zur Kontrolle: Im Spielordner sollte unter `libraries/org/lwjgl/lwjgl-freetype/` für 26.3 ein Ordner `3.4.3-mojang-2.15.0` liegen, für 26.1 und 26.2 ein Ordner `3.4.1-mojang-2.15.0.3`. Der Spielordner liegt unter Windows in `%APPDATA%\.minecraft`.

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

Bittet eure Community, das Spiel neu zu starten oder auf eine Version ab 26.1 zu aktualisieren. Läuft euer Server auf einer älteren Version (1.20.5 bis 1.21.11) und spielen eure Spielerinnen und Spieler mit dem passenden älteren Client, dann bekommen sie die neue Bibliothek nicht. Überlegt deshalb, ob ihr ein Ressourcenpaket wirklich verlangen müsst.

### Euer eigener PC

Admins sind auch Spieler. Auf einem Admin-PC liegen SSH-Schlüssel, Panel-Zugänge und Tokens. Aktualisiert deshalb zuerst den eigenen Client. Testet außerdem unbekannte Server nicht mit dem Rechner, von dem aus ihr administriert.

## Technische Analyse

> **Hinweis:** Dieser Teil erklärt das Prinzip für alle, die es genauer wissen wollen. Adressen, Abstände und alles, was man zum Nachbauen bräuchte, lassen wir bewusst weg. Die Schritte weiter oben gelten unabhängig davon, ob ihr diesen Teil lest.

### Warum eine Schriftdatei ein Programm enthält

TrueType-Schriften enthalten neben den Umrissen der Zeichen auch kleine Programme, das sogenannte Hinting. Diese Programme rücken die Punkte eines Zeichens zurecht, damit es auch in kleiner Größe scharf aussieht. FreeType bringt dafür einen eigenen Interpreter mit, der die Anweisungen der Schrift Schritt für Schritt ausführt. Eine Schriftdatei ist für FreeType also eine Eingabe, die Befehle enthält. Hier kommt sie von einem fremden Server.

### Warum das im Client passiert

Der Server braucht dafür nichts Besonderes. Er bietet ein Ressourcenpaket über die normale Einstellung in der `server.properties` an und schickt danach gewöhnlichen Text in die Aktionsleiste. Alles Weitere geschieht auf eurem Rechner: Der Client lädt die Schrift aus dem Paket und lässt FreeType die Zeichen berechnen.

Minecraft ist in Java geschrieben, und Java verhindert solche Speicherfehler eigentlich. FreeType ist aber eine in C geschriebene Bibliothek, die Minecraft über LWJGL einbindet. In diesem Teil gilt der Schutz von Java nicht. Der Code läuft im selben Prozess wie das Spiel und mit denselben Rechten wie ihr.

### Der Fehler: eine Grenze aus der falschen Quelle

Die Anweisung `SHZ` („shift zone“) verschiebt alle Punkte einer Zone um denselben Betrag. Dafür muss FreeType wissen, wie viele Punkte es sind. In FreeType 2.14.3 stand an dieser Stelle:

```c
else if ( exc->GS.gep2 == 1 && exc->zp2.n_contours > 0 )
  limit = exc->zp2.contours[exc->zp2.n_contours - 1] + 1;
```

Die Obergrenze kommt hier aus den Konturdaten, also aus Angaben, die zur Schrift gehören. Ob der reservierte Speicher für so viele Punkte reicht, prüft der Code nicht. Der PoC nutzt ein zusammengesetztes Zeichen, dessen Bestandteil mehr Punkte angibt, als im Rest des Puffers Platz haben. `SHZ` verschiebt daraufhin auch Werte, die hinter dem Puffer liegen.

### Vom Speicherfehler zur Codeausführung

Ein Schreibzugriff an der falschen Stelle startet noch kein Programm. Der PoC braucht dafür vier Schritte:

1. **Speicher vorbereiten.** Das Paket enthält viele Varianten derselben Schrift. Das erhöht die Chance, dass direkt hinter dem Punktpuffer die Arbeitsdaten des Interpreters liegen.
2. **Den Interpreter umlenken.** Die Verschiebung verändert dort Felder des Interpreters, darunter den Verweis auf die Punktdaten. Danach lesen und schreiben die Anweisungen der Schrift im Speicher des Interpreters und nicht mehr in den Punkten.
3. **Adressen herausfinden.** Windows lädt Bibliotheken bei jedem Start an eine andere Adresse (ASLR). Das Schriftprogramm liest deshalb einen Zeiger aus, der gerade im Speicher steht, und rechnet von dort aus weiter.
4. **Vorhandenen Code neu zusammensetzen.** Der PoC schleust keinen eigenen Maschinencode ein. Er reiht kurze Stücke aneinander, die in der Bibliothek schon vorhanden sind, und ruft damit Windows-Funktionen auf. Im PoC starten sie den Taschenrechner und beenden das Spiel.

All das passiert innerhalb der Schriftdatei. Der Server muss nichts über euren Rechner wissen und nichts zurücklesen.

Die Zahlenwerte im PoC passen nur zu genau einer FreeType-Datei. Für eine andere Version müsste ein Angreifer sie neu bestimmen. Der Fehler selbst steckt aber in jeder Version ohne die Korrektur.

### So wurde der Fehler behoben

FreeType 2.15.0 nimmt die Obergrenze nicht mehr aus den Konturdaten:

```c
case 1:
  cur   = exc->pts.cur;
  limit = exc->pts.n_points > 4U ? exc->pts.n_points - 4U : 0;
  break;
```

Die Grenze ergibt sich jetzt aus der Zahl der Punkte, die die Zone tatsächlich hat, abzüglich der vier Hilfspunkte am Ende. Hat die Zone zu wenige Punkte, ist die Grenze null, und es wird nichts verschoben. Die Schrift kann den Wert damit nicht mehr vorgeben.

Mojang hat für 26.3 und am 25. November auch für 26.1 und 26.2 die Bibliothek gegen einen Build mit FreeType 2.15.0 getauscht. Die Versionsnummer des Spiels ist dabei jeweils gleich geblieben. Ihr erkennt das Update deshalb nur an der Bibliothek, wie im Teil für Spielerinnen und Spieler beschrieben.

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
- Mojang hat die Schriftbibliothek in 26.3 am 24. November ersetzt, in 26.1 und 26.2 am 25. November. Eine öffentliche Aussage fehlt.
- Startet Spiel und Launcher neu und prüft den Ordner der Bibliothek (`3.4.3-mojang-2.15.0` bzw. `3.4.1-mojang-2.15.0.3`).
- Behandelt die Versionen 1.20.5 bis 1.21.11 als betroffen, bis das Gegenteil feststeht.
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
