import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'
import { asSchemaOrgCollection } from 'nuxt-schema-org/content'
import {
  defineLocalizedCollections,
  withI18nMeta
} from './layers/content-core/utils/content/collections'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'

const blogSchema = withI18nMeta(z.object({
    title: z.string(),
    alternativeTitle: z.string().optional(),
    description: z.string(),
    slug: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    headerImage: z.string().optional(),
    headerImageAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Author slug(s) matching entries in the `authors` page collection.
    // Without this field on the schema, the column is dropped and the
    // page-level Author lookups (visible cards + Article JSON-LD) come
    // back empty.
    author: z.union([z.string(), z.array(z.string())]).optional(),
    // Slugs of team members featured in this article. Loose backlink to the
    // team profile pages, independent of the `author`/`authors` collection.
    teamMembers: z.array(z.string()).optional(),
    excerpt: z.object({
      type: z.string(),
      children: z.any()
    }),
    // Publication gate: useBlogContent hides an article until this date and
    // falls back to pubDate when unset. Without the column the field was
    // always undefined, so the gate silently never applied.
    //
    // `seo` and `head` are deliberately NOT declared here: @nuxt/content
    // provides both as built-in columns on every page collection. Redeclaring
    // `seo` would replace that built-in shape with a narrower one.
    releaseDate: z.coerce.date().optional()
  }))

// Mirrors the discriminated union in types/carousel.ts. The previous shape
// here was a flat `{ title, image }`, which described none of the slides that
// exist: @nuxt/content derives columns from this rather than validating
// against it, so `slides` landed in one JSON column regardless and only the
// generated type was wrong — which useHomeContent then cast away.
const carouselSchema = z.object({
  key: z.string().optional(),
  slides: z
    .array(z.union([
      z.object({
        type: z.literal('image'),
        src: z.string(),
        alt: z.string(),
        note: z.string().optional()
      }),
      z.object({
        type: z.literal('blog'),
        title: z.string(),
        href: z.string(),
        excerpt: z.string().optional(),
        image: z.string().optional(),
        alt: z.string().optional(),
        author: z.string().optional(),
        date: z.union([z.string(), z.coerce.date()]).optional(),
        tag: z.string().optional()
      }),
      z.object({
        type: z.literal('news'),
        title: z.string(),
        href: z.string().optional(),
        summary: z.string().optional(),
        image: z.string().optional(),
        alt: z.string().optional(),
        date: z.union([z.string(), z.coerce.date()]).optional(),
        tag: z.string().optional()
      }),
      z.object({
        type: z.literal('poi'),
        title: z.string(),
        href: z.string(),
        caption: z.string().optional(),
        image: z.string().optional(),
        alt: z.string().optional(),
        status: z.enum([
          'planning',
          'in-progress',
          'paused',
          'completed'
        ]).optional(),
        progress: z.number().optional(),
        category: z.enum([
          'team',
          'community',
          'collab'
        ]).optional()
      }),
      z.object({
        type: z.literal('event'),
        title: z.string(),
        dateStart: z.union([z.string(), z.coerce.date()]),
        dateEnd: z.union([z.string(), z.coerce.date()]).optional(),
        location: z.string().optional(),
        href: z.string().optional(),
        image: z.string().optional(),
        alt: z.string().optional(),
        note: z.string().optional()
      })
    ]))
    .default([])
})

const connectSchema = z
  .object({
    javaAddress: z.string(),
    bedrockAddress: z.string().optional(),
    bedrockHost: z.string().optional(),
    bedrockPort: z.string().optional()
  })
  .passthrough()

const teamSchema = z
  .object({
    key: z.string().optional(),
    members: z
      .array(z
          .object({
            id: z.union([z.string(), z.number()]),
            name: z.string(),
            slug: z.string().optional(),
            // Sub-role label(s). A single string keeps existing entries
            // valid; an array renders one chip per discipline for members
            // who wear several hats (e.g. development + building).
            role: z.union([z.string(), z.array(z.string())]).optional(),
            // Coarse group for sectioning/ordering; specific job stays in `role`.
            rank: z.enum([
              'admin',
              'teamassist',
              'content',
              'moderation',
              'media',
              'lite'
            ]).optional(),
            slogan: z.string().optional(),
            bio: z.string().optional(),
            since: z.string().optional(),
            links: z.record(z.string(), z.string()).optional(),
            mcName: z.string().optional(),
            href: z.string().optional(),
            avatarUrl: z.string().url().optional(),
            // Marks an entry as an open position rather than a real member.
            openPosition: z.boolean().optional(),
            applyUrl: z.string().url().optional(),
            // Channel for an open position: Discord (regular hiring) or
            // OpenCollective (the donation-funded Lite rank).
            applyVia: z.enum(['discord', 'opencollective']).optional()
          })
          .passthrough())
      .default([])
  })
  .passthrough()

const serverConceptSchema = z
  .object({
    key: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    points: z
      .array(z
          .object({
            id: z.union([z.string(), z.number()]),
            icon: z.string().optional(),
            title: z.string(),
            text: z.string()
          })
          .passthrough())
      .default([])
  })
  .passthrough()

const sponsorsSchema = z
  .object({
    key: z.string().optional(),
    sponsors: z
      .array(z
          .object({
            name: z.string(),
            url: z.string().url(),
            description: z.string().optional(),
            badge: z.string().optional(),
            logo: z.string().optional(),
            icon: z.string().optional()
          })
          .passthrough())
      .default([])
  })
  .passthrough()

const faqSchema = z
  .object({
    key: z.string(),
    question: z.string(),
    order: z.number().int().default(0)
  })
  .passthrough()

const communityPoiSchema = withI18nMeta(z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    status: z.enum([
      'planning',
      'in-progress',
      'paused',
      'completed'
    ]),
    progress: z.number().min(0).max(100).default(0),
    category: z.enum([
      'team',
      'community',
      'collab',
      'farm'
    ]).default('community'),
    featured: z.boolean().optional(),
    featuredCaption: z.string().optional(),
    lore: z.string().optional(),
    goal: z.string().optional(),
    currentState: z.string().optional(),
    location: z.string().optional(),
    coordinates: z
      .object({
        x: z.number(),
        y: z.number().optional(),
        z: z.number(),
        dimension: z.enum([
          'overworld',
          'nether',
          'end'
        ]).optional()
      })
      .optional(),
    builders: z
      .array(z.object({
          name: z.string(),
          mcName: z.string().optional(),
          link: z.string().url().optional()
        }))
      .optional(),
    thumbnail: z.string().optional(),
    thumbnailAlt: z.string().optional(),
    gallery: z
      .array(z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional()
        }))
      .optional(),
    schematics: z
      .array(z.object({
          url: z.string(),
          name: z.string(),
          format: z.enum([
            'litematic',
            'schem',
            'schematic',
            'nbt'
          ]).optional(),
          version: z.string().optional(),
          litematicaVersion: z.string().optional(),
          sizeLabel: z.string().optional(),
          origin: z.object({
            x: z.number(),
            y: z.number(),
            z: z.number()
          }).optional(),
          facing: z.enum([
            'north',
            'south',
            'east',
            'west'
          ]).optional(),
          rotation: z.enum([
            'none',
            'cw_90',
            'cw_180',
            'cw_270',
            'ccw_90'
          ]).optional(),
          setupNotes: z.string().optional()
        }))
      .optional(),
    startedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    forumUrl: z.string().url().optional(),
    // Defaults to true: a POI is community-contributable unless it explicitly
    // opts out. An `.optional()` boolean gets stored as `false` when absent,
    // which would wrongly flag every POI as showcase-only.
    acceptsContributions: z.boolean().default(true)
  }))

// Timestamps stay strings on purpose. They sit inside JSON columns, where a
// coerced Date would be re-serialised as UTC and lose the offset the author
// wrote — and tests/content/events-frontmatter.spec.ts has to see that offset
// to require it. shared/utils/eventPhase.ts parses them at request time.
const eventTimestamp = z.string()

const eventsSchema = withI18nMeta(z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    type: z.enum([
      'build',
      'play',
      'adventure',
      'beta'
    ]),
    thumbnail: z.string().optional(),
    thumbnailAlt: z.string().optional(),
    // Reachable by link regardless of schedule, but never listed anywhere on
    // its own (overview, carousel, sitemap) and never promoted. Default false
    // keeps every existing event public. See shared/utils/eventPhase.ts.
    unlisted: z.boolean().optional(),
    event: z.object({
      announceAt: eventTimestamp.optional(),
      startsAt: eventTimestamp,
      endsAt: eventTimestamp.optional()
    }),
    access: z
      .object({
        mode: z.enum([
          'open',
          'signup',
          'application',
          'invite'
        ]),
        requirements: z.array(z.string()).optional(),
        opens: eventTimestamp.optional(),
        closes: eventTimestamp.optional(),
        url: z.string().url().optional(),
        note: z.string().optional()
      })
      .optional(),
    join: z
      .object({
        server: z.boolean().optional(),
        discord: z.string().url().optional()
      })
      .optional(),
    // `false` switches promotion off; an object narrows or widens the
    // window. A union becomes a JSON column, so `false` survives as `false`.
    promote: z
      .union([
        z.literal(false),
        z.object({
          from: eventTimestamp.optional(),
          until: eventTimestamp.optional()
        })
      ])
      .optional(),
    subject: z
      .object({
        kind: z.enum([
          'gamemode',
          'feature',
          'offer'
        ]),
        name: z.string()
      })
      .optional(),
    build: z
      .object({
        theme: z.string().optional(),
        submissionDeadline: eventTimestamp.optional()
      })
      .optional(),
    // Beta only: what the test looks at and where feedback goes.
    testing: z
      .object({
        focus: z.array(z.string()).optional(),
        knownIssues: z.array(z.string()).optional(),
        feedbackUrl: z.string().url().optional()
      })
      .optional(),
    // Any format; shown only once the event is past. `value` is a string so
    // "42", "3 h" and "> 100" all fit.
    results: z
      .object({
        summary: z.string().optional(),
        placements: z
          .array(z.object({
            place: z.number().int().positive(),
            name: z.string(),
            mcName: z.string().optional(),
            image: z.string().optional(),
            imageAlt: z.string().optional()
          }))
          .optional(),
        stats: z
          .array(z.object({
            label: z.string(),
            value: z.string()
          }))
          .optional(),
        outcome: z.array(z.string()).optional()
      })
      .optional(),
    play: z
      .object({
        teamSize: z.string().optional(),
        modeSummary: z.string().optional()
      })
      .optional(),
    adventure: z
      .object({
        mapVersion: z.string().optional(),
        minecraftVersion: z.string().optional()
      })
      .optional(),
    gallery: z
      .array(z.object({
        src: z.string(),
        alt: z.string(),
        caption: z.string().optional(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional()
      }))
      .optional(),
    resources: z
      .array(z.object({
        kind: z.enum([
          'download',
          'link',
          'discord',
          'schematic'
        ]),
        name: z.string(),
        url: z.string(),
        description: z.string().optional(),
        format: z.string().optional(),
        version: z.string().optional(),
        sizeLabel: z.string().optional()
      }))
      .optional()
  }))

export default defineContentConfig({
  collections: {
    ...defineLocalizedCollections('blog', (locale) => asSchemaOrgCollection({
      type: 'page',
      source: `blog/${locale}/**/*.md`,
      schema: blogSchema.extend({
        // Without an `onUrl`, @nuxtjs/sitemap defaults every entry's `loc` to
        // the content `path`, which is derived from the file location:
        // `content/blog/en/dev-blog-1.md` becomes `/blog/en/dev-blog-1`. The
        // real route is `/en/blog/<slug>` and two English slugs do not even
        // match their filename, so those URLs 404.
        //
        // This body is serialised with `fn.toString()` into a Nitro virtual
        // module and re-evaluated in a scope that holds nothing from this
        // file — it must not close over `locale` or any import. The locale is
        // therefore derived from the collection name argument instead.
        sitemap: defineSitemapSchema({
          name: `blog_${locale}`,
          // Evaluated per sitemap request, not at build time, so a scheduled
          // article appears once its release date passes. It 404s until then
          // (useBlogContent), and a sitemap must not announce a 404.
          filter: (entry) => {
            const release = entry.releaseDate ?? entry.pubDate
            return !release || new Date(release as string | Date).getTime() <= Date.now()
          },
          onUrl: (url, entry, collection) => {
            const loc = collection.split('_').pop()
            url.loc = `/${loc}/blog/${entry.slug}`
            // A real content date, never the build or request time: Google
            // only uses lastmod when it is consistently accurate. It also
            // replaces the hand-kept `sitemap.lastmod` some German articles
            // carry; their `changefreq`/`priority` go, since Google ignores both.
            delete url.changefreq
            delete url.priority
            const modified = entry.updatedDate ?? entry.releaseDate ?? entry.pubDate
            if (modified) url.lastmod = new Date(modified as string | Date)
            // Translations have different slugs, so the module cannot pair
            // them by path. Front-matter `alternates` is the pairing the page's
            // hreflang links use too (held symmetric by
            // tests/content/translation-alternates.spec.ts); the region tags
            // match what the module emits for every other URL.
            const regions: Record<string, string> = { de: 'de-DE', en: 'en-US' }
            const alternates = (entry.alternates ?? []) as { hreflang: string, href: string }[]
            if (alternates.length) {
              url.alternatives = alternates.map(alt => ({
                hreflang: regions[alt.hreflang] ?? alt.hreflang,
                href: alt.href
              }))
            }
          }
        })
      })
    })),
    ...defineLocalizedCollections('home_carousel', (locale) => ({
      type: 'data',
      source: `carousel/${locale}/home.json`,
      schema: carouselSchema
    })),
    ...defineLocalizedCollections('server_connect', (locale) => ({
      type: 'data',
      source: `server/${locale}/connect.json`,
      schema: connectSchema
    })),
    ...defineLocalizedCollections('team', (locale) => ({
      type: 'data',
      source: `team/${locale}/home.json`,
      schema: teamSchema
    })),
    ...defineLocalizedCollections('server_concept', (locale) => ({
      type: 'data',
      source: `server-concept/${locale}/home.json`,
      schema: serverConceptSchema
    })),
    ...defineLocalizedCollections('sponsors', (locale) => ({
      type: 'data',
      source: `sponsors/${locale}/home.json`,
      schema: sponsorsSchema
    })),
    ...defineLocalizedCollections('faq', (locale) => ({
      type: 'page',
      source: `faq/${locale}/*.md`,
      schema: faqSchema
    })),
    ...defineLocalizedCollections('team_faq', (locale) => ({
      type: 'page',
      source: `team-faq/${locale}/*.md`,
      schema: faqSchema
    })),
    ...defineLocalizedCollections('community_poi', (locale) => asSchemaOrgCollection({
      type: 'page',
      source: `community-poi/${locale}/**/*.md`,
      // Same derived-path problem as the blog collection above; see the
      // comment there. The serialised body must not close over `locale`.
      schema: communityPoiSchema.extend({
        sitemap: defineSitemapSchema({
          name: `community_poi_${locale}`,
          onUrl: (url, entry, collection) => {
            const loc = collection.split('_').pop()
            url.loc = `/${loc}/community-poi/${entry.slug}`
            // Same rules as the blog collection above: a real content date or
            // none, and translations paired through front-matter `alternates`.
            delete url.changefreq
            delete url.priority
            const modified = entry.updatedAt ?? entry.startedAt
            if (modified) url.lastmod = new Date(modified as string | Date)
            const regions: Record<string, string> = { de: 'de-DE', en: 'en-US' }
            const alternates = (entry.alternates ?? []) as { hreflang: string, href: string }[]
            if (alternates.length) {
              url.alternatives = alternates.map(alt => ({
                hreflang: regions[alt.hreflang] ?? alt.hreflang,
                href: alt.href
              }))
            }
          }
        })
      })
    })),
    // Deliberately no `defineSitemapSchema`: whether an event is visible
    // depends on the time of the request, which a build-time sitemap entry
    // cannot know. server/api/__sitemap__/events.ts lists them instead.
    ...defineLocalizedCollections('events', (locale) => ({
      type: 'page',
      source: `events/${locale}/**/*.md`,
      schema: eventsSchema
    })),
    authors: defineCollection({
      type: 'page',
      source: 'authors/**/*.md',
      schema: z
        .object({
          slug: z.string(),
          name: z.string(),
          role: z.string().optional(),
          avatar: z.string().optional(),
          bio: z.string().optional(),
          links: z.record(z.string(), z.string()).optional()
        })
        .passthrough()
    })
  }
})
