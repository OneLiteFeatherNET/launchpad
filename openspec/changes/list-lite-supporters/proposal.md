## Why

Der Lite-Rang gibt es nur über freiwillige Spenden via OpenCollective, doch
die Team-Seite zeigt nur die offene Stelle und den Spenden-Knopf, nie die
Menschen, die ihn tragen. Die öffentliche Mitgliederliste von OpenCollective
nennt diese Unterstützer (ohne Token); die Community-Seite zeigte bisher nur
eine Zahl, weil man glaubte, es gebe keine Namen.

## What Changes

Ausgeliefert als **`feat(community)`**, ein einziger Pull Request.

- Neue Server-Route `GET /api/community/supporters` liest
  `https://opencollective.com/<slug>/members/all.json`, behält nur aktive
  `BACKER` (ohne das Kollektiv selbst, ohne anonyme „Guest“-/„Incognito“-
  Einträge, nach Profil entdoppelt) und gibt ausschließlich `name`, `image`
  und `profile` aus, alphabetisch. Alle anderen Felder (Beträge, E-Mail,
  Transaktionsdaten, Konten) werden auf dem Server verworfen. Gecacht wie die
  Discord-Zahl; ein Fehler ergibt eine leere Liste.
- Team-Seite, Abschnitt „Lite“: unter der offenen Stelle eine Liste „Unsere
  Lite-Unterstützer“ mit Avatar und Name; jeder Eintrag führt auf die Karte der
  Person auf der Community-Wand (`/<locale>/community#<anker>`). Bei leerer Liste
  entfällt der Abschnitt.
- Community-Wand: Unterstützer werden Mitwirkende mit Abzeichen
  „Unterstützer“ (führt zum OpenCollective-Profil); ein Name, der
  (ohne Groß-/Kleinschreibung) zu `mcName` oder `name` eines Bauherrn oder
  Platzierten passt, führt zu einer Karte mit beiden Abzeichen. Jede Karte
  trägt einen stabilen Anker.
- Die Zahl „Mitwirkende“ schließt Unterstützer ein; die Kachel
  „Unterstützer“ zeigt die Zahl der gelisteten Unterstützer (Fallback: Zahl von
  OpenCollective).
- i18n de und en.

Keine neue Abhängigkeit; `image.domains` erhält den OpenCollective-Avatar-Host.

## Capabilities

### New Capabilities

- `lite-supporters`: Ermittlung, Datenschutz-Beschneidung und Caching der
  Lite-Unterstützer auf dem Server.
- `team-lite-supporters`: Liste der Unterstützer im Lite-Abschnitt der
  Team-Seite samt Querverweis auf die Community-Wand.

### Modified Capabilities

- `community-contributors`: Unterstützer sind Mitwirkende (statt nur einer
  Zahl), werden mit Bauherren/Platzierten zusammengeführt und tragen Anker.
- `community-page`: Kacheln „Unterstützer“ und „Mitwirkende“ rechnen mit der
  Liste; die Wand zeigt das Abzeichen „Unterstützer“ und Anker.

## Impact

- Neu: `shared/utils/liteSupporters.ts`, `shared/utils/personAnchor.ts`,
  `server/api/community/supporters.get.ts`,
  `layers/opencollective/composables/useLiteSupporters.ts`,
  `layers/team/components/TeamSupporterList.vue`.
- Geändert: `layers/community/utils/contributors.ts`, `types.ts`,
  `CommunityWall.vue`, `composables/useCommunityOverview.ts`,
  `pages/team/index.vue`, `TeamRankSection.vue`, `nuxt.config.ts`
  (`image.domains`), `i18n/locales/{de,en}.json`.
- Render bleibt vom Request unabhängig (nur Pfad, keine Query/Cookies).
