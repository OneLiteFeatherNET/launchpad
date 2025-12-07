---
title: 'Otis: Central player data for Minecraft (Java & Micronaut)'
alternativeTitle: 'Mojang UUID v4, internal UUID v7, name & language as a stable base for the ecosystem'
description: 'Otis provides central player master data: Mojang UUID (v4), internal UUID (v7), Minecraft name, language, and optionally first/last join. This cuts manual one-off processes, supports GDPR-oriented data flows, and forms the foundation for downstream services like metadata, bans, and Discord bots.'
pubDate: '2025-11-29'
headerImage: 'images/blog/otis-player-data-header.png'
headerImageAlt: 'Otis Microservice: central Minecraft player data (Java, Micronaut)'
slug: 'otis-central-player-data-minecraft'
translationKey: 'otis'
tags:
  - minecraft
  - data
  - microservices
author: phillipp-glanz

canonical: 'https://onelitefeather.net/en/blog/otis-central-player-data-minecraft'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/otis-zentrale-spielerstammdaten-minecraft'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/otis-central-player-data-minecraft'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/otis-central-player-data-minecraft'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'Otis: Central player data for Minecraft'
    alternativeHeadline: 'Java/Micronaut microservice for UUIDs, name, and language'
    description: 'Central player data as an interface in the ecosystem: fewer manual data islands, clearer responsibilities, and a base for reliable services.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2025-11-29T00:00:00+00:00'

---
## Preamble

Modern Minecraft server ecosystems often lack a reliable central point of truth for player information. Developers must frequently retrieve the same data from scattered sources or—even worse—reimplement their own redundant systems. This leads to data duplication, inconsistent states, and incomplete data deletion, which can conflict with privacy law requirements and make daily development unnecessarily complicated.

Administrators also face challenges without centralized data: cross-server punishments become harder to manage, players changing their names become difficult to track, and communication across teams is slowed down.

The reasons behind decentralized data aren't purely technical. Social and organizational factors often play just as large a role. At the start of a project, teams are small or rely on third‑party plugins with their own data models. Developers work independently, often without alignment on common standards. As a result, different minigames—such as “Bedwars” and “SkyPvP”—may all store nearly identical information:

- Username and UUID
- IP address
- Language preferences
- Player textures
- Kills, deaths, and scoreboards
- Global currency values

This fragmentation grows as teams expand, developers come and go, and documentation gaps widen. Attempts to introduce “core” plugins often fail because they grow too large, too intrusive, or too tightly coupled with specific server platforms like Paper, Spigot, or Minestom. These systems are difficult to maintain, prone to breaking changes, and rarely attractive to developers who simply need clean, centralized player data.

Technically, additional barriers arise from missing shared knowledge, lack of API standards, and inconsistent experience within teams. Without agreed-upon architectural patterns, centralized systems become complex, unscalable, or unusable because they require intimate knowledge of internal processes. All of this results in poor API design.

**TL;DR:** A successful central data service depends not only on technology but also on social alignment and shared understanding. Clear communication is the real foundation.

Otis does not aim to be a universal player database for every Minecraft scenario. Instead, it centralizes the specific set of data our team considers essential. However, even the best central service only works when newcomers are introduced to it before they start implementing new systems.

An alternative approach using a shared SQL or NoSQL database was considered, but it fails to prevent duplication problems (e.g., “BUUID” fields in minigames), lacks standardized archival strategies, and still requires a heavy amount of specialized knowledge. No existing open‑source alternative met our needs.

---

## The Problem

A modern Minecraft network without Otis faces several systemic issues:

### **1. No single source of truth**
Developers must query multiple databases, plugins, or APIs just to resolve basic facts like UUID to username mappings. This multiplies maintenance work and creates hidden dependencies.

### **2. Scattered and duplicated data**
Different plugins store the same data repeatedly. Deleting or updating information becomes nearly impossible to do globally.

### **3. Inconsistent data retention and GDPR concerns**
Without a central deletion point, removing player data according to regulations becomes complex and error‑prone.

### **4. Fragile infrastructure**
Interdependent systems break easily when one data source is migrated or updated.

### **5. Social and organizational misalignment**
Teams rarely have consistent standards, shared knowledge bases, or coordinated API design processes.

### **6. High developer turnover**
Knowledge gets lost. Systems drift apart. Documentation lags behind.

All these points create friction, slow development, and increase operational risk.

---

## The Solution: Otis

Otis is a platform‑agnostic, stateless microservice built with Java and Micronaut. It provides a layered architecture and a clean REST interface that centralizes essential player master data.

Otis automatically manages:

- Mojang UUID (v4)
- Internal ecosystem UUID (v7)
- Minecraft username
- Preferred language
- First join timestamp
- Last join timestamp

### **Why UUID v4 and UUID v7?**
- **UUID v4** matches Mojang’s format for external consistency.
- **UUID v7** is used internally for improved indexing, time-ordering, and ecosystem‑wide uniformity without exposing internal identifiers publicly.

---

## Architecture

Otis follows a three‑layer, stateless microservice architecture:

### **1. DTO & Controller Layer**
- Contains OpenAPI‑annotated DTOs.
- Auto‑generates documentation and ensures strong contract boundaries.
- Performs input validation (e.g., username length, timestamp checks).
- Returns explicit, structured errors without exposing stack traces.

### **2. Service Layer**
- Acts as the business logic unit.
- Validates, enriches, or transforms data before database persistence.
- Sets internal fields not exposed externally.
- Serves as the “switchboard” connecting input to internal processes.

### **3. Repository / Data Layer**
- Stores all entities and database queries.
- Defines strict structure for consistent data storage and retrieval.

### **4. Client & Plugin Integration**
- An autogenerated client (via OpenAPI) ensures minimal manual work.
- A Velocity plugin consumes the client to bring Otis functionality into the Minecraft proxy environment.
- Platform independence ensures future compatibility with Paper, Minestom, Fabric/Forge, Bedrock, etc.

---

## Scalability & Stateless Design

Because Otis is stateless, each request directly interacts with the database. This keeps the service simple and predictable but introduces performance considerations:

- Databases should respond within **5–15 ms** to ensure smooth operation.
- All instances must share a distributed cache to support horizontal scaling effectively.
- Vertical scaling is discouraged; horizontal scaling is the preferred method.

Without caching, database contention may increase under heavy load. Horizontal scaling—running multiple Otis instances—is the intended approach for production setups.

---

## Limitations

Otis does not attempt to store all possible player‑related data. It intentionally focuses on a minimal, high‑value subset. Specialized services (e.g., metadata service, ban service, analytics) are expected to build on top of Otis rather than overload it.

Otis also cannot solve communication problems: teams must still align on how to use it. New developers must be onboarded early so they do not reinvent their own player data systems.

---

## Conclusion

Otis provides a clean, scalable, maintainable foundation for player master data inside a Minecraft ecosystem. By centralizing essential information, it reduces duplication, simplifies development, improves GDPR compliance, and decreases operational risk across the network.

It is not a one‑size‑fits‑all solution for every scenario, but it creates the stability needed for reliable downstream services. As we continue building additional components, Otis serves as the backbone of a modern, maintainable infrastructure.

Feedback is always welcome, and discussions around Otis happen openly on Discord.

---

## Project Links

- Repository: https://github.com/OneLiteFeatherNET/Otis
- Issue Tracker: https://github.com/OneLiteFeatherNET/Otis/issues
- Discord: https://discord.onelitefeather.net
- Releases: https://github.com/OneLiteFeatherNET/Otis/releases  