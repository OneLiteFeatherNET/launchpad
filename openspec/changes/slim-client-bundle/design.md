# Design: Schlankere Auslieferung

## Ziele

| Größe | Vorher (`/en`, 1.42.0) | Ziel |
|---|---|---|
| Inline-CSS im HTML | 114 KB roh | −30 KB oder mehr |
| HTML Brotli | 43 KB | kleiner |
| Vorgeladenes JS, Summe Brotli | rund 219 KB | −40 KB oder mehr |
| FontAwesome-Laufzeit im Client | 99 KB roh | 0 |
| Entry-Chunk | 136 KB roh | nicht größer |

Kein sichtbarer Unterschied: Icons, Farben, Saison-Skins und Code-
Hervorhebung sehen gleich aus.

## Messung

- Größen aus dem Produktions-Build (`pnpm build`): `.output/public/_nuxt`,
  das gerenderte HTML aus `pnpm preview` (Port 8788) für `/en`, `/de`,
  `/en/blog` und einen Artikel. Brotli lokal mit `brotli -c | wc -c`
  oder Node `zlib.brotliCompressSync`.
- Lighthouse wie in `improve-web-vitals/design.md` („Messung“), lokal für
  FCP und TBT; n=5, abwechselnd, nur bei Last unter 8.
- Vorher-Build aus `origin/main` in einem eigenen Worktree.

## Entscheidungen

- **Eigene Icon-Komponente statt neuem Icon-Paket**: Die Icon-Definitionen
  (`IconDefinition`: Breite, Höhe, Pfad) liegen schon in den
  `free-*-svg-icons`-Paketen und sind tree-shakebar. Eine Komponente mit
  `<svg viewBox="0 0 w h"><path :d="…"/></svg>` braucht weder Laufzeit noch
  globale CSS. Kein unplugin-icons/Iconify, keine neue Abhängigkeit.
  Duotone-Pfade (Array) nur unterstützen, wenn ein genutztes Icon sie hat.
- **CSS der Icons**: Die wenigen Regeln, die die Site nutzt (Höhe `1em`,
  `vertical-align`, `overflow: visible`, Breite), wandern als Klassen in die
  Komponente. Die übrigen FA-Hilfsklassen (`fa-spin`, `fa-fw`, …) nur
  nachbauen, wenn ein Template sie nutzt (vorher per grep prüfen).
- **posthog-js**: Erst die Doku und die Paketexporte der installierten
  Version prüfen (Context7 oder `node_modules/posthog-js/package.json`
  `exports`). Gibt es keinen kleineren Einstieg, der Feature Flags und
  Opt-out abdeckt, bleibt es, wie es ist, und die PR-Beschreibung sagt das.
- **Inline-CSS**: Nur kürzen, was nachweislich nicht gerendert wird. Ein
  Test vergleicht die Klassenliste vorher und nachher nicht; stattdessen
  sichern die vorhandenen Design-System-Tests und ein Sichtvergleich
  (Screenshots `/en`, `/de/blog`, ein Artikel mit Code, hell und dunkel).

## Risiken

- Fehlende Icon-Regel nach dem Umbau: Screenshots vor und nach vergleichen.
- Tailwind `@source` zu eng: Klassen aus Markdown-Inhalten (`content/`)
  fehlen. Ein Artikel mit Klassen im Markdown gehört in den Sichtvergleich.
- Konflikt mit `improve-web-vitals`: Beide ändern Vue-Dateien mit Icons.
  Dieser Change ändert in Komponenten nur die Icon-Einbindung; wer zuletzt
  mergt, rebased.
