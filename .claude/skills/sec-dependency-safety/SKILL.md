---
name: sec-dependency-safety
description: >-
  Vet dependencies before adding them to this Nuxt 4 repo. Use whenever
  changing `package.json` / lockfile.
---

# Dependency Safety

Single topic: don't introduce risky/unjustified dependencies.

- No new dependency or config preset without clear justification
  (AGENTS.md rule).
- Check it is maintained, reasonably sized, and not flagged by
  Dependabot before adding; prefer a small local helper over a heavy dep.

Verify: `package.json` diff justified; Dependabot/security advisories
clean for the new dep.
