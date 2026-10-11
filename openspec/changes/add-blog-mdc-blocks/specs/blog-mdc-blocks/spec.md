# Spec Delta: blog-mdc-blocks

## ADDED Requirements

### Requirement: Blog posts embed community POIs as cards
A blog post MUST be able to embed a community POI with `::poi-embed{slug="…"}`.
The card SHALL show the POI's title, summary, status, builders and
coordinates, and a link to the POI page in the current locale. The card MUST be
rendered on the server. The progress bar SHALL appear only while the POI is not
completed.

#### Scenario: Known slug
- **WHEN** a post in locale `de` contains `::poi-embed{slug="yggdrasil"}`
- **THEN** the HTML contains a link to `/de/community-poi/yggdrasil` with the POI title as its text

#### Scenario: Unknown slug
- **WHEN** a post embeds a slug that no POI of its locale has
- **THEN** nothing is rendered for the block, and a development warning names the slug

### Requirement: Coordinates copy as a teleport command
The `coords` block SHALL show `x`, `y` and `z` and copy `/tp x y z` on activation.
Without `y` the command MUST use `~`. The block MUST be usable inline
(`:coords{…}`) inside a paragraph.

#### Scenario: Copy
- **WHEN** a reader activates the copy action of `:coords{x=1161 y=75 z=339}`
- **THEN** the clipboard receives `/tp 1161 75 339`

### Requirement: Galleries take their images as YAML props
The `gallery` block SHALL accept `images` as YAML front matter and render each
image with its alternative text and a lightbox. An empty list MUST render nothing.

#### Scenario: Image list
- **WHEN** a `::gallery` block lists two images with `src` and `alt`
- **THEN** the page shows two openable tiles, each with the image's alternative text

### Requirement: Article structured data mentions embedded POIs
The Article JSON-LD SHALL list every POI embedded with `::poi-embed` in
`mentions`, as a `CreativeWork` whose `@id` equals the one the POI page emits.

#### Scenario: Post with two POIs
- **WHEN** a post embeds `yggdrasil` and `end-portal` in that order
- **THEN** `mentions` holds two `CreativeWork` nodes in that order, each with `name`, `url` and the POI page's `#creativework` `@id`

### Requirement: Every block in a blog post resolves to a component
Every `::name` and `:name{…}` used in `content/blog` MUST resolve to a component
file of some layer, and every `::poi-embed` MUST name a POI of the same locale.

#### Scenario: Unknown block name
- **WHEN** a post uses `::unknown-block`
- **THEN** the content test fails and names the file and the block
