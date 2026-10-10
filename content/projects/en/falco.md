---
slug: 'falco'
translationKey: 'falco'
title: 'Falco: Minestom library for chunks and lighting'
summary: 'An Anvil chunk loader, a light engine and an instance implementation for Minestom.'
status: 'active'
releasedAt: '2026-07-31'
publishedAt: '2026-10-10'
updatedAt: '2026-10-10'
platforms:
  - 'Minestom'
license: 'AGPL-3.0'
links:
  docs: 'https://docs.onelitefeather.net/falco'
  source: 'https://github.com/OneLiteFeatherNET/Falco'
  issues: 'https://github.com/OneLiteFeatherNET/Falco/issues'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/falco'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/falco'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/falco'
---

## What is this?

Falco is a set of Java libraries for [Minestom](https://github.com/Minestom/Minestom), not a plugin for Paper or any other server. It has three modules that work on their own: an Anvil chunk loader, a block and sky light engine, and an instance implementation that releases its chunks when it is unregistered.

## What the modules do

- **falco-anvil** reads and writes Anvil worlds. Reading, decompression and NBT parsing run in parallel. If a read fails, the loader throws instead of reporting the chunk as missing, so the server cannot overwrite stored data with a freshly generated chunk. Worlds older than snapshot 21w43a are refused.
- **falco-light** calculates block and sky light. Each call is thread-safe, and the engine is not tied to a particular chunk implementation.
- **falco-instance** provides an `Instance` and its `Chunk`. Unregistering it unloads every chunk it loaded. Minestom's `InstanceManager.unregisterInstance` only unloads the chunks of an `InstanceContainer`; for other instances it leaves chunks, tick partitions and entities behind. Falco makes no claim of a speed gain for this module.

## What to know before you use it

- **The API is experimental.** Every public type carries `@ApiStatus.Experimental`, and signatures and behaviour may change in a minor release.
- **Java 25 is required.** The build targets Java 25.
- **Minestom is not included.** The artefacts compile against Minestom but do not bring it along, so you choose the version. Release 3.0.0 is built against Minestom `2026.08.28-26.2` and does not run on `26.1.2`.
- **The performance figures are measurements, not promises.** The README quotes benchmark results. In one run the Anvil loader read chunks 1.9 times faster than Minestom's own loader on two threads, but a second run did not reproduce that factor. The light engine was 1.11 to 1.71 times faster across six scenarios. All figures were taken before the move to Minestom 26.2 and have not been measured again on it.
- **Setup.** The [quick start](https://docs.onelitefeather.net/falco/tutorials/load-your-first-world-with-falco), the [Maven coordinates](https://docs.onelitefeather.net/falco/how-to-guides/how-to/add-falco-to-your-build) and the [build instructions](https://docs.onelitefeather.net/falco/how-to-guides/how-to/build-falco-from-source) are in the documentation. The artefacts are published to the OneLiteFeather Maven repository at `repo.onelitefeather.dev`.
