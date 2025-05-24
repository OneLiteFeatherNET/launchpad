import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
    collections: {
        blog: defineCollection({
            type: 'page',
            source: 'blog/**/*.md',
            schema: z.object({
                title: z.string(),
                description: z.string(),
                // Transform string to Date object
                pubDate: z.coerce.date(),
                updatedDate: z.coerce.date().optional(),
                heroImage: z.string().optional(),
                headerImage: z.string().optional(),
                language: z.enum(['en', 'de']).default('de')
            })
        })
    }
})