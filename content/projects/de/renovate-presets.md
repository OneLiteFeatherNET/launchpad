---
slug: 'renovate-presets'
translationKey: 'renovate-presets'
title: 'Renovate-Presets für Paper und Minestom'
summary: 'Renovate-Konfigurationen, die Paper-API und Minestom richtig versionieren und allen Repositories dieselben Grundeinstellungen geben.'
status: 'active'
releasedAt: '2025-07-21'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Renovate'
license: 'MIT'
links:
  docs: 'https://github.com/OneLiteFeatherNET/renovate#readme'
  source: 'https://github.com/OneLiteFeatherNET/renovate'
  issues: 'https://github.com/OneLiteFeatherNET/renovate/issues'
maintainers:
  - 'themeinerlp'
  - 'theevilreaper'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/renovate-presets'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/renovate-presets'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/renovate-presets'
---

## Was ist das?

Renovate-Presets ist eine Sammlung von [Renovate](https://docs.renovatebot.com/)-Konfigurationen für die Repositories von OneLiteFeather. Renovate liest die Versionen von Paper-API und Minestom mit ihrem eigenen Schema nicht richtig. Die Presets bringen die passende Versionierung mit und geben allen Projekten dieselben Grundeinstellungen für Abhängigkeitsupdates. Das Repository steht unter der MIT-Lizenz.

## Die Presets

- **default** legt die Grundeinstellungen fest: Renovate-Empfehlungen, semantische Commit-Messages, automatisches Mergen von Patch-Updates, Bürozeiten in der Zeitzone Europe/Berlin, ein `renovate`-Label und Vulnerability-Alerts. Major-Updates werden nie automatisch gemergt. Das Argument ist das Team, das als Reviewer jedes Renovate-PRs eingetragen wird.
- **paper** versioniert `io.papermc.paper:paper-api` nach dem Schema `X.Y.Z-…`.
- **minestom** versioniert `net.minestom:minestom` nach dem datumsbasierten Schema, etwa `2026.08.28-26.2`.

## Verwendung

Jedes Repository nutzt die Default-Variante mit dem GitHub-Team als Argument. Für Minestom- oder Paper-Projekte kommt die passende Variante hinzu:

```json
{
  "extends": [
    "github>OneLiteFeatherNET/renovate:default(OneLiteFeatherNET/mein-team-maintainers)",
    "github>OneLiteFeatherNET/renovate:minestom"
  ]
}
```

Ohne Team als Argument bleibt der Reviewer leer. Die Presets sind über Git-Tags im Format `v<major>.<minor>.<patch>` versioniert, etwa `…:default#v1.1.1`, und lassen sich so festpinnen.

## Für wen ist das?

Für Maintainer von Minecraft-Server- und Minestom-Projekten, die Renovate verwenden. Die Default-Regeln sind auf OneLiteFeather zugeschnitten: Pakete unter `net.onelitefeather` und `net.theevilreaper` werden aus dem Maven-Repository von OneLiteFeather gelesen. Außerhalb der Organisation lohnen sich vor allem die Paper- und Minestom-Presets.
