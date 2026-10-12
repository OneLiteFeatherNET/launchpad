---
title: 'Titan 3.1: Live-Zahlen im Navigator und ein korrigierter Lobby-Switcher'
alternativeTitle: 'Linksklick verbindet, Rechtsklick bringt dich zum Portal'
description: 'Titan 3.1 ist live in der Lobby: Linksklick verbindet, Rechtsklick führt zum Portal, der Navigator zeigt Live-Spielerzahlen pro Modus und der Lobby-Switcher zeigt die echten Limits.'
pubDate: '2026-10-14'
releaseDate: '2026-10-14T18:00:00+02:00'
headerImage: 'images/og/blog-de.png'
headerImageAlt: 'Titan 3.1: Navigator und Lobby-Switcher'
slug: 'titan-3-1-navigator-und-lobby-switcher'
translationKey: 'titan-3-1'
tags:
  - minecraft
  - titan
  - release
author: themeinerlp

canonical: 'https://onelitefeather.net/de/blog/titan-3-1-navigator-und-lobby-switcher'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/titan-3-1-navigator-und-lobby-switcher'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/titan-3-1-navigator-and-lobby-switcher'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/titan-3-1-navigator-and-lobby-switcher'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'Titan 3.1: Live-Zahlen im Navigator und ein korrigierter Lobby-Switcher'
    alternativeHeadline: 'Linksklick verbindet, Rechtsklick bringt dich zum Portal'
    description: 'Titan 3.1 ist live in der Lobby: Links- und Rechtsklick im Navigator, Live-Spielerzahlen pro Modus und ein Lobby-Switcher mit echten Limits.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-10-14T00:00:00+00:00'
---

[Titan](/de/projects/titan) 3.1.0 ist jetzt live in der Lobby. Veröffentlicht wurde die Version am 12. Oktober 2026. Die spürbarsten Änderungen stecken im Navigator und im Lobby-Switcher. Alle Details findest du im [v3.1.0-Release](https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.1.0). Wie wir hierhergekommen sind, erzählt unser [Rückblick](/de/blog/titan-von-1-0-bis-3-0).
<!--more-->

## Navigator: Linksklick zum Verbinden, Rechtsklick zum Portal

Die Feder im Hotbar-Slot 4 ist dein Navigator, und er reagiert jetzt auf beide Klicks:

- **Linksklick** auf einen Modus verbindet dich direkt mit dessen Server.
- **Rechtsklick** teleportiert dich in der Lobby direkt vor das passende Portal, mit Blick darauf. Gibt es für einen Modus kein Portal, verbindet dich der Rechtsklick ebenfalls direkt.

Die Trennung in Links- und Rechtsklick kam aus der Community. Danke an alle, die danach gefragt haben.

## Live-Spielerzahlen pro Modus

Unter jedem Modus zeigt der Navigator jetzt „N online“ an. Die Zahl addiert die Spieler auf allen Servern dieses Modus und aktualisiert sich alle 5 Sekunden. So siehst du, wo gerade etwas los ist, bevor du dich für ein Portal entscheidest.

## Lobby-Switcher: kein „Voll (2/1)“ mehr

Die Uhr im Hotbar-Slot 8 ist der Lobby-Switcher. Manche Lobbys wurden fälschlich als voll angezeigt, etwa mit „Voll (2/1)“. Der Grund war ein Timing-Problem: CloudNet las das Spielerlimit einmal beim Start aus, noch bevor Titan es setzen konnte, und übernahm den Standardwert von Minestom („online + 1“). Titan meldet CloudNet jetzt ein festes Limit, standardmäßig 100. Der Switcher zeigt damit den echten Stand jeder Lobby.

## Hinter den Kulissen

Außerdem haben wir die Abhängigkeit aonyx-bom auf Version 0.8.9 aktualisiert.

## Probier es aus

Geh in die Lobby, öffne die Feder und klick mit rechts auf einen Modus, um direkt vor sein Portal zu springen. Schreib uns auf [unserem Discord](https://1lf.link/discord), was gut funktioniert und was nicht. Wir freuen uns auf dein Feedback. Bis gleich in der Lobby!
