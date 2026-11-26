# Spec Delta

## ADDED Requirements

### Requirement: Der Austausch des Skeletons verschiebt den Footer nicht
Ersetzt der Inhalt einer Seite ihr Skeleton, MUST der Footer an seiner
Position im Viewport bleiben. Der Layout-Shift-Wert (CLS) einer
Client-Navigation MUST für jede Seite mit Skeleton unter 0,1 liegen.

#### Scenario: Kurze Projektseite
- **WHEN** jemand per Klick ein Projekt mit kurzem Text öffnet und die Daten nach dem Skeleton eintreffen
- **THEN** springt der Footer nicht
- **AND** der gemessene CLS der Navigation liegt unter 0,1
