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

export const navConfig: NavConfigEntry[] = [
  { type: 'link', textKey: 'navigation.team', routeName: 'team', icon: ['fas', 'users'] },
  { type: 'link', textKey: 'navigation.blog', routeName: 'blog', icon: ['fas', 'file-alt'] },
  {
    type: 'group',
    textKey: 'navigation.community',
    icon: ['fas', 'handshake'],
    children: [
      { type: 'link', textKey: 'navigation.community_overview', routeName: 'community', icon: ['fas', 'handshake'] },
      { type: 'link', textKey: 'navigation.builds', routeName: 'community-poi', icon: ['fas', 'location-dot'] },
      { type: 'link', textKey: 'navigation.projects', routeName: 'projects', icon: ['fas', 'code'] },
      { type: 'link', textKey: 'navigation.events', routeName: 'events', icon: ['fas', 'calendar-days'] }
    ]
  },
  {
    type: 'group',
    textKey: 'navigation.more',
    icon: ['fas', 'ellipsis-h'],
    children: [
      { type: 'link', textKey: 'navigation.server', routeName: 'index', hash: '#connect', icon: ['fas', 'server'] },
      { type: 'link', textKey: 'navigation.bluemap', routeName: 'bluemap', icon: ['fas', 'map'] },
      { type: 'link', textKey: 'navigation.status', path: 'https://status.onelitefeather.net', icon: ['fas', 'signal'], external: true }
    ]
  }
]
