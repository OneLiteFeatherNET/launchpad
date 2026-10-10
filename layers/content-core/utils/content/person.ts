import type { BlogAuthorProfile } from './repository'
import type { Locale } from './locales'
import { teamAvatarUrl } from '../teamAvatar'

export interface Person {
  slug: string
  name: string
  avatar?: string
  role?: string
  kind: 'team' | 'external'
  profilePath: string
  bio?: string
  links?: BlogAuthorProfile['links']
}

interface RosterMember {
  name: string
  slug?: string
  mcName?: string
  avatarUrl?: string
  role?: string | string[]
  openPosition?: boolean
}

export interface PersonSources {
  team: { members?: readonly RosterMember[] } | null
  authors: readonly BlogAuthorProfile[]
}

export function resolvePersonFrom(
  slug: string,
  locale: Locale,
  { team, authors }: PersonSources
): Person | null {
  const member = team?.members?.find((m) => !m.openPosition && m.slug === slug)
  if (member) {
    return {
      slug,
      name: member.name,
      avatar: teamAvatarUrl({ mcName: member.mcName, slug, avatarUrl: member.avatarUrl }),
      role: Array.isArray(member.role) ? member.role.join(', ') : member.role,
      kind: 'team',
      profilePath: `/${locale}/team/${slug}`
    }
  }
  const author = authors.find((a) => a.slug === slug)
  if (!author) return null
  return {
    slug,
    name: author.name,
    avatar: author.avatar,
    role: author.role,
    kind: 'external',
    profilePath: `/${locale}/blog/author/${slug}`,
    bio: author.bio,
    links: author.links
  }
}
