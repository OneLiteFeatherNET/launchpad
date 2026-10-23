---
slug: slender
translationKey: event-slender-2026
title: "Slender: Halloween 2026"
summary: Collect the pages before Slender finds you – the reworked Halloween edition with stamina, its own resource pack and a new atmosphere.
type: play
unlisted: false
event:
  announceAt: 2026-10-15T18:00:00+02:00
  startsAt: 2026-10-24T18:00:00+02:00
  endsAt: 2026-11-02T23:59:00+01:00
access:
  mode: open
  requirements:
    - You have to accept the server resource pack.
join:
  server: true
subject:
  kind: gamemode
  name: Slender
play:
  modeSummary: Asymmetric – one Slender against everyone else
promote: {}
---

## What it is about

In 2023 we brought *Slender: The Eight Pages* to Minecraft as an asymmetric
multiplayer mode. The idea worked, but balancing, rushed maps and technical
problems held it back. Three years later we are bringing back a reworked
version.

One player is picked at random as **Slender** and hunts the others. Everyone
else is a **Survivor** and has to collect a number of pages. How many depends
on the number of players in the round.

## Before you join

- When you join, the server asks you to accept the **resource pack**. It is
  mandatory: if you decline, you are kicked.
- The GUI is kept dark on purpose, so opening your inventory mid-round does
  not break the mood.
- New effects run through the game's shaders and are controlled by the
  server.

## Guide

::event-guides
:::event-guide{role="Survivor" icon="person-running"}
**Goal:** Collect all pages of the round together before Slender takes you
out.

- The number of pages grows with the number of players.
- Sprinting costs **stamina**. Once it is empty, you have to recover – pace
  yourselves.
- Each player has **one heal item** per round. It heals gradually and can only
  be used when something is missing.
- Fear rises when you find pages, when you spot Slender and when other players
  are defeated. The Creek goes after the most frightened Survivors.
- More on this in the [gameplay post](/en/blog/slender-how-it-plays).
:::

:::event-guide{role="Slender" icon="ghost"}
**Goal:** Take out every Survivor before they have all the pages.

- You are picked at random when the round starts.
- You are invisible by default. Being visible is powerful, but only possible
  for a while.
- While visible, you are dangerous to everyone standing close to you – in
  return, you move more slowly.
- The scan shows you older tracks near you, never the very newest ones. It only
  becomes available later in the round.
- Later in the round, you can briefly take over a Creek.
- Survivors who look at you from close by see a distorted view.
- More on this in the [gameplay post](/en/blog/slender-how-it-plays).
:::
::

## The pages

- The number of pages depends on the number of players. There are always
  several lying on the map at the same time.
- A page only stays out for a while, then it moves on to another spot.
- Shortly before a page disappears, it gives itself away with sounds.

## FAQ

**Do I really have to accept the resource pack?**
Yes. Without it you cannot play; the server kicks you otherwise.

**What happens if I get caught?**
A catch can swap you places with a random teammate or fling you into the air.
It is never fatal.

**What happens if I am defeated?**
You become a spectator and can follow the remaining Survivors. Your body stays
in the world.
