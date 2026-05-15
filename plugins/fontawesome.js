import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faArrowRight,
    faBars,
    faCheck,
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faEllipsisH,
    faEnvelope,
    faFileAlt,
    faHome,
    faLink,
    faLocationDot,
    faMap,
    faServer,
    faShareNodes,
    faSignal,
    faTimes
} from '@fortawesome/free-solid-svg-icons'
import {
    faBluesky,
    faDiscord,
    faFacebookF,
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
    faBars,
    faCheck,
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faEllipsisH,
    faEnvelope,
    faFileAlt,
    faHome,
    faLink,
    faLocationDot,
    faMap,
    faServer,
    faShareNodes,
    faSignal,
    faTimes,
    faBluesky,
    faDiscord,
    faFacebookF,
    faLinkedinIn,
    faRedditAlien,
    faTelegram,
    faWhatsapp,
    faXTwitter
)

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
