---
slug: 'voyager'
translationKey: 'voyager'
title: 'Voyager: elytra racing for Minestom'
summary: 'An elytra minigame for Minecraft: players fly through rings in the sky, in cups made up of several maps.'
status: 'active'
logo: '/images/projects/voyager/icon.png'
logoAlt: 'Code excerpt from Voyager, Ring.java: the record and its checks when a ring is created'
socialImage: '/images/projects/voyager/social.png'
releasedAt: '2026-03-31'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'AGPL-3.0'
links:
  docs: 'https://github.com/OneLiteFeatherNET/Voyager/tree/main/docs'
  source: 'https://github.com/OneLiteFeatherNET/Voyager'
  issues: 'https://github.com/OneLiteFeatherNET/Voyager/issues'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/voyager'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/voyager'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/voyager'
---

## What is this?

Voyager is an elytra racing game for Minecraft, a minigame in the style of Mario Kart. You fly with elytra through rings in the sky. Players compete in cups made up of several maps and collect points by flying through the rings at high speed.

The game server runs on [Minestom](https://github.com/Minestom/Minestom) and requires Java 25. A separate setup server provides the commands and tools for building maps and cups.

## What it does

- **Elytra physics on the server.** The calculation follows the formulas of vanilla Minecraft, including the boost from fireworks.
- **Cups made up of several maps** with ring points and medals.
- **A waiting room** that starts the cup or cancels it.
- **Maps and cups as JSON** with a published JSON Schema. They are reloaded between rounds without restarting the server.
- **A setup server** with `/map` commands and a wand for placing rings.
- **Permissions** through LuckPerms and **Velocity** with modern forwarding.

## Status

Voyager is alpha software. According to the README, the first closed playtest is being prepared, so the game is not yet publicly playable. The release version numbers show how far the code has progressed, not a public launch. According to the status table, the database connection for player profiles and results, the live scoreboard and the deployment are still in progress.

## An experiment with AI agents

According to the README, the project is built through collaboration between a human and AI. A team of 24 specialised AI agents working with Claude Code designs, implements and documents it, while a human game designer sets the direction. The project is explicitly a prototype for this way of building games.

## Licence and contributing

Voyager is licensed under the GNU Affero General Public License v3.0. The documentation lives in the repository under `docs/`. The team takes bug reports and suggestions through the [issues](https://github.com/OneLiteFeatherNET/Voyager/issues).
