---
title: 'Otis: Central player data for Minecraft (Java & Micronaut)'
alternativeTitle: 'Stable Mojang UUID v4, internal UUID v7, name, and language storage for our ecosystem'
description: 'Otis serves central player data: Mojang UUID v4, internal UUID v7, name, language, first/last login date. This helps reduce manual microprocesses, supports GDPR-oriented data structures and creates a foundation for more specialized services like general metadata or bans and for use in Discord bots.'
pubDate: '2025-11-29'
headerImage: 'images/blog/otis-player-data-header.png'
headerImageAlt: 'Otis Microservice: central Minecraft player data (Java, Micronaut)'
slug: 'otis-central-player-data-minecraft'
translationKey: 'otis'

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
    description: 'Central player data interface inside an ecosystem: less manual microprocesses, clearer responsibilities, and a good foundation for reliable services.'
    author:
        type: 'Person'
        name: 'Phillipp Glanz'
    datePublished: '2025-11-29T00:00:00+00:00'
---# Introduction to the Otis project

---

## Preamble

From a developers point of view, there lacks a single source of data (a so-called [Single source of Truth](https://de.wikipedia.org/wiki/Single_Point_of_Truth)) for easy retrieval of essential player data required for UUID to name conversion and further usage in internal, independent data. Because of this, developers are forced to retrieve required data from various sources (including own or third-party databases or services) or implement their own solutions. When working in a team, this leads to the possibility of losing track of already stored data, which may lead to duplicate data storing and incomplete deletion of data, as not all cases may be covered. Complex errors and dependencies are another result. This leads to a scattered infrastructure where even system administrators may lose track.

Without Otis, even administrators and moderators may have a hard time keeping everything organized. This includes harder networkwide punishment management of players or recognition and handling of players whose username has been changed, which may hinder communication between such players, the server team, and other players.

The development of a non-centralized data store might not be caused because of technical issues. Environmental changes may also be a cause. For example, at the start of a new project, none or only a small number of developers may be part of the team, which means that third-party solutions (such as external plugins) may be used, or in the case of multiple developers working on separate projects, solutions may be developed concurrently. These developers oftentimes do not communicate to choose a standardized solution. For example, the minigames "Bedwars" and "SkyPvP" may require the same data:

* Username and UUID
* IP address
* Language preference
* Player textures
* Kills and deaths for display in the game's scoreboards
* Some sort of score
* Global game balance / other currencies

Usually, developers have their hands full due their own projects and may not be aware of what another member of the team is already storing, which oftentimes means no central interface will be agreed upon. However, if a central solution does get thought out, it is usually contained in another "core" plugin, which results in a hard dependency. Each developer must ensure their existence and due to the tendency to include non-essential features may exceed their use as just a central interface for data storage. Since these need to be kept up-to-date separately, updates can introduce breaking changes. This furthermore results in developers not wanting to use such a system, as they do not want to have to wait for it to update first, which prompts them to implement their own solution regardless. From our observations, attempts to centralize data and code sources may also fail due to big fluctuations in the development team and a common lack of a documentation.

Technical difficulties of implementing a central player data system may include a lack of common knowledge by the implementing developers, resulting in missing (API) standards. Such standards are important for future development, as the lack of such may result in inconsistent and coherently bad practices. The core interface may end up very complex, not scalable, or plain unusable, as it may require knowledge of internal processes (→ bad API design).

The exact definition of this expertise is not part of this blog, however we will limit ourselves on the knowledge about technologies and standards used by us outside the Minecraft "cosmos".

**TL;DR: A central service is independent of professional, technical, and social decisions and knowledge. The first step toward it is good communication!**

Otis does not solve the requirement of universally applicable player data databases. It only stores data considered by us as a team as relevant. It also does not solve the issue of missing communication. It is important to make clear that Otis a solution by us is, which should be used. Newcomers must be made aware and instructed on Otis **before** they implement their own minigames or ideas which may require common player data.

An alternative to Otis might be a central NoSQL database which can be used by other plugins (clients) to retrieve required data. This however fails to requirement of non-duplicate data (use of differently-named fields, like BUUID as Bedwars UUID) and data archive. We were not able to find other open-source alternatives which we could use for our systems and uses.

---

### The Solution
