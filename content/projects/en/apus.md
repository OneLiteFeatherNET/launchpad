---
slug: 'apus'
translationKey: 'apus'
title: 'Apus: BlueMap maps for Minecraft worlds on Kubernetes'
summary: 'Renders Minecraft worlds with BlueMap on Kubernetes and hosts the finished maps.'
status: 'active'
audience: 'internal'
logo: '/images/projects/apus/icon.png'
logoAlt: 'Code excerpt from bluemapmaps.bluemap.onelitefeather.net-v1.yaml'
socialImage: '/images/projects/apus/social.png'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Kubernetes'
  - 'Paper'
license: 'AGPL-3.0'
links:
  docs: 'https://github.com/OneLiteFeatherNET/Apus#readme'
  source: 'https://github.com/OneLiteFeatherNET/Apus'
  issues: 'https://github.com/OneLiteFeatherNET/Apus/issues'
maintainers:
  - 'themeinerlp'
  - 'theevilreaper'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/apus'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/apus'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/apus'
---

## What is this?

Apus renders Minecraft worlds with [BlueMap](https://bluemap.bluecolored.de/) on Kubernetes and hosts the finished maps. The worlds come from very different sources. An ETL layer brings them into one normalised format, an operator runs the render and hosting jobs, and a user interface shows progress, so nobody has to write YAML by hand.

At the centre is the **World Bundle**: an immutable, normalised snapshot of a world in S3. On the input side, the ingest layer knows nothing about BlueMap. On the output side, rendering and hosting know nothing about Pterodactyl or ZIP uploads.

## What it does

- **Several sources:** connectors for S3, Pterodactyl, push and ZIP uploads. A new source only needs an implementation of `WorldSourceConnector`.
- **Kubernetes operator:** six custom resources. The operator creates jobs, deployments, ingresses and buckets.
- **Rendering and hosting apart:** the renderer runs as a job. The hosting server reads the finished maps from S3.
- **Visible progress:** a BlueMap addon exposes render progress as JSON and as Prometheus metrics.
- **Interface and API:** a Nuxt 4 interface for tenants and a management console, backed by a REST and SSE API built with Micronaut.
- **Paper plugin:** `paper-worldpush` sends worlds from a running Paper server directly to Apus.

## Who it is for

For networks and communities that want to publish many worlds as maps and already run a Kubernetes cluster.

## What to know before you use it

- **Early development (0.x).** The current version is 0.9.1. Interfaces, CRDs and configuration can change between minor versions. There is no stable 1.0 yet.
- **Kubernetes is required.** The operator needs a cluster.
- **JDK 25 to build.** The Gradle build needs JDK 25. The interface also needs pnpm, and the integration tests need Docker.
- **Documentation.** The guide is in the README. The design is described in the specification in the repository under `docs/superpowers/specs/`.
