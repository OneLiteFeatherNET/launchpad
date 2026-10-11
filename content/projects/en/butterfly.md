---
slug: 'butterfly'
translationKey: 'butterfly'
title: 'Butterfly: Paper plugin and Minestom extension'
summary: 'A Paper plugin and Minestom extension that set scoreboard teams and chat formats from LuckPerms.'
status: 'active'
releasedAt: '2026-06-29'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Paper'
  - 'Minestom'
license: 'AGPL-3.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Butterfly'
  issues: 'https://github.com/OneLiteFeatherNET/Butterfly/issues'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/butterfly'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/butterfly'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/butterfly'
---

## What is this?

Butterfly turns LuckPerms data into what players see. For each player it reads the prefix from LuckPerms and assigns them to a scoreboard team whose prefix appears in the player list. The chat puts the same rank marker in front of the name. Butterfly is available as a Paper plugin and as a Minestom extension, which provides the same logic as a library.

## Features

- **Scoreboard teams from LuckPerms prefixes:** The teams sort themselves by a numeric prefix whose format is set by `butterfly.teams.sort-format`. The team colour comes from the group permission `color.<weight>.<colour>`.
- **Chat format:** The chat shows the sender's prefix and name. The player's head appears in front of it; this is on by default and needs clients from 1.21.9 onwards.
- **Chat tags by permission:** MiniMessage tags such as colours, gradients or click actions only take effect if the sender has the matching `butterfly.chat.tag.<type>` permission. Other tags stay as plain text.
- **Configuration:** A `config.yaml` in the data folder, written with default values on the first start.

## Requirements

- **Java 25** for both modules.
- **LuckPerms:** Butterfly is compiled against the LuckPerms API 5.6-SNAPSHOT. The project does not state a minimum LuckPerms version. On Paper, Butterfly loads after LuckPerms. As a Minestom extension, LuckPerms must run in the same host; without it, Butterfly logs an error and stays inactive.
- **Paper:** built against paper-api 26.1.2, with `api-version` 1.19 in the plugin.yml. The project does not name a tested server version.
- **Minestom:** built against Minestom 2026.09.12-26.2 and placed in the `extensions/` folder.

## Before you use it

- Butterfly is meant for internal use in the OneLiteFeather network. The README explicitly warns against using it as a finished product for the public.
- Version 2.0.0 no longer reads `flags.properties`. Settings now live in `config.yaml`. On Minestom, team collision is set there with `butterfly.teams.collision`.
- Without a `butterfly.chat.tag.*` permission, players lose the chat formatting they had before. Running `lp group default permission set butterfly.chat.tag.* true` restores the old behaviour.
