---
slug: 'renovate-presets'
translationKey: 'renovate-presets'
title: 'Renovate presets for Paper and Minestom'
summary: 'Renovate configurations that version Paper API and Minestom correctly and give every repository the same defaults.'
status: 'active'
logo: '/images/projects/renovate-presets/icon.png'
logoAlt: 'Code excerpt from default.json'
socialImage: '/images/projects/renovate-presets/social.png'
releasedAt: '2025-07-21'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Renovate'
license: 'MIT'
links:
  docs: 'https://github.com/OneLiteFeatherNET/renovate#readme'
  source: 'https://github.com/OneLiteFeatherNET/renovate'
  issues: 'https://github.com/OneLiteFeatherNET/renovate/issues'
maintainers:
  - 'themeinerlp'
  - 'theevilreaper'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/renovate-presets'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/renovate-presets'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/renovate-presets'
---

## What is this?

Renovate presets is a collection of [Renovate](https://docs.renovatebot.com/) configurations for the repositories of OneLiteFeather. Renovate does not read the versions of Paper API and Minestom correctly with their own schemes. The presets bring the matching versioning and give every project the same defaults for dependency updates. The repository is licensed under MIT.

## The presets

- **default** sets the defaults: Renovate's recommended configuration, semantic commit messages, automatic merging of patch updates, office hours in the Europe/Berlin timezone, a `renovate` label and vulnerability alerts. Major updates are never merged automatically. The argument is the team that is set as the reviewer of every Renovate PR.
- **paper** versions `io.papermc.paper:paper-api` by the `X.Y.Z-…` scheme.
- **minestom** versions `net.minestom:minestom` by its date-based scheme, for example `2026.08.28-26.2`.

## How to use it

Every repository uses the default variant with a GitHub team as the argument. Projects for Paper or Minestom add the matching variant:

```json
{
  "extends": [
    "github>OneLiteFeatherNET/renovate:default(OneLiteFeatherNET/my-team-maintainers)",
    "github>OneLiteFeatherNET/renovate:minestom"
  ]
}
```

Without a team as the argument, the reviewer stays empty. The presets are versioned with Git tags in the form `v<major>.<minor>.<patch>`, for example `…:default#v1.1.1`, so you can pin them.

## Who is it for?

For maintainers of Minecraft server and Minestom projects that use Renovate. The default rules are tailored to OneLiteFeather: packages under `net.onelitefeather` and `net.theevilreaper` are read from the OneLiteFeather Maven repository. Outside the organisation, the Paper and Minestom presets are the most useful part.
