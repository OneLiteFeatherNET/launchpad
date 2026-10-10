import { spdxLicenseUrl } from './spdx'

export interface SoftwareApplicationInput {
  title: string
  summary: string
  /** Absolute canonical URL of the project page. */
  url: string
  /** @id of the publishing organization. */
  publisherId: string
  license?: string
  releasedAt?: string | Date
  /** Server platforms the project runs on, e.g. Paper, Folia, Minestom. */
  platforms?: string[]
  links?: {
    docs?: string
    source?: string
    downloads?: Array<{ url: string }>
  }
}

export type SoftwareApplicationNode = Record<string, unknown> & { '@type': 'SoftwareApplication' }

const toIso = (raw: string | Date | undefined): string | undefined => {
  if (!raw) return undefined
  const date = raw instanceof Date ? raw : new Date(raw)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/**
 * The project as a schema.org SoftwareApplication. The platforms go to
 * runtimePlatform: Paper, Folia and Minestom are server runtimes the plugin
 * runs inside, not the operating system underneath. Nothing is derived that
 * the frontmatter does not state.
 */
export function softwareApplicationNode(input: SoftwareApplicationInput): SoftwareApplicationNode {
  const { links, platforms } = input
  return {
    '@type': 'SoftwareApplication',
    '@id': `${input.url}#software`,
    name: input.title,
    description: input.summary,
    url: input.url,
    applicationCategory: 'DeveloperApplication',
    license: spdxLicenseUrl(input.license),
    datePublished: toIso(input.releasedAt),
    softwareHelp: links?.docs,
    downloadUrl: links?.downloads?.[0]?.url,
    codeRepository: links?.source,
    runtimePlatform: platforms?.length ? platforms : undefined,
    publisher: { '@id': input.publisherId }
  }
}
