---
title: 'From 1.0 to 3.0: fifteen months of Titan, our lobby server'
alternativeTitle: 'A retrospective on 67 releases, 696 commits and one rebuild'
description: 'A look back at Titan, our open-source Minestom lobby server: from the 1.0 release in July 2025 through the 2.x features to the 3.0 platform split, and what comes next.'
pubDate: '2026-10-13'
releaseDate: '2026-10-13T10:00:00+02:00'
headerImage: 'images/og/blog-en.png'
headerImageAlt: 'Titan: retrospective from version 1.0 to 3.0'
slug: 'titan-from-1-0-to-3-0'
translationKey: 'titan-1-0-to-3-0'
tags:
  - minecraft
  - titan
  - retrospective
author: themeinerlp

canonical: 'https://onelitefeather.net/en/blog/titan-from-1-0-to-3-0'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/titan-von-1-0-bis-3-0'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/titan-from-1-0-to-3-0'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/titan-from-1-0-to-3-0'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'From 1.0 to 3.0: fifteen months of Titan, our lobby server'
    alternativeHeadline: 'A retrospective on 67 releases, 696 commits and one rebuild'
    description: 'A look back at Titan, our open-source Minestom lobby server: from 1.0 in July 2025 to the 3.0 platform split.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-10-13T00:00:00+00:00'
---

## Preface

When you join OneLiteFeather, the first thing you see is [Titan](/en/projects/titan), our lobby server. It is open source (Apache-2.0), written in Java and built on [Minestom](https://minestom.net), a lightweight Java library for writing Minecraft servers from scratch. This post looks back at everything that happened between Titan 1.0.0 in July 2025 and Titan 3.0.1, released on October 10, 2026.
<!--more-->

## By the numbers

- **67 GitHub releases**, 23 of them stable, from v1.0.0 to v3.0.1
- **696 commits**
- **9 → 285 test classes**
- **4 → 25 Gradle modules**
- **5 human contributors**: @TheMeinerLP, @theEvilReaper, @Joltras, @yannicklamprecht and the OneLiteFeather account, plus a busy Renovate bot

## Version 1: from a simple lobby to a networked one (July 2025 – September 2026)

Titan 1.0 was a small Minestom lobby: four modules, nine test classes, Java 24. The 1.x series grew into 55 releases and laid the foundation:

- **Elytra boost**, first introduced in 1.5 and made vanilla-accurate with fireworks in 1.14.
- **LuckPerms integration** (1.8–1.10), so ranks and permissions work in the lobby the same way they do on the rest of the network.
- **Java 25** from 1.9 onwards.
- **Deep CloudNet integration** (1.11–1.13): a CloudNet extension bootstrap, a LuckPerms-backed permission checker for CloudNet, clean shutdowns, and server switching routed through the bridge.
- **An AOT cache** for faster startup, and automated releases with release-please.

## Version 2: a rebuilt lobby, and lots to do in it (September 29 – October 10, 2026)

**2.0.0 was a rewrite of the internals.** Titan was split into independent *feature columns*, one Gradle module per feature, wired together with [Avaje Inject](https://avaje.io/inject/) and configured through avaje-config profiles in a single `application.yaml`. Our own hand-written module platform was replaced by plain dependency injection: less code, fewer surprises.

On top of that foundation, 2.x shipped one player-facing feature after another in under two weeks:

- **Portals** you walk or fly through to switch servers (2.0), with **live player counts** on their labels (2.1).
- **Seasons**: the lobby restarts into a seasonal world at fixed times (2.0).
- **Daytime that follows the real clock** (2.0).
- **A lobby jump'n'run** (2.2) with randomly generated courses, per-mode high scores and a top-3 sidebar (2.3). It gained stairs, carpets, snow, heads, flower pots and candles as landing blocks (2.5), and climbing segments with ladders, vines and towers that grow with your score (2.6). The difficulty follows a smooth curve: `level = 1 − e^(−score / scale)`. Thanks to community feedback, *medium* no longer throws narrow fence-and-candle jumps at you.
- **`/spawn`** and a spawn entry in the navigator (2.3).
- **A lobby switcher** (2.6): a clock in your hotbar lists every lobby with its player count.

![A player jumps along the lobby jump'n'run in easy mode: single landing blocks hang in open sky between floating islands](/images/blog/titan-lobby-jump-and-run.webp){width="1600" height="843"}

Behind the scenes, 2.4 added **OpenTelemetry tracing and metrics**, so we can see what is slow before you notice it. 2.6 also brought a **boot smoke test**: CI now starts the shipped jar with the real configuration. It is a direct consequence of an incident on release day, when a library update passed the build and every unit test but kept the lobby from starting.

## Version 3: one core, several platforms (October 10, 2026)

**3.0.0 is a breaking change for anyone running Titan themselves.** Startup now goes through a small `ServerBootstrap` contract, selected via Java's `ServiceLoader`, and Minestom extensions, CloudNet and LuckPerms each live in their own **platform module**. 3.0.1 followed the same evening and translated the lobby switcher into German and English. The details follow in two deep-dive posts: on October 20 about the 3.0 platform split, and on October 27 about why green tests did not mean a lobby that boots.

## What's next

Several improvements are already in review:

- In the navigator, left-click to connect and right-click to teleport in front of the matching portal.
- Live player counts for every mode in the navigator.
- A fix that reports each lobby's real player limit to CloudNet.

## Get involved

Titan is developed in the open, like the rest of our Minestom ecosystem, for example [Aves](/en/projects/aves), which powers Titan's menus, and [Falco](/en/projects/falco), our Anvil chunk loader and lighting engine.

- Code: [OneLiteFeatherNET/Titan on GitHub](https://github.com/OneLiteFeatherNET/Titan)
- Releases: [Titan releases](https://github.com/OneLiteFeatherNET/Titan/releases)
- Changelog: [CHANGELOG.md](https://github.com/OneLiteFeatherNET/Titan/blob/main/CHANGELOG.md)

If you enjoy the lobby, the jump'n'run or our open-source work, you can support the servers and development time behind it on [OpenCollective](https://opencollective.com/onelitefeather). Bug reports, ideas and pull requests are just as welcome, and a lot of the 2.x features started as player feedback. See you in the lobby!
