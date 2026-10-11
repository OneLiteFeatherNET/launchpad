---
title: 'Why our tests were green and the lobby still did not start'
alternativeTitle: 'Binary compatibility, a NoSuchMethodError and a boot smoke test'
description: 'A dependency update, a clean build and a lobby that would not start: what happened with Titan 3.0, how the fix looked, and which test now checks the startup.'
pubDate: '2026-10-27'
releaseDate: '2026-10-27'
headerImage: 'images/og/blog-en.png'
headerImageAlt: 'Titan: lobby startup and boot test after the Minestom update'
slug: 'why-our-tests-were-green-lobby-did-not-start'
translationKey: 'titan-3-0-boot-incident'
tags:
  - minecraft
  - titan
  - tests
author: themeinerlp

canonical: 'https://onelitefeather.net/en/blog/why-our-tests-were-green-lobby-did-not-start'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/warum-unsere-tests-gruen-waren-lobby-startete-nicht'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/why-our-tests-were-green-lobby-did-not-start'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/why-our-tests-were-green-lobby-did-not-start'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'Why our tests were green and the lobby still did not start'
    alternativeHeadline: 'Binary compatibility, a NoSuchMethodError and a boot smoke test'
    description: 'A dependency update, a clean build and a lobby that would not start: the Titan 3.0 incident and what we learned from it.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-10-27T00:00:00+00:00'
---

## Preface

On 10 October 2026 we released Titan 2.6.0 and 3.0.0. The same day, something happened that we did not see coming: after a dependency update, the lobby no longer started, although the build and the unit tests were green. This post tells what happened, why "green" does not mean "runs", and which consequences we drew. It continues the first part of the series: [Titan 3.0: one lobby core, several platforms](/en/blog/titan-3-0-one-lobby-core-several-platforms).
<!--more-->

## What happened

After the update of `aonyx-bom` to 0.8.8 (#388), Titan ran on Minestom 2026.10.07-26.2. In that Minestom version, `ConnectionManager#getOnlinePlayers()` changes its return type from `Collection` to `Set`.

The LuckPerms loader that Titan bundles had been compiled against the old signature. At startup, the call therefore failed with a `NoSuchMethodError`, and the lobby did not come up. The analysis in the PR description shows the difference at the bytecode level:

```
ConnectionManager.getOnlinePlayers()Ljava/util/Collection;   old loader (LuckPerms 5.6, 6.0.0, 6.0.1)
ConnectionManager.getOnlinePlayers()Ljava/util/Set;          new loader (LuckPerms 6.0.2)
```

The build and the unit tests passed. That was the uncomfortable part.

Changes like this come to us as automated dependency updates, recognisable by the commit prefix `fix(deps)`. The update rules live in `renovate.json` in the repository. An update like this is small in the diff and large in its effect: one version number changes, and the runtime behaviour follows.

## Binary and source compatibility, explained simply

Two terms help here:

- **Source compatibility** means the code you write still compiles against a new version. A `Set` can be used wherever a `Collection` is expected. Our own code would therefore not have noticed the change of return type.
- **Binary compatibility** means an already compiled jar still works with a new library. Compiled bytecode does not refer to a class but to a method with a name, parameters and a return type, the so-called descriptor. If the return type changes, that exact method no longer exists.

The problem was neither in our code nor in the compiler. The LuckPerms library was already compiled, and the check happened only at runtime: the JVM aborts the call with `NoSuchMethodError` as soon as the code actually reaches that spot.

A unit test usually checks single classes, often against stubs, and does not start a Minestom server. The call that failed at startup therefore never ran in our tests. A green build tells you something about the code, not about the startup.

## The hotfix in Titan

The fix in Titan was a version bump: LuckPerms to 6.0.2 (#401, merged on 10 October at 17:42 UTC). The 6.x loaders also replace the static entry point `MinestomLoader.get()` with `MinestomLoader.create(options).load().enable()`. Our `LuckPermsPermissionService` was ported to the new entry point, and the shutdown hook is now registered explicitly through the options builder.

We did not check this only in the source. The PR description records that the embedded loaders of versions 5.6, 6.0.0, 6.0.1 and 6.0.2 were compared with `javap`: only 6.0.2 calls the `Set` variant. The fix is part of version 2.6.0.

## The CloudNet bridge: the same break, elsewhere

The CloudNet bridge is loaded as a Minestom extension and was affected by the same version jump. With a release candidate of the bridge, the server no longer started after the update. We built the bridge against the new Minestom version and swapped the jar on the production node, without restarting the cloud.

We submitted the change upstream as [CloudNet PR #1906](https://github.com/CloudNetService/CloudNet/pull/1906): "update minestom to v2026.10.07-26.2", with the `NoSuchMethodError: ConnectionManager#getOnlinePlayers()` as its motivation. The PR was merged on 11 October 2026. Our fork of the CloudNet bridge also contains this version bump.

## The boot test as a consequence

The failure became visible when the server was actually started, not through a test. Afterwards came the boot test: [PR #398](https://github.com/OneLiteFeatherNET/Titan/pull/398), titled "boot the shipped jar and parse a real application.yaml", was merged 17 minutes after the LuckPerms fix, at 17:59 UTC. It starts the shipped jar in its own process and reads the real `application.yaml` with the production parser. This is a smoke test in the narrow sense: it builds nothing new and checks the result that would go to the server anyway. At the time of the incident it did not yet exist on the main branch, and the PR description of the fix says so explicitly.

The boot test checks exactly what our unit tests could not: whether the artifact we ship starts at all. Starting the shipped jar would have made this failure visible before the release.

## The timeline

Events were close together. All times are UTC, taken from the GitHub metadata of the respective PRs and releases:

- **10 October, 17:42:** #401 with LuckPerms 6.0.2 merged, the startup fix.
- **10 October, 17:59:** #398 with the boot test merged.
- **10 October, 22:08:** Release 2.6.0, which contains the fix.
- **10 October, 22:14:** #407 merged, the rebuild from part one. Release 3.0.0 followed at 22:16.
- **10 October, 22:54:** CloudNet PR #1906 opened.
- **11 October, 06:25:** CloudNet PR #1906 merged.

The startup fix was therefore already in a release before the rebuild for 3.0.0 landed. The bridge side followed a day later.

## What we take away

- **A build is not a startup.** A test has to start the artifact that is shipped, not only check the source.
- **Keep binary compatibility of dependencies in view.** A version jump in one library can break the bytecode contracts of another. Each Minestom update is therefore a good moment to look at the loader versions we bundle. This is our assessment, not a measurement.
- **Keep platforms behind a small contract.** Code that compiles directly against Minestom classes, as the loader did here, is more exposed to breaks like this than code that talks through a small interface. The reasoning behind our platform design is in the [first part](/en/blog/titan-3-0-one-lobby-core-several-platforms).

## Project Links

* Titan repository: <https://github.com/OneLiteFeatherNET/Titan>
* Fix in Titan: <https://github.com/OneLiteFeatherNET/Titan/pull/401>
* Boot test in Titan: <https://github.com/OneLiteFeatherNET/Titan/pull/398>
* Upstream PR in CloudNet: <https://github.com/CloudNetService/CloudNet/pull/1906>
* Release 2.6.0: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v2.6.0>
* Release 3.0.0: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.0.0>
* Release 3.0.1: <https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.0.1>
