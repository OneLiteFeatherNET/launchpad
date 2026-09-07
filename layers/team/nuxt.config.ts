// Layer: team — the roster, member profiles, open positions and the team FAQ.
//
// TeamMemberCard.vue lived under components/features/home/team/ until this
// layer existed, although home never rendered it and its only consumer was
// TeamRankSection here. It was the one cross-feature import in the tree, and it
// was a filing mistake rather than a real dependency.
export default defineNuxtConfig({})
