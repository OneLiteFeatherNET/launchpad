# Carousel Data Model Architecture

## Overview

The Carousel component now uses an abstracted data model system that separates slide types from component logic.

## File Structure

```
types/
  └── carousel.ts          # Type definitions for all slide types
composables/
  └── useCarousel.ts       # Utility functions for slide normalization
components/
  └── ui/
      └── carousel/
          ├── Carousel.vue # Main carousel component
          └── items/       # Slide rendering components
              ├── CarouselItemImage.vue
              ├── CarouselItemBlog.vue
              ├── CarouselItemNews.vue
              └── CarouselItemEvent.vue
```

## Types (`types/carousel.ts`)

### Slide Types

- **`ImageSlide`**: Basic image slide with `src`, `alt`, optional `note`
- **`BlogSlide`**: Blog article with `title`, `href`, `excerpt`, `image`, etc.
- **`NewsSlide`**: News item with `title`, `summary`, `image`, etc.
- **`EventSlide`**: Event with `dateStart`, `dateEnd`, `location`, etc.
- **`LegacyImageSlide`**: Legacy format (automatically converted)

### Union Types

- **`AnySlide`**: All slide types including legacy
- **`NormalizedSlide`**: Only typed slides (without legacy)
- **`SlideType`**: Type discriminator `'image' | 'blog' | 'news' | 'event'`

## Composables (`composables/useCarousel.ts`)

### Normalization Functions

#### `normalizeSlide(slide: AnySlide): NormalizedSlide`
Converts a single slide (including legacy format) to a typed slide.

#### `normalizeSlides(slides: AnySlide[]): NormalizedSlide[]`
Normalizes an array of slides.

### Type Guards

- `isImageSlide(slide): slide is ImageSlide`
- `isBlogSlide(slide): slide is BlogSlide`
- `isNewsSlide(slide): slide is NewsSlide`
- `isEventSlide(slide): slide is EventSlide`

### Accessibility Helpers

#### `getSlideLabel(slide: NormalizedSlide): string`
Extracts a label text from a slide.

#### `getSlideAriaText(slide: NormalizedSlide, index: number, total: number): string`
Generates ARIA text for screen readers: "Slide X of Y: [Label]"

## Usage

### Basic Example

```vue
<script setup lang="ts">
import Carousel from '~/components/ui/carousel/Carousel.vue'
import type { BlogSlide, ImageSlide } from '~/types/carousel'

const slides: (BlogSlide | ImageSlide)[] = [
  {
    type: 'image',
    src: '/images/photo1.jpg',
    alt: 'Description'
  },
  {
    type: 'blog',
    title: 'My Blog Post',
    href: '/blog/post-1',
    excerpt: 'Short description...',
    image: '/images/blog1.jpg'
  }
]
</script>

<template>
  <Carousel :slides="slides" />
</template>
```

### Legacy Compatibility

Legacy slides (without `type` property) are automatically converted to `ImageSlide`:

```typescript
// Legacy format (automatically converted)
const legacySlides = [
  { src: '/image.jpg', alt: 'Image' }
]

// Converted to:
// { type: 'image', src: '/image.jpg', alt: 'Image' }
```

### Custom Slide Components

The Carousel component automatically maps slide types to rendering components:

```typescript
// In Carousel.vue
const componentFor = (slide: NormalizedSlide) => {
  switch (slide.type) {
    case 'image': return CarouselItemImage
    case 'blog': return CarouselItemBlog
    case 'news': return CarouselItemNews
    case 'event': return CarouselItemEvent
  }
}
```

## Extension

### Adding a New Slide Type

1. **Define type** in `types/carousel.ts`:
   ```typescript
   export interface MyCustomSlide {
     type: 'custom'
     customField: string
     // ... additional fields
   }
   
   // Add to union types
   export type NormalizedSlide = ImageSlide | BlogSlide | NewsSlide | EventSlide | MyCustomSlide
   ```

2. **Normalization** in `composables/useCarousel.ts`:
   ```typescript
   export function normalizeSlide(slide: AnySlide): NormalizedSlide {
     // ...existing checks...
     if ((any as MyCustomSlide).type === 'custom') {
       return any as MyCustomSlide
     }
     // ...
   }
   ```

3. **Create rendering component**:
   ```vue
   <!-- components/ui/carousel/items/CarouselItemCustom.vue -->
   <script setup lang="ts">
   import type { MyCustomSlide } from '~/types/carousel'
   defineProps<{ item: MyCustomSlide }>()
   </script>
   ```

4. **Mapping** in `Carousel.vue`:
   ```typescript
   const componentFor = (slide: NormalizedSlide) => {
     switch (slide.type) {
       // ...existing cases...
       case 'custom': return CarouselItemCustom
     }
   }
   ```

## Benefits of Abstraction

✅ **Type Safety**: TypeScript checks all slide data  
✅ **Maintainability**: Centralized type definitions  
✅ **Reusability**: Types can be used in other components  
✅ **Extensibility**: New slide types easily added  
✅ **Legacy Support**: Automatic conversion of old formats  
✅ **Accessibility**: Centralized ARIA text generation

## Button Fix

The carousel buttons have also been fixed:

- `pointer-events: none` at container level
- `pointer-events: auto !important` on buttons (inline-style)
- Swipe gestures ignore button clicks
- Event propagation is stopped

The buttons should now work in all browsers.

