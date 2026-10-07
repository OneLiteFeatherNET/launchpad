# main-navigation Delta

## MODIFIED Requirements

### Requirement: Gruppen enthalten die Zielseiten
Die Gruppe `Community` MUST Übersicht (`/community`), Bauwerke
(`/community-poi`), Projekte (`/projects`) und Events (`/events`) enthalten. Die
Gruppe `Mehr` MUST Über uns (`/about`), BlueMap und den externen Status enthalten. Jede Seite, die vorher über die Navigation erreichbar
war (Startseite über das Logo, Blog, Team, Community-POIs, Events, Projekte,
Community, `#connect`, BlueMap, Status), MUST weiterhin erreichbar sein; hinzu
kommt Über uns.

#### Scenario: Nichts geht verloren
- **WHEN** alle Ziele der Navigation eingesammelt werden
- **THEN** sind Startseite, Blog, Team, Community-POIs, Events, Projekte, Community, `#connect`, BlueMap, Status und Über uns enthalten

#### Scenario: Über uns in „Mehr“
- **WHEN** die Gruppe `Mehr` aufgeklappt wird
- **THEN** steht dort „Über uns“ mit Ziel `/de/about`, und die oberste Ebene hat weiterhin höchstens sechs Einträge
