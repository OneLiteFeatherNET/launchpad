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
  { type: 'link', textKey: 'navigation.overview', routeName: 'index', icon: ['fas', 'home'] },
  { type: 'link', textKey: 'navigation.server', routeName: 'index', hash: '#connect', icon: ['fas', 'server'] },
  { type: 'link', textKey: 'navigation.bluemap', routeName: 'bluemap', icon: ['fas', 'map'] },
  { type: 'link', textKey: 'navigation.blog', routeName: 'blog', icon: ['fas', 'file-alt'] },
  {
    type: 'group',
    textKey: 'navigation.more',
    icon: ['fas', 'ellipsis-h'],
    children: [
      { type: 'link', textKey: 'navigation.status', path: 'https://status.onelitefeather.net', icon: ['fas', 'signal'], external: true },
      { type: 'link', textKey: 'navigation.roadmap', path: '#', icon: ['fas', 'list-ul'] }
    ]
  }
]
