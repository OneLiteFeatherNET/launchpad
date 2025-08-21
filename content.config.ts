import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSchemaOrgCollection } from 'nuxt-schema-org/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'
import { SponsorTierEnum } from './composables/useSponsorTier'

// Base namespace/key regex pattern
const namespaceKeyPattern = /^[a-z][a-z0-9-]*$/
const namespaceKeyMessage = "Must start with a lowercase letter and can only contain lowercase letters, numbers, and hyphens"

// Create a reusable function to generate namespace/key schemas with different configurations
const createNamespaceKeySchema = (options: { 
  namespaceRequired?: boolean, 
  keyRequired?: boolean,
  defaultNamespace?: string 
} = {}) => {
  const { namespaceRequired = false, keyRequired = false, defaultNamespace } = options

  const namespaceSchema = z.string().regex(namespaceKeyPattern, { message: namespaceKeyMessage })
  const keySchema = z.string().regex(namespaceKeyPattern, { message: namespaceKeyMessage })

  // Apply optional/required and default values based on options
  const finalNamespaceSchema = defaultNamespace 
    ? namespaceSchema.default(defaultNamespace)
    : namespaceRequired 
      ? namespaceSchema 
      : namespaceSchema.optional()

  const finalKeySchema = keyRequired 
    ? keySchema 
    : keySchema.optional()

  return z.object({
    namespace: finalNamespaceSchema,
    key: finalKeySchema
  })
}

// Define all schema variants using the factory function
const namespaceKeySchema = createNamespaceKeySchema()
const authorNamespaceKeySchema = createNamespaceKeySchema({ defaultNamespace: "author" })
const blogNamespaceKeySchema = createNamespaceKeySchema({ defaultNamespace: "blog" })
const sponsorNamespaceKeySchema = createNamespaceKeySchema({ defaultNamespace: "sponsor" })
const requiredNamespaceKeySchema = createNamespaceKeySchema({ namespaceRequired: true, keyRequired: true })
const projectNamespaceKeySchema = createNamespaceKeySchema({ defaultNamespace: "project", keyRequired: true })

// Schema for referencing entities by namespace and key
const referenceSchema = createNamespaceKeySchema({ namespaceRequired: true, keyRequired: true });


// Common field schemas for reuse
const commonFields = {
  title: z.string(),
  description: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().optional(),
  featured: z.boolean().optional(),
}

// Common social media fields
const socialFields = {
  github: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
}

// Reusable schema for title-description pairs
const titleDescriptionSchema = z.object({
  title: commonFields.title,
  description: commonFields.description,
})

// Schema for server rules
const rulesSchema = z.object({
  title: commonFields.title,
  description: commonFields.description,
  generalRules: z.array(z.object({
    title: commonFields.title,
    description: commonFields.description,
  })).optional(),
  sections: z.array(z.object({
    title: commonFields.title,
    description: commonFields.description,
    rules: z.array(z.object({
      title: commonFields.title,
      description: commonFields.description,
    })),
  })).optional(),
  // For backward compatibility
  rules: z.array(z.object({
    title: commonFields.title,
    description: commonFields.description,
  })).optional(),
})

// Reusable schema for items with color
const coloredItemSchema = z.object({
  title: commonFields.title,
  description: commonFields.description,
  color: z.string(),
})

// Unified schema for both team members and standalone authors
const personSchema = z.object({
  name: commonFields.name,
  slug: commonFields.slug,
  ...authorNamespaceKeySchema.shape,
  minecraftUsername: z.string().optional(),
  profileImage: z.string().optional(),
  avatar: z.string().optional(), // Alternative to profileImage
  role: z.string().optional(),
  about: z.string().optional(),
  bio: z.string().optional(), // Alias for about, used in team members
  ...socialFields,
  title: z.string().optional(),
  quote: z.string().optional(), // Used in team members
  joinDate: z.string().optional(), // Used in team members
  onProbation: z.boolean().optional(), // Used in team members
});
const memberSchema = z.object({
  namespace: z.string().regex(namespaceKeyPattern, { message: namespaceKeyMessage }),
  key: z.string().regex(namespaceKeyPattern, { message: namespaceKeyMessage }),
});

// Use the unified personSchema for authors
const authorSchema = personSchema;

// Reusable roadmap item schema
const roadmapItemSchema = z.object({
  title: commonFields.title,
  description: commonFields.description,
  status: z.string(),
});

// Reusable bstats schema
const bstatsSchema = z.object({
  pluginId: z.string(),
  showServers: z.boolean().optional(),
  showPlayers: z.boolean().optional(),
});

const projectSchema = z.object({
  name: commonFields.name,
  ...projectNamespaceKeySchema.shape,
  description: commonFields.description,
  status: z.string(),
  featured: commonFields.featured,
  image: commonFields.image,
  ...socialFields,
  // Reference to authors by namespace and key
  authors: z.array(referenceSchema).optional(),
  features: z.array(z.string()).optional(),
  roadmap: z.array(roadmapItemSchema).optional(),
  bstats: bstatsSchema.optional(),
  // For backward compatibility
  slug: z.string().optional(),
  // Flag to indicate if this is an affiliate link
  isAffiliate: z.boolean().optional(),
});

// Slide schema for carousel
const slideSchema = z.object({
  title: commonFields.title,
  subtitle: z.string(),
  image: commonFields.image,
});

const carouselSchema = z.object({
  slides: z.array(slideSchema),
});

// Timeline item schema for history
const timelineItemSchema = z.object({
  year: z.string(),
  color: z.string(),
  description: commonFields.description,
  slug: commonFields.slug.optional(), // Optional slug for linking to detail pages
});

// Timeline detail page schema
const timelineDetailSchema = z.object({
  title: commonFields.title,
  year: z.string(),
  month: z.string().optional(),
  color: z.string(),
  description: commonFields.description,
  slug: commonFields.slug,
  content: z.string().optional(),
  image: commonFields.image.optional(),
  translationKey: z.string().optional(),
});

const historySchema = z.object({
  title: commonFields.title,
  timeline: z.array(timelineItemSchema),
});

// Activity item schema
const activityItemSchema = z.object({
  title: commonFields.title,
  description: commonFields.description,
  image: commonFields.image,
  color: z.string(),
});

const activitiesSchema = z.object({
  title: commonFields.title,
  activities: z.array(activityItemSchema),
});

// Rank schema for team
const rankSchema = z.object({
  namespace: z.string().regex(namespaceKeyPattern, { message: namespaceKeyMessage }),
  key: z.string().regex(namespaceKeyPattern, { message: namespaceKeyMessage }),
  members: z.array(memberSchema), // Use the unified personSchema for team members
});

// Rank explanation schema
const rankExplanationSchema = z.object({
  rank: z.string(),
  namespace: z.string().regex(namespaceKeyPattern, { message: namespaceKeyMessage }),
  key: z.string().regex(namespaceKeyPattern, { message: namespaceKeyMessage }),
  description: commonFields.description,
});

const teamSchema = z.object({
  title: commonFields.title,
  description: commonFields.description.optional(),
  ranks: z.array(rankSchema),
  rankExplanations: z.array(rankExplanationSchema).optional(),
});

// Use reference schema directly for sponsor projects
const sponsorProjectSchema = referenceSchema;

const sponsorSchema = z.object({
  name: commonFields.name,
  slug: commonFields.slug,
  ...sponsorNamespaceKeySchema.shape,
  description: commonFields.description,
  tier: SponsorTierEnum.optional(),
  featured: commonFields.featured,
  logo: z.string().optional(), // Similar to image but specific for sponsors
  ...socialFields,
  since: z.string().optional(),
  content: z.string().optional(),
  projects: z.array(sponsorProjectSchema).optional(),
});

const sponsorsSchema = z.object({
  title: commonFields.title,
  description: commonFields.description,
  sponsors: z.array(sponsorSchema),
});

const blogSchema = z.object({
  title: commonFields.title,
  alternativeTitle: z.string().optional(),
  description: commonFields.description,
  slug: commonFields.slug,
  ...blogNamespaceKeySchema.shape,
  // Transform string to Date object
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  headerImage: z.string().optional(),
  headerImageAlt: z.string().optional(),
  // Link to the same article in other languages
  translationKey: z.string().optional(),
  // Reference to the author by namespace and key
  author: referenceSchema.optional(),
  excerpt: z.object({
    type: z.string(),
    children: z.any(),
  }),
});

// Create a namespace/key schema for tutorials
const tutorialNamespaceKeySchema = createNamespaceKeySchema({ defaultNamespace: "tutorial" });

// Tutorial schema similar to blog schema
const tutorialSchema = z.object({
  title: commonFields.title,
  alternativeTitle: z.string().optional(),
  description: commonFields.description,
  slug: commonFields.slug,
  ...tutorialNamespaceKeySchema.shape,
  // Transform string to Date object
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  headerImage: z.string().optional(),
  headerImageAlt: z.string().optional(),
  // Link to the same tutorial in other languages
  translationKey: z.string().optional(),
  // Reference to the author by namespace and key
  author: referenceSchema.optional(),
  excerpt: z.object({
    type: z.string(),
    children: z.any(),
  }),
});


// Helper function to create localized collections
const createLocalizedCollections = (
  baseNames: string[], 
  languages: string[] = ['de', 'en'],
  options: {
    getType?: (baseName: string) => 'data' | 'page',
    getSource?: (baseName: string, lang: string) => string,
    getSchema?: (baseName: string) => any,
    getWrapper?: (baseName: string) => (collection: any) => any
  } = {}
) => {
  const {
    getType = () => 'data',
    getSource = (baseName, lang) => {
      // Default source path patterns
      if (baseName === 'carousel' || baseName === 'history' || baseName === 'activities') {
        return `homepage/${lang}/${baseName}.json`
      }
      return `${baseName}/${lang}/**/*.${baseName === 'blog' || baseName === 'tutorials' ? 'md' : 'json'}`
    },
    getSchema = (baseName) => {
      // Map base names to their schemas
      const schemaMap: Record<string, any> = {
        'carousel': carouselSchema,
        'history': historySchema,
        'activities': activitiesSchema,
        'team': teamSchema,
        'blog': blogSchema,
        'authors': authorSchema,
        'sponsors': sponsorsSchema,
        'projects': z.object({ projects: z.array(projectSchema) }),
        'timeline': timelineDetailSchema,
        'rules': rulesSchema,
        'tutorials': tutorialSchema
      }
      return schemaMap[baseName]
    },
    getWrapper = (baseName) => {
      // Apply special wrappers for certain collections
      if (baseName === 'blog') {
        return (collection: any) => defineCollection(asSitemapCollection(asSchemaOrgCollection(collection)))
      }
      return (collection: any) => defineCollection(collection)
    }
  } = options

  // Generate collections for all base names and languages
  const collections: Record<string, any> = {}

  for (const baseName of baseNames) {
    for (const lang of languages) {
      const collectionName = `${baseName}_${lang}`
      const type = getType(baseName)
      const source = getSource(baseName, lang)
      const schema = getSchema(baseName)
      const wrapper = getWrapper(baseName)

      collections[collectionName] = wrapper({
        type,
        source,
        schema
      })
    }
  }

  return collections
}

export default defineContentConfig({
  collections: createLocalizedCollections([
    'carousel',
    'history',
    'activities',
    'team',
    'blog',
    'projects',
    'authors',
    'sponsors',
    'timeline',
    'rules',
    'tutorials'
  ], ['de', 'en'], {
    getType: (baseName) => ['blog', 'timeline', 'tutorials'].includes(baseName) ? 'page' : 'data'
  })
})
