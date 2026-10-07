---
slug: 'anti-redstoneclock-remastered'
translationKey: 'arcr'
title: 'Anti-RedstoneClock Remastered'
summary: 'Ein Paper-Plugin, das Redstone-Clocks erkennt, Teammitglieder im Spiel, auf Discord oder in der Konsole benachrichtigt und sie auf Wunsch abschaltet oder zerstört.'
status: 'active'
releasedAt: '2024-01-30'
updatedAt: '2026-10-07'
platforms:
  - 'Paper'
  - 'Folia'
license: 'AGPL-3.0'
links:
  docs: 'https://arcr.onelitefeather.net'
  source: 'https://github.com/OneLiteFeatherNET/AntiRedstoneClock-Remastered'
  issues: 'https://github.com/OneLiteFeatherNET/AntiRedstoneClock-Remastered/issues'
  downloads:
    - label: 'Hangar'
      url: 'https://hangar.papermc.io/OneLiteFeather/AntiRedstoneClock-Remastered'
    - label: 'Modrinth'
      url: 'https://modrinth.com/plugin/AntiRedstoneClock-Remastered'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/anti-redstoneclock-remastered'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/anti-redstoneclock-remastered'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/anti-redstoneclock-remastered'
---

## Was ist das?

Eine Redstone-Clock ist ein Bau, der sich immer wieder selbst auslöst. Anti-RedstoneClock Remastered, kurz ARCR, findet solche Clocks auf einem Paper-Server, meldet dem Team, wo sie stehen — im Spiel, per Discord-Webhook oder in der Konsole — und schaltet sie auf Wunsch ab oder zerstört sie, damit der Server seine Zeit für anderes nutzt.

Es ist ein Nachbau von Trafalcrafts antiRedstoneClock, von Grund auf neu geschrieben, mit Unterstützung für aktuelle PlotSquared- und WorldGuard-Versionen.

## So erkennt es Clocks

Das Plugin sieht sich keine Bauten an, es zählt Ereignisse. Sobald ein Block zum ersten Mal ein relevantes Ereignis auslöst — ein Kolben fährt, ein Repeater aktualisiert sich, ein Observer pulst, ein Komparator ändert sich, ein Sculk-Sensor reagiert —, beginnt das Plugin ihn zu beobachten und setzt ihm eine Frist. Erreicht der Block das Auslöse-Limit vor Ablauf der Frist, ist er eine Clock; sonst wird er vergessen. Beide Werte sind einstellbar. Hopper-Ketten zählen nur, wenn Items zwischen einem Paar hin- und herwandern, damit Sortieranlagen und Lager nicht gemeldet werden.

Bevor ein Block gezählt wird, können Filter die Prüfung beenden: die Serverlast, der Blocktyp, eine ignorierte Welt, eine WorldGuard-Region oder ein PlotSquared-Grundstück, das Clocks erlaubt.

## Was du vor dem Einsatz wissen solltest

- Ab Werk setzt das Plugin ein Warnschild und zerstört den Block. Wenn du lieber über Clocks informiert werden willst, statt sie entfernen zu lassen, schalte das automatische Zerstören ab; die Dokumentation erklärt, wie.
- Es ist kein Performance-Werkzeug. Es beseitigt, was eine Clock gekostet hat, und sonst nichts, und es pausiert die Erkennung, solange der Server nicht hinterherkommt.
- Paper und Folia werden unterstützt. Spigot, CraftBukkit, Paper-Forks und Hybrid-Server nicht. Die unterstützten Minecraft-Versionen und die benötigte Java-Version stehen in der Dokumentation.

Einrichtung, Konfiguration, Befehle und Berechtigungen findest du in der [Dokumentation](https://arcr.onelitefeather.net).
