# Design: Skeleton Loading bei Seitenwechseln

## Ladeverhalten

Die Seiten rufen heute `await useBlogArticle()` und Ähnliches auf. Diese
Composables nutzen `useAsyncData`, das bei Client-Navigation die Navigation
blockiert, bis die Daten da sind.

Neu: `useAsyncData` mit `lazy: true` auf dem Client. Auf dem Server wartet
Nuxt auch bei `lazy` auf die Daten, bevor es rendert; das SSR-HTML bleibt
vollständig. Vorher in der Nuxt-Doku der installierten Version prüfen und
mit einem Test auf dem gerenderten HTML absichern.

Die Seite zeigt das Skeleton, solange `status === 'pending'` (bzw. `idle`
vor dem ersten Abruf) und keine Daten vorliegen. Liegen Daten aus dem Cache
vor, kein Skeleton.

## 404

Heute wirft das Composable nach dem `await` `createError({ statusCode: 404,
fatal: true })`, wenn das Ergebnis leer ist. Mit `lazy` ist das Ergebnis beim
Rendern noch nicht da. Neu:

- Server: wie bisher nach dem Laden werfen; der Status 404 und die
  Fehlerseite bleiben gleich (Test auf Statuscode).
- Client: sobald der Abruf fertig und das Ergebnis leer ist, `showError({
  statusCode: 404, … })`. Das Skeleton steht bis dahin; danach erscheint die
  bekannte Fehlerseite.

## Skeleton-Bausteine

- Grundbaustein in `layers/base/components/`: `SkeletonBlock` (Fläche mit
  Rundung aus den MD3-Shape-Tokens, Farbe `surface-container-high`), dazu
  Varianten für Textzeilen und Bilder mit festem Seitenverhältnis.
- Je Seitentyp eine Skeleton-Komponente im jeweiligen Layer, die das echte
  Layout spiegelt: gleiche Container, Abstände, Rasterspalten und
  Bildverhältnisse wie die fertige Seite.
- Schimmer per CSS-Animation, unter `prefers-reduced-motion: reduce` eine
  ruhige Fläche ohne Animation.
- Farben und Rundungen nur aus vorhandenen Tokens, kein neuer Farbwert
  (Design-System-Tests bleiben grün). Saison-Skins wirken automatisch über
  die Tokens.

## Prüfung

- Komponententests: Skeleton bei `pending`, Inhalt bei Daten, Fehlerseite bei
  leerem Ergebnis (Client) und Status 404 (Server).
- Test: SSR-HTML der Seiten enthält kein Skeleton.
- Browser (Playwright mit System-Chrome, gedrosselte Antwort der
  Content-Route): Nach dem Klick erscheint das Skeleton sofort; die fertige
  Seite hat keinen Layout-Sprung (Position von Titel und Bild gleich zum
  direkten Aufruf).
- Screenshots der fertigen Seiten nach Navigation und bei direktem Aufruf
  unverändert gegenüber `main`.

## Risiken

- Ein Skeleton, das vom echten Layout abweicht, erzeugt Layout-Sprünge (CLS).
  Gegenmittel: gleiche Container und feste Seitenverhältnisse, Test im Browser.
- Seiten mit mehreren abhängigen Abfragen (z. B. Projekt → POIs, Teamprofil →
  Artikel) dürfen Teilbereiche getrennt laden; die Hauptinhalte erscheinen
  zuerst.
- Doppelte Klicks während des Ladens: Nuxt bricht die vorige Navigation ab,
  kein Sonderfall nötig.
