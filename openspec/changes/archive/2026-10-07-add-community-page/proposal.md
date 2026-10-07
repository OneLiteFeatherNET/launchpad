# Proposal: Community-Seite mit Zahlen und Mitwirkenden-Wand

Ausgeliefert als `feat(community)`.

## Why

Die Website zeigt Bauprojekte, Events, Team und Spenden jeweils für sich, aber
nirgends, wie groß und lebendig die Community ist. Besucher sehen nicht, wie
viele Leute auf dem Discord sind, wie viel gebaut wurde und wer daran
mitgewirkt hat. Die Namen sind längst öffentlich (Bauherren der Community-POIs,
Platzierungen vergangener Events), stehen aber verstreut auf Detailseiten.

## What Changes

- **Neue Seite `/<locale>/community`** (`pages/community.vue`): oben vier
  Zahlen (Discord-Mitglieder, Team, Community-Bauten, Mitwirkende), darunter
  eine „Wand“ der Mitwirkenden mit Minecraft-Kopf, Namen und Abzeichen
  („Bau: Yggdrasil“, „Event: 1. Platz <Event>“), die auf POI beziehungsweise
  Event verlinken. Die Seite ist indexierbar, steht in der Sitemap und trägt
  einen eigenen Canonical und hreflang.
- **Mitwirkende sind nur Personen, die schon öffentlich auf der Seite stehen**:
  `builders` der Community-POIs und `results.placements` sichtbarer, vergangener
  Events. Dedupliziert nach `mcName` (ohne Beachtung der Groß-/Kleinschreibung),
  sonst nach Name; eine Person mit mehreren Beiträgen erscheint einmal mit
  mehreren Abzeichen. Keine neuen personenbezogenen Daten.
- **Discord-Mitgliederzahl** über eine Nitro-Route
  `server/api/community/discord.get.ts`, die den öffentlichen Einladungs-Endpunkt
  (`?with_counts=true`, ohne Token) abfragt, eine Stunde zwischenspeichert und
  bei Fehler oder Zeitüberschreitung keine Zahl liefert. Der Einladungscode ist
  per `runtimeConfig` einstellbar.
- **Neue Layer `layers/community`** (Komponenten, Typen, reine Aggregation).
  Das Zusammentragen aus Community-POI, Events, Team und OpenCollective
  geschieht an einer Stelle der Orchestrierung, nicht in einer Domäne.
- **Navigation**: Eintrag „Community“ (de und en).
- **Startseite**: ein schmaler Zahlenstreifen mit Link auf die Community-Seite.
- `AGENTS.md` führt `community` in der Layer-Liste.
- Nicht in diesem Change: Live-Spielerzahlen (bewusst ausgeschlossen), Namen
  von OpenCollective-Unterstützern (die öffentliche API liefert nur eine
  Anzahl, siehe `design.md`), neue Inhaltsfelder, Verlinkung auf Team-Profile.

## Capabilities

### New Capabilities

- `community-page`: Seite, Zahlenkacheln, Wand, SEO, Navigation, Sitemap und
  der Zahlenstreifen der Startseite.
- `community-contributors`: Regeln, wer Mitwirkender ist, wie dedupliziert und
  wann ein Event berücksichtigt wird.
- `discord-member-count`: Serverroute, Zwischenspeicher, Fehlerverhalten und
  Konfiguration der Mitgliederzahl.

### Modified Capabilities

Keine.

## Impact

- `layers/community/` (neu): `nuxt.config.ts`, `index.ts`, `types.ts`,
  `utils/contributors.ts`, `composables/useDiscordMembers.ts`,
  `components/CommunityStats.vue`, `CommunityWall.vue`, `CommunityStrip.vue`
- `composables/useCommunityOverview.ts` (neu, Orchestrierung auf Wurzelebene)
- `pages/community.vue` (neu), `pages/index.vue`
- `server/api/community/discord.get.ts` (neu), `shared/utils/discordInvite.ts`
  (neu, injizierbarer Abruf), `nuxt.config.ts` (`runtimeConfig.discordInviteCode`)
- `layers/navigation/navItems.ts`, `i18n/locales/{de,en}.json`, `AGENTS.md`
- `tests/community/`, `tests/architecture/` (ergänzt, nicht gelockert)
- Keine neuen Abhängigkeiten.
