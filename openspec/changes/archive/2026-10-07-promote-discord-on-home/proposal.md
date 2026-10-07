# Proposal: Discord im Vordergrund der Startseite

Ausgeliefert als `feat(home)`.

## Why

Die Startseite zeigt heute das Karussell und danach, weit unten, die
Serveradressen. Discord, der Ort, an dem die Community redet, taucht dort nur
über den Zahlenstreifen auf und ist sonst nur in der Navigation verlinkt. Wer
spielen will, findet die Adresse; wer mitreden will, findet nichts. Zusätzlich
liest die Mitgliederzahl ihren Einladungscode aus einer fest verdrahteten
Konfiguration, obwohl die Einladung hinter `https://1lf.link/discord` jederzeit
wechseln kann – dann zählt die Seite still die falsche Gruppe.

## What Changes

- **Neuer Block „Mitreden“** (`DiscordCta`, Layer `home`) direkt unter dem
  Karussell: Überschrift, ein Satz Werbetext, Live-Mitgliederzahl und die
  Schaltfläche „Discord beitreten“ als echter externer Link auf
  `runtimeConfig.public.discordUrl` (`https://1lf.link/discord`). Fehlt die
  Zahl, entfällt nur die Zahl.
- **Reihenfolge der Startseite**: Karussell → Discord („Mitreden“) →
  Serveradressen („Spielen“) → Zahlenstreifen → Konzept → Rest. Begründung in
  `design.md`.
- **Alle Einladungslinks laufen über den Kurzlink.** Im Quelltext der Seiten,
  Layer, i18n-Dateien und `public/` gibt es schon heute keinen direkten
  Einladungslink mehr; ein Architekturtest hält das fest. Blog-Artikel bleiben
  unberührt.
- **Der Einladungscode wird aus dem Kurzlink gelesen**: die Serverroute ruft
  `https://1lf.link/discord` ohne automatisches Folgen ab, liest `Location`
  (`https://discord.com/invite/<code>`) und zählt damit; scheitert das, gilt
  der konfigurierte `discordInviteCode`. Alles bleibt in der einen
  zwischengespeicherten Funktion (eine Stunde, Fehler nicht gecacht); der
  Abruf wird übergeben, Tests berühren nie das Netz.
- Nicht in diesem Change: neue Abhängigkeiten, Änderungen an Blog-Inhalten,
  Discord-Widget oder Online-Zahlen, eine eigene Discord-Seite.

## Capabilities

### New Capabilities

- `home-discord-cta`: Block, Inhalt, Zugänglichkeit und Platz auf der Startseite.
- `discord-invite-resolution`: Auflösen des Einladungscodes aus dem Kurzlink,
  Rückfall und Verbot direkter Einladungslinks im Quelltext.

### Modified Capabilities

Keine (`add-community-page` ist noch nicht archiviert; die Mitgliederzahl-Route
wird dort beschrieben und hier erweitert).

## Impact

- `layers/home/components/DiscordCta.vue` (neu), `pages/index.vue`
- `shared/utils/discordInvite.ts` (Auflösung des Codes, Orchestrierung),
  `server/api/community/discord.get.ts`
- `i18n/locales/{de,en}.json` (`home.discord.*`)
- `tests/home/`, `tests/community/discord-invite.spec.ts`,
  `tests/architecture/` (ergänzt, nicht gelockert)
- Keine neuen Abhängigkeiten, `quality-baseline.json` unverändert.
