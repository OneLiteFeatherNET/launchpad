---
title: 'Manipuliertes Minecraft-Plugin: Wie ein versteckter Nachlader in einer bStats-Klasse steckt'
alternativeTitle: 'Was die manipulierte JAR tut, wie ihr euren Server prüft und wie ihr euch schützt'
description: 'Eine manipulierte Plugin-JAR lädt bei jedem Serverstart heimlich ein zweites Plugin nach. So prüft ihr, ob ihr betroffen seid, und so schützt ihr euch.'
pubDate: '2026-11-25'
releaseDate: '2026-11-25T12:00:00+01:00'
slug: 'manipuliertes-minecraft-plugin-versteckter-nachlader'
translationKey: 'trojanised-minecraft-plugin-hidden-loader'
tags:
  - minecraft
  - security
  - malware
  - plugins
author: themeinerlp
canonical: 'https://onelitefeather.net/de/blog/manipuliertes-minecraft-plugin-versteckter-nachlader'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/manipuliertes-minecraft-plugin-versteckter-nachlader'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/trojanised-minecraft-plugin-hidden-loader'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/trojanised-minecraft-plugin-hidden-loader'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'Manipuliertes Minecraft-Plugin: Wie ein versteckter Nachlader in einer bStats-Klasse steckt'
    alternativeHeadline: 'Was die manipulierte JAR tut, wie ihr euren Server prüft und wie ihr euch schützt'
    description: 'Eine weiterverteilte Plugin-JAR enthält eine manipulierte bStats-Klasse, die bei jedem Serverstart heimlich ein zweites Plugin nachlädt. Mit Prüfbefehlen, Indikatoren und Schutzmaßnahmen für Server-Admins und Plugin-Entwickler.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-11-25T12:00:00+01:00'
---
Aus der Community wurde uns eine Plugin-JAR zur Prüfung gemeldet. Sie enthält Schadcode. Dieser Beitrag richtet sich an alle, die einen Minecraft-Server betreiben oder Plugins entwickeln: Er erklärt, was die Datei tut, wie ihr prüft, ob ihr betroffen seid, und wie ihr euch davor schützt.

> **Wichtig vorab:** Untersucht wurde genau **eine** weiterverteilte Datei (SHA-256 siehe unten). Sie ist ein echtes, funktionierendes Plugin, in das nachträglich Schadcode eingebaut wurde. Den Namen des Plugins nennen wir bewusst nicht: Es ist selbst Opfer, und dieselbe Manipulation kann in jedem anderen Plugin stecken. Uns geht es um die Malware dahinter und um Gegenmaßnahmen. Die Analyse war rein statisch: Weder die Datei noch das nachgeladene zweite Plugin wurden je gestartet oder von einer Java-Laufzeit geladen.

## Was passiert ist

Die JAR sieht aus wie das Plugin und verhält sich auch so. Verändert wurde eine einzige Klasse, und zwar nicht im Plugin selbst, sondern in einer mitgelieferten Bibliothek: **bStats**.

[bStats](https://bstats.org/) ist eine verbreitete Open-Source-Bibliothek, mit der Plugins anonyme Nutzungsstatistiken melden. Viele Plugins liefern sie direkt in ihrer eigenen JAR mit. Das nennt man „shaden“: Die Bibliothek wird in die Plugin-Datei kopiert und bekommt dabei einen eigenen Paketnamen. Genau deshalb ist sie ein gutes Versteck. Wer in ein Plugin hineinschaut, liest den Code des Plugins und nicht die Statistik-Bibliothek, die in hunderten anderen Plugins genauso aussieht. bStats selbst ist nicht das Problem, manipuliert wurde nur die Kopie in dieser einen JAR.

In dieser Kopie steckt eine zusätzliche Methode namens `preparePluginBridge()`. Der Konstruktor der Klasse ruft sie auf, also **bei jedem Serverstart**, sobald das Plugin seine Statistiken einrichtet. Sie ist ein **Nachlader** (englisch „Loader“ oder „Dropper“): Der eigentliche Schadcode steckt nicht in der JAR, sondern wird erst zur Laufzeit von einem Server des Angreifers geholt. Wir nennen die JAR deshalb Stufe 1 und das nachgeladene Plugin Stufe 2.

Für euch heißt das: Was auf einem betroffenen Server tatsächlich passiert ist, bestimmt allein der Server des Angreifers. Er kann heute etwas anderes ausliefern als gestern, und jedem Server etwas anderes. Was er am 25. November 2026 ausgeliefert hat, steht im Abschnitt „Stufe 2“: eine vollständige Fernsteuerung für den Server.

## So funktioniert der Trick

```text
Serverstart
   │
   ▼
Plugin richtet bStats ein ──► versteckte Methode läuft mit
   │
   ▼
Konsolen-Ausgabe des Plugins stummschalten
   │
   ▼
Stufe 2 schon geladen? ── ja ──► nichts tun
   │ nein
   ▼
Verschlüsseltes Plugin vom Server des Angreifers holen
   │                         (schlägt das fehl: aus dem Versteck in ./logs lesen)
   ▼
Kopie in ./logs ablegen, getarnt als rotierte Logdatei
   │
   ▼
Entschlüsseln ──► als Temp-Datei ablegen ──► über den PluginManager laden
   │
   ▼
Temp-Datei löschen, Konsolen-Ausgabe wieder einschalten
```

### 1. Die Methode versteckt sich vor Dekompilierern

Ein Dekompilierer macht aus einer kompilierten `.class`-Datei wieder lesbaren Java-Code. Die meisten blenden dabei Methoden aus, die der Java-Compiler automatisch erzeugt hat. Solche Methoden tragen die Markierungen `synthetic` und `bridge`. Die Schadmethode trägt genau diese beiden Markierungen und dazu eine gefälschte generische Signatur. Wer die Klasse im Dekompilierer öffnet, sieht deshalb eine gewöhnliche bStats-Klasse.

Verräterisch ist die Größe: Die Klasse ist **76 KB** groß, das Original rund **10 KB**.

Im Konstruktor bleibt eine unscheinbare Zeile übrig:

```java
this.metricsBase = new MetricsBase("bukkit", serverUUID, serviceId, /* ... */);
this.pluginBridge = this.preparePluginBridge();   // gehört nicht zu bStats
```

### 2. Der Code ist verschleiert

Selbst wer die Methode findet, liest zunächst nichts Verständliches:

- Jede Zahl ist als Rechenkette geschrieben (4 868 Ausdrücke, die sich zu einfachen Zahlen ausrechnen lassen).
- Jeder Text ist als Byte-Folge abgelegt und mit XOR verschlüsselt. XOR ist hier eine sehr einfache Verschlüsselung mit einem einzigen Byte als Schlüssel. Eine Textsuche nach der Domain in der JAR findet deshalb nichts.
- Alle Aufrufe laufen über Reflection. Das ist die Java-Technik, Klassen und Methoden zur Laufzeit über ihren Namen als Text anzusprechen. So taucht kein verdächtiger Methodenaufruf direkt im Code auf.

### 3. Schutz und Konsole werden ausgeschaltet

Zuerst versucht die Methode, den SecurityManager von Java zu entfernen, indem sie das interne Feld `System.security` auf `null` setzt. Danach schaltet sie die Konsolen-Ausgabe des Plugin-Loggers ab (`setUseParentHandlers(false)`). Der Grund: Bukkit schreibt beim Laden eines Plugins eine Zeile in die Konsole, und die würde das fremde Plugin verraten. Nach dem Laden stellt die Methode den alten Wert wieder her.

Eine Prüfung auf ein Ablaufdatum ist ebenfalls eingebaut. Der Wert dafür ist leer, die Probe ist also unbefristet aktiv.

### 4. Download nur, wenn Stufe 2 noch fehlt

Die Methode prüft, ob die Klasse `net.s0lar.SolarLoader` schon vorhanden ist. Nur wenn sie fehlt, wird nachgeladen: ein HTTP-Abruf an `hxxps://s0lar[.]net/routes/0/d.php` mit einem fest eingebauten Kennwert im Header `a`. Die Antwort ist Base64-Text.

### 5. Das Versteck: eine Logdatei mit unsichtbarem Zeichen

Die Antwort wird im Ordner `./logs` gespeichert. Die Methode sucht dort die neueste `*.log.gz`, zählt deren laufende Nummer um eins hoch und legt die Datei als `<Datum>-<n+1>.log.gz` ab, **mit einem angehängten Zero-Width-Space**. Das ist das Unicode-Zeichen U+200B, ein Leerzeichen ohne Breite. Im Dateimanager und in einem normalen `ls` sieht die Datei aus wie ein gewöhnliches rotiertes Log.

Dieses Versteck sorgt dafür, dass der Schadcode auch ohne Netz überlebt: Schlägt der Download bei einem späteren Start fehl, wird Stufe 2 aus dieser Datei geladen. Ältere Verstecke räumt die Methode selbst weg. Sie erkennt sie an der Endung U+200B oder U+0001.

### 6. Entschlüsseln, laden, Spuren beseitigen

Der Base64-Text wird dekodiert und mit AES-256 entschlüsselt. Der Schlüssel ist in der JAR fest eingebaut. Das Ergebnis ist eine zweite Plugin-JAR. Sie landet kurz im Temp-Verzeichnis unter einem Namen, der mit einem 13-stelligen Zeitstempel beginnt, wird über den ganz normalen PluginManager von Bukkit geladen und sofort wieder gelöscht.

Entschleiert sieht das Laden so aus (gekürzt, Variablen zur Lesbarkeit umbenannt, `STR(...)` steht für einen entschlüsselten Text):

```java
plugin = pluginManager.getClass().getMethod(STR("loadPlugin"), file.getClass())
        .invoke(pluginManager, file);
plugin.getClass().getMethod(STR("onLoad")).invoke(plugin);

Class<?> entry = plugin.getClass().getClassLoader().loadClass(STR("p.AsyncTimings"));
entry.getDeclaredMethod(STR("o"), String.class, String.class, String.class)
        .invoke(null, token, pluginName, domain);   // Kennwert, Name des Wirts-Plugins, Domain des Angreifers

pluginManager.getClass().getMethod(STR("enablePlugin"), pluginClass)
        .invoke(pluginManager, plugin);
```

Der gesamte Ablauf steckt in `catch (Throwable)`-Blöcken ohne Ausgabe. Geht etwas schief, erfahrt ihr davon nichts.

## Stufe 2: eine Fernsteuerung namens „Solar“

Für die Analyse wurde das nachgeladene Plugin am 25. November 2026 **einmal** so abgerufen, wie es der Nachlader tut, offline entschlüsselt und statisch entschleiert. Auch diese Datei wurde nie gestartet. Macht das bitte nicht nach: Der Server des Angreifers sieht bei jedem Abruf eure IP-Adresse.

Das Ergebnis ist eine Momentaufnahme. Der Angreifer kann jederzeit etwas anderes ausliefern.

### Was Stufe 2 ist

Stufe 2 ist eine vollständige Fernsteuerung für Minecraft-Server, die sich selbst „Solar“ nennt. Sie tarnt sich als Plugin **„DataFixerUpper“** im Paket `com.mojang.datafixers.util.impl`. So heißt auch eine echte Bibliothek von Mojang, der Name fällt in einer Klassenliste also nicht auf.

Gesteuert wird sie auf zwei Wegen. Spielerkonten, die der Angreifer freigeschaltet hat, setzen Befehle im Chat ab. Die Nachricht wird abgefangen und erscheint nicht im Chat. Zusätzlich verteilt der Server des Angreifers Befehlsstapel, für die niemand online sein muss.

### Die schwersten Funktionen

Stufe 2 bringt 51 Befehle mit. Die vier folgenden Punkte sind im entschleierten Code nachvollzogen:

- **Betriebssystem-Befehle ausführen.** Der Angreifer kann beliebige Befehle auf dem Host starten und bekommt die Ausgabe zurück. Damit endet der Schaden nicht bei Minecraft: Alles, was der Benutzer des Serverprozesses darf, darf auch der Angreifer.
- **Weiteren Code nachladen.** Stufe 2 kann Plugins und einzelne Java-Klassen von einer URL laden und ausführen, sich selbst aktualisieren und die Adresse ihres Steuerservers wechseln.
- **Andere JARs infizieren.** Stufe 2 baut den Nachlader aus Stufe 1 in andere Plugin-JARs und in die Server-JAR ein, auf Befehl des Angreifers; dabei durchsucht sie den Ordner `./plugins`. Ob sie das auch von sich aus tut, ist nicht belegt. Signaturdateien, an denen die Änderung auffallen würde, entfernt sie dabei. Das ist Wurm-Verhalten: Ein einziges befallenes Plugin kann so den ganzen Plugin-Ordner verseuchen.
- **Angriffe auf Dritte.** Der Server lässt sich als Werkzeug für DoS-Angriffe einsetzen, also um fremde Ziele mit Datenpaketen oder Verbindungen zu überfluten. Die Folgen landen bei euch und eurem Hoster.

Dazu kommen Datei-Zugriffe (herunterladen, ersetzen, löschen), Konsolenbefehle mit Serverrechten, das Vergeben von Operator-Rechten, das Umschalten von Online-Modus und Whitelist, das Umleiten von Spielern auf fremde Server und ein Filter, der Konsolenausgaben unterdrückt. Auf Befehl lädt Stufe 2 außerdem die Datei `logs/latest.log` zum Server des Angreifers hoch.

**Was ohne jeden Befehl passiert:** Schon beim Aktivieren trägt sich Stufe 2 aus der Plugin-Verwaltung des Servers aus. Sie entfernt sich aus der internen Plugin-Liste und aus dem Namensverzeichnis von Bukkit, `/plugins` zeigt sie danach nicht mehr an. Anschließend meldet sie den Server beim Angreifer an und schickt einen Steckbrief mit: MOTD, Welt-Seed, Namen der Welten, Betriebssystem, Rechnername, Server-Icon, maximale Spielerzahl und die Server-Kennungen aus den Konfigurationen von bStats und LiteBans. Danach fragt sie alle zwei Minuten nach neuen Anweisungen.

**Code vorhanden, Ablauf nicht belegt:** Stufe 2 enthält Code, der das Bot-Token von DiscordSRV, das Forwarding-Secret von Velocity (aus `config/paper-global.yml`) und, auf Windows-Hosts, Discord-Konten-Tokens aus Discord- und Browser-Profilen ausliest. Klassen und Texte sind eindeutig. Nicht belegt ist, wann dieser Code läuft und wohin die Daten gehen: Im entschleierten Code ist kein Aufrufer sichtbar, und der Steckbrief bei der Anmeldung enthält diese Daten nicht. Geht trotzdem vom schlechteren Fall aus und ändert beide Geheimnisse.

Die vollständige Befehlsliste, geordnet nach Schwere, folgt in einem eigenen Beitrag.

### Ein drittes Modul, das nur ausgewählte Server bekommen

Stufe 2 ist selbst wieder ein Nachlader: Sie kann ein weiteres Modul namens **„Door“** holen. Der Server des Angreifers liefert es aber nicht an jeden befallenen Server aus. Er schaltet Server einzeln frei, und nur ein freigeschalteter Server bekommt „Door“. Ein für die Analyse angelegter Testeintrag wurde nicht freigeschaltet. An dieser Stelle haben wir abgebrochen und die Freigabe nicht umgangen. Was „Door“ tut, wissen wir deshalb nicht.

Dabei ließ sich das Protokoll zwischen Stufe 2 und dem Server des Angreifers nachvollziehen. Zwei Punkte sind für euch wichtig:

- **Der Verkehr ist als Fehlerseite getarnt.** Jede Antwort des Servers sieht aus wie eine gewöhnliche Seite „404 Not Found“. Die eigentlichen Daten stecken verschlüsselt in einem HTML-Kommentar, der mit `<!-- B: ` beginnt. Dieses Muster hängt nicht an der Domain und eignet sich deshalb als Suchmuster für Proxy- und Firewall-Logs.
- **Infizierte JARs gehen an den Angreifer.** Baut Stufe 2 den Nachlader in eine Plugin-JAR ein, lädt sie diese JAR zusätzlich zum Server des Angreifers hoch. Eigene, nicht öffentliche Plugins, die im Plugin-Ordner eines befallenen Servers lagen, gelten damit als abgeflossen.

Die Antwort des Servers enthält außerdem eine Liste von Spielernamen, die die Fernsteuerung im Chat bedienen dürfen. Die Namen stehen dort nur als Hash. Die Konten, die sich daraus zurückrechnen ließen, melden wir an Mojang und veröffentlichen sie nicht: Ein Name auf der Liste belegt nicht, wer das Konto heute benutzt.

### Woher die manipulierte JAR vermutlich stammt

Die versteckte Methode aus Stufe 1 trägt eine gefälschte generische Signatur. Genau diese Signatur ist eine von fünf, die der Injektor der Stufe 2 für eingebaute Methoden verwendet. Das spricht dafür, dass die untersuchte JAR von dieser Malware selbst infiziert wurde, etwa auf einem bereits befallenen Server, und nicht von Hand.

Für euch ist das die wichtigste Erkenntnis: Die Datei, um die es hier geht, ist wahrscheinlich nicht die einzige ihrer Art. Jedes Plugin, das einmal auf einem befallenen Server lag und von dort weitergegeben wurde, kann den Nachlader tragen.

## Bin ich betroffen?

Die Befehle unten sind für Linux und gehen davon aus, dass ihr im Server-Ordner steht, also dort, wo `plugins/` und `logs/` liegen. Keiner davon startet oder lädt eine JAR.

**Ein unauffälliges Ergebnis ist kein Freispruch.** Die Prüfungen erkennen genau diese Probe. Eine anders umgepackte Datei hat einen anderen Hash und kann andere Namen verwenden.

### 1. Hash der Plugin-Dateien vergleichen

Ein Hash ist ein Fingerabdruck einer Datei. Gleicher Hash heißt: dieselbe Datei, egal wie sie heißt.

```bash
sha256sum plugins/*.jar | grep -i 5d147a987780de9e5f39167f71638397075ceb0c6dd69471bb6400dbcdb0d857
```

Unter Windows (PowerShell):

```powershell
Get-ChildItem plugins\*.jar | Get-FileHash -Algorithm SHA256 |
  Where-Object Hash -eq '5d147a987780de9e5f39167f71638397075ceb0c6dd69471bb6400dbcdb0d857'
```

Gibt es eine Ausgabe, liegt genau die untersuchte Datei auf eurem Server.

### 2. Alle JARs nach den Spuren des Injektors durchsuchen

Der Name der Methode aus Stufe 1 und die fünf gefälschten Signaturen des Injektors stehen unverschlüsselt in den Klassen. Diese Schleife schaut in jede JAR, ohne sie auszuführen. Prüft damit auch eure Server-JAR, nicht nur den Plugin-Ordner:

```bash
for jar in plugins/*.jar *.jar; do
  if unzip -p "$jar" '*.class' 2>/dev/null | grep -a -q -F \
      -e 'preparePluginBridge' \
      -e '<Hp6:Ljava/lang/Iterable;>' -e '<Kx3:Ljava/io/Serializable;>' \
      -e '<Bm9:Ljava/lang/Comparable;>' -e '<Rq7:Ljava/lang/Runnable;>' \
      -e '<Nv2:Ljava/io/Closeable;>'; then
    echo "VERDACHT: $jar"
  fi
done
```

Zusätzlich lohnt ein Blick auf die Größe aller eingebetteten bStats-Klassen. Der Vergleichswert aus der Analyse: Original rund 10 KB, manipuliert 76 KB.

```bash
for jar in plugins/*.jar; do
  unzip -lv "$jar" 2>/dev/null |
    awk -v j="$jar" '/bstats.*\/Metrics\.class$/ && $1 > 30000 {print j": "$NF" ("$1" Bytes)"}'
done
```

### 3. Den Log-Ordner auf getarnte Dateien prüfen

Sucht nach Dateinamen, die andere Zeichen als druckbares ASCII enthalten. Das `LC_ALL=C` davor ist wichtig: Ohne diese Angabe meldet `find` auf den meisten Systemen jede Datei.

```bash
LC_ALL=C find logs -name '*[! -~]*'
LC_ALL=C ls -b logs
```

`ls -b` zeigt das unsichtbare Zeichen als `\342\200\213` am Ende des Namens an.

Eine zweite Probe über den Inhalt: Das Versteck enthält Base64-Text und ist deshalb kein gültiges gzip-Archiv.

```bash
for f in logs/*.log.gz*; do
  gzip -t "$f" 2>/dev/null || echo "kein gzip: $f"
done
```

Unter Windows (PowerShell):

```powershell
Get-ChildItem logs | Where-Object { $_.Name -match '[^\x20-\x7E]' }
```

Findet ihr eine solche Datei: **nicht löschen, sondern sichern.** Sie enthält die verschlüsselte Stufe 2 und ist der beste Hinweis darauf, was auf eurem Server gelaufen ist.

### 4. Temp-Verzeichnis und Netzwerk

Die entschlüsselte JAR liegt nur kurz im Temp-Verzeichnis. Wird der Server hart beendet, kann sie liegen bleiben:

```bash
find "${TMPDIR:-/tmp}" -maxdepth 1 -regextype posix-extended -regex '.*/[0-9]{13}[^/]*\.jar'
```

Habt ihr DNS- oder Firewall-Logs, sucht dort nach Anfragen an `s0lar[.]net` und Verbindungen zu `198.167.197[.]139`. Schneidet ein Proxy den Verkehr mit, sucht zusätzlich nach Pfaden mit `/routes/0/` und nach 404-Antworten, die `<!-- B: ` enthalten.

### 5. Spuren der Stufe 2

Taucht in `/plugins` ein Plugin namens `DataFixerUpper` auf, ist das ein klarer Treffer. Verlasst euch aber nicht darauf, dass es dort erscheint: Stufe 2 trägt sich beim Aktivieren selbst aus der Plugin-Liste aus und unterdrückt Konsolenausgaben. Eine saubere Liste und eine ruhige Konsole beweisen nichts.

Stufe 2 legt außerdem Dateien mit unauffälligen Namen an. Wo genau, geht aus der Analyse nicht hervor, sucht deshalb im ganzen Server-Ordner:

```bash
find . \( -name particles_store.dat -o -name entity_registry.dat -o -name session_cache.dat \
  -o -name skin_cache.dat -o -name profile_cache.dat -o -name checksums.md5 \)
```

Ein Treffer ist ein Hinweis und kein Beweis, solche Namen kann auch ein harmloses Plugin verwenden.

### Ihr habt nur ein Hoster-Panel

Ohne Shell könnt ihr die Plugin-Dateien und die Server-JAR herunterladen und Schritt 1 und 2 auf dem eigenen Rechner ausführen. Das unsichtbare Zeichen seht ihr im Dateimanager des Panels nicht. Achtet im Ordner `logs` auf eine `.log.gz`, die sich nicht entpacken lässt oder deren Nummer nicht zu den übrigen passt, und bittet im Zweifel den Support eures Hosters, Schritt 3 für euch auszuführen.

## Was tun, wenn ihr betroffen seid

Hat euer Server die Datei geladen, gilt er als **kompromittiert**, und zwar der ganze Host und nicht nur Minecraft. Stufe 2 kann Betriebssystem-Befehle ausführen, und niemand außer dem Angreifer weiß, welche gelaufen sind.

1. **Server stoppen und vom Netz nehmen.** Das Plugin zu löschen reicht nicht.
2. **Spuren sichern**, bevor ihr aufräumt: die verdächtige JAR und die getarnte Datei aus `logs/`. Die JAR benennt ihr am besten um (zum Beispiel in `.jar.quarantine`), damit kein Server sie versehentlich lädt.
3. **Alle JARs im Plugin-Ordner und die Server-JAR als infiziert behandeln**, nicht nur das auslösende Plugin. Stufe 2 baut den Nachlader in andere JARs ein. Bezieht alles neu aus der Originalquelle und vergleicht die Hashes. Kopiert keine JAR von diesem Server auf einen anderen und gebt keine weiter.
4. **Alle Geheimnisse ändern, die der Serverprozess lesen konnte.** Zuerst die beiden, für die Stufe 2 eigenen Code mitbringt: das **Bot-Token von DiscordSRV** und das **Forwarding-Secret von Velocity**. Dann Datenbank-Zugänge, RCON-Passwort, Discord-Webhooks, Panel-Zugänge und SSH-Schlüssel. Lief der Server auf einem Windows-Rechner, auf dem jemand bei Discord angemeldet ist: alle Discord-Sitzungen dieses Benutzers abmelden und Passwörter ändern.
5. **Den Host selbst prüfen:** Cronjobs und Autostart-Einträge, neue Benutzer, fremde SSH-Schlüssel.
6. **Die Server-Einstellungen gegen den Sollzustand prüfen:** `online-mode`, Whitelist, Bannliste, OP-Liste, Permissions und `enable-command-block`. Stufe 2 kann all das umschalten.
7. **Am saubersten: den Host neu aufsetzen** und Welt- sowie Konfigurationsdaten aus einem Backup einspielen.

Seid ihr Kunde bei einem Hoster, meldet den Vorfall dort. Er kann prüfen, ob mehr als euer eigener Server betroffen ist.

## So beugt ihr vor

### Für Server-Admins

- **Plugins nur aus der Originalquelle beziehen** und den Hash mit dem Release vergleichen. Keine „gratis“ weitergereichten Premium-Plugins: Genau so kommt eine solche Datei auf den Server.
- **Ausgehenden Netzwerkverkehr beschränken.** Ein Minecraft-Server muss nur wenige Ziele erreichen: die Session-Server von Mojang, eure Datenbank und Dienste, die ihr bewusst erlaubt. Das stoppt das Nachladen, den Datenabfluss und den Missbrauch für DoS-Angriffe. Sperrt zusätzlich `s0lar[.]net` per DNS oder Firewall, verlasst euch aber nicht allein darauf: Stufe 2 kann ihre Domain zur Laufzeit wechseln.
- **Dem Server wenig Rechte geben.** Eigener Benutzer ohne Sonderrechte, am besten in einem Container, das Dateisystem so weit wie möglich schreibgeschützt, kein Zugriff auf Schlüssel anderer Dienste.
- **Überwachen,** was hier aufgefallen wäre: neue Dateien in `logs/` mit Nicht-ASCII-Namen, `.jar`-Dateien im Temp-Verzeichnis, geladene Plugins, die nicht im Plugin-Ordner liegen.

### Für Plugin-Entwickler und alle, die Plugins prüfen

- **Eingebettete Bibliotheken mit dem Original vergleichen.** Eine bStats-Klasse, die siebenmal so groß ist wie das Original, braucht keine weitere Analyse.
- **`javap` statt nur Dekompilierer.** `javap` gehört zum JDK und zeigt jede Methode an, auch die, die Dekompilierer auslassen:

  ```bash
  javap -p -v -cp Plugin.jar <paket.des.plugins>.bstats.bukkit.Metrics |
    grep -E 'ACC_SYNTHETIC|ACC_BRIDGE'
  ```

  Verdächtig sind Methoden mit `ACC_SYNTHETIC` und `ACC_BRIDGE`, die viel Code enthalten. Echte Bridge-Methoden bestehen aus wenigen Anweisungen. Die fünf gefälschten Signaturen des Injektors stehen in der Indikatoren-Tabelle.
- **Auf fehlende Signaturdateien achten.** Fehlen in einer eigentlich signierten JAR die Dateien `.SF`, `.RSA` oder `.DSA` unter `META-INF`, hat jemand sie verändert. Der Injektor entfernt sie.
- **Auf Muster achten:** lange Hex-Konstanten, Reflection auf `loadPlugin`, Byte-Arrays mit anschließender XOR-Schleife.
- **Eigene Releases mit Hash veröffentlichen,** damit eure Nutzer überhaupt etwas zum Vergleichen haben.

## Indikatoren (IOCs)

„Indicators of Compromise“ sind Merkmale, an denen sich ein Befall erkennen lässt. Domain und URL sind absichtlich entschärft geschrieben (`hxxps`, `[.]`), damit niemand sie versehentlich anklickt.

### Stufe 1

| Typ | Wert |
|---|---|
| SHA-256 der JAR | `5d147a987780de9e5f39167f71638397075ceb0c6dd69471bb6400dbcdb0d857` |
| Dateigröße der JAR | 5 109 544 Bytes, alle Einträge datiert auf 2026-06-28 23:04 |
| Domain | `s0lar[.]net` |
| URL | `hxxps://s0lar[.]net/routes/0/d.php` |
| Klassen der Stufe 2 | `net.s0lar.SolarLoader`, `p.AsyncTimings` (Methode `o(String,String,String)`) |
| Datei | `logs/*.log.gz` mit angehängtem U+200B (ältere Variante: U+0001), Inhalt Base64 |
| Datei | `<java.io.tmpdir>/<13-stellige Zahl>*.jar` |
| Code-Merkmal | Feld `pluginBridge` und Methode `preparePluginBridge` in der bStats-Klasse `Metrics` |

Verschlüsselt ist mit AES-256 im CBC-Modus. Das Schlüsselmaterial und den Kennwert aus dem Header veröffentlichen wir nicht. Hoster, Plattformen und Sicherheitsteams bekommen beides auf Anfrage, um gefundene Versteck-Dateien zu entschlüsseln.

### Stufe 2

| Typ | Wert |
|---|---|
| SHA-256 der entschlüsselten JAR | `11429437397e84d9278757f8bc4832a4f59a1553bc4414310638a8caa6d83c4e` (Stand 2026-11-25, Build vom 2026-11-22) |
| Server | `s0lar[.]net` → `198.167.197[.]139` (nginx/1.24.0, Ubuntu) |
| Pfade am Server | `routes/0/a.php` bis `routes/0/v.php`, `download.php?uuid=` |
| Netzwerk-Muster | Antworten mit Status 404, die einen HTML-Kommentar `<!-- B: ` mit Base64-Inhalt enthalten |
| Anfrage-Header | einbuchstabige Header `a`, `b`, `d` mit Base64-Werten, `User-Agent: Java/…` |
| Plugin-Name | `DataFixerUpper` 1.0-SNAPSHOT, Hauptklasse `com.mojang.datafixers.util.impl.ChunkCarvingFixer` |
| Pakete | `net.s0lar`, `p` (`p.AsyncTimings`), `ab.sixseven.onetwo` (verschleiertes ASM), dazu JNA und JvmDowngrader |
| Plugin-Kanal | `serve:run` (wird beim Aktivieren ein- und ausgehend registriert) |
| Tarn-Dateien | `particles_store.dat`, `session_cache.dat`, `entity_registry.dat`, `skin_cache.dat`, `profile_cache.dat`, `checksums.md5` |
| Eingebaute UUIDs | `e19212b9-53d8-44cd-8eac-41c85f8b0e28`, `d7b77c65-23fe-4159-b73c-50fc3d2c293d` |
| Gefälschte Signaturen eingebauter Methoden | `<Hp6:Ljava/lang/Iterable;>(THp6;J)V`, `<Kx3:Ljava/io/Serializable;>()TKx3;`, `<Bm9:Ljava/lang/Comparable;>(TBm9;)V`, `<Rq7:Ljava/lang/Runnable;>(TRq7;I)TRq7;`, `<Nv2:Ljava/io/Closeable;>()TNv2;` |
| Methodennamen des Injektors | `getDataRevision`, `getSemanticsId`, `getTelemetryId`, `patchRuntimeLibs`, `patchLibs`, `patchLibraries` |

Der Hash der Stufe 2 gilt nur für den Stand vom 25. November 2026. Liefert der Angreifer einen neuen Build aus, ändert er sich.

## Was wir nicht wissen

- **Was das dritte Modul „Door“ tut.** Der Server des Angreifers liefert es nur an Server aus, die er einzeln freigeschaltet hat.
- **Ob euer Server dieselbe Stufe 2 bekommen hat.** Die Analyse ist eine Momentaufnahme eines einzelnen Abrufs.
- **Wann der Code für den Token-Diebstahl läuft und wohin die Daten gehen.** Der Code ist vorhanden, ein Aufrufer ist im entschleierten Code nicht sichtbar.
- **Ob Stufe 2 andere JARs auch ohne Befehl infiziert.** Belegt ist der Befehl dafür. Ein automatischer Auslöser ließ sich weder finden noch ausschließen. Insgesamt ließen sich 94 % der versteckten Aufrufe und 87 % der verschlüsselten Texte der Stufe 2 auflösen, einzelne Methoden ließen sich nicht dekompilieren.
- **Ob der Rest der untersuchten JAR sauber ist.** Die übrigen Klassen waren unauffällig, wurden aber nur grob per Mustersuche geprüft und nicht Zeile für Zeile. Ein Vergleich mit der Original-JAR steht aus.
- **Wer dahintersteckt und wie weit die Malware verbreitet ist.**

## So lief die Analyse, ohne die Probe zu starten

Schadcode untersucht man nicht, indem man ihn ausprobiert. Alles hier ist statische Analyse: Die Datei wird gelesen, aber nie ausgeführt und nie von einer Java-Laufzeit geladen.

1. **Entpacken als Daten.** Eine JAR ist ein ZIP-Archiv. Entpacken führt nichts aus.
2. **`javap`** zeigt die Struktur der Klasse samt aller Markierungen und Konstanten. Hier fiel die versteckte Methode auf.
3. **Rechenketten ausrechnen.** Ein kleines Werkzeug auf Basis der Bibliothek [ASM](https://asm.ow2.io/) liest die Klasse als Datei ein, ersetzt jede Rechenkette durch ihr Ergebnis und entfernt die Tarn-Markierungen. Fachleute nennen das „Constant Folding“. Es sind rund 70 Zeilen Java.
4. **Dekompilieren** mit [CFR](https://www.benf.org/other/cfr/). Jetzt erscheint die Methode, und die Zahlen sind lesbar.
5. **Texte entschlüsseln.** Ein Python-Skript mit 26 Zeilen sucht jedes Byte-Array samt zugehöriger XOR-Schleife und ersetzt beides durch den Klartext. Danach stehen Namen wie `loadPlugin` und `net.s0lar.SolarLoader` im Code.

Die Original-Datei wurde in `.jar.quarantine` umbenannt, damit sie kein Server versehentlich lädt.

Stufe 2 ist deutlich stärker verschleiert (Zelix). Dafür entstand ein eigener, bewusst eingeschränkter Bytecode-Interpreter. Er liest die Klassen als Daten und rechnet nur die Entschlüsselungsroutinen der Probe nach. Zugriffe auf Dateien, Netz, Prozesse, Reflection und Classloader sind darin gesperrt. So ließen sich die versteckten Aufrufe und Texte zurückschreiben und anschließend mit CFR dekompilieren, ohne dass je eine Zeile der Malware in einer echten Java-Laufzeit lief.

## Kurz zusammengefasst

- Eine weiterverteilte Plugin-JAR enthält eine manipulierte bStats-Klasse. Das Original-Plugin ist selbst Opfer, deshalb nennen wir es nicht.
- Bei jedem Serverstart lädt sie unbemerkt ein zweites Plugin vom Server des Angreifers und versteckt eine Kopie als Logdatei mit unsichtbarem Zeichen im Namen.
- Dieses zweite Plugin („Solar“, getarnt als „DataFixerUpper“) ist eine Fernsteuerung: Betriebssystem-Befehle, Nachladen von Code, Infizieren weiterer JARs, DoS-Angriffe vom Server aus. Ein drittes Modul („Door“) bekommen nur einzeln freigeschaltete Server, sein Inhalt ist unbekannt.
- Prüfen: Hash vergleichen, alle JARs samt Server-JAR nach den Spuren des Injektors durchsuchen, `logs/` mit `LC_ALL=C find logs -name '*[! -~]*'` prüfen.
- Betroffen: Server vom Netz, Spuren sichern, alle Plugin-JARs und die Server-JAR neu beziehen, DiscordSRV-Token, Velocity-Secret und alle weiteren Geheimnisse ändern, den Host selbst prüfen, am besten neu aufsetzen.
- Vorbeugen: Plugins nur aus der Originalquelle, ausgehenden Verkehr beschränken, dem Server wenig Rechte geben.

Habt ihr Fragen oder einen Fund auf eurem eigenen Server, meldet euch bei uns auf [Discord](https://1lf.link/discord).

## Quellen und weiterlesen

- [bStats](https://bstats.org/), die Statistik-Bibliothek, deren Kopie hier manipuliert wurde
- [`javap` in der JDK-Dokumentation](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html) (englisch)
- [ASM](https://asm.ow2.io/), Bibliothek zum Lesen und Umschreiben von Java-Bytecode (englisch)
- [CFR](https://www.benf.org/other/cfr/), Java-Dekompilierer (englisch)
