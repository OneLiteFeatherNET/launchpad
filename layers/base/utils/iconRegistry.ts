import type { IconDefinition } from '../types'
import {
  faArrowRight,
  faArrowUpRightFromSquare,
  faBars,
  faBookOpen,
  faCalendarDays,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleInfo,
  faCode,
  faCodeBranch,
  faComment,
  faCopy,
  faCube,
  faDownload,
  faEllipsisH,
  faEnvelope,
  faFileAlt,
  faHandshake,
  faHome,
  faImage,
  faUser,
  faSkull,
  faShieldHalved,
  faPersonRunning,
  faHammer,
  faGhost,
  faLink,
  faLocationDot,
  faLock,
  faMap,
  faMinus,
  faPause,
  faPlus,
  faPlay,
  faServer,
  faShareNodes,
  faSignal,
  faTerminal,
  faTimes,
  faTriangleExclamation,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import {
  faBluesky,
  faDiscord,
  faFacebookF,
  faGithub,
  faLinkedinIn,
  faRedditAlien,
  faTelegram,
  faWhatsapp,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons'

/**
 * Icons that `IconFa` can resolve from the string form, `['fas', 'arrow-right']`.
 * The icon is looked up by name at runtime, so it renders only if it is listed
 * here; `tests/architecture/fontawesome-registry.spec.ts` checks every string
 * reference in the sources against this list. An icon imported as a definition
 * object needs no entry.
 */
const REGISTERED: IconDefinition[] = [
  faArrowRight,
  faArrowUpRightFromSquare,
  faBars,
  faBookOpen,
  faCalendarDays,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleInfo,
  faCode,
  faCodeBranch,
  faComment,
  faCopy,
  faCube,
  faDownload,
  faEllipsisH,
  faEnvelope,
  faFileAlt,
  faHandshake,
  faHome,
  faImage,
  faUser,
  faSkull,
  faShieldHalved,
  faPersonRunning,
  faHammer,
  faGhost,
  faLink,
  faLocationDot,
  faLock,
  faMap,
  faMinus,
  faPause,
  faPlus,
  faPlay,
  faServer,
  faShareNodes,
  faSignal,
  faTerminal,
  faTimes,
  faTriangleExclamation,
  faUsers,
  faBluesky,
  faDiscord,
  faFacebookF,
  faGithub,
  faLinkedinIn,
  faRedditAlien,
  faTelegram,
  faWhatsapp,
  faXTwitter,
]

const byKey = new Map<string, IconDefinition>()
for (const icon of REGISTERED) {
  byKey.set(`${icon.prefix}/${icon.iconName}`, icon)
  // Font Awesome aliases (`times` for `xmark`, `file-alt` for `file-lines`, ...)
  for (const alias of icon.icon[2]) {
    if (typeof alias === 'string') byKey.set(`${icon.prefix}/${alias}`, icon)
  }
}

/** The registered definition for a prefix and name (or alias), if any. */
export function findRegisteredIcon(prefix: string, name: string): IconDefinition | undefined {
  return byKey.get(`${prefix}/${name}`)
}
