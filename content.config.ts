import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSchemaOrgCollection } from 'nuxt-schema-org/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'


let blogSchema = z.object({
    title: z.string(),
    alternativeTitle: z.string().optional(),
    description: z.string(),
    slug: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    headerImage: z.string().optional(),
    headerImageAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Link to the same article in other languages
    translationKey: z.string().optional(),

    // New optional SEO header fields (backwards compatible)
    canonical: z.string().url().optional(),
    alternates: z.array(
        z.object({
            hreflang: z.string(),
            href: z.string().url(),
        })
    ).optional(),

    excerpt: z.object({
        type: z.string(),
        children: z.any(),
    }),
});
export default defineContentConfig({
    collections: {
        blog_de: defineCollection(asSitemapCollection(asSchemaOrgCollection({
            type: 'page',
            source: 'blog/de/**/*.md',
            schema: blogSchema
        }))),
        blog_en: defineCollection(asSitemapCollection(asSchemaOrgCollection({
            type: 'page',
            source: 'blog/en/**/*.md',
            schema: blogSchema
        }))),

        // Carousel content for home page (i18n)
        home_carousel_de: defineCollection({
            type: "data",
            source: 'carousel/de/home.json',
            schema: z.object({
                key: z.string().optional(),
                slides: z.array(
                    z.object({
                        // Definiere die Struktur deiner Slides explizit
                        title: z.string(),
                        image: z.string(),
                        // ... weitere Felder
                    })
                ).default([]),
            }),
        }),
        home_carousel_en: defineCollection({
            type: "data",
            source: 'carousel/en/home.json',
            schema: z.object({
                key: z.string().optional(),
                slides: z.array(
                    z.object({
                        // Definiere die Struktur deiner Slides explizit
                        title: z.string(),
                        image: z.string(),
                        // ... weitere Felder
                    })
                ).default([]),
            }),
        }),

        // Server connect information (i18n)
        server_connect_de: defineCollection({
            type: "data",
            source: 'server/de/connect.json',
            schema: z.object({
                javaAddress: z.string(),
                bedrockAddress: z.string().optional(),
                bedrockHost: z.string().optional(),
                bedrockPort: z.string().optional(),
            }).passthrough(),
        }),
        server_connect_en: defineCollection({
            type: "data",
            source: 'server/en/connect.json',
            schema: z.object({
                javaAddress: z.string(),
                bedrockAddress: z.string().optional(),
                bedrockHost: z.string().optional(),
                bedrockPort: z.string().optional(),
            }).passthrough(),
        }),

        // Timeline (i18n)
        timeline_de: defineCollection({
            type: "data",
            source: 'timeline/de/home.json',
            schema: z.object({
                key: z.string().optional(),
                events: z.array(
                    z.object({
                        id: z.union([z.string(), z.number()]),
                        title: z.string(),
                        date: z.union([z.string(), z.coerce.date()]),
                        description: z.string().optional(),
                        href: z.string().optional(),
                        icon: z.string().optional(),
                        side: z.enum(['left', 'right']).optional(),
                        colorVariant: z.enum(['brand', 'accent', 'neutral', 'orange', 'purple']).optional(),
                    }).passthrough()
                ).default([]),
            }).passthrough(),
        }),
        timeline_en: defineCollection({
            type: "data",
            source: 'timeline/en/home.json',
            schema: z.object({
                key: z.string().optional(),
                events: z.array(
                    z.object({
                        id: z.union([z.string(), z.number()]),
                        title: z.string(),
                        date: z.union([z.string(), z.coerce.date()]),
                        description: z.string().optional(),
                        href: z.string().optional(),
                        icon: z.string().optional(),
                        side: z.enum(['left', 'right']).optional(),
                        colorVariant: z.enum(['brand', 'accent', 'neutral', 'orange', 'purple']).optional(),
                    }).passthrough()
                ).default([]),
            }).passthrough(),
        }),

        // Team overview (i18n)
        team_de: defineCollection({
            type: "data",
            source: 'team/de/home.json',
            schema: z.object({
                key: z.string().optional(),
                members: z.array(
                    z.object({
                        id: z.union([z.string(), z.number()]),
                        name: z.string(),
                        slug: z.string().optional(),
                        role: z.string().optional(),
                        slogan: z.string().optional(),
                        mcName: z.string().optional(),
                        href: z.string().optional(),
                        avatarUrl: z.string().url().optional(),
                    }).passthrough()
                ).default([]),
            }).passthrough(),
        }),
        team_en: defineCollection({
            type: "data",
            source: 'team/en/home.json',
            schema: z.object({
                key: z.string().optional(),
                members: z.array(
                    z.object({
                        id: z.union([z.string(), z.number()]),
                        name: z.string(),
                        slug: z.string().optional(),
                        role: z.string().optional(),
                        slogan: z.string().optional(),
                        mcName: z.string().optional(),
                        href: z.string().optional(),
                        avatarUrl: z.string().url().optional(),
                    }).passthrough()
                ).default([]),
            }).passthrough(),
        }),

        authors: defineCollection({
            type: "page",
            source: 'authors/**/*.md',
            schema: z.object({
                slug: z.string(),
                name: z.string(),
                role: z.string().optional(),
                avatar: z.string().optional(),
                bio: z.string().optional(),
                links: z.record(z.string()).optional(),
            }).passthrough(),
        }),

        // Server concept (i18n)
        server_concept_de: defineCollection({
            type: "data",
            source: 'server-concept/de/home.json',
            schema: z.object({
                key: z.string().optional(),
                title: z.string(),
                subtitle: z.string().optional(),
                points: z.array(
                    z.object({
                        id: z.union([z.string(), z.number()]),
                        icon: z.string().optional(),
                        title: z.string(),
                        text: z.string(),
                    }).passthrough()
                ).default([]),
            }).passthrough(),
        }),
        server_concept_en: defineCollection({
            type: "data",
            source: 'server-concept/en/home.json',
            schema: z.object({
                key: z.string().optional(),
                title: z.string(),
                subtitle: z.string().optional(),
                points: z.array(
                    z.object({
                        id: z.union([z.string(), z.number()]),
                        icon: z.string().optional(),
                        title: z.string(),
                        text: z.string(),
                    }).passthrough()
                ).default([]),
            }).passthrough(),
        }),
    }
})
