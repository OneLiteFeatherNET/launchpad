---
slug: 'ingot'
translationKey: 'ingot'
title: 'Ingot: self-hosted Maven repository manager'
summary: 'A Maven repository manager for JVM projects and a fork of Reposilite.'
status: 'active'
logo: '/images/projects/ingot/icon.png'
logoAlt: 'Code excerpt from README.md'
socialImage: '/images/projects/ingot/social.png'
releasedAt: '2026-08-08'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'JVM'
  - 'Docker'
license: 'Apache-2.0'
links:
  docs: 'https://github.com/OneLiteFeatherNET/ingot#readme'
  source: 'https://github.com/OneLiteFeatherNET/ingot'
  issues: 'https://github.com/OneLiteFeatherNET/ingot/issues'
  downloads:
    - label: 'GitHub Releases'
      url: 'https://github.com/OneLiteFeatherNET/ingot/releases'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/ingot'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/ingot'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/ingot'
---

## What is this?

Ingot stores, serves and mirrors build artefacts for Maven-based projects in the JVM ecosystem. It speaks the standard Maven HTTP protocol, so `mvn deploy` and `gradle publish` work without a custom plugin. Ingot runs as a single JVM process with a small footprint.

## A fork of Reposilite

Ingot is a fork of [Reposilite](https://github.com/dzikoysk/reposilite) by dzikoysk and contributors, released under the Apache-2.0 license. The foundation of the server comes from the Reposilite project. Ingot has its own releases, its own maintainers and its own version line starting at 1.0.0. It is not affiliated with Reposilite and is not endorsed by its authors. Copyright and change notices are in the [NOTICE file](https://github.com/OneLiteFeatherNET/ingot/blob/main/NOTICE).

## What changes compared with Reposilite

- **Name and artefacts:** The product is called Ingot. The build produces `ingot-*.jar` and publishes under `net.onelitefeather.ingot`. Java packages and module folders stay `reposilite-*` and `com.reposilite.*`, so existing Reposilite plugins still compile.
- **Docker image:** `ghcr.io/onelitefeathernet/ingot` is a drop-in replacement for the Reposilite image, with the same entrypoint, paths and environment variables. `INGOT_OPTS` is new; `REPOSILITE_OPTS` is still read. The dashboard can run in its own container.
- **Version line:** Ingot counts from 1.0.0, independently of Reposilite 3.5.28, the version the sources came from. According to the project, the feature set matches 3.5.28.
- **Dashboard:** Version 1.1.0 moved the dashboard to Tailwind CSS v4, and the root listing now reports each repository's visibility.

## What to know before you use it

- **Java 17 or newer** is required for the JAR. The Docker image ships Java 21.
- **Hosted and proxy repositories:** Hosted `releases`, `snapshots` and `private` repositories are built in. Remote repositories can be mirrored, and fetched artefacts can optionally be stored locally.
- **Documentation:** The guides are Markdown files in the repository under `reposilite-site/data/guides`. A published documentation site does not exist yet.
- **Setup:** The [quickstart](https://github.com/OneLiteFeatherNET/ingot#quickstart) covers running from source and with Docker Compose.
