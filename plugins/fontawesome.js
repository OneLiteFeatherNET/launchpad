import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faArrowRight,
    faArrowUpRightFromSquare,
    faBars,
    faBookOpen,
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
    faLink,
    faLocationDot,
    faLock,
    faMap,
    faMinus,
    faPlus,
    faServer,
    faShareNodes,
    faSignal,
    faTerminal,
    faTimes,
    faTriangleExclamation,
    faUsers
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
    faXTwitter
} from '@fortawesome/free-brands-svg-icons'

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false

// Only the icons referenced via the global library (the `['fas'|'fab', 'name']`
// string syntax) are registered here. Components that import icon objects directly
// are tree-shaken on their own. When adding a new `['fas'|'fab', 'name']` reference,
// add the matching icon below as well, otherwise it renders empty.
library.add(
    faArrowRight,
    faArrowUpRightFromSquare,
    faBars,
    faBookOpen,
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
    faLink,
    faLocationDot,
    faLock,
    faMap,
    faMinus,
    faPlus,
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
    faXTwitter
)

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
