---
slug: 'cyano'
translationKey: 'cyano'
title: 'Cyano: test framework for Minestom'
summary: 'A JUnit 5 testing module for Minestom servers, extracted from the no longer maintained Microtus fork.'
status: 'active'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'Apache-2.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Cyano'
  issues: 'https://github.com/OneLiteFeatherNET/Cyano/issues'
maintainers:
  - 'theevilreaper'
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/cyano'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/cyano'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/cyano'
---

## What is this?

Cyano is a testing module for Minestom servers. It comes from the testing module of the Minestom fork Microtus, which is no longer maintained, and keeps that fork's enhancements. Relevant changes from upstream Minestom are picked up as well. Cyano is a JUnit 5 extension for integration tests, not a plugin for a server.

## What you can test with it

- **Create players without coordinates.** `env.createPlayer(instance)` spawns the player at (0, 0, 0). A `TestConnection` offers the same default with `connect(instance)`.
- **Remove instances together with their players.** `env.destroyInstance(instance, true)` removes all players first. Minestom refuses to destroy an instance while players are still connected.
- **Keep existing tests.** Moving from Minestom's own testing module means replacing the annotation with `@ExtendWith(MicrotusExtension.class)`. The enhancements are opt-in; without them, behaviour stays unchanged.

## Who it is for

Developers who test Minestom servers or libraries with JUnit 5 and rely on the enhancements of the Microtus fork. If you do not need those, Minestom's own testing module is the simpler choice.

## What to know

- **Early development (0.x).** There is no 1.0 release yet. The current version is 0.7.8, released on 8 October 2026. Before 1.0 there is no stability promise, so read the changelog before every upgrade.
- **Not on Maven Central.** The coordinates are `net.onelitefeather:cyano`. The artefacts are published to the OneLiteFeather Maven repository at `repo.onelitefeather.dev`. Only releases from 0.7.4 onwards are public.
- **Java 25 is required.** The build targets Java 25.
- **Minestom follows the 26.2 line.** Version 0.7.8 updates its Minestom dependency to 2026.10.07-26.2.
