Material 3 Navigation Komponenten

Dateien:
- `NavigationBar.vue` - Hauptkomponente (Top/Bottom Varianten)
- `NavigationItem.vue` - Einzelnes Navigation-Element
- `NavigationIconButton.vue` - Icon-Button (M3 Style)
- `LanguageSelector.vue` - Sprache auswählen

Integration
- Importiere `NavigationBar.vue` in dein Layout (`layouts/default.vue`) oder direkt in `pages`.
- Stelle sicher, dass Material Symbols via `nuxt.config.ts` eingebunden ist (siehe README oben).

Design Tokens
- Nutzt `tokens.css` Variablen (`--color-surface`, `--color-text`, `--color-border`, `--color-brand-secondary`, ...)

Dark Mode
- Unterstützt Dark Mode via `.dark` class (wie bereits im Projekt angewendet)

Accessibility
- ARIA Labels und Fokus Indikatoren implementiert

