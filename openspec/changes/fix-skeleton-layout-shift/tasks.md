# Tasks

Jede Aufgabe folgt Rot → Grün. Commits unter `fix(ui): …`, Tests im selben
Commit wie der Code, den sie treiben.

## 1. Messen

- [ ] 1.1 CLS der Client-Navigation für alle Seiten mit Skeleton bei gedrosselter Content-Route messen (Ausgangswert, Projektseite 0,15)

## 2. Skeletons

- [ ] 2.1 Test: Detail-Skeletons tragen kein `min-h-screen`; rot sehen
- [ ] 2.2 `min-h-screen` entfernen, Detail-Skeletons auf den immer vorhandenen oberen Teil kürzen, Kartenzahl der Übersichts-Skeletons prüfen; grün

## 3. Prüfung und Abschluss

- [ ] 3.1 CLS erneut messen: jede Seite unter 0,1
- [ ] 3.2 Screenshots direkter Aufrufe gegenüber `main`; unverändert
- [ ] 3.3 `pnpm test`, Quality-Gate, `pnpm typecheck` und `pnpm build` laufen grün
- [ ] 3.4 Pull Request `fix(ui): keep the footer in place when a skeleton is replaced` öffnen
