# Design: Marken- und Site-Name-Signale, strukturierte Daten und Robots-Header

## Context

Motivation und Umfang: siehe `proposal.md`. Anforderungen: siehe `specs/`.

Gelesen an `origin/main` `c28dda8` und den installierten Modulen
(`nuxt-schema-org` 6.4.3 ungepatcht, `@nuxtjs/i18n` 10.6.0, `@nuxtjs/robots`
6.2.4); gemessen an der Live-Site am 2026-10-26.

**Woher der WebSite-Knoten kommt.** Mit `@nuxtjs/i18n` registriert
`nuxt-schema-org` den Plugin `runtime/app/plugins/i18n/defaults.js` (Name
`nuxt-schema-org:defaults`, `dist/module.mjs:157-174`, nur wenn
`schemaOrg.defaults` nicht `false` ist). Dort:

- `siteUrl()` ist `localePath('index', locale)` absolut aufgelöst, also
  `https://onelitefeather.net/en` bzw. `/de`; `websiteId()` hängt
  `#website` an (`defaults.js:44-46`). Daraus `defineWebSite({ '@id', url,
  name, inLanguage, description })` (`:47-53`). Kein `alternateName`.
- Auf der Nicht-Default-Locale kommt `translationOfWork` → `/en#website`
  dazu, auf der Default-Locale `workTranslation` → `/de#website`
  (`:77-91`).
- Der Default-`WebPage` bekommt `isPartOf: { '@id': websiteId() }` — der
  Wert wird **sofort** ausgerechnet, nicht als Getter (`:102-104`).
- `about` → `#identity` nur auf `localePath('index')` (`:101`), danach
  `maybeAddIdentitySchemaOrg()` für die Organization aus
  `schemaOrg.identity` (`:107`, `utils/shared.js:149-184`).

`name` und `description` des WebSite-Knotens kommen aus `useSiteConfig()`,
das `nuxtSiteConfig.description` aus den Locale-Dateien liest; deshalb ist die
WebSite-Beschreibung heute schon lokalisiert, die der Organization nicht (sie
steht fest in `nuxt.config.ts:61`).

**Wie Knoten zusammengeführt werden.** `@unhead/schema-org` (vendored unter
`nuxt-schema-org/dist/vendor/schema-org-v3/`) schlüsselt Knoten beim
Deduplizieren nur nach dem Fragment: `resolveAsGraphKey(id)` ist
`id.substring(id.lastIndexOf('#'))` (`shared/schema-org.B7dF02JN.mjs:128-131`).
`https://onelitefeather.net/#website` und `…/en#website` sind also derselbe
Knoten `#website`. Bei gleichem Schlüssel wird gemergt — Skalare überschreibt
der spätere Knoten, Arrays werden verkettet — außer der spätere Knoten trägt
`_dedupeStrategy: 'replace'`; dann ersetzt er den früheren ganz
(`:1253-1265`). `_dedupeStrategy` wird aus `tagDuplicateStrategy` des
`<script>`-Tags gesetzt, in dem die Knoten registriert wurden (`:2597-2604`).
Ein Merge kann `translationOfWork`/`workTranslation` nicht entfernen
(`undefined` wird übersprungen, `null` auf ein Objekt mergt zu nichts); ein
Ersetzen kann es.

**Wie `primaryImageOfPage` zum Logo wird.** Der WebPage-Resolver setzt
`primaryImageOfPage` per `setIfEmpty` auf `#logo`, wenn es ein Logo gibt
(`:724-737`), und der Organization-Resolver ebenso (`:880-891`). Ein
explizit gesetzter Wert gewinnt; heute setzt niemand einen.

**ProfilePage.** `usePageSeo({ schemaType: 'ProfilePage' })` ergibt
`@type: ['WebPage', 'ProfilePage']` (`resolveDefaultType`, `:106-118`). Für
genau diesen Fall löst der Resolver `mainEntity` als Person/Organization auf
(`:696-702`). Die Seite gibt nur keins an.

**Woher `X-Robots-Tag` kommt.** `@nuxtjs/robots` setzt den Header in der
Server-Middleware `runtime/server/middleware/injectContext.js:76-83` aus
Route-Regeln und Site-Config — für Teamprofile `index, follow, max-…`.
`usePageSeo` schreibt `noindex` nur als Meta-Tag per `useHead`
(`usePageSeo.ts:54-59`). Das Modul hat dafür `useRobotsRule(rule)`
(`runtime/app/composables/useRobotsRule.js`), das im SSR **beide** setzt:
`setHeader(event, 'X-Robots-Tag', rule)` und das Meta-Tag (`:23-54`). Es
schreibt nur in die Antwort, liest nichts aus der Anfrage.

**Woher der 302 auf `/` kommt.** Aus dem Nitro-Plugin von `@nuxtjs/i18n`
(`runtime/server/plugin.js`, `utils/redirect.js`): `redirectOn: 'root'` mit
Cookie `i18n_redirected` und `Accept-Language`, Code 302. `/` ist `no-store`
und `sitemap: false` (`nuxt.config.ts:209`). `x-default` und Canonical
erzeugt `strictSeo`; beide zeigen auf `/en`.

**Was Google verlangt** (Site-Names-Doku): WebSite-Markup auf der Startseite
der Domain, `url` = Root der Domain, `name` + optional `alternateName`
(Domain kleingeschrieben ist ein zulässiger Alternativname). Site-Namen auf
Unterverzeichnis-Ebene werden nicht unterstützt.

## Goals / Non-Goals

**Goals:** genau ein WebSite-Knoten pro Seite, auf jeder Locale identisch,
auf Domain-Ebene; Organization ohne Widerspruch zur Meta-Description;
`primaryImageOfPage` sinnvoll; ProfilePage vollständig; Meta-Robots und
Header einig; deutsche Titel deutsch; eine CI-Prüfung, die all das festhält.

**Non-Goals:** Routing von `/` ändern; Canonical, Hreflang, `x-default`
oder Sitemap ändern; Event- und SoftwareApplication-Eignung für Rich
Results; FAQPage-Entfernung (eigener Chore-Change); neue Rich-Result-Typen; `schemaOrg.reactive` ändern.

## Decisions

### 1. Root-Identität: Variante (a) — 302 bleibt, ein WebSite-Knoten auf `/`

**Entschieden (Owner): (a).** Der 302 bleibt.

Auf jeder Seite, beide Locales, steht genau ein WebSite-Knoten:

```json
{
  "@type": "WebSite",
  "@id": "https://onelitefeather.net/#website",
  "url": "https://onelitefeather.net/",
  "name": "OneLiteFeather",
  "alternateName": ["OneLiteFeather Network", "onelitefeather.net", "OLF"],
  "inLanguage": ["en-US", "de-DE"],
  "description": "<nuxtSiteConfig.description der aktuellen Locale>",
  "publisher": { "@id": "https://onelitefeather.net/#identity" }
}
```

Begründung:

- Google will die `url` auf dem Root. Der Knoten sagt genau das, egal unter
  welchem Präfix er ausgeliefert wird. Googlebot sendet in der Regel weder
  Cookie noch `Accept-Language`, landet über den 302 auf `/en` und liest dort
  denselben Knoten. Bei einem 302 behält Google üblicherweise die Quell-URL;
  die Startseite der Domain ist für Google damit `/` mit dem Inhalt von
  `/en`, und deren WebSite-Markup nennt `/`.
- Nur JSON-LD ändert sich. Routing, `routeRules`, Caching, Sitemap,
  Canonical, Hreflang und `x-default` bleiben unberührt. Kein Render liest
  die Anfrage (`tests/architecture/request-independent-render.spec.ts`
  bleibt grün), `/` bleibt `no-store`.
- Ein Knoten statt zwei Sprachvarianten: Es gibt eine Website mit zwei
  Sprachen, keine zwei Websites. `translationOfWork`/`workTranslation` zwischen
  `/en#website` und `/de#website` entfallen damit; die Sprachbeziehung der
  Seiten tragen Hreflang und `inLanguage` der WebPages weiter.
- Die `description` bleibt lokalisiert. Derselbe `@id` mit Text in der
  Seitensprache ist kein Widerspruch.

**Umsetzung.** Ein App-Plugin `layers/content-core/plugins/site-identity.server.ts`
mit `dependsOn: ['nuxt-schema-org:defaults']`, das wie der Modul-Default bei
`useError()` aussteigt, registriert per `useHead` ein Schema-Script mit
`key: 'schema-org-graph'` und `tagDuplicateStrategy: 'replace'`, darin der
WebSite-Knoten aus einer reinen Funktion
`rootWebSiteNode({ siteUrl, description, languages })` in
`layers/content-core/utils/siteIdentity.ts`. Dazu ein zweiter, normaler
`useSchemaOrg([defineWebPage({ isPartOf: { '@id': websiteId(siteUrl) } })])`,
der per Merge das sofort berechnete `isPartOf` des Moduls überschreibt (Merge
reicht hier, Objekte werden feldweise gemergt). `websiteId(siteUrl)` kommt zu
den anderen `@id`-Buildern in `utils/schema-ids.ts`.

`siteUrl` ist `useSiteConfig().url` (Produktion `https://onelitefeather.net`
aus `$production.site`, lokal `http://localhost:3000`) — nicht hart
codiert, wie bei `organizationId`.

Nur Server (`.server.ts`): In Produktion ist `schemaOrg.reactive` aus, die
Schema-Plugins des Moduls laufen nur im SSR (`dist/module.mjs:160-174`, `mode:
'server'`), und `useSchemaOrg` tut im Client nichts. Ein `useHead`-Script mit
`nodes` im Client fände dort keinen Resolver. In Dev rechnet der Client den
Graph mit den Modul-Defaults neu; Maßstab ist das SSR-HTML.

Die Reihenfolge ist der Kern: Ersetzen wirkt nur, wenn unser Knoten nach dem
Modul-Default registriert wird. `dependsOn` legt das fest. Weil das auf
Modul-Interna beruht (Fragment-Schlüssel, `tagDuplicateStrategy`), prüft der
Change das am gebauten Ergebnis (`seo-check` gegen `pnpm preview:prod`, siehe
`tasks.md`) und nicht nur in Unit-Tests. Ob `dependsOn` auf einen Plugin
wartet, der im Client gar nicht registriert ist, spielt wegen `.server.ts`
keine Rolle.

**Geprüft (Produktions-Build, `pnpm preview:prod`):** `replace` verhält sich
wie gelesen. `/en`, `/de`, ein Artikel, ein Teamprofil und eine Projektseite
liefern genau einen `WebSite`-Knoten mit Root-`@id`/`url` und den drei
Alternativnamen, ohne `translationOfWork`/`workTranslation`; kein Knoten
verweist mehr auf `/en#website` oder `/de#website`; `WebPage.isPartOf` zeigt
auf den Root-Knoten. Der Rückfall `schemaOrg.defaults: false` war nicht nötig.

**Erwogene Alternative zur Umsetzung:** `schemaOrg.defaults: false` und ein
eigener Defaults-Plugin, der WebSite, WebPage und die Identity selbst
registriert. Abgelehnt als erste Wahl: Er müsste `about` auf der Startseite
und `maybeAddIdentitySchemaOrg()` nachbauen bzw. über
`#schema-org/app/utils/shared` importieren — mehr Code, mehr Modul-Interna.
Er bleibt der Rückfall, falls `replace` sich im Build nicht wie gelesen
verhält; dann wird das im PR begründet.

**Abgelehnt:**

- **(b) `/` als cachebare 200-Seite.** Unter `strategy: 'prefix'` gibt es
  keine Route `/`; eine eigene Seite dort müsste sich aus dem i18n-Routing
  nehmen, und die Server-Weiterleitung (`redirectOn: 'root'`) müsste
  abgeschaltet oder auf den Client verlegt werden, damit die Antwort
  request-unabhängig und cachebar ist. Danach braucht `/` einen eigenen
  Canonical, einen Sitemap-Eintrag und `x-default` → `/`, den `strictSeo`
  heute auf die Default-Locale legt und den App-Code nicht schreiben darf.
  Zeigt `/` dagegen Inhalt mit Canonical `/en`, wählt Google `/en` als
  Startseite — Unterverzeichnis, also genau das heutige Problem. Ein
  Client-Redirect von `/` liest Googlebot wieder als Weiterleitung. Viel
  Risiko an Routing, Caching und Hreflang für denselben JSON-LD-Effekt.
- **(c1) `prefix_except_default`** (Englisch ohne Präfix auf `/`): sauberste
  Root-Startseite, aber eine URL-Migration aller `/en/**`-Seiten mit 301,
  neuen Canonicals, Hreflang und Sitemap-Einträgen. Unverhältnismäßig für
  diesen Fix.
- **(c2) 301 statt 302 auf `/`.** Ein permanenter Redirect muss
  request-unabhängig sein, also immer `/en` — Deutsch sprechende Besucher
  verlören die Weiterleitung, und Google würde `/en` endgültig als Startseite
  übernehmen.
- **Zwei WebSite-Knoten je Sprache, nur um `alternateName` ergänzt.** Lässt
  `url` auf dem Unterverzeichnis, das Google nicht unterstützt.

**Risiko.** Ob und wann Google den Site-Namen übernimmt, steuert der Code
nicht; Crawl-Verzug seit #543 bleibt. Messbar über die Search Console
(Startseite neu prüfen lassen) und eine Suche nach `onelitefeather.net`
einige Wochen nach dem Deploy.

### 2. Organization: Beschreibung angleichen, PNG-Logo

`schemaOrg.identity.description` und `site.description` in `nuxt.config.ts`
bekommen den Text von `nuxtSiteConfig.description` aus `en.json` als
Grundwert. **Entschieden (Owner): die Organization-`description` wird je
Sprache ausgeliefert.** Das Plugin aus Entscheidung 1 registriert dafür einen
zweiten Merge `defineOrganization({ '@id': organizationId(siteUrl),
description })` mit der lokalisierten Site-Beschreibung
(`useSiteConfig().description`, gespeist aus `nuxtSiteConfig.description`).
Der spätere Skalar überschreibt den Grundwert; alle übrigen Felder bleiben
ausschließlich in `schemaOrg.identity`. Das weicht nur im Feld `description`
von der Regel „eine Identity-Quelle“ des `nuxt-seo`-Skills ab.

`logo` zeigt auf ein neues `public/images/logo.png` (512×512, aus
`logo.svg` gerendert, einmalig per `rsvg-convert`, eingecheckt). Google
verlangt ≥ 112×112 und ein von Google Images unterstütztes Format; PNG ist
die sichere Wahl. Beide Stellen ändern: Basis-`identity` (relativ) und
`$production.schemaOrg.identity` (absolut) — skalar, also ersetzt `defu`
statt zu verketten. Der Logo-Knoten `#logo` bleibt; nur sein `url` ändert
sich.

### 3. Startseite nennt die Domain

`useHomeSeo` bekommt eine eigene Meta-Description je Sprache
(`index.description`), die mit der Marke beginnt und die Domain einmal nennt:
DE „OneLiteFeather (onelitefeather.net) ist ein deutschsprachiges
Minecraft-Netzwerk seit 2019 – mit Community-Bauten, Events und
Open-Source-Software für Paper und Minestom.“, EN die entsprechende
Übersetzung. Der Wortlaut ist die bestehende Beschreibung plus Domain, ohne
zusätzliche Schlüsselwörter. `seo.default_description` bleibt der Fallback der
übrigen Seiten. Titel und H1 bleiben (`tests/seo/brand-name.spec.ts` hält
den Titel fest). Sichtbar steht die Domain schon in den Server-Adressen
(`content/server/*/connect.json`, SSR-gerendert).

### 4. `primaryImageOfPage` = Social-Image

`usePageSeo` übergibt `primaryImageOfPage: socialImage.value.url` an sein
`defineWebPage`; `useArticleSeo` setzt in einem eigenen
`defineWebPage({ primaryImageOfPage: previewSocial.value.url })` dasselbe
für Artikel. Seiten ohne eigenes Bild bekommen `og-default.png`
(1200×630 PNG) statt des SVG-Logos. Der Resolver macht daraus einen
`ImageObject`-Knoten; `setIfEmpty` mit dem Logo greift nicht mehr.

### 5. ProfilePage `mainEntity`

`pages/team/[slug].vue` ergänzt seinen `useSchemaOrg`-Aufruf um
`defineWebPage({ mainEntity: { '@id': personId(site.url, slug) } })`. Der
Merge in `#webpage` trägt das Feld ein; der Person-Knoten mit derselben `@id`
existiert schon. Kein neues Feld in `PageSeoOptions` — nur diese Seite
braucht es.

### 6. `codeRepository` → `sameAs`

`codeRepository` ist auf `SoftwareSourceCode` definiert, nicht auf
`SoftwareApplication`. Die Repository-URL wird zu `sameAs: [source]` (ein
Identitätslink auf das Projekt). Den Typ zu
`['SoftwareApplication', 'SoftwareSourceCode']` zu erweitern wäre ebenfalls
gültig, ändert aber, wie Google den Knoten einordnet — außerhalb des Scopes.

### 7. Robots über `useRobotsRule`

`usePageSeo` ruft statt `useHead({ meta: [{ name: 'robots' }] })` bei
gesetzter Direktive `useRobotsRule(directive)` auf. Der `keywords`-Eintrag
bleibt in `useHead`. Das betrifft Teamprofile, ungelistete Events, Impressum
und Datenschutz; bei den beiden letzten setzt die Route-Regel schon denselben
Header, die Werte sind identisch. Kein Render liest dadurch die Anfrage:
`useRobotsRule` nutzt `useRequestEvent` nur in `node_modules`, um den Header
zu schreiben. Die Seiten sind ohnehin pro Pfad gecacht, und der Wert hängt
nur vom Inhalt ab.

### 8. Deutsche Titel

Die zwölf gleichen DE/EN-Titelpaare aus dem Audit, eingeordnet:

| Seite | Ursache | Entscheidung |
|---|---|---|
| `/de/community-poi` | `community_poi.overview.title` unübersetzt | „Community-Sehenswürdigkeiten“ |
| `/de/blog` („Übersicht“), `/en/blog` („Overview“) | generischer Key | neuer Key `blog.overview.page_title` für `<title>`/`definePageMeta`: „Blog: Neuigkeiten und Einblicke aus dem Netzwerk“ / „Blog: news and insights from the network“ |
| `/de/blog/author/themeinerlp` | `blog.author.title` = „{name} – Blog“ in beiden | „Beiträge von {name}“ / „Articles by {name}“ |
| DevBlog #1 (DE/EN) | Frontmatter-Titel „DevBlog #1“ in beiden | `seo.title`: „DevBlog #1: Welche Technologien wir nutzen und warum“ / „DevBlog #1: What we use and why it helps“ |
| `/de/events` | „Events“ | **Owner: „Veranstaltungen“** (`events.title`; wirkt auch auf H1 und Breadcrumb) |
| `/de/community` | „Community“ — gebräuchlich | bleibt |
| `/de/bluemap` | Produktname | bleibt |
| `/de/events/slender` | Eigenname „Slender: Halloween 2026“ | bleibt |
| fünf Teamprofile | Spielername ohne Rolle | bleibt |

Ein Test vergleicht die Titel-Keys in `de.json` und `en.json` und erlaubt
Gleichheit nur für eine benannte Liste mit Begründung.

### 9. JSON-LD-Prüfung in CI

Keine neue Abhängigkeit. Reine Funktionen in `scripts/jsonld-checks.mjs`
nehmen einen geparsten `@graph` (und Seitenkontext wie Origin und Seitentyp)
und liefern eine Liste von Befunden; `scripts/seo-check.mjs` sammelt die
Graphen, die es ohnehin parst, und meldet die Befunde als Fehler. Unit-Tests
in `tests/scripts/jsonld-checks.spec.ts` laufen mit festen Graph-Fixtures in
Node (schnell, ohne Server).

Geprüft wird:

- **WebSite:** genau einer; `@id` = `<origin>/#website`; `url` =
  `<origin>/`; `name` = `OneLiteFeather`; `alternateName` enthält
  `OneLiteFeather Network` und `onelitefeather.net`; keine
  `translationOfWork`/`workTranslation`.
- **Organization:** `@id` = `<origin>/#identity`, `name`, `url`, `logo`
  löst auf einen `ImageObject` mit nicht-SVG-`url` auf.
- **Article:** Pflicht/empfohlen nach Google: `headline`, `image` (≥ 1),
  `datePublished`, `dateModified`, `author` mit `name` und `url`,
  `publisher` löst auf.
- **ProfilePage:** `mainEntity['@id']` löst auf einen Person-Knoten im Graph
  auf.
- **Referenzen:** `isPartOf`, `publisher`, `about`, `primaryImageOfPage`
  zeigen auf Knoten im Graph; `primaryImageOfPage` ist kein SVG.
- **Robots:** Meta `robots` und `X-Robots-Tag` sind sich bei
  `index`/`noindex` einig (für jede geprüfte Seite).

`seo-check` prüft dazu zusätzlich ein indexierbares und ein dünnes
Teamprofil, die es über `/en/team` findet, statt Slugs festzuschreiben.

`@adobe/structured-data-validator` und `linkinator` sind **optional und
nicht Teil dieses Changes**: Der Validator würde Googles Regelsatz breiter
abdecken (Event, SoftwareApplication), aber eine neue Abhängigkeit für
Prüfungen einbringen, die hier nicht Ziel sind. Ein Link-Checker gehört zu
einem anderen Problem. Falls gewünscht, eigener `ci`-Change.

## Risks / Trade-offs

- **Modul-Interna.** `replace` und Fragment-Schlüssel sind Verhalten von
  `@unhead/schema-org`, kein dokumentiertes Nuxt-API. Abgesichert durch die
  CI-Prüfung am Produktions-Build; ein Modul-Update, das es ändert, wird rot.
- **Dev vs. Produktion.** In Dev ist `schemaOrg.reactive` an, im Client läuft
  der Graph neu; Prüfmaßstab ist der Produktions-Build (`pnpm preview:prod`).
- **Google-Verzögerung.** Siehe Entscheidung 1.

## Open Questions

Vom Owner entschieden: (a) für den Root; `alternateName` mit `OLF`;
Organization-`description` je Sprache; `/de/events` heißt „Veranstaltungen“;
FAQPage-Entfernung ist ein eigener Chore-Change und nicht Teil dieses Changes.
Der Wortlaut der neuen Texte (Startseiten-Description, Blog-Übersicht,
Autorenseite, DevBlog #1, Community-POI) steht in der PR-Beschreibung zur
Prüfung durch den Owner.
