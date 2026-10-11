---
slug: 'workflows'
translationKey: 'workflows'
title: 'Workflows: wiederverwendbare GitHub-Actions-Workflows'
summary: 'Zentrale Workflows für Gradle-Builds, Docker-Images, SBOMs, Trivy-Scans, Resource Packs und Commit-Prüfung.'
status: 'active'
releasedAt: '2026-05-11'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'GitHub Actions'
license: 'MIT'
links:
  docs: 'https://github.com/OneLiteFeatherNET/workflows#available-workflows'
  source: 'https://github.com/OneLiteFeatherNET/workflows'
  issues: 'https://github.com/OneLiteFeatherNET/workflows/issues'
maintainers:
  - 'themeinerlp'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/workflows'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/workflows'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/workflows'
---

## Was ist das?

Workflows ist eine Sammlung wiederverwendbarer GitHub-Actions-Workflows für die Repositories der OneLiteFeatherNET-Organisation. Sie stehen als `workflow_call` bereit. Ein Repository bindet sie mit `uses:` ein und pinnt eine Version, statt die CI-Logik in jedes Projekt zu kopieren. Das Projekt steht unter der MIT-Lizenz.

## Was die Workflows tun

- **gradle-build-pr** baut und testet Gradle-Projekte auf Pull Requests, auf Ubuntu, Windows und macOS. Er läuft nur, wenn sich relevante Dateien geändert haben.
- **gradle-publish** veröffentlicht ein Gradle-Projekt beim Push eines Tags in das Maven-Repository von OneLiteFeather.
- **docker-publish** baut ein Container-Image und lädt es in Teilen hoch, damit kein einzelner Request ein Proxy-Limit überschreitet. Optional signiert er das Image ohne Schlüssel (keyless) mit cosign über GitHub OIDC.
- **sbom-publish** lädt eine CycloneDX-SBOM in Dependency-Track hoch. Liefert ein Projekt keine SBOM, erzeugt Trivy eine.
- **security-scan** prüft ein Dateisystem oder ein Container-Image mit Trivy und zeigt die Befunde im Code Scanning. Standardmäßig blockiert er nichts.
- **resourcepack-publish** packt ein Resource Pack reproduzierbar als ZIP, legt Prüfsummen und ein Manifest daneben und kündigt die Version auf Discord an.
- **pr-lint** prüft Conventional Commits im PR-Titel und in jedem Commit, damit release-please keine Version stillschweigend auslässt.
- Dazu kommen **release-please**, **markdown-lint** (markdownlint und lychee) und **close-invalid-prs**, das PRs von Fork-Standardbranches schließt.

Die Standards sind Java 25 mit Temurin und eine Matrix über drei Betriebssysteme auf Pull Requests.

## So wird es verwendet

Ein Build bei jedem Pull Request:

```yaml
jobs:
  build:
    uses: OneLiteFeatherNET/workflows/.github/workflows/gradle-build-pr.yml@v2
    secrets: inherit
```

Die README empfiehlt, auf ein Tag oder eine Major-Version zu pinnen statt auf `main`. Renovate kann die Version danach automatisch nachziehen.

## Für wen ist das?

Für Maintainer von OneLiteFeather-Projekten, die Build-, Release- und Veröffentlichungs-Pipelines nicht in jedem Repository einzeln pflegen wollen. Außerhalb der Organisation lohnt ein Blick auf die Ziele: Maven-Repository, Dependency-Track und der Speicher für Resource Packs sind auf die Infrastruktur von OneLiteFeather ausgelegt.
