# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der
Code. Commits unter `perf(deps): …`, Tests im selben Commit wie der Code,
den sie treiben. In Vue-Komponenten nur die Icon-Einbindung ändern; LCP,
Hydration und Listener gehören zu `improve-web-vitals`.

## 1. Ausgangsmessung

- [ ] 1.1 Produktions-Build von `origin/main` bauen; Inline-CSS, HTML (roh/Brotli), vorgeladenes JS je Seite und Chunk-Inhalte (`nuxi analyze`) nach `design.md` erfassen

## 2. Icons

- [ ] 2.1 Test: Ein Icon aus `free-solid-svg-icons` rendert als `<svg>` mit `viewBox` und Pfad, `aria-hidden="true"`; rot sehen
- [ ] 2.2 Icon-Komponente umsetzen; grün
- [ ] 2.3 Test: Kein Quelltext importiert `fontawesome-svg-core` oder `vue-fontawesome`, kein Template nutzt `font-awesome-icon`; rot sehen
- [ ] 2.4 Alle 11 Dateien umstellen, `plugins/fontawesome.ts` und den CSS-Eintrag in `nuxt.config.ts` entfernen, beide Pakete aus `package.json`; Registry-Test anpassen; grün
- [ ] 2.5 Sichtvergleich der Icons (Navigation, Footer, Carousel-Steuerung, Karten) hell und dunkel

## 3. Inline-CSS

- [ ] 3.1 Inhalt der 89 KB Tailwind-CSS aufschlüsseln (Utilities, Tokens, Saison-Skins, Shiki); Kandidaten notieren
- [ ] 3.2 Test: Inline-CSS von `/en` unter Budget (vorläufig auf heutigen Wert); grün
- [ ] 3.3 Kürzen, was nicht gerendert wird; Sichtvergleich nach `design.md`; Budget auf neuen Stand + 10 % senken

## 4. posthog-js

- [ ] 4.1 Doku und Paketexporte der installierten Version prüfen; Ergebnis in `design.md`
- [ ] 4.2 Wenn ein kleinerer Einstieg alle genutzten Funktionen abdeckt: Test für Opt-out und Feature Flags; umstellen; grün. Sonst nichts ändern

## 5. Abhängigkeiten

- [ ] 5.1 Ungenutzte Pakete finden (Importe, Konfiguration, Skripte); je Paket belegen
- [ ] 5.2 Entfernen; `pnpm install`, `pnpm build`, `pnpm test`, `pnpm typecheck` grün

## 6. Budgets und Abschluss

- [ ] 6.1 Test: Summe des vorgeladenen JS unter Budget; Entry-Budget auf neuen Stand + 10 %
- [ ] 6.2 Nachher messen; Tabelle Vorher/Nachher in `design.md` und PR-Beschreibung
- [ ] 6.3 `pnpm test`, `pnpm quality`, `pnpm typecheck` und `pnpm build` laufen grün
- [ ] 6.4 Pull Request `perf(deps): slim the client bundle and inline css` öffnen
