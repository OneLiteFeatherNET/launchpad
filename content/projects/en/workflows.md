---
slug: 'workflows'
translationKey: 'workflows'
title: 'Workflows: reusable GitHub Actions workflows'
summary: 'Central workflows for Gradle builds, Docker images, SBOMs, Trivy scans, resource packs and commit checks.'
status: 'active'
logo: '/images/projects/workflows/icon.png'
logoAlt: 'Code excerpt from gradle-build-pr.yml'
socialImage: '/images/projects/workflows/social.png'
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

## What is this?

Workflows is a collection of reusable GitHub Actions workflows for the repositories of the OneLiteFeatherNET organisation. They are exposed as `workflow_call`. A repository calls them with `uses:` and pins a version, instead of copying CI logic into every project. The project is licensed under the MIT License.

## What the workflows do

- **gradle-build-pr** builds and tests Gradle projects on pull requests, on Ubuntu, Windows and macOS. It only runs when relevant files have changed.
- **gradle-publish** publishes a Gradle project to the OneLiteFeather Maven repository when a tag is pushed.
- **docker-publish** builds a container image and uploads it in chunks, so that no single request exceeds a proxy limit. Optionally it signs the image keylessly with cosign, using GitHub OIDC.
- **sbom-publish** uploads a CycloneDX SBOM to Dependency-Track. If a project does not provide an SBOM, Trivy generates one.
- **security-scan** scans a file system or a container image with Trivy and shows the findings in code scanning. By default it blocks nothing.
- **resourcepack-publish** packs a resource pack into a reproducible ZIP, places checksums and a manifest beside it, and announces the version on Discord.
- **pr-lint** checks Conventional Commits in the PR title and in every commit, so that release-please cannot silently skip a release.
- There are also **release-please**, **markdown-lint** (markdownlint and lychee) and **close-invalid-prs**, which closes PRs opened from a fork's default branch.

The defaults are Java 25 on Temurin and a matrix over three operating systems for pull requests.

## How to use it

A build on every pull request:

```yaml
jobs:
  build:
    uses: OneLiteFeatherNET/workflows/.github/workflows/gradle-build-pr.yml@v2
    secrets: inherit
```

The README recommends pinning to a tag or a major version rather than `main`. Renovate can then bump the version automatically.

## Who is it for?

For maintainers of OneLiteFeather projects who do not want to maintain build, release and publishing pipelines separately in every repository. Outside the organisation, check the targets first: the Maven repository, Dependency-Track and the resource pack storage are set up for the OneLiteFeather infrastructure.
