---
slug: 'anti-redstoneclock-remastered'
translationKey: 'arcr'
title: 'Anti-RedstoneClock Remastered'
summary: 'A Paper plugin that detects redstone clocks, alerts staff in game, on Discord or in the console, and can optionally disable or destroy them.'
status: 'active'
logo: '/images/projects/arcr.webp'
logoAlt: 'ARCR logo: a red redstone-style loop with a gap, broken by a glowing cyan star'
releasedAt: '2024-01-30'
publishedAt: '2026-10-07'
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

## What is this?

A redstone clock is a build that keeps triggering itself. Anti-RedstoneClock Remastered, ARCR for short, finds such clocks on a Paper server, tells staff where they are — in game, through a Discord webhook or in the console — and, if you want it to, disables or destroys them so the server spends its time on something else.

It is a re-creation of Trafalcraft's antiRedstoneClock, rewritten from scratch with support for current PlotSquared and WorldGuard versions.

## How it detects clocks

The plugin does not look at builds, it counts events. The first time a block produces a relevant event — a piston firing, a repeater updating, an observer pulsing, a comparator changing, a sculk sensor reacting — the plugin starts observing it and gives it a deadline. A block that reaches the trigger limit before the deadline is a clock; a block that does not is forgotten. Both numbers are configurable. Hopper chains are only counted when items travel back and forth between a pair, so sorters and storage systems are not reported.

Before a block is counted, filters can end the check: the server load, the block type, an ignored world, a WorldGuard region or a PlotSquared plot that allows clocks.

## What to know before you use it

- Out of the box the plugin places a warning sign and breaks the block. If you would rather be told about clocks than have them removed, switch automatic breaking off; the documentation explains how.
- It is not a performance tool. It removes what a clock was costing and nothing else, and it pauses detection while the server is not keeping up.
- Paper and Folia are supported. Spigot, CraftBukkit, Paper forks and hybrid servers are not. The supported Minecraft versions and the required Java version are listed in the documentation.

Setup, configuration, commands and permissions are covered in the [documentation](https://arcr.onelitefeather.net).
