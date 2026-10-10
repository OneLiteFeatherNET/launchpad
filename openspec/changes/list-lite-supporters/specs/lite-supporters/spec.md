## ADDED Requirements

### Requirement: Lite-Unterstützer sind aktive Backer der OpenCollective-Mitgliederliste
Der Server MUST die Unterstützer aus
`https://opencollective.com/<slug>/members/all.json` (öffentlich, ohne Token)
ermitteln. Ein Eintrag zählt genau dann, wenn seine Rolle `BACKER` und
`isActive` wahr ist, sein Profil eine `https://opencollective.com/`-URL ist, er
weder das Kollektiv selbst noch ein anonymes Konto („Guest“, „Incognito“,
„Anonymous“) ist. Mehrere Einträge mit demselben Profil MUST zu einem werden.
Die Liste SHALL alphabetisch ohne Beachtung der Schreibweise sortiert sein,
nicht nach Betrag.

#### Scenario: Nur aktive Backer
- **WHEN** die Liste Einträge mit den Rollen `ADMIN`, `HOST`, `CONTRIBUTOR`, `FOLLOWER` und inaktive `BACKER` enthält
- **THEN** erscheinen nur die aktiven `BACKER`

#### Scenario: Das Kollektiv ist kein Unterstützer
- **WHEN** ein aktiver `BACKER` den Namen „OneLiteFeather“ trägt oder auf das Profil des Kollektivs zeigt
- **THEN** erscheint er nicht

#### Scenario: Doppelter Eintrag
- **WHEN** dasselbe Profil zweimal vorkommt
- **THEN** erscheint die Person einmal

#### Scenario: Alphabetische Reihenfolge
- **WHEN** die Namen „weltspielt“, „Abarzer“ und „Marc“ vorliegen
- **THEN** lautet die Reihenfolge „Abarzer“, „Marc“, „weltspielt“

### Requirement: Nur Name, Bild und Profil verlassen den Server
Jeder Unterstützer MUST ausschließlich `name`, `image` und `profile` tragen.
Beträge, E-Mail-Adressen, Transaktionszeiten, Konten und alle weiteren Felder
MUST auf dem Server verworfen werden und weder in der Antwort der Route noch in
der Payload oder im HTML einer Seite vorkommen. `image` SHALL nur eine
`https`-URL der Avatar-Hosts von OpenCollective sein, sonst `null`.

#### Scenario: Zusätzliche Felder
- **WHEN** ein Eintrag `totalAmountDonated`, `email`, `lastTransactionAt` und `github` trägt
- **THEN** enthält das Ergebnis nur `name`, `image` und `profile`

#### Scenario: Fremdes Bild
- **WHEN** das Bild von Gravatar oder einem anderen Host stammt
- **THEN** ist `image` `null`

### Requirement: Der Abruf ist gecacht und fällt leise aus
Die Route `/api/community/supporters` MUST mit `defineCachedFunction` etwa eine
Stunde zwischenspeichern, ohne `swr`, und einen Fehler nie speichern. Schlägt
der Abruf fehl (Netz, Status, Format), MUST sie `{ supporters: [] }` liefern,
und jede Seite antwortet weiter mit 200.

#### Scenario: OpenCollective nicht erreichbar
- **WHEN** der Abruf fehlschlägt oder der Slug nicht existiert
- **THEN** liefert die Route eine leere Liste, und Team- und Community-Seite antworten mit 200
