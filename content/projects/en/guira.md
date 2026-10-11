---
slug: 'guira'
translationKey: 'guira'
title: 'Guira: Minestom library for setup flows'
summary: 'A Java library for defining your own setup flows on Minestom servers.'
status: 'active'
logo: '/images/projects/guira/icon.png'
logoAlt: 'Code excerpt from SetupDataService.java'
socialImage: '/images/projects/guira/social.png'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Minestom'
license: 'Apache-2.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Guira'
  issues: 'https://github.com/OneLiteFeatherNET/Guira/issues'
maintainers:
  - 'theevilreaper'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/guira'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/guira'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/guira'
---

## What is this?

Guira is a small Java library for [Minestom](https://github.com/Minestom/Minestom). It does not impose a fixed flow. You decide what a setup contains, such as maps, teams or rules. Guira stores and manages this data in memory.

## What a setup flow means here

- **Your own data types.** A setup is an object that implements the `SetupData` interface, with the methods `save()`, `reset()`, `loadData()` and `getId()`. For map-based setups there is the base class `MapSetupData`.
- **Management by UUID.** `SetupDataService` stores setup data under a UUID. You use `add`, `get` and `remove` to retrieve or delete it.
- **Category templates.** `SetupCategories` provides templates for the categories name, builder and spawn, each with a material and a text colour.
- **Events.** `SetupCreateEvent` and `SetupFinishEvent` mark the start and the end of a setup.

## What to know before you use it

- **Guira fires no events.** The library does not raise `SetupCreateEvent` or `SetupFinishEvent` itself. You have to fire and handle them in your plugin or application.
- **Early development (0.x).** The latest version is 0.10.6. There is no 1.0 release yet, so the API may still change between versions.
- **Minestom is not included.** The library is compiled against Minestom but does not bring it along. You choose the Minestom version yourself.
- **Java 25 is required.** The build targets Java 25.
- **Setup.** The artefact `net.onelitefeather:guira` is published to the OneLiteFeather Maven repository at `repo.onelitefeather.dev`. The source code is on GitHub under the Apache 2.0 licence.
