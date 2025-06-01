# Canonical URLs and Language Linking for Blog Posts

This document explains how to use the canonical URL and language linking feature for blog posts in the OneLiteFeather blog.

## What are Canonical URLs?

Canonical URLs help search engines understand which URL is the preferred version when there are multiple URLs that lead to the same content. This is especially important for multilingual sites like our blog, which has content in both German and English.

## How to Link Blog Posts Across Languages

To link blog posts across languages, you need to add a `translationKey` field to the frontmatter of each blog post. The `translationKey` should be the same for all language versions of the same content.

### Example

For a blog post about Proxmox and Ansible, you would add the following to the frontmatter of both the German and English versions:

```yaml
---
title: 'Mit Proxmox und Ansible in eine Achterbahn der Automatisierung'
description: '...'
pubDate: 'Oct 15 2023'
headerImage: '...'
headerImageAlt: '...'
slug: 'mit-proxmox-und-ansible-in-eine-achterbahn-der-automatisierung-vserver'
translationKey: 'proxmox-ansible-automation'  # This is the key that links the translations
---
```

```yaml
---
title: 'Riding the Rollercoaster of Automation with Proxmox and Ansible'
description: '...'
pubDate: 'Oct 15 2023'
headerImage: '...'
headerImageAlt: '...'
slug: 'riding-the-rollercoaster-of-automation-with-proxmox-and-ansible'
translationKey: 'proxmox-ansible-automation'  # This is the key that links the translations
---
```

## How It Works

When a blog post is viewed, the system will:

1. Look for other blog posts with the same `translationKey` in different languages.
2. Add a canonical URL link to the current page.
3. Add alternate language links to the head of the page, pointing to the translations.
4. Add an x-default hreflang link pointing to the default locale version (German).

This helps search engines understand the relationship between the different language versions of the same content and can properly index them.

## Best Practices

1. Always use the same `translationKey` for all language versions of the same content.
2. Make sure the `translationKey` is unique for each piece of content.
3. Use descriptive keys that reflect the content of the blog post.
4. Keep the keys consistent across all language versions.

## Technical Details

The implementation uses the following components:

1. A `translationKey` field in the content schema (content.config.ts).
2. Code in [...slug].vue to find translations in other languages.
3. Code to add canonical URL and alternate language links to the head.
4. Configuration in nuxt.config.ts to ensure the siteUrl is properly configured.

This ensures that search engines understand the relationship between the different language versions of the same content and can properly index them.