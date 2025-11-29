---
title: 'Otis: Zentrale Spielerstammdaten für Minecraft (Java & Micronaut)'
alternativeTitle: 'Mojang UUID v4, interne UUID v7, Name & Sprache als stabile Basis fürs Ökosystem'
description: 'Otis stellt Spielerstammdaten zentral bereit: Mojang UUID (v4), interne UUID (v7), Minecraft-Name und Sprache sowie optional erster/letzter Beitritt. Das reduziert manuelle Inselprozesse, unterstützt DSGVO-orientierte Datenflüsse und bildet die Grundlage für nachgelagerte Services wie Metadata, Bans und Discord Bots.'
pubDate: '2025-11-29'
headerImage: 'images/blog/otis-player-data-header.png'
headerImageAlt: 'Otis Microservice: zentrale Minecraft-Spielerdaten (Java, Micronaut)'
slug: 'otis-zentrale-spielerstammdaten-minecraft'
translationKey: 'otis'

canonical: 'https://onelitefeather.net/de/blog/otis-zentrale-spielerstammdaten-minecraft'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/otis-zentrale-spielerstammdaten-minecraft'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/otis-central-player-data-minecraft'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/otis-central-player-data-minecraft'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'Otis: Zentrale Spielerstammdaten für Minecraft'
    alternativeHeadline: 'Java/Micronaut Microservice für UUIDs, Name und Sprache'
    description: 'Zentrale Spielerdaten als Schnittstelle im Ökosystem: weniger manuelle Dateninseln, klarere Verantwortlichkeiten und eine Basis für zuverlässige Services.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2025-11-29T00:00:00+00:00'
---# Projektvorstellung Otis


---

## Vorwort

Otis ist ein [Java](https://www.java.com/de/) [Micronaut](https://micronaut.io/) Service ([Otis](https://github.com/OneLiteFeatherNET/otis)) und ein gleichnamiges Projekt, welches Spielerstammdaten zentral zur Verfügung stellt. Zu Spielerstammdaten gehören Daten wie zum Beispiel die Java UUID ([v4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random))) von Mojang in Minecraft, eine interne UUID ([v7](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_7_(timestamp_and_random))) für die Verwaltung der externen Software unseres Ökosystems, der eigentliche Minecraft Spielername, die Sprache des Spielers und wann der Spieler das erste und letzte Mal dem Minecraft Server beigetreten ist.

Da Otis als zentrale Anlaufstelle für Spielerstammdaten (als Schnittstelle) unseres Ökosystems verwendet wird, kommen weitere Anwendungsfälle wie ein MetaData Service, Ban Service, Discord Bot usw. infrage. Wir möchten uns auf eine zentrale Spielerdatenbank verlassen können, denn aktuell werden Prozesse wie Datenerhebung und -löschung dezentral - wenn existent - in verschiedenen Stellen teils manuell ausgeführt, was dem [Datenschutz (Datenschutzgrundverordnung in Deutschland / EU)](https://de.wikipedia.org/wiki/Datenschutz-Grundverordnung) im Weg steht. Otis als Microservice und [Minimum Viable Product (MVP)](https://de.wikipedia.org/wiki/Minimum_Viable_Product) ermöglicht es uns zudem Fehler und Erfahrung mit der aktuellen Infrastruktur zu sammeln. Bedenkenswert daran ist, dass diese zentrale Komponente in unserer Infrastruktur deshalb systemkritisch ist, da die darauf abhängigen Services ohne Daten unter Umständen nicht funktionieren können und deshalb einen [hohen Schutz- und Verfügbarkeitsbedarf (Hochverfügbarkeit, Ausfallsicherheit, Vertraulichkeit)](https://de.wikipedia.org/wiki/CAP-Theorem#) hat.


---

## Problem

Aus Entwicklersicht haben wir keine eindeutige Datenquelle (sogenannte “[Single source of Truth](https://de.wikipedia.org/wiki/Single_Point_of_Truth)”) für die Spielersuche, für die Konvertierung von Spielernamen zu ihrer UUID und zur Verarbeitung von internen Daten (externe, abhängige Systeme). Durch fehlende zentralen Datenquellen wie Otis sie zur Verfügung stellt, sind Entwickler gezwungen, ihre Daten von verschiedenen Quellen (Datenbanken von eigenen oder third party plugins und Software) zusammenzutragen oder ihre eigenen Datenquellen zu erzeugen. Folgend verliert man als Team den Überblick über schon vorhandene Daten, hat möglicherweise duplizierte Daten und -sätze und entwickelt am Datenschutz vorbei, da eine zentrale Löschung nicht mehr möglich ist. Fehler und komplexe Abhängigkeiten sind eine weitere Folge - eine zerstreute Infrastruktur, bei der man wiederum als Systemadministrator bei Migrationen der Datenbanken und -quellen leicht den Überblick verliert.

Administrator und Moderation haben in ihren täglichen Prozessen ohne Otis mit einem erhöhten Organisationsaufwand zu kämpfen. Darunter fällt indirekt die Verwaltung von Spielern auf Servern, zum Beispiel globale Freischaltungen und Banns auf Servern oder die Erkennung von Spielern nach Namenswechseln und ein erhöhter Kommunikationsaufwand gegenüber anderen Teammitgliedern und Spielern.

Die Entstehung von dezentralen Datenquellen ist nicht unbedingt durch technologische Probleme verursacht, denn auch soziale Komponenten spielen einen entscheidenden Faktor. Zu Beginn eines Software Projektes wie zum Beispiel eines Minecraft Servers gibt es wenig bis keine Entwickler, es werden auch Drittanbieter für Features verwendet (“heruntergeladene Plugins”) und gegebenenfalls Minispiele von ein oder mehreren Entwicklern entwickelt, die prototypenähnliche Merkmale haben. In vielen Fällen fehlen regelmäßige Termine für diese Entwickler, um sich auf Standards und gemeinsame Schnittstellen, Systeme zu einigen. Dadurch kann es vorkommen, dass Minispiel 1: “Bedwars” und Minispiel 2: “SkyPvP” Daten über Spieler teilen, wie zum Beispiel:

* Spielername, UUID
* IP Addresse
* Spracheinstellungen
* Texturen vom Spieler
* Kills und Tode des Spielers im Scoreboard in den Spielmodis
* Score (meist Punkte)
* Globales Spielgeld / Währung,…

Meist sind Entwickler an einzelnen Projekten beschäftigt und wissen nicht unbedingt, was ihr Vorgänger oder ein weiteres Teammitglied an Datenquellen zur Verfügung hat, weshalb diese Überlegung einer zentralen Anlaufstelle für Spielerdaten selten überlegt wird. Wenn sie doch etabliert wird, findet man diese in “Core” Systemen, die meist ein weiteres Plugin sind und eine feste Abhängigkeit voraussetzen - jeder Entwickler muss sie implementieren, da diese Systeme sehr viel beherbergen, meist über das Ziel einer zentralen Datenquelle hinaus. Zudem sind diese Systeme sehr wartungsintensiv, da sie als Plugin selbst auch up to date mit der Paper / Spigot oder Minestom API sein müssen und ihre zusätzlichen Abhängigkeiten auch sogenannte “breaking changes” mit sich bringen können, wenn sie ein Update bringen. Dadurch entsteht unter Entwicklern der Unmut, dieses System zu verwenden, weil sie nicht auf ein Update des “Core Systems” in ihrem Plugin / System warten können und erfinden ihre eigene Datenquelle oder basieren auf ein anderes Plugin, welches ihre benötigten Spielerdaten in Teilen liefert. Aus unseren Beobachtungen scheitern diese Versuche der zentralen Daten- und Codequelle auch daran, dass Entwicklerteams eine hohe Fluktuation an Entwicklern haben können und Dokumentation nicht zum passenden Zeitpunkt vorhanden ist.

Zu den technische Komponenten, die eine zentrale Quelle von Spielerstammdaten verhindern, gehören unterschiedliche Wissenstände der Entwickler und eine fehlende gemeinsame Wissensdatenbank, auf die basierend auch auf (API-) Standards gesetzt werden kann. Diese Faktenlage ist wichtig für zukünftige Entwicklungen und Diskurse. Ist so eine Wissensdatenbank nicht vorhanden, zum Beispiel als Plattform, wird technisch entweder alleine entwickelt (jeder für sich, in der gleichen Quelle) oder sogenannte “bad practice” etabliert - die zentrale Quelle wird technisch komplex, nicht skalierungssicher oder die API wird unnutzbar, da sie Fachkenntnis über den internen Ablauf voraussetzt → schlechtes API Design.

Die genaue Definition der Fachlichkeit ist nicht Teil dieses Blogs, dennoch beschränken wir uns hier auf das Wissen über die uns von eingesetzten Technologien und Standards außerhalb des Minecraft “Kosmos”.

**TLDR: Eine zentralisierte Software ist abhängig von fachlichen, technischen und sozialen Entscheidungen und Kenntnissen, der erste Schritt ist die Kommunikation miteinander!**

Otis löst nicht die “universal Spielerdatenbank” der Spielerdatenbanken. Es sammelt nur die Daten, die von uns als Team als fachlich relevant eingestuft worden sind. Zudem löst es nicht das Problem der Kommunikation: Es muss kommuniziert werden, dass Otis unsere Lösung ist, die verwendet werden soll. Neue Entwickler müssen wissen und angeleitet werden, dass Otis existiert, bevor sie ihre Minispiele oder anderen Ideen in Code umsetzen, welche Spielerstammdaten benötigen.

Eine theoretische Alternative zu Otis wäre eine Zentrale NoSQL Datenbank, bei der sich die Plugins (Clients) auf dieser verbinden und sich ihre benötigten Daten abgreifen. Diese Alternative scheitert an der Fachkenntnis, an den duplizierten Daten (unterschiedliche UUID Felder, z.B. BUUID → Bedwars UUID, für verschiedene Spielmodis) und an der Datenarchivierung. Weitere Alternativen lassen sich OpenSource nicht finden, auf denen wir mit unseren Systemen aufbauen können und die unseren Anwendungsfall repräsentieren.


---

## Lösung

Otis stellt eine Schnittstelle zur Verwaltung von Spielerstammdaten zur Verfügung. Dazu verwaltet (erstellen, updaten) es selbstständig bestimmte Stammdaten wie die Spieler UUID, erster und letzter Netzwerkbeitritt und den Namen des Spielers.

Jetzt wird es technisch - Otis setzt auf eine [geschichtete (layered) Architektur](https://de.wikipedia.org/wiki/Schichtenarchitektur) mit dem [Microservice Prinzip](https://de.wikipedia.org/wiki/Microservices) im zustandslosen ([stateless](https://de.wikipedia.org/wiki/Zustandslosigkeit)) Design. Dabei unterteilen wir im Gradle Projekt zwischen Backend, Client und Velocity Plugin. Das Velocity Plugin basiert auf den Client und der Client wird anhand der OpenAPI Dokumentation aus dem Backend generiert. Das Backend ist intern in sogenannten drei Schichten aufgeteilt. Die erste Schicht repräsentiert DTOs und Controller und dient zur Kommunikation mit dem Client. Der Controller übergibt Anfragen über DTOs via Dependency Injection an die Serviceschicht, diese übernimmt Validierung sowie andere Aufgaben und übergibt diese an die Datenbankschicht. Die Datenbankschicht hat auch manchmal das Schlüsselwort “Repository” enthalten.

<img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/SchichtenarchitekturAufrufstrukturen.svg" class="dark:bg-white/5 bg-white" alt="Schichtenarchitektur Aufrufstrukturen" />

### DTOs

**D**ata **T**ransfer **O**bjects sind mit OpenAPI Annotationen dokumentiert und erlauben das automatische Generieren von Dokumentation für OpenAPI / Swagger. Als netter Nebeneffekt können wir über sogenannte Validierungsgruppen Inhalte vorvalidieren. Vorvalidieren bedeutet, dass überprüft wird, ob zum Beispiel ein Spielername auch nur maximal 16 Zeichen lang ist oder die Zeiten (Unix Time) im negativen Bereich liegt. Als großes Plus können wir aufgrund der OOP Struktur explizite Antworten (Responses) geben, wenn es zu Fehlern kommt ohne dass wir Stacktraces zurückgeben. Damit ist eine erhöhte Sicherheit gegeben, da Stacktraces nur serverseitig geloggt werden. Stacktraces verraten Code Strukturen und erleichtern Reverse Engineering ohne Code.

### Serviceschicht

Nachdem eine Anfrage bei dem Controller angekommen ist, landet sie in der Serviceschicht. Die Serviceschicht hat die Möglichkeit, Daten zu validieren, anzureichen und zu verändern bevor sie in die Datenbank gelangen. Dadurch können wir in der Datenbank Felder setzen, die wir nicht nach außen preisgeben. In einfachen Worten ausgedrückt: Es ist das Zug Stellwerk für Weichen.

### Datenbankschicht

Die Datenbankschicht ist im Grunde eine Sammlung an Modellen (Entitäten) und Datenbank Queries, die die Struktur zur Datenverarbeitung vorgeben.

### Warum ist Otis eine geschichtete Architektur und warum ein Microservice?

Durch die geschichtete Architektur hat man schnellere und saubere Resultate und bleibt so nah wie möglich bei dem MVP. Man muss nicht immer Domain Driven Design (**DDD**) oder eigene Prinzipien erfinden um ein gutes Ergebnis zu erlangen. Dazu können wir aufgrund der Microservice Architektur plattformunabhängig bleiben, Minestom, Bedrock, Paper, Fabric / Forge, usw. stellen keine Hürde dar, da wir über ein einheitliches **REST** Protokoll kommunizieren.

Ein gutes Einsatzgebiet ist Minecraft, in unserem Anwendungsfall, aber muss es nicht. Solange ein Spiel eine eindeutige ID pro Spieler besitzt, könnte man das Backend auch für andere Spieleplattformen verwenden, bei denen man Verwendung sieht - Foren könnten angebunden werden, Discord Bots, usw…

### Mögliche Probleme

Dadurch das wir zustandlos arbeiten, sind Anfragen als kostbar zu betrachten, da alle Anfragen mit 1 zu n an die Datenbank durchgereicht werden. An sich sind Datenbankzugriffe immer kostbar, da Tabellen kurz gesperrt werden, um sie atomar zu halten. Durch viele parallele Zugriffe aufgrund von Skalierung kann die Datenbank an Verfügbarkeit verlieren und die Antwortzeiten erhöhen sich. Normal sollten die Antwortszeiten von der Datenbank 5-15 Millisekunden unabhängig vom Netzwerk betragen, alles darüber wird auf lange Sicht zum Problem. Caching würde das Problem verringern und gegebenenfalls lösen. Zu Beachten ist dabei, dass es ein Cache ist, der zwischen Instanzen geteilt werden kann, um eine [horizontale Skalierung](https://de.wikipedia.org/wiki/Skalierbarkeit#Horizontale_Skalierung_(scale_out)) zu gewährleisten. Eine [vertikale Skalierung](https://de.wikipedia.org/wiki/Skalierbarkeit#Vertikale_Skalierung_(scale_up)) ist dann nur möglich, wenn die Ressourcen erhöht werden (zum Beispiel: 1 → 2 CPU Einheiten, 4GB → 8GB RAM), was wir in unserem Fall nicht haben wollen. Eine [horizontale Skalierung](https://de.wikipedia.org/wiki/Skalierbarkeit#Horizontale_Skalierung_(scale_out)) besteht aus mehreren Instanzen, die parallel Anfragen verarbeiten, währendessen eine [vertikale Skalierung](https://de.wikipedia.org/wiki/Skalierbarkeit#Vertikale_Skalierung_(scale_up)) nur aus einer oder weniger großen Instanz bersteht.


---

## Abschluss

Durch dieses Projekt haben wir eine gute Basis geschaffen, andere Projekte anzugehen und tieferes Verständnis aufzubauen für Architektur und Kommunikation. Gerne kann Otis als Projekt für andere (Minecraft) Projekte verwendet werden, um Stabilität, Einheitlichkeit und Wartbarkeit zu erreichen. Sollte es Fragen geben, kann man sich gerne auf dem Discord unterhalten. Über konstruktives Feedback für diesen Blog Beitrag sind wir froh, da er diesen Blog Beitrag verbessert.


---

## Projekt Links

* Repository: [https://github.com/OneLiteFeatherNET/Otis](https://github.com/OneLiteFeatherNET/otis)
* Issue-Tracker: <https://github.com/OneLiteFeatherNET/Otis/issues>
* Discord: <https://discord.onelitefeather.net>
* Releases: <https://github.com/OneLiteFeatherNET/Otis/releases>