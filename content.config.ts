import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSchemaOrgCollection } from 'nuxt-schema-org/content'


export default defineContentConfig({
    collections: {
        blog_de: defineCollection( asSchemaOrgCollection({
            type: 'page',
            source: 'blog/de/**/*.md',
            schema: z.object({
                title: z.string(),
                description: z.string(),
                slug: z.string(),
                // Transform string to Date object
                pubDate: z.coerce.date(),
                updatedDate: z.coerce.date().optional(),
                headerImage: z.string().optional(),
                headerImageAlt: z.string().optional(),
                excerpt: z.object({
                    type: z.string(),
                    children: z.any(),
                }),
            })
        })),
        blog_en: defineCollection( asSchemaOrgCollection({
            type: 'page',
            source: 'blog/en/*.md',
            schema: z.object({
                title: z.string(),
                description: z.string(),
                slug: z.string(),
                // Transform string to Date object
                pubDate: z.coerce.date(),
                updatedDate: z.coerce.date().optional(),
                headerImage: z.string().optional(),
                headerImageAlt: z.string().optional(),
                excerpt: z.object({
                    type: z.string(),
                    children: z.any(),
                }),
            })
        }))
    }
})