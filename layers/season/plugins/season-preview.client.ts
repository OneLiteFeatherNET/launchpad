import { previewSeason } from '../utils/seasons'

/**
 * `?season=halloween` previews a season out of its window, `?season=none`
 * switches the current one off — in the browser only, after hydration.
 *
 * The server may not read the query: the HTML is cached at the edge and must
 * not depend on the request. So the page renders as the calendar says, and
 * this swaps the shared season state once the app is mounted. Everything that
 * reads `useSeason()` — `data-season`, favicon, theme-color, logo, decoration
 * — follows reactively. A preview shows the base colours for a moment first;
 * the real season, decided on the server, never does.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const season = useSeason()
  nuxtApp.hook('app:mounted', () => {
    const preview = previewSeason(window.location.search)
    if (preview !== undefined) season.value = preview
  })
})
