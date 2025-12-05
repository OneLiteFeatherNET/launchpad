import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSchemaOrgCollection } from 'nuxt-schema-org/content'
import { createLocalizedCollections, withI18nMeta } from './utils/content/collections'

const blogSchema = withI18nMeta(
  z.object({
    title: z.string(),
    alternativeTitle: z.string().optional(),
    description: z.string(),
    slug: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    headerImage: z.string().optional(),
    headerImageAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    excerpt: z.object({
      type: z.string(),
      children: z.any()
    })
  })
)

const carouselSchema = z.object({
  key: z.string().optional(),
  slides: z
    .array(
      z.object({
        title: z.string(),
        image: z.string()
      })
    )
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

const timelineSchema = z
  .object({
    key: z.string().optional(),
    events: z
      .array(
        z
          .object({
            id: z.union([z.string(), z.number()]),
            title: z.string(),
            date: z.union([z.string(), z.coerce.date()]),
            description: z.string().optional(),
            href: z.string().optional(),
            icon: z.string().optional(),
            side: z.enum(['left', 'right']).optional(),
            colorVariant: z.enum(['brand', 'accent', 'neutral', 'orange', 'purple']).optional()
          })
          .passthrough()
      )
      .default([])
  })
  .passthrough()

const teamSchema = z
  .object({
    key: z.string().optional(),
    members: z
      .array(
        z
          .object({
            id: z.union([z.string(), z.number()]),
            name: z.string(),
            slug: z.string().optional(),
            role: z.string().optional(),
            slogan: z.string().optional(),
            mcName: z.string().optional(),
            href: z.string().optional(),
            avatarUrl: z.string().url().optional()
          })
          .passthrough()
      )
      .default([])
  })
  .passthrough()

const serverConceptSchema = z
  .object({
    key: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    points: z
      .array(
        z
          .object({
            id: z.union([z.string(), z.number()]),
            icon: z.string().optional(),
            title: z.string(),
            text: z.string()
          })
          .passthrough()
      )
      .default([])
  })
  .passthrough()

export default defineContentConfig({
  collections: {
    ...createLocalizedCollections('blog', (locale) =>
      defineCollection(
        asSchemaOrgCollection({
          type: 'page',
          source: `blog/${locale}/**/*.md`,
          schema: blogSchema
        })
      )
    ),
    ...createLocalizedCollections('home_carousel', (locale) =>
      defineCollection({
        type: 'data',
        source: `carousel/${locale}/home.json`,
        schema: carouselSchema
      })
    ),
    ...createLocalizedCollections('server_connect', (locale) =>
      defineCollection({
        type: 'data',
        source: `server/${locale}/connect.json`,
        schema: connectSchema
      })
    ),
    ...createLocalizedCollections('timeline', (locale) =>
      defineCollection({
        type: 'data',
        source: `timeline/${locale}/home.json`,
        schema: timelineSchema
      })
    ),
    ...createLocalizedCollections('team', (locale) =>
      defineCollection({
        type: 'data',
        source: `team/${locale}/home.json`,
        schema: teamSchema
      })
    ),
    ...createLocalizedCollections('server_concept', (locale) =>
      defineCollection({
        type: 'data',
        source: `server-concept/${locale}/home.json`,
        schema: serverConceptSchema
      })
    ),
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
          links: z.record(z.string()).optional()
        })
        .passthrough()
    })
  }
})
