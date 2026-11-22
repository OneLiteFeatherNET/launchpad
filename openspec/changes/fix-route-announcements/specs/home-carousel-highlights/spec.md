# Spec Delta

## ADDED Requirements

### Requirement: Das Karussell folgt dem APG-Muster
Das Karussell MUST eine benannte Region (`role="region"`,
`aria-roledescription="carousel"`, Name aus i18n) sein. Jede Slide MUST
`role="group"` und `aria-roledescription="slide"` tragen und ein Label
„n von m“ aus i18n. Kein fokussierbares Element ohne Rolle und Namen.

#### Scenario: Region
- **WHEN** das Karussell gerendert wird
- **THEN** hat der Container Rolle Region, Rollenbeschreibung „carousel“ und einen Namen

#### Scenario: Slide
- **WHEN** eine Slide gerendert wird
- **THEN** ist sie eine Gruppe mit Rollenbeschreibung „slide“ und Positionslabel

#### Scenario: Kein namenloser Tab-Stopp
- **WHEN** man durch das Karussell tabbt
- **THEN** erreicht der Fokus nur benannte Bedienelemente
