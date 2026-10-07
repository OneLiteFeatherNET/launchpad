# Tasks

Jede Aufgabe folgt Rot → Grün: zuerst der fehlschlagende Test, dann der Code.
Ein Pull Request unter `feat(home)`; Commits folgen Conventional Commits
(`feat(home): …`, `feat(community): …` für die Serverroute, ein Typ je Commit),
Tests im selben Commit wie der Code. Tests folgen F.I.R.S.T.: feste Zeit, kein
Netz (der Abruf wird übergeben), kein Warten, jeder Test baut sein Fixture.

## 1. Einladungscode aus dem Kurzlink

- [x] 1.1 `tests/community/discord-shortlink.spec.ts` schreiben: `resolveDiscordInviteCode(fetcher, url)` ruft die URL mit `redirect: 'manual'` und Abbruchsignal ab, liefert den Code aus `Location: https://discord.com/invite/abc`, aus `https://discord.gg/abc`, löst relative Ziele auf, folgt höchstens drei Sprüngen, gibt `null` bei fehlendem `Location`, fremdem Host, Status ≠ 3xx, Wurf des Abrufs und Schleifen; `loadDiscordMembers(fetcher, { shortlink, fallbackCode })` zählt mit dem aufgelösten Code und mit dem Rückfall, wenn die Auflösung `null` ergibt oder wirft, und wirft, wenn die Zählung scheitert; rot sehen; verifiziert durch `pnpm exec vitest run tests/community/discord-shortlink.spec.ts`
- [x] 1.2 `shared/utils/discordInvite.ts` umsetzen (Typ des Abrufs lockern: `cf` optional, `redirect` erlaubt); verifiziert durch grüne Tests aus 1.1
- [x] 1.3 `tests/architecture/discord-cache.spec.ts` anpassen (Route nutzt `loadDiscordMembers`, `runtimeConfig.public.discordUrl`, behält `defineCachedFunction`, `swr: false`, `members: null` und den Rückfallcode) und `tests/architecture/discord-links.spec.ts` schreiben (keine direkten Einladungslinks außerhalb `content/blog/`); rot sehen; `server/api/community/discord.get.ts` umsetzen; verifiziert durch `pnpm exec vitest run tests/architecture tests/community`

## 2. Discord-Block

- [x] 2.1 `tests/home/discord-cta.spec.ts` (`// @vitest-environment nuxt`) schreiben: `DiscordCta` rendert `section[aria-labelledby]` mit `h2`, einen `a` mit `href` und `rel` mit `noopener`, die formatierte Zahl bei `1234`, keine Zahl bei `null`, ruft nichts ab; rot sehen
- [x] 2.2 `layers/home/components/DiscordCta.vue` mit `M3Button` und MD3-Rollen umsetzen, `home.discord.{title,pitch,members,cta}` in `i18n/locales/{de,en}.json`; verifiziert durch grüne Tests aus 2.1 und `pnpm exec vitest run tests/i18n tests/design-system tests/a11y`
- [x] 2.3 `tests/home/page-order.spec.ts` schreiben (liest die Quelle): `LazyDiscordCta` steht nach `<Carousel` und vor `LazyServerAddresses`, `hydrate-on-visible`, bekommt `:members` und `:href` aus Seitendaten, Reihenfolge Adressen → Streifen → Konzept; rot sehen; `pages/index.vue` umsetzen; verifiziert durch grüne Tests und `pnpm exec vitest run tests/architecture tests/community`

## 3. Gesamtprüfung

- [ ] 3.1 `pnpm test`, `pnpm typecheck`, `pnpm quality` (Baseline nicht erhöht) und `pnpm build` laufen grün
- [ ] 3.2 `pnpm preview`: `/de` und `/en` zeigen den Discord-Block direkt nach dem Karussell mit Mitgliederzahl und `href="https://1lf.link/discord"`, im gerenderten HTML kein direkter Einladungslink, `/api/community/discord` liefert eine Zahl

## 4. Pull Request

- [ ] 4.1 Pull Request mit dem Titel `feat(home): put discord in the foreground of the home page` öffnen (Beschreibung auf Englisch: Zusammenfassung, Begründung, Belege aus 3.2)
