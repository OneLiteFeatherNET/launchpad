# Design: Bessere Web Vitals

## Ziele

Messung mobil (Lighthouse 12.8.2, Standard-Drosselung) gegen einen lokalen
Produktions-Build, Vorher (`origin/main`) gegen Nachher (Branch):

| Seite | Ziel |
|---|---|
| `/de/blog/<artikel>`, `/en/blog/<artikel>` | LCP Load Delay < 300 ms, LCP −300 ms oder mehr |
| `/en/blog`, `/de/blog` | LCP-Bild nicht mehr lazy, LCP −300 ms oder mehr |
| `/en`, `/de` | Preload und Bild nutzen dieselbe Datei (nur ein Bild-Request für Slide 0) |
| alle vier | TBT nicht höher als vorher, keine Seite verliert mehr als 2 Punkte Performance |

Die Ziele sind Richtwerte. Was ein Schritt messbar nicht bringt, fliegt raus
und steht mit Zahlen in der PR-Beschreibung.

## Messung

- Lokal: `pnpm build`, dann `pnpm preview` (Wrangler, Port 8788). Lokal
  nutzt der Bildprovider `none`, Bilder aus `content/` laufen auf 404. Lokal
  taugt die Messung deshalb nur für FCP, TBT und lange Tasks.
- Für LCP: die Preview-URL des Pull Requests (Check „Workers Builds:
  launchpad“) gegen Production messen. Steht keine Preview-URL bereit, LCP
  nur über das HTML prüfen (Preload, `fetchpriority`, `loading`) und das in
  der PR-Beschreibung sagen.
- Lighthouse über den Slot-Runner: `heavy npx -y lighthouse@12.8.2 <url>
  --only-categories=performance --output=json --chrome-flags="--headless=new"`.
- Je Seite n=5, Vorher und Nachher abwechselnd, nur bei Last unter 8
  (`/proc/loadavg`) und mindestens 4 GB frei. Median berichten.
- Seiten: `/en`, `/de`, `/en/blog`, `/de/blog/minecraft2shell-luecke-im-minecraft-client`.
- Ausgewertet: FCP, LCP mit Phasen (`largest-contentful-paint-element`), TBT,
  `long-tasks`, Anzahl Bild-Requests für das LCP-Bild.
- Für Bildthemen zusätzlich das HTML prüfen (Preload-`href` = `src`/`srcset`
  des Bildes), nicht nur die Zeiten.
- Ausgangswerte gegen Production stehen in `proposal.md` (1.42.0).

## Entscheidungen

- **Lazy Hydration statt `<ClientOnly>`**: Inhalt bleibt im SSR-HTML (SEO,
  FCP), nur die Hydration wartet.
- **Kein globales Abschalten der Hydration** (`hydrate-never`) für Teile mit
  Links: Nuxt-Links brauchen die Hydration für Client-Navigation. Reine
  Anzeige ohne Links oder Handler darf `hydrate-never` nutzen.
- **Folgearbeit nach dem Frame**: `requestAnimationFrame` + `setTimeout(0)`
  bzw. `scheduler.yield()` mit Fallback; kein neues Paket.
- **Felddaten**: Zuerst prüfen, ob PostHog Web Vitals bereits erfasst
  (Netzwerk: `web-vitals-with-attribution.js`, Events `$web_vitals`). Wenn
  ja, nur dokumentieren, wo sie zu finden sind. Einstellungen im
  PostHog-Projekt ändert dieser Change nicht.

## Risiken

- `preload` auf dem Artikelbild bei Artikeln ohne Kopfbild: nur setzen, wenn
  `headerImage` existiert.
- Lazy Hydration verzögert die erste Interaktion mit dieser Komponente um
  ihr Nachladen; Komponenten oberhalb des Falzes mit Bedienelementen
  (Navigation, Carousel-Steuerung, Cookie-Banner) bleiben sofort hydriert.
