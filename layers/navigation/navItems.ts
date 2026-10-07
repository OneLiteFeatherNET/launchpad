export type NavLinkConfig = {
  type: 'link'
  textKey: string
  routeName?: string
  path?: string
  hash?: string
  icon?: string | [string, string]
  external?: boolean
}

export type NavGroupConfig = {
  type: 'group'
  textKey: string
  icon?: string | [string, string]
  children: NavLinkConfig[]
}

export type NavConfigEntry = NavLinkConfig | NavGroupConfig

const eventsLink: NavLinkConfig = {
  type: 'link',
  textKey: 'navigation.events',
  routeName: 'events',
  icon: ['fas', 'calendar-days']
}

/** The call to action next to Discord; not part of the grouped entries. */
export const playLink: NavLinkConfig = {
  type: 'link',
  textKey: 'navigation.play',
  routeName: 'index',
  hash: '#connect',
  icon: ['fas', 'play']
}

/**
 * The grouped entries. Events sit last in "Community" until one is live; the
 * caller decides that (the navigation does not know the events layer) and
 * passes `eventsTopLevel`, which moves the link behind Blog.
 */
export function buildNavConfig({ eventsTopLevel }: { eventsTopLevel: boolean }): NavConfigEntry[] {
  return [
    { type: 'link', textKey: 'navigation.team', routeName: 'team', icon: ['fas', 'users'] },
    { type: 'link', textKey: 'navigation.blog', routeName: 'blog', icon: ['fas', 'file-alt'] },
    ...(eventsTopLevel ? [eventsLink] : []),
    {
      type: 'group',
      textKey: 'navigation.community',
      icon: ['fas', 'handshake'],
      children: [
        { type: 'link', textKey: 'navigation.community_overview', routeName: 'community', icon: ['fas', 'handshake'] },
        { type: 'link', textKey: 'navigation.builds', routeName: 'community-poi', icon: ['fas', 'location-dot'] },
        { type: 'link', textKey: 'navigation.projects', routeName: 'projects', icon: ['fas', 'code'] },
        ...(eventsTopLevel ? [] : [eventsLink])
      ]
    },
    {
      type: 'group',
      textKey: 'navigation.more',
      icon: ['fas', 'ellipsis-h'],
      children: [
        { type: 'link', textKey: 'navigation.bluemap', routeName: 'bluemap', icon: ['fas', 'map'] },
        {
          type: 'link',
          textKey: 'navigation.status',
          path: 'https://status.onelitefeather.net',
          icon: ['fas', 'signal'],
          external: true
        }
      ]
    }
  ]
}

export const navConfig: NavConfigEntry[] = buildNavConfig({ eventsTopLevel: false })
