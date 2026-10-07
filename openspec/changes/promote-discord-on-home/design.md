# Design: Discord auf der Startseite

## Context

Motivation: `proposal.md`; Anforderungen: `specs/`. Befunde am Stand
`origin/main` (`43bde71`):

- `pages/index.vue`: Karussell, `LazyCommunityStrip`, `LazyServerConcept`,
  `LazyServerAddresses`, Sponsoring, OpenCollective, FAQ; jeder Abschnitt
  `hydrate-on-visible`, Daten auf Seitenebene
  (`tests/architecture/home-data-waterfall.spec.ts`).
- `useCommunityOverview().numbers.discordMembers` liefert die Zahl bereits auf
  Seitenebene (über `useDiscordMembers`, Route `/api/community/discord`); es
  braucht keinen zweiten Abruf.
- Direkte Einladungslinks (`discord.gg/…`, `discord.com/invite/…`) stehen nur in
  Blog-Markdown; Komponenten, Seiten, i18n, `public/llms.txt` und
  `content/team` nutzen schon `https://1lf.link/discord`, mehrere Komponenten
  mit dem Literal als Rückfall neben `runtimeConfig.public.discordUrl`.
- `shared/utils/discordInvite.ts` kennt nur den festen Code.
- Domänen kennen einander nicht: `home` darf `community` nicht importieren.

## Goals / Non-Goals

**Goals:** Discord gleichrangig mit den Serveradressen auf der Startseite;
die Mitgliederzahl folgt der echten Einladung; Ausfälle bleiben unsichtbar.

**Non-Goals:** Online-Zahlen, Widget, Blog-Inhalte, neue Abhängigkeiten.

## Decisions

1. **`DiscordCta` lebt in `layers/home` und bekommt alles per Props**
   (`href`, `members: number | null`). Die Seite holt die Zahl (sie kennt
   beide Domänen) und reicht sie durch; die Komponente ruft nichts ab.
   Alternative – `useDiscordMembers` im Block – verletzt die Schichtregel und
   startet einen Abruf nach dem Seitendatenabruf (Wasserfall).
2. **Reihenfolge: Karussell → Discord → Serveradressen → Zahlenstreifen →
   Konzept → Sponsoring → OpenCollective → FAQ.** Die beiden Einstiege
   „Mitreden“ und „Spielen“ stehen unmittelbar untereinander und bilden ein
   Paar. Discord zuerst, weil es jeden erreicht (auch wer noch nicht spielen
   kann oder will); die Adressen sind der konkrete zweite Schritt. Der
   Zahlenstreifen folgt, weil seine Discord-Zahl den Block darüber bestätigt
   und er zur Community-Seite weiterführt. Das Konzept erklärt den Server für
   Unentschlossene und rückt hinter die beiden Handlungsaufforderungen, bleibt
   aber vor Förderern und FAQ. Es ändert sich nur die Markup-Reihenfolge;
   `hydrate-on-visible` und Seitendaten bleiben.
3. **Der Block ist ein `section` mit `h2`** (`aria-labelledby`); der einzige
   `h1` bleibt der `sr-only`-Titel der Seite. Schaltfläche: `M3Button` mit
   `href` und `target="_blank"` (die Basis setzt dann
   `rel="noopener noreferrer"`), Farben aus den MD3-Rollen
   (`bg-surface-container`, `text-on-surface`, `text-on-surface-variant`;
   Kontrast prüfen die Design-System-Tests). Die Zahl steht als eigener Satz
   („1.234 Mitglieder“) und entfällt bei `null`.
4. **Einladungscode aus dem Kurzlink.** `resolveDiscordInviteCode(fetcher, url)`
   ruft den Kurzlink mit `redirect: 'manual'` ab, liest `Location` (relativ zur
   angefragten URL aufgelöst) und folgt höchstens drei Sprüngen, bis der Host
   `discord.com`, `discord.gg` oder `discordapp.com` ist; der Code ist das
   letzte Pfadsegment (`/invite/<code>` oder `/<code>`). Alles andere ergibt
   `null`. `loadDiscordMembers` löst auf und fällt bei `null` oder einem Wurf
   auf den konfigurierten Code zurück; die Zählung (`loadDiscordMemberCount`)
   bleibt unverändert und wirft weiter bei Fehlern. Das Ganze steckt in der
   bestehenden `defineCachedFunction` (Schlüssel Kurzlink + Rückfallcode, eine
   Stunde, `swr: false`); ein Fehlschlag wird nicht gespeichert. Gelingt die
   Zählung mit dem Rückfallcode, wird sie eine Stunde gespeichert – akzeptabel.
5. **Keine Änderung an den Rückfall-Literalen** in Komponenten: sie sind schon
   der Kurzlink. Ein Architekturtest verbietet direkte Einladungsmuster in
   `layers/`, `pages/`, `layouts/`, `i18n/`, `public/`, `server/` und
   `shared/` sowie in `content/` außerhalb von `content/blog/`.

## Risks / Trade-offs

- Der Kurzlink-Dienst kann den Redirect ändern (z. B. Interstitial) → `null`,
  Rückfall auf den Code; die Zahl bleibt.
- Zwei Abrufe statt einem pro Stunde und Colo → vernachlässigbar; der
  Kurzlink-Abruf nutzt dieselbe Zeitgrenze (5 s).
