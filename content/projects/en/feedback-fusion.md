---
slug: 'feedback-fusion'
translationKey: 'feedback-fusion'
title: 'FeedbackFusion: cloud-native collection of user feedback'
summary: 'A Rust application that collects and manages user feedback at scale. It runs on Kubernetes and stores its data in a database.'
status: 'active'
logo: '/images/projects/feedback-fusion/icon.png'
logoAlt: 'Code excerpt from service.proto'
socialImage: '/images/projects/feedback-fusion/social.png'
releasedAt: '2024-07-06'
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
platforms:
  - 'Kubernetes'
  - 'Docker'
license: 'MIT'
links:
  docs: 'https://onelitefeathernet.github.io/feedback-fusion/nightly/docs'
  source: 'https://github.com/OneLiteFeatherNET/feedback-fusion'
  issues: 'https://github.com/OneLiteFeatherNET/feedback-fusion/issues'
alternates:
  - hreflang: 'de'
    href: 'https://onelitefeather.net/de/projects/feedback-fusion'
  - hreflang: 'en'
    href: 'https://onelitefeather.net/en/projects/feedback-fusion'
  - hreflang: 'x-default'
    href: 'https://onelitefeather.net/en/projects/feedback-fusion'
---

## What is this?

FeedbackFusion is a cloud-native application written in Rust for collecting and managing user feedback. It is built to run on Kubernetes and designed for large volumes of feedback. Besides the server, the repository contains a Helm chart, among other components. The project is licensed under the MIT License.

## Features

- **Stateless apart from the database:** The application keeps no state other than its database connection, which makes it straightforward to run on Kubernetes.
- **Several databases:** The rbatis ORM supports MySQL, MariaDB, PostgreSQL and MSSQL.
- **gRPC API with OIDC:** The API uses gRPC for communication and OIDC for authentication.
- **Frontend built with lit:** The user interface is based on lit and the Open-WC standards and is not tied to a particular framework.

## Deployment

FeedbackFusion is available as a Helm chart and as a Docker image. To install it with Helm, add the chart repository and install the chart:

```sh
helm repo add feedback-fusion https://onelitefeathernet.github.io/feedback-fusion
helm install feedback-fusion feedback-fusion/feedback-fusion
```

Alternatively, run the Docker image `ghcr.io/onelitefeathernet/feedback-fusion` directly with Docker. You connect the database yourself.

## Who is it for?

FeedbackFusion is for teams that want to collect and manage user feedback for their own services and that run a Kubernetes environment to host it. If you want to contribute, the repository describes the development setup and the tests. Questions and bug reports belong in the GitHub issues.
