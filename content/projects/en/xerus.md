---
slug: 'xerus'
translationKey: 'xerus'
title: 'Xerus: minigame API for Minestom'
summary: 'A Java library for minigames on Minestom: kits, teams and a phase system for the flow of a round.'
status: 'active'
logo: '/images/projects/xerus/icon.png'
logoAlt: 'Code excerpt from Kit.java'
socialImage: '/images/projects/xerus/social.png'
releasedAt: '2025-03-25'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'AGPL-3.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Xerus'
  issues: 'https://github.com/OneLiteFeatherNET/Xerus/issues'
maintainers:
  - 'theevilreaper'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/xerus'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/xerus'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/xerus'
---

## What is this?

Xerus is a Java library for building minigames on [Minestom](https://github.com/Minestom/Minestom). It is not a plugin for Paper or any other server, but an API. It provides the building blocks most minigames need: kits for equipment, teams for players and a phase system for the flow of a round.

## What the library provides

- **Kits** describe what a player receives. A kit is applied to a player, and an event reports every change.
- **Teams** group players, optionally with a capacity limit. A distributor splits the players across the teams.
- **Phases** model the flow of a game: phases with a tick counter, and series of phases that run linearly or cyclically. Each phase reports its end through callbacks.
- **Events** such as `GamePreLaunchEvent`, `GameFinishEvent` and `PlayerKitChangeEvent` let you hook into the flow.
- **Language:** the library ships a German language file. If your project supports several languages, check texts against the player's language.

## Who is it for?

For developers who build minigames on Minestom and do not want to rewrite kits, teams and round flows every time. If you run a Paper server, it does not apply: the README explicitly rules out Paper.

## What to know before you use it

- **Breaking changes are listed in the CHANGELOG.** In 1.12.3 ambiguous colour constants were renamed, and the CHANGELOG marks this as a breaking change. Read it before every upgrade. `Phase.setFinishedCallback` is marked for removal; its replacements are `addFinishedCallback` and `removeFinishedCallback`.
- **Java 25 is required.** The build targets Java 25.
- **Minestom is not included.** You choose the version. Xerus 1.12.4 is built through the Mycelium BOM 1.8.9 against Minestom 2026.10.07-26.2.
- **Maven coordinates.** They are `net.theevilreaper:xerus`. The artefacts are published to the OneLiteFeather Maven repository, which requires credentials. Xerus is not available on Maven Central.
- **Documentation.** There is no dedicated documentation site. Start with the README, the Javadoc from the build and the tests in the repository.
- **In the ecosystem.** The elytra race [Voyager](/en/projects/voyager) depends on Xerus.
