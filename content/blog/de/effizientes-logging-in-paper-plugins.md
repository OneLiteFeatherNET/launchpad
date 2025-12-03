---
title: 'Effizientes Logging in Paper-Plugins mit SLF4J und log4j2'
alternativeTitle: 'Markerbasiertes Logging für strukturierte Auswertungen'
description: 'Lerne, wie du mit SLF4J und log4j2 Marker verwendest, um Logs thematisch zu gruppieren und die Auswertung zu erleichtern.'
pubDate: '2024-09-29'
headerImage: 'images/blog/effizientes-logging-paper-plugins-slf4j-log4j2-grafana-loki.jpg'
headerImageAlt: 'Effizientes Logging in Paper-Plugins mit SLF4J und log4j2 Grafana Loki Bild'
slug: 'effizientes-logging-paper-plugins-slf4j-log4j2-grafana-loki'
translationKey: 'effizientes-logging-paper-plugins-slf4j-log4j2-grafana-loki'
canonical: 'https://onelitefeather.net/de/blog/effizientes-logging-paper-plugins-slf4j-log4j2-grafana-loki'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/effizientes-logging-paper-plugins-slf4j-log4j2-grafana-loki'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/de/blog/effizientes-logging-paper-plugins-slf4j-log4j2-grafana-loki'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'Effizientes Logging in Paper-Plugins mit SLF4J und log4j2'
    alternativeHeadline: 'Markerbasiertes Logging für strukturierte Auswertungen'
    description: 'Lerne, wie du mit SLF4J und log4j2 Marker verwendest, um Logs thematisch zu gruppieren und die Auswertung zu erleichtern.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2024-09-29T00:00:00+00:00'
---

Wenn man ein Minecraft-Plugin für PaperMC entwickelt, kann es schnell unübersichtlich werden, den Überblick über die Logs zu behalten. Besonders bei großen Projekten oder Multi-Modul-Architekturen stoßen herkömmliche Log-Nachrichten an ihre Grenzen. Umso wichtiger ist es, eine klare Struktur in die Log-Dateien zu bringen, die relevante Informationen einfach filterbar macht.
<!--more-->
In diesem Blog-Beitrag zeigen wir dir, wie du mit SLF4J und `log4j2` gezielt Marker verwendest, um deine Logs thematisch zu gruppieren. Durch diese Technik kannst du Log-Nachrichten mit spezifischen Labels wie `DATABASE`, `NETWORK` oder `GAME` versehen. Das ist besonders hilfreich, wenn du in deiner Paper-Umgebung unterschiedliche Module verwendest, etwa für Datenbankzugriffe, Netzwerkanfragen oder Spiel-Events. Mit einer durchdachten Log-Strukturierung wird die Analyse von Logs zur Fehlersuche einfacher...

### Was sind Marker und warum sie verwenden?

Marker sind wie kleine Etiketten, die du deinen Log-Nachrichten hinzufügen kannst. Anstatt einfach nur eine Nachricht wie „Datenbankverbindung hergestellt“ ins Log zu schreiben, kannst du diese Nachricht mit dem Marker `DATABASE` kennzeichnen. Das bedeutet, dass du später bei der Auswertung in der Konsole oder in Tools wie Grafana Loki ganz gezielt nur die Nachrichten mit diesem Marker anzeigen lassen kannst.

Ein weiterer Vorteil von Markern ist, dass sie unabhängig von den regulären Log-Ebenen wie INFO, WARN oder ERROR funktionieren. Du kannst also eine tiefere, thematische Ebene für deine Logs schaffen, ohne das bestehende Logging-Konzept zu verändern.

### Beispielhafte Implementierung in einem Paper-Plugin

**Schritt 1: Marker-Klasse erstellen**

Wir beginnen damit, eine zentrale Klasse für unsere Marker-Konstanten anzulegen. Dadurch haben wir alle Marker an einem Ort definiert und können sie leicht in verschiedenen Modulen wiederverwenden.

```java
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

public final class LogMarkers {
    public static final Marker DATABASE = MarkerFactory.getMarker("DATABASE");
    public static final Marker GAME = MarkerFactory.getMarker("GAME");
    public static final Marker NETWORK = MarkerFactory.getMarker("NETWORK");

    private LogMarkers() {}
}
```

**Schritt 2: Marker im Code verwenden**

Die Marker verwenden wir dann im Code, um unsere Log-Nachrichten thematisch zu kennzeichnen. Hier ein Beispiel aus einem Datenbank-Modul:

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import static com.example.LogMarkers.*;

public class DatabaseModule {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseModule.class);

    public void connectToDatabase() {
        logger.info(DATABASE, "Verbindung zur Datenbank erfolgreich hergestellt.");
    }

    public void executeQuery(String query) {
        logger.debug(DATABASE, "SQL-Abfrage: {}", query);
        try {
            // DB-Abfrage ausführen...
        } catch (Exception e) {
            logger.error(DATABASE, "Fehler bei der Ausführung der Abfrage: {}", e.getMessage());
        }
    }
}
```

**Schritt 3: `log4j2`-Konfiguration anpassen**

Damit nur die relevanten Marker in der Konsole oder Datei ausgegeben werden, passt du die `log4j2.xml` wie folgt an:

```xml
<Configuration>
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %c{1} - %msg %marker%n"/>
        </Console>
        <File name="FileLogger" fileName="logs/paper-plugin.log">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss} %-5p [%c{1}] %m %marker%n"/>
        </File>
    </Appenders>
    <Loggers>
        <Logger name="DatabaseLogger" level="debug" additivity="false">
            <MarkerFilter marker="DATABASE" onMatch="ACCEPT" onMismatch="DENY"/>
            <AppenderRef ref="Console"/>
            <AppenderRef ref="FileLogger"/>
        </Logger>
        <Logger name="GameLogger" level="debug" additivity="false">
            <MarkerFilter marker="GAME" onMatch="ACCEPT" onMismatch="DENY"/>
            <AppenderRef ref="Console"/>
            <AppenderRef ref="FileLogger"/>
        </Logger>
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="FileLogger"/>
        </Root>
    </Loggers>
</Configuration>
```

Mit dieser Konfiguration kannst du die Ausgabe in der Konsole und den Log-Dateien auf die relevanten Marker beschränken. Das hilft, die Menge an irrelevanten Logs zu reduzieren und den Fokus auf die wichtigen Nachrichten zu legen.

### Integration mit Grafana Loki

Durch den gezielten Einsatz von Markern lassen sich Logs hervorragend in Grafana Loki filtern. So kannst du z.B. alle Datenbank-bezogenen Logs mit `DATABASE` oder Spiel-Events mit `GAME` gruppieren und gezielt analysieren. Diese Strukturierung macht es einfacher, verschiedene Ereignisse zu verfolgen und gezielt auf Fehler zu reagieren.

### Fazit

Durch die Verwendung von Markern in deinem Paper-Plugin schaffst du eine klar strukturierte Log-Architektur, die es dir ermöglicht, Logs gezielt zu analysieren. Ob in der Konsole, in Dateien oder bei der Auswertung in Grafana Loki – durch die Marker-Filterung behältst du stets den Überblick über das, was im Plugin passiert.

Willst du mehr über Paper-Plugins erfahren? Dann bleib dran und erfahre in unseren zukünftigen Dev-Blogs mehr über weitere Möglichkeiten!

## Werde Teil unserer Reise

Bei OneLiteFeather schätzen wir eine entspannte Arbeitsatmosphäre und leben den Flair von kreativer Freiheit gepaart mit strukturierter Organisation. Wir arbeiten nach dem **Kanban-Prinzip**, das uns ermöglicht, in einem stressfreien Umfeld ohne starre Deadlines zu arbeiten. Dabei liegt unser Fokus auf **aktiver Kommunikation** und dem gemeinsamen Fortschritt. Wenn du in den Bereichen **Moderation**, **Community Management**, **Entwicklung** oder **Konzepterstellung** Erfahrung hast und dich in einer Gemeinschaft engagieren möchtest, die Wert auf persönliches Wachstum und Teamarbeit legt, dann bist du bei uns genau richtig. Referenzen sind willkommen und helfen uns, ein besseres Verständnis für deine Fähigkeiten und Erfahrungen zu bekommen.

Wir sind gespannt darauf, von dir zu hören und gemeinsam spannende Projekte zu verwirklichen. Du kannst mich, **themeinerlp**, direkt auf Discord erreichen, oder du kannst über unseren Discord-Server in Kontakt treten, den du unter [1lf.link/discord](https://1lf.link/discord) findest. Dort kannst du ein Ticket eröffnen, um dich zu bewerben. Alternativ kannst du auch **OneLiteFeather** direkt via Discord kontaktieren. Lass uns über deine Ideen plaudern und wie du zur OneLiteFeather-Community beitragen kannst. Zusammen können wir die digitale Welt erkunden, unser Wissen erweitern und eine positive und unterstützende Gemeinschaft aufbauen.

Falls Unklarheiten aufkommen sollten, sei frei uns zu fragen. Wir sind hier, um alle deine Fragen zu beantworten und freuen uns darauf, mehr über dich und deine Interessen zu erfahren!
