---
slug: slender
translationKey: event-slender-2026
title: "Slender: Zurück in den Nebel"
summary: Sammle die Seiten, bevor Slender dich findet – die überarbeitete Fassung mit Stamina, eigenem Resource Pack und neuer Atmosphäre.
type: play
unlisted: false
event:
  announceAt: 2026-10-15T18:00:00+02:00
  startsAt: 2026-10-24T18:00:00+02:00
  endsAt: 2026-12-31T23:59:00+01:00
sessions:
  label: Slender-Nacht
  first: 2026-10-31T21:00:00+01:00
  durationMinutes: 180
  repeat: weekly
access:
  mode: open
  requirements:
    - Das Server-Resource-Pack muss angenommen werden.
join:
  server: true
subject:
  kind: gamemode
  name: Slender
play:
  modeSummary: Asymmetrisch – ein Slender gegen alle anderen
thumbnail: '/images/events/slender/cover.webp'
thumbnailAlt: 'Schwebende Inseln in türkisfarbenem Nebel: auf der Mitte ein spitzer Tempel, darüber ein dunkler Ring an Ketten, dazwischen überwucherte Brücken und rechts ein kahler, verdrehter Baum'
gallery:
  - src: '/images/events/slender/cover.webp'
    alt: 'Schwebende Inseln in dichtem Nebel, auf der mittleren Insel ein spitzer Tempel mit einem Ring an Ketten darüber'
    caption: 'Schwebende Inseln im Nebel'
    width: 1600
    height: 843
  - src: '/images/events/slender/page-tree.webp'
    alt: 'Ein schwarzer, verzweigter Baum mit einem Blatt Papier am Stamm, von unten gesehen im nächtlichen Nebel, davor verdorrtes Gras'
    caption: 'Eine Seite am Stamm'
    width: 1600
    height: 843
  - src: '/images/events/slender/forest.webp'
    alt: 'Dunkler, nebliger Nadelwald bei Nacht, links unten eine schwarze Gestalt mit leuchtenden orangefarbenen Schlitzen'
    caption: 'Etwas beobachtet dich'
    width: 1600
    height: 843
promote: {}
---

## Worum es geht

2023 haben wir *Slender: The Eight Pages* als asymmetrischen Multiplayer-Modus
nach Minecraft gebracht. Die Idee ging auf, die Umsetzung litt aber unter
Balancing, jungen Maps und technischen Problemen. Drei Jahre später bringen
wir eine überarbeitete Fassung zurück.

Ein Spieler wird zufällig als **Slender** ausgewählt und jagt die anderen.
Alle übrigen sind **Survivor** und müssen eine bestimmte Anzahl an Seiten
sammeln. Wie viele, richtet sich nach der Spielerzahl der Runde.

## Bevor du joinst

- Beim Betreten fordert der Server dich auf, das **Resource Pack**
  anzunehmen. Es ist Pflicht: Lehnst du ab, wirst du vom Server geworfen.
- Die GUI ist bewusst dunkel gehalten, damit das Inventar mitten in der Runde
  die Stimmung nicht bricht.
- Neue Effekte laufen über die Shader des Spiels und werden vom Server
  gesteuert.

## Anleitung

::event-guides
:::event-guide{role="Survivor" icon="person-running"}
**Ziel:** Sammelt gemeinsam alle Seiten der Runde, bevor Slender euch
ausschaltet.

- Die Zahl der Seiten wächst mit der Spielerzahl.
- Sprinten kostet **Ausdauer**. Ist sie leer, müsst ihr euch erst erholen –
  teilt sie euch ein.
- Jeder hat **ein Heil-Item** pro Runde. Es heilt nach und nach und lässt sich
  erst nutzen, wenn euch etwas fehlt.
- Angst wächst beim Finden von Seiten, bei Sichtungen und wenn Mitspieler
  ausscheiden. Der Creek nimmt sich besonders ängstliche Survivor vor.
- Mehr dazu im [Spielprinzip-Beitrag](/de/blog/slender-spielprinzip).
:::

:::event-guide{role="Slender" icon="ghost"}
**Ziel:** Schalte alle Survivor aus, bevor sie die Seiten beisammen haben.

- Du wirst zu Rundenbeginn zufällig bestimmt.
- Du bist standardmäßig unsichtbar. Sichtbar zu sein ist mächtig, aber nur
  eine Weile möglich.
- Sichtbar bist du gefährlich für alle, die dicht bei dir stehen – dafür bist
  du langsamer.
- Der Scan zeigt dir ältere Spuren in deiner Nähe, nie die allerneuesten. Er
  steht erst später in der Runde zur Verfügung.
- Später in der Runde kannst du kurz einen Creek übernehmen.
- Survivor, die dich aus der Nähe ansehen, sehen das Bild verzerrt.
- Mehr dazu im [Spielprinzip-Beitrag](/de/blog/slender-spielprinzip).
:::
::

## Die Seiten

- Die Zahl der Seiten richtet sich nach der Spielerzahl. Immer einige liegen
  gleichzeitig auf der Karte.
- Eine Seite bleibt nur eine Weile liegen und wandert dann an eine andere
  Stelle.
- Kurz bevor eine Seite verschwindet, verrät sie sich durch Töne.

## Häufige Fragen

**Muss ich das Resource Pack wirklich annehmen?**
Ja. Ohne Pack kannst du nicht mitspielen, der Server wirft dich sonst.

**Was passiert, wenn ich gefangen werde?**
Ein Fang kann dich mit einem zufälligen Mitspieler die Plätze tauschen lassen
oder in die Luft schleudern. Tödlich ist das nie.

**Was passiert, wenn ich ausscheide?**
Du wirst Zuschauer und verfolgst die verbleibenden Survivor. Dein Körper bleibt
in der Welt liegen.
