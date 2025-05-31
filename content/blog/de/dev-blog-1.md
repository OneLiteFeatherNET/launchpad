---
title: 'DevBlog #1'
description: 'Heute möchte ich aus unserem Team die aktiv verwenden Technologien vorstellen und was die für Vorteile uns bringen. '
pubDate: 'Oct 21 2023'
headerImage: 'blog/dev-blog-1.webp'
slug: 'dev-blog-1'
---
Hallo alle zusammen,
mein Name ist Phillipp. Ich bin einer der zwei Entwicklungsleiter und betreue hier im Team die Technologien sowie die Server Architektur. 

Heute möchte ich aus unserem Team die aktiv verwenden Technologien vorstellen und was die für Vorteile uns bringen. 

Wir teilen die Liste unten in mehrere Teile auf, um den Fokuspunkt und die Qualität für euch zu erhalten
<!--more-->

Als Erstes gebe ich euch eine kleine Auflistung, welche Technologien wir verwenden.
Technologien (Services): 
- Sentry *
- SonarQube *
- Gitlab * 
- OpenProject
- Outline
- Kubernetes
- NextCloud
- MailCow
- MariaDB
- MongoDB
- S3(Minio)
- AzureAD
- KeyDB(Redis)
- Weblate
- Renovate
(- WakaTime)

*: Wird in diesem Teil behandelt.

Dazu verwenden wir auch Prinzipien, die werden euch aber in einem anderen Dev-Blog genauer erläutert. 

---

### Sentry
Sentry wird bei uns für das automatische Fehlerverfolgung verwendet. 
Damit erhoffen wir uns, das im Produktiv- und Testumgebungen aktiv mitbekommen, wenn User ein Bug oder Error produzieren, den wir durch das Quality Assurance nicht bedacht haben oder ein Sonderfall ist.

Vorteile:
- Automatische Benachrichtigung von Live wie Test Systemen, wenn Fehler oder Bugs produziert werden.
- Stacktraces werden zentral gespeichert und direkt an das Projekt in Gitlab verknüpft.
- Fehler werden auch anhand von Versionen aufgezeichnet, um Prioritäten von Fehler zu sortieren, um dann im Projektmanagement nachvollziehen, ob dieser Bug schon gefixt wurde. 

---

### SonarQube
SonarQube wird hier bei uns für das Feedback in der ersten Stufe verwendet, es prüft unseren Source Code via CI/CD aktiv auf Sicherheit und orientiert sich an Industriestandards. Dadurch können wir sicherstellen, dass unser Source Code Qualität immer konstant bleibt und sich Flüchtigkeitsfehler nicht einschleichen. 

Vorteile:
- Automatisiertes, neutrales Feedback an den Entwickler
- Der Projektleiter oder Entwicklungsleiter muss erst bei der zweiten Stufe zu Hilfe gezogen werden, dadurch sparen wir uns Zeit.
- Konstante Source Code Qualität 


---

### Gitlab
Gitlab ist unsere zentrale Source Code Verwaltung, dabei ermöglicht uns der CI/CD Workflow automatische Updates auf verschieden Umgebungen auszurollen. Und hilft uns bei der Software Koordination. Dabei bietet uns Gitlab die Integration von Metriken von verschiedenen Umgebungen an.
Aktuell verwenden die Fork Funktion, um Projekte nach gleichen Dateistrukturen aufzubauen, um Voreinstellungen, die wichtig sind, direkt zu übernehmen.

Vorteile:
- Automatisch Einrichtung vom  CI/CD Workflow
- Große Zeitersparnis beim Projektaufsetzen
- Einheitliche Strukturen, um Einlernzeit zu sparen 
- Schnellere Abhängigkeits- (Dependencies) Updates durch Zentrale Templateverwaltung

---

Vielen dank für eure Aufmerksamkeit.
Ich hoffe das hat euch gefallen.
Gebt uns doch aktives Feedback auf unserem Discord.

Grüße
TheMeinerLP - Phillipp
Software Lead

Zweitkorrektur durch: Michelle (Besitzerin von OneLiteFeather)

---

## Werde Teil unserer Reise

Bei OneLiteFeather schätzen wir eine entspannte Arbeitsatmosphäre und leben den Flair von kreativer Freiheit gepaart mit strukturierter Organisation. Wir arbeiten nach dem **Kanban-Prinzip**, das uns ermöglicht, in einem stressfreien Umfeld ohne starre Deadlines zu arbeiten. Dabei liegt unser Fokus auf **aktiver Kommunikation** und dem gemeinsamen Fortschritt. Wenn du in den Bereichen **Moderation**, **Community Management**, **Entwicklung** oder **Konzepterstellung** Erfahrung hast und dich in einer Gemeinschaft engagieren möchtest, die Wert auf persönliches Wachstum und Teamarbeit legt, dann bist du bei uns genau richtig. Referenzen sind willkommen und helfen uns, ein besseres Verständnis für deine Fähigkeiten und Erfahrungen zu bekommen.

Wir sind gespannt darauf, von dir zu hören und gemeinsam spannende Projekte zu verwirklichen. Du kannst mich, **themeinerlp**, direkt auf Discord erreichen, oder du kannst über unseren Discord-Server in Kontakt treten, den du unter [1lf.link/discord](https://1lf.link/discord) findest. Dort kannst du ein Ticket eröffnen, um dich zu bewerben. Alternativ kannst du auch **OneLiteFeather** direkt via Discord kontaktieren. Lass uns über deine Ideen plaudern und wie du zur OneLiteFeather-Community beitragen kannst. Zusammen können wir die digitale Welt erkunden, unser Wissen erweitern und eine positive und unterstützende Gemeinschaft aufbauen.

Falls Unklarheiten aufkommen sollten, sei frei uns zu fragen. Wir sind hier, um alle deine Fragen zu beantworten und freuen uns darauf, mehr über dich und deine Interessen zu erfahren!