# Design: Überschriften, Titel- und Beschreibungslängen, Blog-Links ohne Sprache

## Context

Motivation: siehe `proposal.md`. Gelesen an `origin/main` `83fc3fe`.

- `pages/blog/index.vue:59`: `<h1 class="sr-only">`; `Top1.vue:27`:
  `<h1 class="text-headline-small text-on-surface">` mit `M3CardLink`.
- Titel: `app.vue:21` hängt `| OneLiteFeather` (17 Zeichen) an; die Startseite
  schaltet das über `useHomeSeo` mit `titleTemplate: '%s'` ab. Die Startseite
  zählt also nur `index.title`. Gemessen: `de` **57** Zeichen (der Auftrag
  nannte 62; siehe offene Frage 1), `en` 54.
- `usePageSeo.ts:126`: `inLanguage: locale?.value || DEFAULT_LOCALE`;
  `useArticleSeo.ts:178`: `inLanguage: locale.value`. `nuxt.config.ts:137`
  setzt `language: 'de-DE'`/`'en-US'`; `rootWebSiteNode` liefert diese Werte.
- `nuxt.config.ts:186-240`: `routeRules`. Cache-Header stehen nur auf
  `/en/**` und `/de/**`; bestehende Umbenennungs-Redirects
  (`/de/projects/cygnus` …) sind 301 ohne eigene Header.

## Goals / Non-Goals

**Goals:** eine Hauptüberschrift pro Seite; Titel und Descriptions innerhalb
der Anzeigegrenzen; `/blog/…` ohne Sprache landet auf einer echten Seite;
Schema.org sagt überall dieselbe Sprache.

**Non-Goals:** Inhalte der Artikel ändern, nur ihre Meta-Beschreibung; die
`schemaOrg`-Blöcke in den Artikel-Frontmatter (`description:` ab Zeile ~27
mit bis zu 365 Zeichen) anfassen — sie sind JSON-LD, kein Meta-Tag;
Weiterleitung anderer Pfade (`/team/**` …); Browser-Spracherkennung für die
Weiterleitung.

## Decisions

1. **`<h2>` statt `<h1>` im Top1, Optik über Typ-Token.** Das Top1 ist ein
   Abschnitt der Übersicht, nicht ihr Name. Die Klasse `text-headline-small`
   bleibt; Überschriftenebene und Optik sind getrennt. Das `sr-only`-`<h1>`
   bleibt, sein Kommentar stimmt weiter. Die Artikelkarten (`ArticleCard`)
   prüft ein Test auf ihre Ebene (kein `<h1>`).
2. **Titel `de`: `OneLiteFeather – Minecraft-Server & Open Source` (47).**
   Marke vorn (#543), „Deutscher" entfällt, weil „Minecraft-Server" der
   Suchbegriff ist und die Description „deutschsprachig" ohnehin sagt.
   Alternative: `OneLiteFeather – Deutscher Minecraft-Server` (43), behält
   die Sprache, verliert „Open Source". Grenze im Test: gerenderter Titel
   (Key plus 17 Zeichen Suffix, außer Startseite) höchstens 60 Zeichen je
   Sprache. Der Test zeigt, ob weitere Keys (die Liste aus
   `localized-titles.spec.ts`) darüber liegen; solche werden mitgekürzt. Die
   Unterscheidung zwischen `de` und `en` aus `localized-titles` bleibt.
3. **Descriptions ≤ 155 Zeichen, überall, wo ein Meta-Tag daraus wird.**
   Quellen, die den Meta-Wert liefern: i18n-Keys, die Seiten per
   `usePageSeo` übergeben; Blog-`seo.description` bzw. `description`
   (`useArticleSeo.ts:108`); `summary` bei Projekten, Events und POI
   (`pages/projects/[...slug].vue:16` u. a.); Teamprofil-Texte werden aus
   Bausteinen zusammengesetzt (`teamProfileDescription`) und vom Test
   mitgeprüft. Ist-Längen (Messung am Quelltext; der Test ist die endgültige
   Inventur):

   | Datei / Key | Ist | Soll |
   |---|---|---|
   | `i18n/locales/de.json` `index.description` | 170 | 147 |
   | `i18n/locales/en.json` `index.description` | 170 | 141 |
   | `i18n/locales/de.json` `about.description`, `projects.overview.description` | 156 | ≤155 |
   | `content/blog/de/java-sicherheitsupdate-november-2026.md` | 217 | ≤155 |
   | `content/blog/en/java-security-update-november-2026.md` | 207 | ≤155 |
   | `content/blog/de/titan-3-1-navigator-und-lobby-switcher.md` | 181 | ≤155 |
   | `content/blog/en/titan-3-1-navigator-and-lobby-switcher.md` | 180 | ≤155 |
   | `content/blog/de/titan-von-1-0-bis-3-0.md` | 177 | ≤155 |
   | `content/blog/de/warum-unsere-tests-gruen-waren-lobby-startete-nicht.md` | 176 | ≤155 |
   | `content/blog/de/titan-3-0-lobby-kern-mehrere-plattformen.md` | 168 | ≤155 |
   | `content/blog/de/svenko1s-herbst-bauprojekte.md` | 167 | ≤155 |
   | `content/blog/en/titan-from-1-0-to-3-0.md` | 166 | ≤155 |
   | `content/blog/de/slender-halloween-2026-ankuendigung.md` | 164 | ≤155 |
   | `content/blog/en/why-our-tests-were-green-lobby-did-not-start.md` | 159 | ≤155 |
   | `content/community-poi/de/hexenfarm.md` `summary` | 193 | ≤155 |
   | `content/projects/de/bettergopaint.md` `summary` | 171 | ≤155 |
   | `content/community-poi/en/witch-farm.md`, `end-portal.md` `summary` | 162 | ≤155 |
   | `content/community-poi/en/harbour-building.md` `summary` | 156 | ≤155 |

   Neuer Wortlaut `index.description`:
   - de: `OneLiteFeather (onelitefeather.net) ist ein deutschsprachiges Minecraft-Netzwerk seit 2019 – mit Community-Bauten, Events und Open-Source-Software.`
   - en: `OneLiteFeather (onelitefeather.net) is a German-speaking Minecraft network since 2019 with community builds, events and open-source software.`

   Beide behalten, was `brand-name.spec.ts` verlangt (beginnt mit
   `OneLiteFeather`, enthält `onelitefeather.net`); „Paper und Minestom"
   entfällt. Die Artikel-Kürzungen schreibt der Apply-Schritt redaktionell:
   erster Satz bleibt, Zahlen und Spielwerte kommen nicht dazu. Gleichheit mit
   `nuxtSiteConfig.description` (149) ist nicht verlangt. `seo-check.mjs`
   bekommt `DESCRIPTION_MAX = 155`.
4. **Weiterleitung per `routeRules`, 301, immer nach `/en`.**
   `'/blog': { redirect: { to: '/en/blog', statusCode: 301 } }` und
   `'/blog/**': { redirect: { to: '/en/blog/**', statusCode: 301 } }` (Nitro
   ersetzt `**` im Ziel durch den Rest des Pfads). Zum Zusammenspiel:
   - *Cache-Header:* die Cache-Regeln greifen nur auf `/en/**`, `/de/**`; die
     neue Quelle `/blog/**` gehört keiner. Die Weiterleitung trägt also keine
     `cloudflare-cdn-cache-control`-Direktive, genau wie die vorhandenen
     301-Regeln. Das Ziel `/en/blog/<slug>` wird wie jede Seite dort gecacht.
   - *`error-response-headers`:* greift ab Status 400; 301 bleibt unberührt.
     Ist der Ziel-Artikel unbekannt, kommt der 404 vom Ziel, mit `no-store`.
   - *Cloudflare-Redirect-Regel für `/`:* sie liegt im Dashboard und betrifft
     nur den Pfad `/`; `/blog/**` überschneidet sich nicht damit. Die
     Locale-Erkennung (Cookie/`Accept-Language`) bleibt `/` vorbehalten: eine
     Weiterleitung, die Cookies liest, wäre pro Pfad zwischengespeichert falsch
     (AGENTS.md „A cached page is shared by everyone"). Darum fest `en`.
   - *Sitemap, Canonical:* weder Quelle noch Ziel ändern sie; die
     Quell-URLs standen nie darin.
   - *Deutsche Slugs:* `/blog/<deutscher-slug>` führt auf
     `/en/blog/<deutscher-slug>` und damit zu 404. Das ist besser als vorher
     (ein dauerhaftes Ziel), aber nicht korrekt; siehe offene Frage 2.
5. **Organization-Logo als `ImageObject`.** `public/images/logo.png` ist
   512×512. In `nuxt.config.ts:377` wird
   `logo: { '@type': 'ImageObject', url: 'https://onelitefeather.net/images/logo.png', width: 512, height: 512 }`
   gesetzt. Das ist ein Objekt, kein Array; defu führt es mit der
   Basis-Identity zusammen, ohne zu verdoppeln (nuxt-seo-Skill, „One identity
   source"). Die Basis-Identity (`logo: '/images/logo.png'`) bekommt dieselbe
   Form mit relativer URL; ein Test hält fest, dass die Maße der PNG-Datei
   entsprechen (IHDR lesen), damit sie bei einem Logotausch nicht still
   veralten.
6. **`inLanguage` aus `localeProperties.language`.** Der Skill legt
   `language` als einzige Quelle für `<html lang>` und hreflang fest;
   `WebSite.inLanguage` folgt dem schon. `usePageSeo` und `useArticleSeo`
   lesen dieselbe Eigenschaft (`useI18n().localeProperties`), statt den Code
   `locale.value` zu verwenden. Fällt sie aus, bleibt der Code als Rückfall.
7. **Typ `fix(seo)`.** Alles verbessert falsche oder fehlende Signale; keine
   neue Funktion für Besucher. Der Redirect macht tote Links lebendig und
   zählt als Fehlerbehebung.

## Risks / Trade-offs

- Gekürzte Beschreibungen verlieren Information. Mitigation: Erster Satz und
  Schlüsselbegriff bleiben.
- Der Redirect nimmt der Seite die Möglichkeit, `/blog/…` je Sprache
  unterschiedlich zu behandeln; wird das gebraucht, gehört es in eine Route,
  nicht in `routeRules`.
- Eine Kappe von 60 gerenderten Titelzeichen ist ein Näherungswert für
  Pixelbreite; sie ist bewusst konservativ.

## Open Questions

1. Der Auftrag nannte 62 Zeichen für den `de`-Titel; im Quelltext sind es 57.
   Bei der Prod-Messung prüfen, ob dort ein anderer Text steht.
2. Soll `/blog/<slug>` für bekannte deutsche Slugs nach `/de/blog/<slug>`
   führen? Das bräuchte eine Slug-Tabelle oder einen Nitro-Handler; bis es
   Belege für solche Links gibt, reicht `/en`.
3. 301 ohne Cache-Direktive oder mit `max-age=86400` am Edge? Konsistenz mit
   den bestehenden Regeln spricht für „ohne".
