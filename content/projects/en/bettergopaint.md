---
slug: 'bettergopaint'
translationKey: 'bettergopaint'
title: 'BetterGoPaint: brush plugin for Paper'
summary: 'A Paper plugin that lets builders paint terrain with brushes and block palettes. Every stroke is a FastAsyncWorldEdit edit that //undo can revert.'
status: 'active'
releasedAt: '2024-05-13'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Paper'
license: 'GPL-3.0-or-later'
links:
  docs: 'https://docs.onelitefeather.net/bettergopaint'
  source: 'https://github.com/OneLiteFeatherNET/BetterGoPaint'
  issues: 'https://github.com/OneLiteFeatherNET/BetterGoPaint/issues'
  downloads:
    - label: 'Hangar'
      url: 'https://hangar.papermc.io/OneLiteFeather/BetterGoPaint'
    - label: 'Modrinth'
      url: 'https://modrinth.com/plugin/bettergopaint'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/bettergopaint'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/bettergopaint'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/bettergopaint'
---

## What is this?

BetterGoPaint paints terrain on Paper servers. Builders hold a feather, choose a brush and a palette of up to five blocks, and right-click the ground. Every stroke is a [FastAsyncWorldEdit](https://modrinth.com/plugin/fastasyncworldedit) edit and can be taken back with `//undo`.

BetterGoPaint is a maintained fork of [goPaint](https://github.com/Arcaniax-Development/goPaint_1.14) by Arcaniax.

## What it does

- **Eleven brushes** for spheres, sprays and splatters, discs, connected areas, cliffs, overlays and underlays, cracks, gradients and curved strokes.
- **Block palettes** of up to five blocks. Each block placed by a stroke is picked from the palette.
- **Masks**, so a stroke replaces only one chosen block. The global mask of the WorldEdit session (`//gmask`) is respected.
- **Surface modes** `DIRECT`, `RELATIVE` and `DISABLED` decide which blocks count as surface while painting.
- **Undo and redo** for each stroke separately.
- **A brush per builder**: size, palette and settings are changed in the brush menu.
- **Exported brushes**: a brush can be moved into any non-block item and handed to other builders.
- **World control**: painting can be switched off in selected worlds with `generic.disabled-worlds`.
- **Translations**: English is built in, and further languages are collected on Crowdin.

## Requirements

- Paper 26.1.1, 26.1.2, 26.2 or 26.3 with Java 25.
- FastAsyncWorldEdit 2.16 or newer. The plugin requires it.
- Minecraft 1.21 stays on BetterGoPaint 1.1.x. Folia is not supported yet.

## Who it is for

For build teams who want to shape landscapes and terrain faster, and for server owners who give their builders these tools. Everyone with the `bettergopaint.use` permission can paint, and operators have it by default. Setup, commands and permissions are covered in the [documentation](https://docs.onelitefeather.net/bettergopaint).
