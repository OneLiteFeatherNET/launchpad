export default defineEventHandler((event) => {
  const target = legacyBlogRedirectTarget(event.path)
  if (target) return sendRedirect(event, target, 301)
})
