# Design: Halloween-Skin

## Context

Motivation: siehe `proposal.md` – Why. Anforderungen: `specs/seasonal-theming`,
`specs/halloween-season`.

Randbedingungen aus dem Bestand:

- **Farben laufen über Custom Properties.** Tailwind v4 kompiliert
  `bg-primary` zu `background-color: var(--color-primary)`; `@theme` schreibt
  die Werte auf `:root, :host`. Eine spätere Regel, die dieselben Properties
  neu deklariert, färbt jede Aufrufstelle um, ohne eine Komponente anzufassen.
- **Der MD3-Generator existiert** (`scripts/md3-tokens.mjs`): `SchemeFidelity`
  plus drei eigene Tonalpaletten, Custom Colors ohne Blend, Ausgabe als
  `light-dark()`-Paare zwischen `md3:generated`-Markern, `--check` und
  `md3-tokens.spec.ts` für Aktualität.
- **Tests lesen `tailwind.css` als Ganzes.** `schemeColors()` in
  `tests/helpers/theme.ts` sammelt *jede* `--color-*`-Deklaration der Datei in
  eine Map – eine spätere gewinnt. `contrast.spec.ts`, `dead-color-tokens`,
  `brand-scale` lesen ebenfalls die ganze Datei.
- **Migration abgeschlossen.** Auf `main` lesen alle Komponenten MD3-Rollen;
  die Alt-Tokens sind entfernt. Außerhalb der Rollen gibt es nur noch feste
  Markenfarben: `--gradient-brand/-accent(-light)` in `@theme` und
  `--brand-magenta`/`--brand-cyan` in `:root` (Glow der Verbindungsbox).
  (Ursprünglich gegen einen halb migrierten Stand geplant; beim Rebase auf
  `main` ist die Alt-Token-Brücke deshalb entfallen, siehe D3.)
- **Layer-Regeln.** Domänen importieren einander nicht; nur `app.vue`,
  `layouts/`, `pages/` kombinieren. `NavigationBar` lädt das Logo heute fest
  als `images/logo.svg`.
- **`app.vue`** setzt `theme-color` als Literale; `md3-tokens.spec.ts` liest
  sie per Regex von dort und vergleicht mit `--color-surface`.
- **Edge-Cache** (`edge-caching-and-seo`): `/de/**` und `/en/**` per
  `cloudflare-cdn-cache-control: max-age=3600, stale-while-revalidate=86400`;
  kein Render darf Query, Cookies oder Header lesen
  (`request-independent-render.spec.ts`).

## Goals / Non-Goals

**Goals:**
- Eine Saison ist Daten (Fenster, Seeds, Assets), keine Handarbeit an Tokens.
- Der Skin greift in migrierten *und* nicht migrierten Dateien, ohne die
  MD3-Migration zu blockieren oder von ihr blockiert zu werden.
- Außerhalb der Saison ist die Auslieferung byte-identisch zu heute bis auf
  das zusätzliche, inaktive CSS.

**Non-Goals:**
- Rohfarben (`gray-*`, `neutral-*` …) umfärben. Das ist Aufgabe der
  MD3-Migration; einzige Ausnahme ist der Body-Hintergrund (D7).
- `site.webmanifest`-Icons und OG-Bilder saisonal tauschen – installierte
  PWA-Icons und gecachte Social-Previews würden die Saison überdauern.
- Weitere Saisons. Das Register ist dafür offen, dieser Change liefert nur
  Halloween.

## Decisions

### D1 – Saison-Farben kommen aus demselben Generator
`scripts/md3-tokens.mjs` bekommt ein Register `SEASONS` mit Seeds je Saison
und erzeugt pro Saison ein vollständiges Schema über dieselbe Funktion wie das
Basis-Schema (Fidelity, Kontraststufe 0, Neutral-Paletten aus der
Primär-Seed). Die Funktion `scheme()` wird dafür auf Seeds parametrisiert;
das Basis-Ergebnis bleibt bitgleich (bestehender `--check` beweist das).

Halloween-Seeds (Startwerte, im PR per Screenshot bestätigt):

| Rolle | Seed | Absicht |
|---|---|---|
| primary | `#5B2A86` | Hexen-Violett, trägt Struktur und Flächen-Unterton |
| secondary | `#FF7518` | Kürbis, alles Interaktive (Fokusring = `secondary`) |
| tertiary | `#7CB518` | Gift-Grün als seltener Akzent |
| custom `brand-orange` | `#FF7518` | Kürbis statt Markenorange |
| custom `brand-purple` | `#6A0DAD` | dunkleres Violett |

*Alternative:* Werte von Hand wie im alten Branch. Verworfen – genau daran ist
der alte Ansatz gescheitert (jede vergessene Rolle bleibt blau, jede Paarung
braucht eine Handrechnung).

### D2 – Saison-Blöcke in eigener Datei `assets/css/seasons.css`
Der Generator schreibt die Datei vollständig (Kopfkommentar „do not edit“),
je Saison ein Block `html[data-season="<id>"] { … }`. `tailwind.css`
importiert sie direkt nach `@import 'tailwindcss'`.

- **Warum nicht in `tailwind.css`:** `schemeColors()` und die anderen Parser
  würden Saisonwerte als Basiswerte lesen (spätere Deklaration gewinnt). Eine
  eigene Datei hält jede bestehende Prüfung unverändert gültig; Saisons
  bekommen ihre eigenen Prüfungen (D8). Das weicht von MD3-D2 („eine
  Token-Quelle“) ab, aber nur für Overrides, die keine Utilities erzeugen –
  `seasons.css` enthält kein `@theme`.
- **Selektor `html[data-season=…]`** (Spezifität 0,1,1) statt
  `[data-season=…]` (0,1,0 wie `:root`): gewinnt unabhängig von der
  Reihenfolge im Bundle.
- **Keine `@custom-variant`.** Die Deko braucht keine saisonabhängigen
  Utilities, da sie nur während der Saison im DOM steht.

### D3 – Deko-Farben außerhalb der Rollen im selben Block
Nach den Rollen schreibt der Generator einen markierten Abschnitt
(`/* decoration:start */ … /* decoration:end */`) für die festen
Markenfarben, die keine Rolle sind:

| Wert | Saisonwert |
|---|---|
| `--brand-magenta` | Sekundär-Seed der Saison |
| `--brand-cyan` | Tertiär-Seed der Saison |
| `--gradient-brand` | `var(--color-primary)` → `var(--color-secondary)` |
| `--gradient-accent` | `brand-purple` → `tertiary` → `secondary` (Rollen) |
| `--gradient-*-light` | statische Töne der Saison-Paletten auf den Tonstufen, auf denen auch die Basis-Stops liegen (≈ 50 → 75 bzw. 55 → 65 → 80) |

Die Haupt-Verläufe verweisen per `var()` auf Rollen, folgen also Hell/Dunkel
und sind so lesbar wie die Rollen. Ein Test prüft, dass jede
`--brand-*`/`--gradient-*`-Deklaration in `tailwind.css` im Saison-Block genau
einmal beantwortet wird – kommt eine neue feste Farbe hinzu, schlägt er an.

*Ursprünglich* war hier eine befristete Brücke für ~25 Alt-Tokens geplant und
umgesetzt, weil die MD3-Migration unvollständig war. Beim Rebase auf `main`
(Migration abgeschlossen, #371) ist sie entfallen.

### D4 – Neuer Domänen-Layer `season`
`layers/season/` mit:
- `types.ts`: `Season` (`id`, `start`, `end` als `{ month, day }`,
  `themeColor: { light, dark }`, `logo`, `favicon`, `decor: boolean`),
  `ActiveSeason = Season | null`.
- `utils/seasons.ts`: Register `SEASONS` (Halloween: 20.10.–2.11.), reine
  Funktion `resolveSeason({ date, override, seasons })` – übernommen aus
  `feat/seasonal-theming`, dort bereits getestet (Berliner Kalendertag per
  `Intl.DateTimeFormat`, Jahreswechsel, `none`, unbekannte Werte ignoriert).
- `composables/useSeason.ts`: `useState('season', …)` –
  `runtimeConfig.public.season` vor Kalender (Query siehe D4a). Initialisierung nur auf dem
  Server, Client übernimmt den Payload. `resolveSeason` nimmt dafür eine
  Liste `overrides` (höchste Priorität zuerst); der erste *erkannte* Wert
  gewinnt, ein unbekannter fällt auf die nächste Ebene durch statt sie zu
  überspringen.
- `components/SeasonDecor.vue`.
- `index.ts`: Typ-Exporte und `resolveSeason`/`SEASONS` (keine
  `@nuxt/content`-Abhängigkeit, also client-sicher).

*Warum nicht `shared/utils`:* Nitro braucht die Saison nicht; `shared/` ist
laut AGENTS.md für Code beider Seiten reserviert. *Warum nicht `base`:*
`base` ist domänenfrei, eine Saison mit Logo-Pfaden und Deko ist Domäne.

### D4a – `?season=`-Vorschau nur im Client
Beim Rebase auf `main` hinzugekommen:
`tests/architecture/request-independent-render.spec.ts` verbietet jedem Render,
Query, Cookies oder Header zu lesen, weil das HTML an der Edge gecacht wird.
`useSeason` entscheidet deshalb nur aus `NUXT_PUBLIC_SEASON` und Kalender.
Die Vorschau übernimmt `layers/season/plugins/season-preview.client.ts`: Nach
`app:mounted` liest es `window.location.search` (über die reine Funktion
`previewSeason`) und setzt den gemeinsamen State; alles, was `useSeason()`
liest, folgt reaktiv. Unbekannte Werte ändern nichts (kein Neuentscheiden
nach Browser-Uhr).

Preis: Die Vorschau zeigt kurz die Basisfarben, bevor sie umspringt. Die
echte, kalendergesteuerte Saison ist davon nicht betroffen.

*Alternativen:* Ausnahme im Architekturtest (Query ist Teil des Cache-Keys,
technisch cache-sicher) – verworfen, weil der Test ausdrücklich verlangt,
solche Features aus dem gecachten HTML herauszuziehen. Vorschau ganz
streichen – verworfen, weil sie der einfachste Weg ist, den Skin vor dem
20.10. in Produktion zu prüfen.

### D5 – Nur `app.vue` und das Layout verdrahten die Saison
- `app.vue`: `htmlAttrs['data-season']` (fehlt außerhalb der Saison),
  `theme-color` aus `season?.themeColor ?? BASE_THEME_COLOR`, genau ein
  `rel="icon"`/`mask-icon` aus `season?.favicon ?? '/favicon.svg'`, und
  `<SeasonDecor />` neben `<NuxtLayout>`.
- `BASE_THEME_COLOR` wird eine benannte Konstante in `app.vue`; der
  `md3-tokens.spec.ts`-Test liest diese Konstante statt der Meta-Literale.
- `layouts/default.vue` übergibt `NavigationBar` ein neues optionales Prop
  `logoSrc` (Default `images/logo.svg`). So importiert `navigation` nichts aus
  `season`.

### D5a – Basis-Favicon in `app.head` mit `key`
In der Umsetzung festgestellt: `nuxt-seo-utils` ergänzt für
`public/favicon.svg` automatisch einen eigenen Icon-Link, solange
`app.head` keinen enthält – jede Seite hatte schon vor diesem Change zwei
`rel="icon"`. Das Basis-Icon steht deshalb in `nuxt.config.ts` unter
`app.head.link` mit `key: 'favicon'`; `app.vue` ersetzt es über denselben
`key` durch das Saison-Favicon. Ergebnis: genau ein Icon-Link, mit und ohne
Saison.

### D6 – Deko als Inline-SVG, fixed, unter der Navigation
`SeasonDecor` rendert nur bei `season?.decor`, als
`<div aria-hidden="true" class="pointer-events-none fixed inset-0 z-30 overflow-hidden">`
– unter Navigation (`z-50`) und Mobile-Overlay (`z-40`), außerhalb des
Dokumentflusses (kein CLS). Inhalt:
- zwei Spinnennetze (Pfad aus dem alten Branch, gespiegelt), `text-primary/25`;
- bis zu drei Fledermäuse `hidden motion-safe:md:block` (opt-in; das
  ursprünglich geplante `md:block motion-reduce:hidden` verliert in Tailwind
  v4 gegen `md:block` und ließ die Fledermäuse bei reduzierter Bewegung
  fliegen – im Browser festgestellt),
  `text-brand-purple/40`, Animation `--animate-season-drift` (lange Dauer,
  nur `transform`, damit keine Layout-/Paint-Arbeit anfällt).

Farben nur über Rollen-Tokens mit Deckkraft – erfüllt die Governance-Regeln
und färbt sich automatisch mit. Keine Bilddateien, keine Requests.
Die Keyframes stehen in `tailwind.css` (`@theme` `--animate-season-drift`
plus `@keyframes`), damit `utility-classes.spec.ts` sie findet.

### D7 – Body-Hintergrund auf die Surface-Rolle
Geplant, weil `layouts/default.vue` `dark:bg-gray-900` setzte – eine
Rohfarbe, die keine Saison erreicht. Auf `main` hat die MD3-Migration (#370)
das bereits auf `bg-surface text-on-surface` umgestellt; der Punkt entfiel
beim Rebase.

### D8 – Tests
- **Generator:** `seasons.spec.ts` prüft, dass `seasons.css` dem
  Generatorergebnis entspricht, und nennt bei Abweichung Saison und Rolle
  (eigene Datei statt `md3-tokens.spec.ts`, weil die Saisonprüfungen dort
  gebündelt sind).
- **Vollständigkeit:** Jede Saison deklariert jede Rolle des Basis-Schemas;
  jede feste Deko-Farbe aus `tailwind.css` hat eine Zeile; jede Saison im
  Layer-Register hat einen Block in `seasons.css` und umgekehrt.
- **Kontrast:** `contrast.spec.ts` führt `ROLE_PAIRS` zusätzlich gegen jede
  Saison aus (Helfer `schemeColors(seasonCss(id))`).
- **Farbwirkung:** Farbton-Bereiche für `primary`/`secondary`, Luminanz von
  `surface` hell > 0,8 (Spec `halloween-season`).
- **Auflösung:** Unit-Tests für `resolveSeason` (übernommen und ergänzt um die
  Spec-Szenarien: 22:30 UTC am 19.10., 3.11. 00:30, Tippfehler).
- **Browser-Chrome:** `theme-color` der Saison = Saison-`surface`.
- **Deko:** Komponententest: kein DOM ohne Saison, `aria-hidden`,
  `pointer-events-none`, Fledermäuse mit `motion-reduce:hidden`.
- **Assets:** Größe ≤ Basis-Asset.
- **Architektur:** `module-boundaries` und `layer-name-collisions` grün mit
  neuem Layer.

### D9 – Neues Logo und Favicon
Aus `public/images/logo.svg` abgeleitet, nicht neu gezeichnet: Markenform
bleibt, Farbflächen wechseln auf die Halloween-Seeds, dazu ein einzelnes
Motiv (Hexenhut auf der Feder bzw. Kürbis-Akzent). Favicon als vereinfachte
Variante ohne Detailmotiv, damit es bei 16 px lesbar bleibt. Beide
optimiert (SVGO), ohne die Inkscape-Metadaten des Originals. Ablage unter
`public/images/seasons/halloween/`.

## Risks / Trade-offs

- [Rohfarben bleiben neutral grau, v. a. im Dunkelmodus] → Grau passt zu
  Halloween; Body-Hintergrund über D7 gelöst. Screenshots aller
  Hauptseiten hell/dunkel im PR; auffällige Stellen als Kandidaten für die
  MD3-Migration notieren, nicht in diesem Change fixen.
- [Fidelity erzeugt aus `#FF7518` einen sehr lauten `secondary-container`] →
  Kontrasttest erzwingt die Minima; optisch notfalls Seed abdunkeln oder
  sekundär auf Tonal Spot stellen – reine Generatoränderung.
- [Saisonwechsel rund eine Stunde verzögert durch Edge-Cache; die erste Anfrage nach Ablauf bekommt per SWR noch die alte Fassung] → Fenster startet
  bewusst Tage vor dem 31.; Notschalter per Env wirkt ebenso verzögert,
  bei Bedarf Cache-Purge in Cloudflare.
- [Die `?season=`-Vorschau zeigt kurz die Basisfarben] → Nur Vorschau
  betroffen (D4a); die kalendergesteuerte Saison rendert schon im HTML.
- [Deko-Animation kostet mobile Performance] → Fledermäuse erst ab `md`,
  nur `transform`; Lighthouse-Lauf mit `?season=halloween` im PR.

## Migration Plan

1. Merge vor dem 20.10. – außerhalb des Fensters inaktiv, Prüfung in
   Produktion über `?season=halloween`.
2. Rollback ohne Deploy: `NUXT_PUBLIC_SEASON=none` in Cloudflare setzen.
3. Nach Saisonende bleibt alles liegen (inaktiv) für das nächste Jahr.

## Open Questions

- Endgültige Seed-Werte: Startwerte aus D1, Feinabstimmung per Screenshot im
  PR, ohne Einfluss auf Specs oder Tasks.
