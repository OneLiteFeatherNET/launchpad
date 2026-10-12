---
title: 'Titan 3.1: live counts in the navigator and a fixed lobby switcher'
alternativeTitle: 'Click to connect, right-click to walk up to the portal'
description: 'Titan 3.1 is live in the lobby: left-click to connect and right-click to reach the portal in the navigator, live player counts per mode and a lobby switcher that shows real limits.'
pubDate: '2026-10-14'
releaseDate: '2026-10-14T18:00:00+02:00'
headerImage: 'images/og/blog-en.png'
headerImageAlt: 'Titan 3.1: navigator and lobby switcher'
slug: 'titan-3-1-navigator-and-lobby-switcher'
translationKey: 'titan-3-1'
tags:
  - minecraft
  - titan
  - release
author: themeinerlp

canonical: 'https://onelitefeather.net/en/blog/titan-3-1-navigator-and-lobby-switcher'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/blog/titan-3-1-navigator-und-lobby-switcher'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/blog/titan-3-1-navigator-and-lobby-switcher'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/blog/titan-3-1-navigator-and-lobby-switcher'

schemaOrg:
  - type: 'BlogPosting'
    headline: 'Titan 3.1: live counts in the navigator and a fixed lobby switcher'
    alternativeHeadline: 'Click to connect, right-click to walk up to the portal'
    description: 'Titan 3.1 is live in the lobby: click-to-connect and portal teleports in the navigator, live player counts per mode and a fixed lobby switcher.'
    author:
      type: 'Person'
      name: 'Phillipp Glanz'
    datePublished: '2026-10-14T00:00:00+00:00'
---

[Titan](/en/projects/titan) 3.1.0 is now live in the lobby. It was released on October 12, 2026, and the navigator and the lobby switcher are the parts you will notice first. The full changes are in the [v3.1.0 release](https://github.com/OneLiteFeatherNET/Titan/releases/tag/v3.1.0). For how we got here, read our [retrospective](/en/blog/titan-from-1-0-to-3-0).
<!--more-->

## Navigator: left-click to connect, right-click to the portal

The feather in hotbar slot 4 is your navigator, and it now reacts to both clicks:

- **Left-click** a mode to connect directly to its server.
- **Right-click** a mode to teleport in the lobby, right in front of the matching portal, facing it. If a mode has no portal, right-click connects you directly, too.

The split between left- and right-click came from our community. Thank you for asking for it.

## Live player counts per mode

Under each mode, the navigator now shows "N online". That number adds up the players on all servers of the mode and refreshes every 5 seconds, so you can see where the action is before you pick a portal.

## Lobby switcher: no more "Full (2/1)"

The clock in hotbar slot 8 is the lobby switcher. Some lobbies were wrongly shown as full, with readings like "Full (2/1)". The cause was a timing problem: CloudNet read the player limit once at startup, before Titan could set it, and took Minestom's default of "online + 1". Titan now reports a fixed limit to CloudNet, 100 by default, so the switcher shows the real state of each lobby.

## Behind the scenes

We also updated the aonyx-bom dependency to 0.8.9.

## Try it out

Log into the lobby, click the feather, and try a right-click ride to a portal. Tell us what works and what does not on [our Discord](https://1lf.link/discord). We are looking forward to your feedback, and see you in the lobby!
