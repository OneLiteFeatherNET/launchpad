---
slug: 'otis'
translationKey: 'otis'
title: 'Otis: Central player data for Minecraft networks'
summary: 'A Micronaut REST service that stores Mojang UUIDs, player names, languages and join times in one place.'
status: 'active'
releasedAt: '2025-08-06'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Velocity'
license: 'Apache-2.0'
links:
  source: 'https://github.com/OneLiteFeatherNET/Otis'
  issues: 'https://github.com/OneLiteFeatherNET/Otis/issues'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/otis'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/otis'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/otis'
---

## What is this?

Otis is a REST service built on [Micronaut](https://micronaut.io/). It stores player master data in a database, and plugins, extensions and services from our ecosystem query it over HTTP. Instead of every project keeping its own player data, there is one central source. Internal services can then work with players who are offline. The [blog post on player data](/en/blog/otis-central-player-data-minecraft) explains why Otis exists and how the service is built.

Otis is not a universal player database. It only stores the fields our team considers relevant.

## What Otis stores

For each player, Otis keeps the Mojang UUID, an internal UUID for managing the services in the ecosystem, the player name, the language (default `en-US`), the timestamps of the first and last join, and a map of profile textures.

The Velocity plugin creates a record when a player joins for the first time and updates it when the player joins or leaves the server.

## Interface

- `/otis` creates a profile (`POST`), reads it by UUID (`GET /byId/{owner}`) or by name (`GET /byName/{name}`), deletes it (`DELETE /delete/{owner}`) and lists all profiles (`GET /all`).
- `/search` checks whether a profile exists for a UUID or a name.

## What to know before you use it

- **Unknown players are not looked up.** If a player is not registered, a call to a third-party service would be needed. Otis cannot handle this case at the moment.
- **Otis can be unavailable.** The calling service has to handle the case where Otis cannot be reached.
- **Java 25 is required.** The build targets Java 25.
- **A Compose file starts MariaDB.** It lives in the repository under `docker/` and starts a MariaDB instance.
- **Errors follow RFC 9457.** Since version 1.17.0, Otis returns errors as problem details under RFC 9457. Clients that read error responses should check their handling.
- **Releases come regularly.** The first public release is v1.0.1 from August 2025, the latest is v1.17.0 from October 2026.
- **The README is the reference.** There is no dedicated documentation site yet.

## More in the blog

The post [Otis: Central player data for Minecraft](/en/blog/otis-central-player-data-minecraft) covers the architecture, the problems behind it and the limits of the service.
