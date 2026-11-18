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
Am **17. November 2026** hat OpenJDK ein [Sicherheits-Advisory](https://openjdk.org/groups/vulnerability/advisories/2026-11-17) veröffentlicht. Jeder Minecraft-Java-Server läuft auf Java, also betrifft es auch eure Server. Hier steht, was ihr tun müsst: als Kunde eines Hosters und als Admin eines eigenen Root-Servers oder einer VM.

> **Stand 18. November 2026: Noch nicht jeder Hersteller hat Patches.** Oracle, Amazon Corretto und Azul Zulu haben gepatchte Builds veröffentlicht. Eclipse Temurin noch nicht, und darauf bauen die meisten Minecraft-Hoster und Docker-Images auf. Auch Red Hat, Microsoft und die Linux-Distributionen liefern nach eigenem Zeitplan. Findet ihr also noch kein Update, liegt das wahrscheinlich nicht an euch. Prüft in den nächsten Tagen erneut und nutzt bis dahin die Übergangslösung weiter unten.

## Was passiert ist

Das Advisory schließt zehn Lücken im OpenJDK und eine in OpenJFX. Alle sind übers Netzwerk erreichbar, ohne Login und ohne dass jemand etwas anklicken muss. Die schwerste ist **[CVE-2026-114938](https://www.cve.org/CVERecord?id=CVE-2026-114938)** im HotSpot-Compiler mit einem CVSS-Wert von **8.1**. Sie betrifft Java 17, 21, 25 und 27. Die Entdecker von Calif nennen sie „Java4Shell“: Ein präparierter Base64-Text lässt den Base64-Decoder von Java Speicher an der falschen Stelle beschreiben. Nach eigenen Angaben konnte Calif so bei Keycloak, Jira und Jenkins fremden Code ausführen, ohne sich anzumelden. Bisher ist kein Angriff in freier Wildbahn bekannt.

Diese eine Lücke steckt in einem Codepfad für die AVX-512-Befehle neuerer Prozessoren. Laut Calif betrifft sie Intel Xeon ab Ice Lake (Sapphire, Emerald und Granite Rapids) sowie AMD EPYC und Ryzen ab Zen 4. Das sind genau die CPUs, die in vielen aktuellen Root-Servern stecken. ARM-Server sind von ihr nicht betroffen. Die übrigen neun Lücken hängen nicht von der CPU ab. Aktualisieren müssen deshalb alle.

Betroffen sind laut Advisory **Java 25.0.5, 21.0.13, 17.0.21, 11.0.33, 8u512 und alle älteren Versionen**. Java 8 und 11 sind von der schwersten Lücke nicht betroffen, von mehreren anderen aber schon.

Ob sich eine der Lücken konkret über das Minecraft-Protokoll ausnutzen lässt, weiß im Moment niemand. Ein Minecraft-Server verarbeitet aber den ganzen Tag Daten von außen: Pakete von Spielern, Skins, Plugin-Nachrichten, Webpanels, Datenbankverbindungen. Darum gilt: **aktualisieren, nicht abwarten.**

### Alle Lücken im Überblick

| CVE | Bereich | CVSS | Betroffene Java-Linien |
|---|---|---|---|
| [CVE-2026-114938](https://www.cve.org/CVERecord?id=CVE-2026-114938) | HotSpot-Compiler („Java4Shell“) | 8.1 | 17, 21, 25, 27 |
| [CVE-2026-114939](https://www.cve.org/CVERecord?id=CVE-2026-114939) | Kerberos (`org.ietf.jgss`) | 7.4 | 8, 11, 17, 21, 25, 27 |
| [CVE-2026-114940](https://www.cve.org/CVERecord?id=CVE-2026-114940) | TLS (`javax.net.ssl`) | 7.4 | 8, 11, 17, 21, 25, 27 |
| [CVE-2026-114941](https://www.cve.org/CVERecord?id=CVE-2026-114941) | HotSpot-Compiler | 7.0 | 21, 25, 27 |
| [CVE-2026-114942](https://www.cve.org/CVERecord?id=CVE-2026-114942) | Core-Bibliotheken | 7.0 | 17, 21, 25, 27 |
| [CVE-2026-114943](https://www.cve.org/CVERecord?id=CVE-2026-114943) | HotSpot-Laufzeit | 6.5 | 8, 11, 17, 21, 25, 27 |
| [CVE-2026-114944](https://www.cve.org/CVERecord?id=CVE-2026-114944) | Management (`java.lang.management`) | 5.9 | 8, 11, 17, 21, 25, 27 |
| [CVE-2026-114945](https://www.cve.org/CVERecord?id=CVE-2026-114945) | Core-Bibliotheken (`java.lang`) | 5.3 | 17, 21, 25, 27 |
| [CVE-2026-114946](https://www.cve.org/CVERecord?id=CVE-2026-114946) | HotSpot-Compiler | 4.8 | 8, 11, 17, 21, 25, 27 |
| [CVE-2026-114947](https://www.cve.org/CVERecord?id=CVE-2026-114947) | TLS (`javax.net.ssl`) | 3.7 | 25, 27 |
| [CVE-2026-86144](https://www.cve.org/CVERecord?id=CVE-2026-86144) | JavaFX WebView | 7.5 | JavaFX 21, 25, 27 |

JavaFX spielt für Minecraft-Server keine Rolle.

## Wer nichts tun muss

- **Minecraft Realms**: Die Server betreibt Mojang selbst und aktualisiert sie auch selbst.
- **Bedrock Edition** (Konsole, Handy, Windows-App, Bedrock Dedicated Server): Sie ist nicht in Java geschrieben.
- **Der offizielle Launcher** bringt für das Spiel seine eigene Java-Laufzeit mit, die Mojang aktualisiert. Wer Prism, MultiMC oder einen anderen Launcher mit eigener Java-Installation nutzt, sollte dort ebenfalls aktualisieren.

Alle anderen, die einen Java-Server betreiben oder mieten, sind gefragt.

## Welche Java-Version braucht mein Server?

| Minecraft-Version | Java-Version | Gibt es einen Fix? |
|---|---|---|
| 26.1 und neuer | Java 25 | Ja |
| 1.20.5 bis 1.21.11 | Java 21 | Ja |
| 1.18 bis 1.20.4 | Java 17 | Ja |
| 1.17.x | Java 16 | **Nein**, Java 16 bekommt keine Updates mehr. Stellt auf Java 17 um, 1.17 läuft damit. |
| bis 1.16.5 | Java 8 (oft auch 11) | Ja |

Proxys wie Velocity oder BungeeCord laufen auch auf Java und brauchen genauso das Update.

## Welche Version ist sicher?

Gesucht ist ein Build, der **nach dem 17. November 2026** erschienen ist und **neuer** ist als die oben genannten Versionen. Die Nummern unterscheiden sich je nach Hersteller. Stand 18. November:

| Hersteller | Gepatchte Builds |
|---|---|
| Oracle | 17.0.21.1, 21.0.13.1, 25.0.5.1 |
| Amazon Corretto | 17.0.21.1.2, 21.0.13.1.2, 25.0.5.1.2 |
| Azul Zulu | 17.0.21.1, 21.0.13.1, 25.0.5.1 |
| Eclipse Temurin | noch keiner |
| Red Hat, Microsoft, Linux-Distributionen | noch offen, eigener Zeitplan |

Von Temurin, auf dem die meisten Minecraft-Hoster und Docker-Images aufbauen, gab es noch keinen neuen Build. Adoptium arbeitet daran und peilt „so schnell wie möglich“ an. Prüft also beim Aktualisieren, ob der Build wirklich neu ist, und nicht nur, ob der Paketmanager „fertig“ meldet.

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

Gibt es für euer Java noch keinen Patch, könnt ihr zumindest Java4Shell entschärfen. Prüft zuerst, ob eure CPU den betroffenen Befehlssatz hat:

```bash
grep -om1 -E 'avx512_?vbmi' /proc/cpuinfo
```

Gibt der Befehl nichts aus, ist euer Server für Java4Shell nicht anfällig. Für die übrigen Lücken braucht ihr das Update trotzdem.

Erscheint `avx512vbmi` oder `avx512_vbmi`, schaltet eines dieser beiden JVM-Flags den betroffenen Codepfad ab:

```bash
# Schaltet nur die Base64-Optimierung ab (engere Variante)
java -XX:-UseBASE64Intrinsics -jar server.jar

# Begrenzt Java auf AVX2; wirkt breiter und kann mehr Leistung kosten
java -XX:UseAVX=2 -jar server.jar
```

Ob das Flag im laufenden Server greift, zeigt `jcmd <PID> VM.flags -all | grep -E 'UseBASE64Intrinsics|UseAVX'`. Setzt `UseAVX` nur auf x86-Servern: Eine ARM-JVM kennt das Flag nicht und startet dann gar nicht.

Beides sind **keine offiziellen Empfehlungen** von OpenJDK, sondern Übergangslösungen aus den Analysen von Sicherheitsforschern. Sie helfen nur gegen CVE-2026-114938, nicht gegen die übrigen neun Lücken. Sobald ein gepatchter Build läuft, entfernt ihr das Flag wieder.

## Kurz zusammengefasst

- Realms und Bedrock: nichts zu tun.
- Gemieteter Server: Java-Version im Startlog prüfen, beim Hoster nachfragen, nach dem Update neu starten.
- Eigener Server: alle Java-Installationen finden, über SDKMAN, Paketmanager oder neues Archiv aktualisieren, neu starten, Version prüfen.
- Java 16 auf Java 17 umstellen, ältere Linien ohne Support ebenso.

Habt ihr Fragen oder hängt ihr irgendwo fest, meldet euch bei uns auf [Discord](https://1lf.link/discord).

## Quellen und weiterlesen

Offiziell:

- [OpenJDK Vulnerability Advisory vom 17. November 2026](https://openjdk.org/groups/vulnerability/advisories/2026-11-17) mit allen CVE-Nummern
- [CISA: Critical Java Vulnerability Requires Immediate Patching](https://www.cisa.gov/news-events/alerts/2026/11/17/critical-java-vulnerability-requires-immediate-patching) (englisch)

Auf Deutsch:

- [heise online: Java: RCE mit AAAA…=](https://www.heise.de/news/Java-RCE-mit-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA-11528561.html)
- [Borns IT- und Windows-Blog: Kritische Schwachstelle Java4Shell (CVE-2026-114938)](https://borncity.com/blog/2026/11/17/kritische-schwachstelle-java4shell-cve-2026-114938/)

Auf Englisch:

- [heise online: Java4Shell: Dangerous Java vulnerability](https://www.heise.de/en/news/Java4Shell-Dangerous-Java-vulnerability-11528504.html)
- [The Hacker News: Java4Shell Flaw Enables Pre-Auth RCE in Jira, Jenkins, Keycloak and More](https://thehackernews.com/2026/11/java4shell-cve-2026-114938-enables-pre.html)
- [Datadog Security Labs: Java4Shell, Remote Code Execution in OpenJDK](https://securitylabs.datadoghq.com/articles/java4shell-remote-code-execution-in-openjdk-cve-2026-114938/) mit Details zu CPUs und Übergangslösungen
