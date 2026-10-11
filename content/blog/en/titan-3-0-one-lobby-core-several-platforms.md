---
title: 'Titan 3.0: one lobby core, several platforms'
alternativeTitle: 'Why server startup became a swappable platform'
description: 'Titan 3.0 separates the lobby core from server startup: Minestom extensions are now just one platform among several. What changed, why, and what was hard.'
pubDate: '2026-10-20'
releaseDate: '2026-10-20'
headerImage: 'images/og/blog-en.png'
headerImageAlt: 'Titan 3.0: lobby core with swappable platforms'
slug: 'titan-3-0-one-lobby-core-several-platforms'
translationKey: 'titan-3-0-platforms'
tags:
  - minecraft
  - titan
  - architecture
author: themeinerlp

canonical: 'https://onelitefeather.net/en/blog/titan-3-0-one-lobby-core-several-platforms'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/titan-3-0-lobby-kern-mehrere-plattformen'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/titan-3-0-one-lobby-core-several-platforms'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/titan-3-0-one-lobby-core-several-platforms'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'Titan 3.0: one lobby core, several platforms'
    alternativeHeadline: 'Why server startup became a swappable platform'
    description: 'Titan 3.0 separates the lobby core from server startup: Minestom extensions are now just one platform among several.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-10-20T00:00:00+00:00'
---

## Preface

Titan is the Minestom server that runs our lobby. It is where players arrive before they move on to a minigame: portals, navigator, spawn, sitting, Jump'n'Run and, since recently, a lobby switcher. The code lives in the [Titan repository](https://github.com/OneLiteFeatherNET/Titan) and is built with Gradle.

On 10 October 2026, versions 2.6.0 and 3.0.0 were released, and 3.0.1 followed the same day. 3.0.0 is a breaking change, because the way the lobby starts has changed fundamentally. This post describes the old state, the path to the new one, what was hard, and what we take away from it. The second part of the series covers what happened when the update started running.
<!--more-->

## Before: one startup for both variants

Titan has two variants. `apps/cloudnet` runs in production under CloudNet, and `apps/local` is meant for development on your own machine. Up to version 2.6.0, both shared the same entry point. `TitanApplication.main` always created an `ExtensionBootstrap` from minestom-extensions, loaded the `extensions/` folder, built the feature core, and started the server last. The `runtime` depended directly on that library. The local variant loaded extensions it did not need either.

In production the extensions are really needed, because the CloudNet bridge and the Titan bridge run as Minestom extensions. Locally, they cost startup time and bring in dependencies nobody uses. There was also a tight coupling: the LuckPerms module asked the extension manager directly (`ExtensionBootstrap.getExtensionManager()`), even where no loader existed at all.

The state before 3.0, in short:

- `runtime`: entry point and startup order, dependent on minestom-extensions
- `features/*`: lobby functions as their own Gradle modules
- `core`, `common`, `persistence`, `bridge`, `setup`: shared interfaces, database, bridge and setup
- `apps/cloudnet`, `apps/local`: the two variants

## After: one contract, three paths

In the new model, the `core` module holds a contract, `ServerBootstrap`, with four methods: `name()`, `init(Auth)`, `start(host, port)` and `loadedExtensions()`. At startup, the `runtime` selects the bootstrap through the `ServiceLoader`:

- No platform found: plain Minestom without extensions.
- Exactly one found: that one is used.
- Several found: startup fails with an error message that names all of them.

The platforms are separate modules:

- `platform/extensions`: the implementation of the contract on top of minestom-extensions, registered through `META-INF/services`
- `platform/cloudnet`: player delivery over the CloudNet message channel, active when the service directory contains a `.wrapper` folder
- `platform/luckperms`: reads the loaded extensions through the injected bootstrap instead of the library

Each variant decides which platform it includes. `apps/cloudnet` brings in extensions and CloudNet, while `apps/local` starts without the extension loader. `TitanStartup` also fixes the order: initialise the server first, then install the exception handler, then build the bean scope, and only then start the server. That way no player can enter a half-built lobby.

## The path there

The rebuild was not a single step. Between 25 September and 10 October we built it as a chain of merged PRs:

- **25 September:** #292 rebuilds the lobby around feature modules (about 15,000 lines added, 3,600 removed). #297 and #301 move configuration into `application.yaml` with profiles and onto the avaje-config facade.
- **27 September:** #304 reloads configuration at runtime. #306 consolidates the navigator destinations into one Aves module (877 lines added, 2,523 removed). #308 replaces our own module platform with Avaje Inject beans (3,877 added, 4,755 removed).
- **28 September:** #312 splits Titan into `features/*` and app variants, and #313 binds permissions through an optional DI module.
- **4 and 10 October:** OpenTelemetry tracing for lobby functions (#362, #363, then #389 to #395).
- **10 October:** #398 starts the shipped jar in a test, #403 closes the bean scope when startup fails, and #407 turns the extension bootstrap into a platform.

PR #407 alone touches 50 files, with +1,216 and −132 lines across six commits. Between the tags 2.6.0 and 3.0.0 there are only two commits; the real work sits in the chain before. From 2.0.0 to 3.0.0 there are 74 commits in total. Since 20 September, nine commits on the main branch carry the breaking-change marker `!`.

The lobby switcher, a clock in hotbar slot 8 that shows other lobbies with their player counts, arrived with 2.6.0 and is not part of 3.0.0. With 3.0.1, the clock's name is rendered per player locale; before, it was fixed once in English.

## What was hard

Three points were hard while we were building it.

**Deviations from the design.** The OpenSpec design from version 2.6.0 planned a second Avaje scope for choosing the platform. We implemented a `ServiceLoader` instead. `CloudNetEnvironment` stayed in `common`, because moving it into `platform` would have reversed the dependency direction. `TracedDeliver` moved to `common`. `platform/cloudnet` got its own Gradle group, because using the same name as `apps/cloudnet` produced a circular task graph. `loadedExtensions()` returns an ordered list instead of a set.

**Rebase conflicts.** #407 sat on top of #403 and had to be rebased several times against a growing `main`, because tracing, Jump'n'Run and the lobby switcher all landed in parallel.

**Testability.** `MinecraftServer.init` is process-global, so a unit test cannot start the server cleanly more than once. Today we check startup through #398, which starts the shipped jar in its own process, and check the rest by hand on a real server. That this test arrived only after the problem described in part two is a story of its own.

There were also mistakes in the rebuild itself, which we fixed inside #407. The port is now parsed the way `Integer.getInteger` does it. Extensions are reported only after server initialisation. A bind failure is logged and ends the process with exit code 1. Before, the JVM could hang on non-daemon threads.

## What we learned

We take three things from it:

- **Large rebuilds in small, merged steps.** Each step worked on its own. That made the rebases tedious, but it never left behind a state in which nothing starts.
- **A platform needs a small contract.** For our purposes, a `ServiceLoader` and an interface with four methods are enough. This is our assessment, not a measurement.
- **Starting the finished artifact beats many unit tests.** How much that mattered in October is the subject of part two.

For operators the change is clear: with 3.0.0, only `apps/cloudnet` loads the `extensions/` folder. Local runs start without the extension loader.

Part two of the series: [Why our tests were green and the lobby still did not start](/en/blog/why-our-tests-were-green-lobby-did-not-start).

## Project Links

* Repository: <https://github.com/OneLiteFeatherNET/Titan>
* Release 3.0.0: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.0.0>
* Release 3.0.1: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.0.1>
* Changelog: <https://github.com/OneLiteFeatherNET/Titan/blob/main/CHANGELOG.md>
