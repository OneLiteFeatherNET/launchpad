# @nuxt/content v2 → v3

<details>
<summary>Old patterns (@nuxt/content v2)</summary>

| v2 | v3 |
|---|---|
| `queryContent()` | `queryCollection()` |
| `.findOne()` / `.find()` | `.first()` / `.all()` |
| `fetchContentNavigation()` | `queryCollectionNavigation()` |
| `.findSurround()` | `queryCollectionItemSurroundings()` |
| `doc._path` | `doc.path` |
| `useContent()` | removed |
| `<ContentDoc>` / `<ContentList>` / `<ContentQuery>` | `<ContentRenderer>` |
| `<ContentSlot>` / `<MDCSlot>` | `<slot mdc-unwrap="p">` |
| `_dir.yml` | `.navigation.yml` |
| `ProseCodeInline` | `ProseCode` |
| `ProseCode` | `ProsePre` |

</details>

If you're reading v2 docs, examples, or an older blog post about `@nuxt/content`,
translate through this table before applying anything — none of the v2 APIs exist
in this repo's v3 install. For everything else (schemas, collections, the
repository boundary, the `path` field), see `SKILL.md` in this skill.
