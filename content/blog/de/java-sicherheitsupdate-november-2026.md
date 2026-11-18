---
title: 'Java-Sicherheitsupdate November 2026: Was Minecraft-Server jetzt tun müssen'
alternativeTitle: 'Für Kunden von Hostern und für Admins mit Root-Server oder VM, mit und ohne SDKMAN'
description: 'Das OpenJDK-Advisory vom 17. November 2026 schließt zehn Lücken, eine davon mit CVSS 8.1. So aktualisiert ihr Java für euren Minecraft-Server, inklusive Vorlage für ein Ticket an euren Hoster.'
pubDate: '2026-11-18'
releaseDate: '2026-11-18T12:00:00+01:00'
headerImage: 'images/blog/java-security-update-november-2026.webp'
headerImageAlt: 'Terminal auf einem Linux-Server: java -version meldet Temurin 21.0.13, und die SDKMAN-Liste zeigt noch keinen neueren Build'
slug: 'java-sicherheitsupdate-november-2026'
translationKey: 'java-security-update-november-2026'
tags:
  - minecraft
  - infrastructure
  - hardening
  - security
author: themeinerlp
canonical: 'https://onelitefeather.net/de/blog/java-sicherheitsupdate-november-2026'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/java-sicherheitsupdate-november-2026'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/java-security-update-november-2026'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/java-security-update-november-2026'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'Java-Sicherheitsupdate November 2026: Was Minecraft-Server jetzt tun müssen'
    alternativeHeadline: 'Für Kunden von Hostern und für Admins mit Root-Server oder VM, mit und ohne SDKMAN'
    description: 'Das OpenJDK-Advisory vom 17. November 2026 schließt zehn Lücken, eine davon mit CVSS 8.1. So aktualisiert ihr Java für euren Minecraft-Server, inklusive Vorlage für ein Ticket an euren Hoster.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-11-18T12:00:00+01:00'
---
Am **17. November 2026** hat OpenJDK außerhalb des üblichen Quartalsrhythmus ein [Sicherheits-Advisory](https://openjdk.org/groups/vulnerability/advisories/2026-11-17) veröffentlicht. Jeder Minecraft-Java-Server läuft auf Java, also betrifft es auch eure Server. Hier steht, was ihr tun müsst: als Kunde eines Hosters und als Admin eines eigenen Root-Servers oder einer VM.

> **Stand 18. November 2026: Noch nicht jeder Hersteller hat Patches.** Oracle hat gepatchte Builds veröffentlicht, Eclipse Temurin zum Beispiel noch nicht. Auf Temurin bauen die meisten Minecraft-Hoster und Docker-Images auf. Auch Corretto, Zulu, Microsoft, Red Hat und die Linux-Distributionen liefern nach eigenem Zeitplan. Findet ihr also noch kein Update, liegt das wahrscheinlich nicht an euch. Prüft in den nächsten Tagen erneut und nutzt bis dahin die Übergangslösung weiter unten.

## Was passiert ist

Das Advisory schließt zehn Lücken im OpenJDK und eine in OpenJFX. Alle sind übers Netzwerk erreichbar, ohne Login und ohne dass jemand etwas anklicken muss. Die schwerste ist **CVE-2026-114938** im HotSpot-Compiler mit einem CVSS-Wert von **8.1**. Sie betrifft Java 17, 21, 25 und 27. Sicherheitsforscher nennen sie „Java4Shell“ und beschreiben einen Speicherfehler beim Dekodieren von Base64, der bis zur Ausführung von fremdem Code führen soll. Die technischen Details sind noch nicht veröffentlicht, und bisher ist kein Angriff bekannt.

Betroffen sind laut Advisory **Java 25.0.5, 21.0.13, 17.0.21, 11.0.33, 8u512 und alle älteren Versionen**. Java 8 und 11 sind von der schwersten Lücke nicht betroffen, von mehreren anderen aber schon.

Ob sich eine Lücke konkret über das Minecraft-Protokoll ausnutzen lässt, weiß im Moment niemand. Ein Minecraft-Server verarbeitet aber den ganzen Tag Daten von außen: Pakete von Spielern, Skins, Plugin-Nachrichten, Webpanels, Datenbankverbindungen. Darum gilt: **aktualisieren, nicht abwarten.**

## Wer nichts tun muss

- **Minecraft Realms**: Die Server betreibt Mojang selbst und aktualisiert sie auch selbst.
- **Bedrock Edition** (Konsole, Handy, Windows-App, Bedrock Dedicated Server): Sie ist nicht in Java geschrieben.
- **Der offizielle Launcher** bringt für das Spiel seine eigene Java-Laufzeit mit, die Mojang aktualisiert. Wer Prism, MultiMC oder einen anderen Launcher mit eigener Java-Installation nutzt, sollte dort ebenfalls aktualisieren.

Alle anderen, die einen Java-Server betreiben oder mieten, sind gefragt.

## Welche Java-Version braucht mein Server?

- **Minecraft 26.1 und neuer:** Java 25. Ein Fix ist verfügbar oder angekündigt.
- **Minecraft 1.20.5 bis 1.21.11:** Java 21. Ein Fix ist verfügbar oder angekündigt.
- **Minecraft 1.18 bis 1.20.4:** Java 17. Ein Fix ist verfügbar oder angekündigt.
- **Minecraft 1.17.x:** Java 16. **Kein Fix**, Java 16 bekommt keine Updates mehr. Stellt auf Java 17 um, 1.17 läuft damit.
- **Minecraft bis 1.16.5:** Java 8 (oft auch 11). Ein Fix ist verfügbar oder angekündigt.

Proxys wie Velocity oder BungeeCord laufen auch auf Java und brauchen genauso das Update.

## Welche Version ist sicher?

Gesucht ist ein Build, der **nach dem 17. November 2026** erschienen ist und **neuer** ist als die oben genannten Versionen. Oracle nummeriert seine Fixes zum Beispiel als 21.0.13.1 und 25.0.5.1. Distributionen wie Eclipse Temurin, Amazon Corretto, Azul Zulu, Microsoft oder Red Hat veröffentlichen eigene Builds mit eigenen Nummern und eigenem Zeitplan.

Am 18. November gab es von Temurin, auf dem die meisten Minecraft-Hoster und Docker-Images aufbauen, noch keinen neuen Build. Adoptium arbeitet daran und peilt „so schnell wie möglich“ an. Prüft also beim Aktualisieren, ob der Build wirklich neu ist, und nicht nur, ob der Paketmanager „fertig“ meldet.

Eure aktuelle Version zeigt:

```bash
java -version
```

Wichtig: Ein laufender Server benutzt weiter das Java, mit dem er gestartet wurde. **Ohne Neustart bringt das Update nichts.**

## Ihr seid Kunde bei einem Hoster

Bei den meisten Minecraft-Hostern wählt ihr im Panel nur ein „Java-Image“ oder eine „Java-Version“ aus. Die Java-Installation darin pflegt der Hoster. Ihr könnt also vor allem drei Dinge tun:

1. **Nachsehen, welche Java-Version läuft.** Die meisten Server schreiben sie beim Start in die Konsole. Paper zum Beispiel meldet die Java-Version in den ersten Zeilen.
2. **Den Hoster fragen**, ob und wann die Images aktualisiert werden. Eine Vorlage dafür steht unten.
3. **Nach dem Update neu starten**, damit der Server das neue Java auch benutzt. Manche Panels ziehen ein neues Image erst beim nächsten Start oder erst nach „Neu installieren“. Fragt nach, was bei eurem Hoster nötig ist.

Läuft euer Server noch auf Java 16 (Minecraft 1.17), stellt im Panel auf Java 17 um.

### Vorlage für Ticket oder E-Mail

Passt die Teile in eckigen Klammern an und schickt den Text an den Support eures Hosters:

```text
Betreff: Java-Sicherheitsupdate vom 17.11.2026 für meinen Minecraft-Server

Hallo,

am 17. November 2026 hat OpenJDK ein Sicherheits-Advisory mit zehn
Schwachstellen veröffentlicht, darunter CVE-2026-114938 (CVSS 8.1):
https://openjdk.org/groups/vulnerability/advisories/2026-11-17

Betroffen sind Java 25.0.5, 21.0.13, 17.0.21, 11.0.33, 8u512 und ältere
Versionen. Mein Server [Servername / Server-ID] läuft laut Startlog mit
Java [Version aus der Konsole].

Ich habe dazu folgende Fragen:

1. Wann stellt ihr aktualisierte Java-Versionen bzw. Images bereit, die
   diese Lücken schließen?
2. Muss ich danach etwas tun (Neustart, Image neu auswählen, Neuinstallation),
   damit mein Server die neue Version benutzt?
3. Gibt es bis dahin eine Übergangslösung, die ihr empfehlt?

Vielen Dank und viele Grüße
[Name]
```

## Ihr betreibt einen Root-Server oder eine VM

Hier seid ihr selbst verantwortlich. Der Ablauf ist immer derselbe: herausfinden, welches Java läuft, aktualisieren, neu starten, prüfen.

### 1. Jede Java-Installation finden

Auf vielen Servern liegt mehr als ein Java, etwa ein Systempaket, ein entpacktes Archiv unter `/opt` und eines über SDKMAN. Diese Befehle zeigen, welches Java eure laufenden Prozesse wirklich benutzen und was insgesamt installiert ist:

```bash
# Welches Java benutzt jeder laufende Java-Prozess?
for pid in $(pgrep -x java); do
  echo "PID $pid: $(readlink -f /proc/$pid/exe)"
done

# Alle installierten Java-Binaries auf dem System
sudo find / -xdev -type f -path '*/bin/java' 2>/dev/null
```

Ruft jedes gefundene Binary mit `-version` auf, zum Beispiel `/opt/java/bin/java -version`.

### 2a. Mit SDKMAN

[SDKMAN](https://sdkman.io/) installiert Java pro Benutzer unter `~/.sdkman`. Meldet euch als der Benutzer an, unter dem der Minecraft-Server läuft.

```bash
# Kandidatenliste aktualisieren
sdk selfupdate
sdk update

# Neue Builds eurer Linie suchen, z. B. Java 25 von Temurin
sdk list java | grep -E '25\..*tem'

# Den neuen Build installieren und als Standard setzen
# (Identifier aus der Liste übernehmen)
sdk install java <identifier>
sdk default java <identifier>

# Prüfen
java -version
```

Startet euer Server über eine systemd-Unit oder ein Skript, schaut nach, welchen Pfad es benutzt:

- `~/.sdkman/candidates/java/current/bin/java` folgt automatisch dem Standard, den ihr mit `sdk default` setzt.
- Ein fester Pfad wie `~/.sdkman/candidates/java/21.0.13-tem/bin/java` bleibt beim alten Build. Tragt dort den neuen Pfad ein oder stellt auf `current` um.

Den alten Build entfernt ihr erst, wenn der Server mit dem neuen sauber läuft: `sdk uninstall java <alter-identifier>`.

### 2b. Ohne SDKMAN

**Debian und Ubuntu** (Pakete `openjdk-*` oder Temurin aus dem Adoptium-Repository):

```bash
sudo apt update
apt list --upgradable 2>/dev/null | grep -Ei 'jdk|jre|temurin'
sudo apt upgrade
```

**Fedora, RHEL, Rocky, Alma:**

```bash
sudo dnf check-update --refresh | grep -Ei 'jdk|jre|temurin'
sudo dnf upgrade
```

**Arch Linux:**

```bash
sudo pacman -Syu
```

Distributionen liefern Sicherheitsupdates mit ihrer eigenen Paketversion aus, oft einige Tage nach dem Advisory. Erscheint noch kein Update, prüft den Security-Tracker eurer Distribution.

**Manuell entpacktes Java** (zum Beispiel ein Temurin-Archiv unter `/opt`): Ladet den neuen Build herunter, sobald er erscheint, entpackt ihn neben den alten und lasst einen festen Pfad darauf zeigen. Dann ändert sich bei künftigen Updates nur dieser Link:

```bash
sudo tar -xzf OpenJDK25U-jdk_x64_linux_hotspot_<version>.tar.gz -C /opt
sudo ln -sfn /opt/jdk-<version> /opt/java-25
/opt/java-25/bin/java -version
```

Euer Startskript ruft dann immer `/opt/java-25/bin/java` auf.

**Docker und Pterodactyl/Pelican:** Die Java-Images (etwa die „Yolks“ von Pterodactyl) bauen meist auf Temurin auf. Sobald neue Images erscheinen, müsst ihr sie auf jedem Node ziehen und die Container neu erstellen. Ein bloßer Neustart reicht nicht, wenn das Image nicht neu gezogen wurde:

```bash
docker compose pull
docker compose up -d
```

### 3. Neu starten und prüfen

Startet jeden Minecraft-Server und jeden Proxy neu. Danach führt ihr die Schleife aus Schritt 1 noch einmal aus und prüft für jeden Prozess die Version. Erst wenn dort überall der neue Build steht, seid ihr fertig.

### Übergangslösung, solange kein Build da ist

In der Community wird für die schwerste Lücke ein JVM-Flag genannt, das die betroffene Base64-Optimierung abschaltet:

```bash
java -XX:-UseBASE64Intrinsics -jar server.jar
```

Das ist **keine offizielle Empfehlung** von OpenJDK. Das Flag betrifft nur CVE-2026-114938, nicht die übrigen neun Lücken, und kann Base64-Verarbeitung etwas langsamer machen. Testet vorher mit `java -XX:-UseBASE64Intrinsics -version`, ob eure Java-Version das Flag kennt. Sobald ein gepatchter Build läuft, entfernt ihr es wieder.

## Kurz zusammengefasst

- Realms und Bedrock: nichts zu tun.
- Gemieteter Server: Java-Version im Startlog prüfen, beim Hoster nachfragen, nach dem Update neu starten.
- Eigener Server: alle Java-Installationen finden, über SDKMAN, Paketmanager oder neues Archiv aktualisieren, neu starten, Version prüfen.
- Java 16 auf Java 17 umstellen, ältere Linien ohne Support ebenso.

Die Original-Quelle mit allen CVE-Nummern ist das [OpenJDK-Advisory vom 17. November 2026](https://openjdk.org/groups/vulnerability/advisories/2026-11-17). Habt ihr Fragen oder hängt ihr irgendwo fest, meldet euch bei uns auf [Discord](https://1lf.link/discord).
