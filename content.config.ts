import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'
import { asSchemaOrgCollection } from 'nuxt-schema-org/content'
import {
  defineLocalizedCollections,
  withI18nMeta
} from './utils/content/collections'
import {asSitemapCollection} from "@nuxtjs/sitemap/content";

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
    })
  }))

const carouselSchema = z.object({
  key: z.string().optional(),
  slides: z
    .array(z.object({
        title: z.string(),
        image: z.string()
      }))
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
      .array(z
          .object({
            id: z.union([z.string(), z.number()]),
            title: z.string(),
            date: z.union([z.string(), z.coerce.date()]),
            description: z.string().optional(),
            href: z.string().optional(),
            icon: z.string().optional(),
            side: z.enum(['left', 'right']).optional(),
            colorVariant: z.enum(['brand',
'accent',
'neutral',
'orange',
'purple']).optional()
          })
          .passthrough())
      .default([])
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
            rank: z.enum(['admin', 'teamassist', 'content', 'moderation', 'media', 'lite']).optional(),
            slogan: z.string().optional(),
            bio: z.string().optional(),
            since: z.string().optional(),
            links: z.record(z.string()).optional(),
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
      'collab'
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
    updatedAt: z.coerce.date().optional()
  }))

export default defineContentConfig({
  collections: {
    ...defineLocalizedCollections('blog', (locale) => asSitemapCollection(asSchemaOrgCollection({
              type: 'page',
              source: `blog/${locale}/**/*.md`,
              schema: blogSchema
          }))),
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
    ...defineLocalizedCollections('timeline', (locale) => ({
      type: 'data',
      source: `timeline/${locale}/home.json`,
      schema: timelineSchema
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
    ...defineLocalizedCollections('community_poi', (locale) => asSitemapCollection(asSchemaOrgCollection({
          type: 'page',
          source: `community-poi/${locale}/**/*.md`,
          schema: communityPoiSchema
        }))),
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
