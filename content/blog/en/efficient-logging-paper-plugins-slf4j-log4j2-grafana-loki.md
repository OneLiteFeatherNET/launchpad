---
title: 'Efficient Logging in Paper Plugins with SLF4J and log4j2'
alternativeTitle: 'Marker-based logging for structured analysis'
description: 'Learn how to use SLF4J and log4j2 markers to group logs by topic and make analysis easier.'
pubDate: '2024-09-29'
headerImage: 'images/blog/effizientes-logging-paper-plugins-slf4j-log4j2-grafana-loki.jpg'
headerImageAlt: 'Efficient logging in Paper plugins with SLF4J and log4j2 Grafana Loki image'
slug: 'efficient-logging-paper-plugins-slf4j-log4j2-grafana-loki'
translationKey: 'effizientes-logging-paper-plugins-slf4j-log4j2-grafana-loki'
canonical: 'https://onelitefeather.net/en/blog/efficient-logging-paper-plugins-slf4j-log4j2-grafana-loki'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/effizientes-logging-paper-plugins-slf4j-log4j2-grafana-loki'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/efficient-logging-paper-plugins-slf4j-log4j2-grafana-loki'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/efficient-logging-paper-plugins-slf4j-log4j2-grafana-loki'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'Efficient Logging in Paper Plugins with SLF4J and log4j2'
    alternativeHeadline: 'Marker-based logging for structured analysis'
    description: 'Learn how to use SLF4J and log4j2 markers to group logs by topic and make analysis easier.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2024-09-29T00:00:00+00:00'
---

When building a Minecraft plugin for PaperMC, it’s easy to lose track of logs. Traditional log messages quickly hit their limits in larger projects or multi-module architectures. All the more reason to add a clear structure that keeps important information filterable.
<!--more-->
In this post, we’ll show how to use SLF4J and `log4j2` markers to group your logs by topic. With this technique, you can tag log messages with labels like `DATABASE`, `NETWORK`, or `GAME`. That’s especially useful when your Paper setup has multiple modules—for database access, network calls, or game events. With deliberate log structuring, analyzing logs for debugging becomes much simpler.

### What are markers and why use them?

Markers are like small labels you add to your log messages. Instead of just writing “Database connection established,” you tag the message with the `DATABASE` marker. Later, in the console or tools like Grafana Loki, you can filter explicitly for that marker.

Another advantage: markers work independently of regular log levels such as INFO, WARN, or ERROR. You gain a thematic layer without changing your existing logging concept.

### Example implementation in a Paper plugin

**Step 1: Create a marker class**

Start by adding a central class for your marker constants. That keeps all markers in one place and reusable across modules.

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

**Step 2: Use markers in code**

Use markers in your code to categorize log messages. Here’s a database module example:

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import static com.example.LogMarkers.*;

public class DatabaseModule {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseModule.class);

    public void connectToDatabase() {
        logger.info(DATABASE, "Successfully established database connection.");
    }

    public void executeQuery(String query) {
        logger.debug(DATABASE, "SQL query: {}", query);
        try {
            // Execute DB query...
        } catch (Exception e) {
            logger.error(DATABASE, "Error executing query: {}", e.getMessage());
        }
    }
}
```

**Step 3: Adjust the `log4j2` configuration**

Limit console and file output to the relevant markers in `log4j2.xml`:

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

With this setup, you limit console and file output to the markers you care about. That cuts noise and keeps attention on the important messages.

### Integration with Grafana Loki

By using markers, you can filter logs cleanly in Grafana Loki—group all database-related logs with `DATABASE` or game events with `GAME` and analyze them in a targeted way. This structure makes it easier to follow events and react to issues.

### Conclusion

Markers give your Paper plugin a clear logging architecture, making targeted analysis straightforward. Whether in the console, files, or Grafana Loki, marker filtering keeps you on top of what’s happening inside the plugin.

Want to learn more about Paper plugins? Stay tuned for future dev blogs covering additional techniques.

## Become Part of Our Journey

At OneLiteFeather, we value a relaxed working atmosphere and embrace the flair of creative freedom coupled with structured organization. We work according to the **Kanban principle**, which allows us to work in a stress-free environment without rigid deadlines. Our focus is on **active communication** and collective progress. If you have experience in **Moderation**, **Community Management**, **Development**, or **Concept Creation** and want to engage in a community that values personal growth and teamwork, then you are in the right place. References are welcome and help us gain a better understanding of your skills and experiences.

We look forward to hearing from you and realizing exciting projects together. You can reach me, **themeinerlp**, directly on Discord, or you can contact us through our Discord server at [1lf.link/discord](https://1lf.link/discord). There, you can open a ticket to apply. Alternatively, you can contact **OneLiteFeather** directly via Discord. Let's talk about your ideas and how you can contribute to the OneLiteFeather community. Together we can explore the digital world, expand our knowledge, and build a positive and supportive community.

If you have any questions, feel free to ask us. We are here to answer all your questions and look forward to learning more about you and your interests!
