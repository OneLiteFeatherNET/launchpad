---
slug: 'titan'
translationKey: 'titan'
title: 'Titan: Minestom lobby server'
summary: "The OneLiteFeather network lobby with Jump'n'Run, elytra boost, sitting, portals, a navigator and a lobby switcher."
status: 'active'
logo: '/images/projects/titan/icon.png'
logoAlt: 'Code excerpt from Titan, Difficulty.java: the target cost of the next jump'
socialImage: '/images/projects/titan/social.png'
releasedAt: '2025-07-09'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
  - 'CloudNet'
license: 'Apache-2.0'
links:
  docs: 'https://github.com/OneLiteFeatherNET/Titan#readme'
  source: 'https://github.com/OneLiteFeatherNET/Titan'
  issues: 'https://github.com/OneLiteFeatherNET/Titan/issues'
  downloads:
    - label: 'GitHub Releases'
      url: 'https://github.com/OneLiteFeatherNET/Titan/releases'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/titan'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/titan'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/titan'
---

## What is this?

Titan is the lobby server where players arrive on the OneLiteFeather network. It is built on [Minestom](https://github.com/Minestom/Minestom), a Java library for custom Minecraft servers, and it is made for our own use case.

## What the lobby does

- **Jump'n'Run:** A random single-player course, started from hotbar slot 0. The difficulty rises with the score. There are five modes: Easy, Medium, Hard, Rainbow and Ultra. During a run, a sidebar shows the score, the record and the top three results of the mode.
- **Navigator and portals:** Portals lead to the game servers. A portal can carry a text label with the current player count of its target.
- **Lobby switcher:** A clock in hotbar slot 8 opens a list of the running lobbies with their player counts. This exists only in the CloudNet variant.
- **Elytra boost, sitting and tickling:** Small features that make time in the lobby more pleasant.
- **Seasonal lobby:** At fixed times, a different lobby world runs, for example a winter world in December.

## Who it is for

Operators who want to run a Minestom lobby with these features, or build on one. The lobby is made of feature modules that are assembled with Avaje Inject, so a new feature can be added as its own module without changing the core.

## What to know before you use it

- **Built for our use case.** The settings, worlds and portals fit our network. Do not adopt them unchanged for another server.
- **Java 25 is required.** The build targets Java 25.
- **Two variants.** The `cloudnet` variant runs behind CloudNet with LuckPerms for permissions. The `local` variant runs standalone without a permission plugin, so every player permission check is denied.
- **A database is optional.** Without one, Jump'n'Run records are kept in memory only.
- **Extensions.** Since version 3.0, only the `cloudnet` variant loads the `extensions/` folder.

To find the server, see the [join page](/en/join). The source code is available under the Apache License 2.0 on [GitHub](https://github.com/OneLiteFeatherNET/Titan).
