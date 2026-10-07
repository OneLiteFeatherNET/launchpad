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
- **Umschaltpunkt wandert von `lg` (1024 px) auf `xl` (1280 px).** Ohne Events
  oben passt die Leiste bei 1024 px (Logo 172 px, vier Einträge, zwei Buttons,
  Sprachwahl; Messung: rechter Rand 978 px bei 992 px Platz). Mit „Events“ oben
  und den zwei Buttons ragt sie bei 1024 px über (rechter Rand 1055 px bei
  1010 px Platz) und die Seite scrollt waagerecht. Statt Symbole oder Beschriftung
  zu kürzen, zeigt der Bereich 1024 bis 1279 px das mobile Menü; ab 1280 px passt
  die Leiste in beiden Varianten. Die Prüfung steht in den Aufgaben.
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
- **Spielen und Discord**: Desktop `M3Button` `filled` (`to` auf
  `/<locale>#connect`, dieselbe Route und derselbe Anker wie der frühere Eintrag
  „Server verbinden“) vor `M3Button` `tonal` (`href`, neuer Tab). Das mobile
  Panel zeigt beide als volle Breite unter den Linkzeilen. `navigation.server`
  entfällt, `navigation.play` kommt hinzu; das Icon `play` ist im
  FontAwesome-Plugin schon registriert.
- **Events automatisch oben**: `buildNavConfig({ eventsTopLevel })` in
  `navItems.ts` ist eine reine Funktion; `navConfig` bleibt als Standard
  (`false`) erhalten. `hasLiveListedEventAt(events, now)` in
  `shared/utils/eventPhase.ts` zählt ein Event, wenn `isEventListedAt` gilt und
  die Phase nicht `past` ist (also angekündigt oder laufend). Daten kommen aus
  `repo.listEventSchedules(locale)` in content-core, das nur `unlisted` und
  `event` projiziert (kein `path`, kein `stem`, unsortiert wie `listEvents`).
  Das Composable `useEventsInNav` (Wurzel, `useAsyncData`, `new Date()` im
  Handler, Ergebnis im Payload) liefert den Wahrheitswert an
  `layouts/default.vue`, das ihn als `events-top-level` an `NavigationBar` und
  an `useSiteNavigationSchema` gibt. So importiert die Navigation die
  Events-Domäne nicht. Zeitabhängige Ausgabe läuft mit dem Edge-Cache bis zu
  etwa 70 Minuten nach.
- **Mobile Gruppenköpfe**: `NAV_ITEM_MOBILE` mit Aktiv- oder Ruhefarbe wie die
  Linkzeilen, `list-none`, Chevron mit `ml-auto` und Drehung bei offenem
  `details`; Kinder eingerückt, ohne eigene Hintergrundfläche.
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
