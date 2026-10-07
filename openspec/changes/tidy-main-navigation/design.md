# Design: Hauptnavigation aufräumen

## Context

Motivation und Umfang: siehe `proposal.md`. Anforderungen: siehe `specs/`.

Befunde am Stand `origin/main`:

- `navConfig` (`layers/navigation/navItems.ts`) kennt `link` und `group`;
  `NavigationBar.vue` baut daraus Desktop-Leiste (`details`/`summary`),
  mobiles Panel (`details`) und die ungenutzte untere Leiste. Das
  Schema.org-Composable flacht dieselbe Konfiguration ab. Eine neue Struktur
  ist daher im Wesentlichen eine Änderung der Konfiguration.
- Die Gruppe „Mehr“ nutzt bereits `aria-expanded`, aber kein `aria-controls`
  und keinen Aktivzustand.
- Das Logo trägt `aria-label="Übersicht"`, obwohl der Text „OneLiteFeather“
  sichtbar ist (WCAG 2.5.3 verlangt den sichtbaren Text im Namen). Mit dem
  Wegfall von `navigation.overview` braucht es einen eigenen Schlüssel.
- `navigation.community_poi` wird nur in `navItems.ts` gelesen; Seitentitel
  hängen an `community_poi.*`-Inhalten. Eine Umbenennung des Schlüssels
  ändert also keine Überschrift.

## Decisions

- **Struktur nur in `navConfig`.** Desktop, Mobil, Schema und der
  Erreichbarkeits-Test lesen dieselbe Quelle. Der Test sammelt die Ziele aus
  `navConfig` plus das Logo (Quelltext-Prüfung) und vergleicht mit einer
  festen Liste der früher erreichbaren Ziele.
- **Umschaltpunkt bleibt `lg` (1024 px).** Bei 1024 px bleiben nach Abzug der
  Ränder (`px-8`) 960 px: Logo (~200 px) plus vier Einträge, Discord-Button
  und Sprachwahl brauchen etwa 700 px. Es gibt also Reserve; ein Verschieben
  nach `xl` würde Tablets ohne Grund auf das Mobilmenü zwingen. Die Prüfung
  per Screenshot bei 1024 px steht in den Aufgaben.
- **Aktivzustand einer Gruppe** über `isNavGroupActive(routePath, childPaths)`
  in `utils/navigation.ts`, das je Kind `isCurrentNavPath` anwendet. Pfade mit
  Anker (`/de#connect`) und externe Ziele zählen nicht, sonst würde „Mehr“ auf
  der Startseite leuchten. Der Gruppenknopf nutzt `NAV_ITEM_ACTIVE`; er trägt
  kein `aria-current`, weil das aktuelle Kind es bereits trägt.
- **Zugänglichkeit der Dropdowns**: `summary` bleibt der native
  Disclosure-Knopf (Enter/Leertaste lösen Klick aus); neu ist `aria-controls`
  auf die `id` des Menüs. Escape schließt über `closeMenus`.
- **Mobil**: dasselbe Muster wie heute (aufklappbare `details` je Gruppe);
  die Gruppenüberschrift trägt den Aktivzustand ebenfalls.
- **Discord**: Desktop als `M3Button` (`tonal`, `href`, neuer Tab); im mobilen
  Panel bleibt es ein Eintrag der Liste.
- **Logo-Name**: neuer Schlüssel `navigation.home_link` („OneLiteFeather –
  Startseite“ / „OneLiteFeather – Home“), im `label-in-name`-Test eingetragen.
- **Benennung**: `navigation.builds` statt `navigation.community_poi`; der
  Gruppen-Eintrag „Übersicht“ nutzt `navigation.community_overview`, getrennt
  von `navigation.community`, dem Gruppentitel.

## Risks

- Eine Gruppe mehr hinter einem Klick: Projekte und Events sind einen Klick
  weiter weg. Akzeptiert; die Startseite und die Community-Seite verlinken sie.
- `add-community-page` und `add-unlisted-events` sind noch offen und
  referenzieren die Navigation; ihre Anforderungen („Eintrag Community
  vorhanden“) bleiben erfüllt.
