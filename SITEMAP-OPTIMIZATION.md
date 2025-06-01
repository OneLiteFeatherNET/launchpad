# Sitemap Optimization for i18n Content

## Changes Made

1. **Added Sitemap Configuration in nuxt.config.ts**
   - Enabled `autoI18n: true` to automatically generate hreflang tags
   - Added custom XSL columns to display language information in the sitemap
   - Set default values for changefreq, priority, and lastmod
   - Added explicit i18n configuration to match the project's locales

2. **Added transformEntries Function**
   - Implemented a function that processes content entries to add proper alternate language links
   - Groups entries by translationKey to associate content across languages
   - Adds alternates property with hreflang attributes to each entry

3. **Fixed Content Collection Source Pattern**
   - Updated the blog_en collection source pattern from 'blog/en/*.md' to 'blog/en/**/*.md'
   - This ensures all English blog posts, including those in subdirectories, are included in the sitemap

## Benefits for SEO

These changes improve the site's SEO in several ways:

1. **Better Language Targeting**: Search engines can now properly understand which language version to show to users based on their preferences.

2. **Reduced Duplicate Content Issues**: By explicitly linking language alternatives with hreflang tags, search engines won't treat translated content as duplicate content.

3. **Improved Crawling Efficiency**: The sitemap now provides clear information about all available language versions, helping search engines discover and index all content more efficiently.

4. **Enhanced User Experience**: Users searching in their preferred language are more likely to be directed to the appropriate language version of your content.

## Technical Details

The implementation uses the translationKey field in content files to establish relationships between different language versions of the same content. The sitemap will now include proper hreflang annotations that follow Google's recommendations for multilingual sites.

For example, a German page will have an alternate link to its English version, and vice versa, helping search engines understand these are translations of the same content.