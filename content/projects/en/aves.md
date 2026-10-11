---
slug: 'aves'
translationKey: 'aves'
title: 'Aves: Minestom library with helper utilities'
summary: 'Helper utilities for Minestom: inventories, items, maps, files, multi-language text and general helpers.'
status: 'active'
logo: '/images/projects/aves/icon.png'
logoAlt: 'Code excerpt from GlobalInventoryBuilder.java'
socialImage: '/images/projects/aves/social.png'
releasedAt: '2025-03-25'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'AGPL-3.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Aves'
  issues: 'https://github.com/OneLiteFeatherNET/Aves/issues'
maintainers:
  - 'theevilreaper'
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/aves'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/aves'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/aves'
---

## What is this?

Aves is a Java library for Minestom that takes over recurring tasks when you build a server: reading and writing files, building inventories, creating items and maps, and showing text in several languages. It is not a plugin for Paper or any other server. It is a toolbox that you add to your Minestom project.

## What the packages provide

- **inventory** contains inventory builders for global, personal and translated inventories, paged inventories, layouts, click handlers and slot helpers.
- **item** creates items, including items with translated names and descriptions.
- **file** reads and writes files, with GSON serialisation among other things.
- **i18n** manages multi-language texts for in-game messages.
- **map** provides a base class for maps and a map provider.
- **hotbar** contains a layout for the hotbar.
- **util** collects helper functions for broadcasts, components, futures, players, positions, strings, time formats, vectors and collections.

## Who it is for

For developers who run or build a Minestom server and do not want to rewrite inventories, file handling or multi-language support each time. Titan and Cygnus, two other OneLiteFeather projects, use Aves as a dependency.

## What to know before you use it

- **Not intended for public use.** The README states that Aves is meant for internal use only and does not belong in public repositories. If you want to use it outside the project, clear that with the maintainers first.
- **The API is not fully stable.** Paged inventories, their controls and three Broadcaster methods are marked `@ApiStatus.Experimental` and may change. `InventoryLayout` must not be extended.
- **Minestom is not included.** Aves compiles against Minestom and Adventure but does not bring them along. The Minestom version is set by the OneLiteFeather Mycelium BOM that Aves imports, so check which version your build resolves.
- **Java 25 is required.** The build targets Java 25.
- **Setup.** The coordinate is `net.theevilreaper:aves`. The artefacts are published to the OneLiteFeather Maven repository, which requires credentials. The source code and release notes are on GitHub.
