# Spec Delta

## Purpose

The first load of a page fetches what the largest contentful element needs
before anything else, so the LCP image is not queued behind non-critical bytes.

## ADDED Requirements

### Requirement: Carousel fetches only the current slide's image on first load
The server-rendered home page SHALL contain an image element only for the
current carousel slide. The next slide's image SHALL be fetched after the page
is idle or on first navigation input, and before that slide becomes visible.
The first slide SHALL keep its image preload with `fetchpriority="high"`.
Slide boxes SHALL keep their size so layout does not shift.

#### Scenario: Initial load
- **WHEN** `/en` is rendered on the server
- **THEN** only the first slide contains an `img` with a source
- **AND** the page has one image preload with `fetchpriority="high"`

#### Scenario: Idle after mount
- **WHEN** the page has mounted and the browser is idle
- **THEN** the next slide's image is requested

#### Scenario: Navigation before arming
- **WHEN** the visitor navigates to the next slide before the idle callback ran
- **THEN** the image is armed and rendered with the slide, never an empty slide

#### Scenario: Autoplay
- **WHEN** autoplay advances
- **THEN** it only moves to a slide whose image is armed

### Requirement: Navigation logo is served from the site's own origin
The navigation bar SHALL load the logo, including seasonal logos, as a
same-origin file from `public/`, not through the image resizer, with fixed
dimensions.

#### Scenario: Default logo
- **WHEN** the navigation bar is rendered without a season
- **THEN** the logo `img` points at `/images/logo.svg` and has width and height

#### Scenario: Seasonal logo
- **WHEN** a season passes its own logo path
- **THEN** the logo `img` points at that path under the site's origin

### Requirement: Modulepreload is trimmed and budgeted
The total modulepreloaded JS on `/en` SHALL be lower than the recorded
baseline of ~506 KB raw in 50 chunks. The trim SHALL be a pure function used by
the `build:manifest` hook, and the upper bound SHALL be enforced in
`tests/performance/entry-chunk-budget.spec.ts`.

#### Scenario: Preload trim
- **WHEN** the trim function receives a manifest with first-view and other chunks
- **THEN** only first-view chunks keep `preload`

#### Scenario: Preload budget
- **WHEN** `/en` is built and its HTML inspected
- **THEN** the sum of modulepreloaded JS is below the baseline

### Requirement: Entry chunk carries only needed code
The entry chunk SHALL NOT contain icons that the first view does not use. The
cookie-consent banner SHALL hydrate lazily and keep its server-rendered markup.

#### Scenario: Icons per page
- **WHEN** a page uses a subset of the icons
- **THEN** icons it does not use are not in the entry chunk

#### Scenario: Banner before hydration
- **WHEN** the page is server-rendered without consent decided
- **THEN** the banner markup, with its dialog semantics, is in the HTML
