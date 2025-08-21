# OneLiteFeather Blog - Project Guidelines for Junie

## Project Overview
This is a multilingual blog platform for OneLiteFeather.net, a Minecraft Network. It's built with Nuxt 3 and features content in both German and English. The project serves as the official blog for OneLiteFeather, providing articles, project showcases, and team information.

## Project Structure
- `content/` - Blog posts and other content (organized by language)
- `components/` - Vue components organized by feature/section
- `layouts/` - Page layouts for different sections of the site
- `pages/` - Application pages following Nuxt's file-based routing
- `public/` - Static assets like images and fonts
- `i18n/` - Internationalization configuration and translation files
- `docs/` - Project documentation
- `composables/` - Reusable Vue composition functions
- `tests/` - End-to-end tests using Playwright

## Key Technologies
- **Nuxt 3** - Vue.js framework for server-side rendering
- **Nuxt Content** - Content management for blog posts
- **Nuxt i18n** - Internationalization with German (default) and English support
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Material 3** - Google's latest design system for UI components and theming
- **Nuxt SEO** - SEO optimization tools
- **Playwright** - End-to-end testing framework

## Design System
The project implements Google's Material Design 3 (Material 3) as its design system. When working with the UI, Junie should follow these guidelines:

1. **Color System**
   - Use the Material 3 color tokens for consistency:
     - Surface colors: `bg-surface`, `bg-surface-variant`
     - On-surface colors: `text-on-surface`, `text-on-surface-variant`
     - Container colors: `bg-primary-container`, `bg-secondary-container`
     - On-container colors: `text-on-primary-container`, `text-on-secondary-container`
   - Always include dark mode variants with the `dark:` prefix (e.g., `dark:bg-surface-dark`)
   - For sponsor tiers, use the established color mapping in `useSponsorTier.ts`

2. **Component Styling**
   - Follow Material 3 shape guidelines:
     - Buttons should use `rounded-full` for pill-shaped buttons
     - Cards should use `rounded-lg` for container shapes
   - Implement proper elevation with shadow utilities (e.g., `shadow-md`)
   - Use Material 3 state changes (hover, focus, active) for interactive elements

3. **Accessibility**
   - Ensure proper color contrast according to Material 3 guidelines
   - Implement focus states for keyboard navigation
   - Use appropriate ARIA attributes for interactive elements

4. **Responsive Design**
   - Maintain Material 3 layout principles across different screen sizes
   - Use the established breakpoint system for responsive adjustments

## Testing Guidelines
When making changes to the codebase, Junie should:

1. Run the existing Playwright tests to ensure no regressions:
   ```bash
   pnpm test
   ```

2. For changes affecting UI components or page layouts, verify the changes in both German and English versions.

3. If adding new features, consider adding appropriate tests in the `tests/e2e` directory.

## Build Process
Before submitting changes, Junie should build the project to ensure it compiles correctly:

```bash
pnpm build
```

## Code Style Guidelines
1. Follow the existing component structure and naming conventions
2. Use TypeScript for type safety
3. Ensure all components are responsive and work on mobile devices
4. Maintain the existing i18n structure for multilingual support
5. Follow the accessibility guidelines in the docs directory

## Content Guidelines
1. All user-facing content should be available in both German and English
2. Blog posts should be placed in the appropriate language directory in `content/`
3. Use the existing frontmatter structure for blog posts and projects

## Deployment
The project is deployed to Cloudflare Pages. The production environment uses specific configurations defined in the nuxt.config.ts file under the `$production` key.

## Common Issues and Solutions
1. For i18n-related issues, check the locale files in the `i18n/locales` directory

## Documentation
Refer to the documentation in the `docs/` directory for more detailed information on:
- Component design guidelines
- Accessibility best practices
- Canonical URL handling for multilingual content
