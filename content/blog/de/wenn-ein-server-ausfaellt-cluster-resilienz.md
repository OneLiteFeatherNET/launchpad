---
title: 'Wenn ein Server ausfällt: Wie wir unser Cluster widerstandsfähig gemacht haben'
alternativeTitle: 'Resilienz für Einsteiger: Unsere Reise zu einem ausfallsicheren Kubernetes-Cluster'
description: 'Ein Server fällt aus – und niemand merkt es. Genau das war mein Ziel. Ich erzähle in Alltagsbildern, wie wir unser Cluster Stück für Stück widerstandsfähiger gemacht haben, welche Höhen und Tiefen die Reise mit sich brachte und was das ganz konkret für OneLiteFeather bedeutet.'
pubDate: '2026-06-13'
headerImage: 'images/blog/cluster-topology-social.png'
headerImageAlt: 'Topologie des feather-core-Clusters: Control-Plane, Ceph-Storage und Worker in Zone fr01'
slug: 'wenn-ein-server-ausfaellt-cluster-resilienz'
translationKey: 'cluster-resilience-light'
tags:
  - infrastructure
  - kubernetes
  - reliability
  - hardening
author: phillipp-glanz
canonical: 'https://onelitefeather.net/de/blog/wenn-ein-server-ausfaellt-cluster-resilienz'
sitemap:
  loc: '/de/blog/wenn-ein-server-ausfaellt-cluster-resilienz'
  lastmod: '2026-06-13'
  changefreq: monthly
  priority: 0.8
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/wenn-ein-server-ausfaellt-cluster-resilienz'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/when-a-server-fails-cluster-resilience'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/when-a-server-fails-cluster-resilience'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'Wenn ein Server ausfällt: Wie wir unser Cluster widerstandsfähig gemacht haben'
    alternativeHeadline: 'Resilienz für Einsteiger: Unsere Reise zu einem ausfallsicheren Kubernetes-Cluster'
    description: 'Ein Server fällt aus – und niemand merkt es. Genau das war mein Ziel. Ich erzähle in Alltagsbildern, wie wir unser Cluster Stück für Stück widerstandsfähiger gemacht haben.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-06-13T00:00:00+00:00'
---
Ich verrate euch mein Lieblingsergebnis der letzten Wochen: Ein Server ist ausgefallen – und niemand hat es gemerkt. Kein abgebrochener Login, keine leere Website, kein „Datenbank gerade nicht erreichbar". Klingt nach dem langweiligsten Satz der Welt, ist aber genau das, worauf ich hingearbeitet habe.
<!--more-->
> **Light Edition.** Hier erzähle ich die Geschichte in Alltagsbildern, ganz ohne Vorwissen. Wer die echten Schräubchen sehen will – mit Konfiguration und Diagrammen aus dem Maschinenraum – findet sie in der [Deep-Dive-Ausgabe](https://onelitefeather.net/de/blog/resilienz-im-detail-priorityclasses-pdb-affinitaeten).

Ich bin bei OneLiteFeather für den Backend- und Infrastruktur-Kram zuständig. Unsere Dienste laufen längst nicht mehr auf einem einzelnen Server, sondern auf einem Cluster – einer Gruppe von Maschinen, die sich die Arbeit teilen. Die Idee dahinter ist simpel: Fällt eine Maschine aus, übernehmen die anderen. In der Theorie. In der Praxis musste ich dem Cluster diese „Theorie" erst beibringen – und genau das ist die Reise, von der ich erzählen will. Am einfachsten geht das mit drei Bildern, die ihr garantiert kennt.

## Bild 1: Leg nicht alle Eier in einen Korb

Das erste Problem ist uralt und passt in einen Satz, den schon meine Oma kannte: Leg nicht alle Eier in einen Korb.

![Drei Eier in einem Korb gegenüber je einem Ei in drei Körben](/images/blog/analogy-eggs-baskets.drawio.svg)
*Links: drei Eier, ein Korb – ein Stolpern, und alle drei sind hin. Rechts: drei Körbe – fällt einer um, ist nur ein Ei betroffen.*

Genau so war es anfangs bei uns: Von manchen Diensten lief zwar mehr als eine Kopie, aber alle Kopien lagen zufällig auf demselben Server. Drei Eier, ein Korb. Geht der Server in die Knie, sind alle Kopien gleichzeitig weg – die Redundanz war nur auf dem Papier vorhanden.

Ich habe dem Cluster also beigebracht, die Kopien bewusst auf verschiedene Server zu verteilen. Klingt trivial, ist aber der Unterschied zwischen „drei Eier in einem Korb" und „drei Körbe". Erst dann ist ein zweiter Server wirklich ein Sicherheitsnetz und kein dekoratives Beiwerk.

## Bild 2: Es bleibt immer eine Kasse offen

Ab und zu muss ich einen Server kurz aus dem Verkehr ziehen – für ein Update oder zum Aufräumen. Stell dir das wie einen Supermarkt vor: Manchmal muss eine Kassiererin in die Pause. Völlig okay – solange nicht **alle** gleichzeitig das Schild „geschlossen" rausstellen.

![Vier Supermarktkassen, drei offen, eine im Pause-Modus](/images/blog/analogy-checkout-lanes.drawio.svg)
*Wartung ist erlaubt – aber immer nur an einer Kasse gleichzeitig. Mindestens eine bleibt offen und bedient weiter.*

Früher konnte es passieren, dass bei so einer Wartung aus Versehen alle Kassen gleichzeitig zumachten – und der Dienst war für einen Moment komplett weg. Heute gibt es eine feste Hausregel: Von jedem Dienst darf immer nur eine Kopie gleichzeitig in Pause. Der Rest bedient unbeirrt weiter. Wartung tagsüber, ohne Schweißausbruch – das war vorher undenkbar.

## Bild 3: Wenn der Strom knapp wird, fliegt zuerst die Lichterkette

Das dritte Bild: Stell dir einen Stromausfall zu Hause vor, und du hast nur noch begrenzt Saft. Was bleibt an, was steckst du zuerst aus? Der Kühlschrank bleibt – logisch. Die Heizung bleibt. Die Lichterkette von der letzten Feier? Die kann warten.

![Eine Steckdosenleiste: Kühlschrank und Heizung bleiben, Deko wird zuerst ausgesteckt](/images/blog/analogy-power-strip.drawio.svg)
*Wird es eng, wird das Unwichtigste zuerst ausgesteckt. Das Wesentliche bleibt am Netz.*

Genau diese Rangordnung habe ich dem Cluster gegeben. Wird der Platz knapp, weiß die Maschine von selbst, was sie schützen muss: den Speicher, auf dem alle Daten liegen, und die Datenbanken, von denen alles abhängt. Und was tritt zuerst zurück? Die netten, aber verzichtbaren Dinge – etwa unsere Minecraft-Kartenansicht. Niemand muss nachts aufstehen und entscheiden; die Reihenfolge steht vorher fest.

> **Ein echtes Beispiel aus unserem Cluster.** Als wir neulich einen Server für ein Update kurz herausgenommen haben, blieb unsere Minecraft-Kartenansicht (BlueMap) durchgehend erreichbar – weil immer mindestens zwei Kopien auf anderen Servern weiterliefen. Vor dem Umbau wäre sie in genau diesem Moment kurz verschwunden.

## Die Höhen – und die Tiefen

Ehrlich gesagt lief das nicht in einem Rutsch. Es gab die schönen Momente und die zähen.

Der schönste: Ich habe das erste Mal bewusst einen Server „in Wartung" geschickt und gespannt auf den Bildschirm gestarrt – und es passierte schlicht nichts. Die Dienste zogen ruhig um, die Website blieb erreichbar. Dafür hatte ich die ganze Arbeit gemacht.

Der zäheste: Ich hatte mehrere meiner schönen Regeln aufgeschrieben, sie sahen korrekt aus – und wurden trotzdem ignoriert. Es brauchte etliche Tassen Kaffee und einiges an Detektivarbeit, bis ich verstand, dass eine Regel an exakt der richtigen Stelle stehen muss, damit sie überhaupt zählt. „Aufgeschrieben" ist eben nicht „angewendet" – die Lektion zieht sich durch die ganze Reise.

Und der kniffligste: unsere Datenbank-Vermittlungsstelle, durch die jede Anfrage läuft. Die wollte ich doppelt absichern – aber meine Verteilungsregel war zu streng formuliert. Die zweite Kopie fand keinen freien Platz und blieb in der Warteschleife hängen. Erst als ich die Regel von „muss" auf „möglichst" abgemildert habe, lief beides sauber auf zwei verschiedenen Servern. Eine winzige Formulierung, ein riesiger Unterschied.

## Was das für OneLiteFeather bedeutet

Klingt nach viel Aufwand für etwas, das man im besten Fall nie bemerkt. Genau das ist der Punkt:

- **Weniger Überraschungen.** Ein einzelner ausgefallener Server ist heute ein Schulterzucken, kein Notfall.
- **Ruhigere Wartungen.** Updates laufen tagsüber, ohne dass mir die Hände zittern.
- **Klare Prioritäten.** Wird es eng, schützt sich das System selbst – Wichtiges bleibt, Verzichtbares tritt zurück.
- **Mehr Ruhe im Team.** Weniger nächtliche „Website ist down"-Schrecksekunden, mehr Zeit für die Projekte, die uns wirklich Spaß machen.

Unser Cluster ist dadurch nicht spektakulärer geworden – es ist langweiliger geworden, im allerbesten Sinne. Und ehrlich: Genau diese Sorte Langeweile ist mir am liebsten.

---

## Werde Teil unserer Reise

Bei OneLiteFeather schätzen wir eine entspannte Arbeitsatmosphäre und leben den Flair von kreativer Freiheit gepaart mit strukturierter Organisation. Wir arbeiten nach dem **Kanban-Prinzip**, das uns ermöglicht, in einem stressfreien Umfeld ohne starre Deadlines zu arbeiten. Dabei liegt unser Fokus auf **aktiver Kommunikation** und dem gemeinsamen Fortschritt. Wenn du in den Bereichen **Moderation**, **Community Management**, **Entwicklung** oder **Konzepterstellung** Erfahrung hast und dich in einer Gemeinschaft engagieren möchtest, die Wert auf persönliches Wachstum und Teamarbeit legt, dann bist du bei uns genau richtig. Referenzen sind willkommen und helfen uns, ein besseres Verständnis für deine Fähigkeiten und Erfahrungen zu bekommen.

Wir sind gespannt darauf, von dir zu hören und gemeinsam spannende Projekte zu verwirklichen. Du kannst mich, **themeinerlp**, direkt auf Discord erreichen, oder du kannst über unseren Discord-Server in Kontakt treten, den du unter [1lf.link/discord](https://1lf.link/discord) findest. Dort kannst du ein Ticket eröffnen, um dich zu bewerben. Alternativ kannst du auch **OneLiteFeather** direkt via Discord kontaktieren. Lass uns über deine Ideen plaudern und wie du zur OneLiteFeather-Community beitragen kannst. Zusammen können wir die digitale Welt erkunden, unser Wissen erweitern und eine positive und unterstützende Gemeinschaft aufbauen.

Falls Unklarheiten aufkommen sollten, sei frei uns zu fragen. Wir sind hier, um alle deine Fragen zu beantworten und freuen uns darauf, mehr über dich und deine Interessen zu erfahren!
