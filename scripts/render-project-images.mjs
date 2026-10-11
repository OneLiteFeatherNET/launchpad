// Renders the code-based images of the projects from real lines of their repositories:
// a square icon (512x512, card and detail header) and a social card (1200x630, carousel
// and og:image) per project. Prints the rclone commands that upload them.
//   node scripts/render-project-images.mjs --repos <dir> [--out <dir>] [--fonts <dir>]
//     [--only <slug,...>]
// --repos holds the checkouts named in PROJECTS (read only); --only renders a subset of them.
// --fonts needs inter-400-latin.ttf, inter-700-latin.ttf and jetbrains-mono-400.ttf.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import { parse as parseYaml } from 'yaml'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const WIDTH_SOCIAL = 1200
const HEIGHT_SOCIAL = 630
const SIZE_ICON = 512
const CODE_FONT_SIZE = 22
const CODE_LINE_HEIGHT = 1.5
// Characters per line that fit the editor body at 22px JetBrains Mono (0.6em per glyph).
const ICON_COLUMNS = 30
const SOCIAL_COLUMNS = 77
// Card layout in px: the trees use these numbers and the fit limits below derive from them.
const CODE_ROW = Math.round(CODE_FONT_SIZE * CODE_LINE_HEIGHT)
const PANEL_HEADER = 52
const PANEL_BORDER = 2
const ICON_LAYOUT = { padding: 32, gap: 24, bar: 10, bodyPadding: 20 }
// The brand block (title, name, chips) is taller than the 112px logo, so its height is fixed here.
const SOCIAL_LAYOUT = { padding: 44, top: 166, gap: 28, bodyPadding: 18 }

/** Dark MD3 roles from assets/css/tailwind.css, as literals (satori cannot read CSS variables). */
const COLORS = {
  surface: '#121319',
  panel: '#0d0e13',
  panelHeader: '#1f1f25',
  outline: '#454652',
  onSurface: '#e4e1e9',
  onSurfaceVariant: '#c6c5d3',
  primary: '#bbc3ff',
  secondary: '#7dd0ff',
  tertiary: '#ffb0cc',
  muted: '#90909d',
  primaryContainer: '#2a388f',
  onPrimaryContainer: '#9ba7ff',
  secondaryContainer: '#009bd2',
  onSecondaryContainer: '#002d40',
  surfaceContainerHighest: '#34343a'
}

const SYNTAX = {
  plain: COLORS.onSurface,
  keyword: COLORS.primary,
  key: COLORS.primary,
  type: COLORS.secondary,
  annotation: COLORS.secondary,
  string: COLORS.tertiary,
  number: COLORS.tertiary,
  comment: COLORS.muted
}

/**
 * The snippet of each project: the repository file and the 1-based line range
 * the image shows. The text is read from the checkout at render time.
 * `socialName` renames the social card (bucket keys are immutable); it defaults to `social`.
 */
export const PROJECTS = [
  {
    slug: 'anti-redstoneclock-remastered',
    language: 'yaml',
    source: { repo: 'AntiRedstoneClock-Remastered', file: 'src/main/resources/config.yml', lines: [24, 30] }
  },
  {
    slug: 'falco',
    language: 'java',
    source: { repo: 'Falco', file: 'README.md', lines: [149, 156] }
  },
  {
    slug: 'otis',
    language: 'java',
    source: {
      repo: 'Otis',
      file: 'backend/src/main/java/net/onelitefeather/otis/controller/OtisRequestsController.java',
      lines: [93, 100]
    },
    socialName: 'social-v2'
  },
  {
    slug: 'titan',
    language: 'java',
    source: {
      repo: 'Titan',
      file: 'features/jumprun/src/main/java/net/onelitefeather/titan/feature/jumprun/course/Difficulty.java',
      lines: [38, 42]
    }
  },
  {
    slug: 'cygnus',
    language: 'java',
    source: {
      repo: 'Cygnus',
      file: 'game/src/main/java/net/onelitefeather/cygnus/team/TeamCreator.java',
      lines: [29, 35]
    }
  },
  {
    slug: 'voyager',
    language: 'java',
    source: {
      repo: 'Voyager',
      file: 'voyager/api/src/main/java/net/elytrarace/voyager/api/race/Ring.java',
      lines: [18, 24]
    }
  },
  {
    slug: 'butterfly',
    language: 'yaml',
    source: {
      repo: 'Butterfly',
      file: 'bukkit/src/main/resources/net/onelitefeather/butterfly/bukkit/default-config.yaml',
      lines: [1, 8]
    }
  },
  {
    slug: 'bettergopaint',
    language: 'java',
    source: {
      repo: 'BetterGoPaint',
      file: 'src/main/java/net/onelitefeather/bettergopaint/objects/brush/DiscBrush.java',
      lines: [38, 44]
    }
  },
  {
    slug: 'aves',
    language: 'java',
    source: {
      repo: 'Aves',
      file: 'src/main/java/net/theevilreaper/aves/inventory/GlobalInventoryBuilder.java',
      lines: [52, 59]
    }
  },
  {
    slug: 'apus',
    language: 'yaml',
    source: {
      repo: 'Apus',
      file: 'deploy/crds/bluemapmaps.bluemap.onelitefeather.net-v1.yaml',
      lines: [8, 15]
    }
  },
  {
    slug: 'xerus',
    language: 'java',
    source: {
      repo: 'Xerus',
      file: 'src/main/java/net/theevilreaper/xerus/api/kit/Kit.java',
      lines: [14, 21]
    }
  },
  {
    slug: 'cyano',
    language: 'java',
    source: {
      repo: 'Cyano',
      file: 'src/test/java/net/minestom/testing/TestPlayerIntegrationTest.java',
      lines: [13, 20]
    }
  },
  {
    slug: 'guira',
    language: 'java',
    source: {
      repo: 'Guira',
      file: 'src/main/java/net/onelitefeather/guira/SetupDataService.java',
      lines: [35, 41]
    }
  },
  {
    slug: 'workflows',
    language: 'yaml',
    source: {
      repo: 'workflows',
      file: '.github/workflows/gradle-build-pr.yml',
      lines: [54, 60]
    }
  },
  {
    slug: 'renovate-presets',
    language: 'json',
    source: {
      repo: 'renovate',
      file: 'default.json',
      lines: [4, 11]
    }
  },
  {
    slug: 'feedback-fusion',
    language: 'protobuf',
    source: {
      repo: 'feedback-fusion',
      file: 'proto/feedback-fusion-v1/service.proto',
      lines: [15, 20]
    }
  },
  {
    slug: 'ingot',
    language: 'bash',
    source: {
      repo: 'ingot',
      file: '.github/README.md',
      lines: [112, 116]
    }
  }
]

/** Bucket name of a project's social card, and the image its frontmatter points at. */
export const socialNameOf = project => project.socialName ?? 'social'

/** The projects named by `--only`, in PROJECTS order; an unknown slug throws, it is not skipped. */
export function selectProjects(slugs) {
  const unknown = slugs.filter(slug => !PROJECTS.some(project => project.slug === slug))
  if (unknown.length) throw new Error(`unknown project slug: ${unknown.join(', ')}`)
  return PROJECTS.filter(project => slugs.includes(project.slug))
}

const LANGUAGE_LABEL = { yaml: 'YAML', java: 'Java', json: 'JSON', protobuf: 'Protobuf', bash: 'Bash' }

/** The lines of a snippet, dedented; ranges outside the 6 to 12 lines a card fits are refused. */
export function snippetOf(text, [start, end]) {
  const lines = text.split('\n').slice(start - 1, end).map(line => line.replace(/\t/g, '    ').trimEnd())
  if (lines.length < 5 || lines.length > 12) throw new Error(`snippet has ${lines.length} lines, want 5 to 12`)
  const indents = lines
    .filter(line => line.trim())
    .map(line => line.length - line.trimStart().length)
  const indent = Math.min(...indents)
  return lines.map(line => line.slice(indent))
}

/**
 * Code lines a window shows: a line counts only if it ends above the window's bottom border,
 * which clips the rest. `top` and `bottom` are the window's edges on the card, in px.
 */
export function maxCodeLines({ top, bottom, bodyPadding }) {
  const firstLine = top + PANEL_BORDER + PANEL_HEADER + bodyPadding
  return Math.floor((bottom - PANEL_BORDER - firstLine) / CODE_ROW)
}

export const ICON_MAX_LINES = maxCodeLines({
  top: ICON_LAYOUT.padding,
  bottom: SIZE_ICON - ICON_LAYOUT.padding - ICON_LAYOUT.bar - ICON_LAYOUT.gap,
  bodyPadding: ICON_LAYOUT.bodyPadding
})

export const SOCIAL_MAX_LINES = maxCodeLines({
  top: SOCIAL_LAYOUT.padding + SOCIAL_LAYOUT.top + SOCIAL_LAYOUT.gap,
  bottom: HEIGHT_SOCIAL - SOCIAL_LAYOUT.padding,
  bodyPadding: SOCIAL_LAYOUT.bodyPadding
})

/** Refuses a snippet the card cannot show whole, instead of cropping its last line. */
export function assertFits(snippet, maxLines, label) {
  if (snippet.length > maxLines) {
    throw new Error(`${label}: the snippet has ${snippet.length} lines but the card shows ${maxLines}; shorten its line range`)
  }
}

const JAVA_KEYWORDS = new Set(`
  abstract boolean break case catch class default else enum extends false final
  for if implements import instanceof int interface long new null package private
  protected public record return static switch this throw throws true try var void while
`.split(/\s+/).filter(Boolean))

const JAVA_RULES = [
  ['comment', /\/\/.*|\/\*.*?\*\//y],
  ['string', /"(?:[^"\\]|\\.)*"?/y],
  ['annotation', /@[A-Za-z_]\w*/y],
  ['number', /\d[\d_]*(?:\.\d+)?[lLfFdD]?/y],
  ['word', /[A-Za-z_$][\w$]*/y]
]

const YAML_VALUE_RULES = [
  ['comment', /(?<=^|\s)#.*/y],
  ['string', /'(?:[^']|'')*'?|"(?:[^"\\]|\\.)*"?/y],
  ['number', /-?\d+(?:\.\d+)?\b/y],
  ['word', /[A-Za-z_][\w-]*/y]
]

const YAML_KEY = /^(\s*(?:-\s+)?)([^\s#'"][^:#]*?)(:)(?=\s|$)/

const JSON_VALUE_RULES = [
  ['string', /"(?:[^"\\]|\\.)*"?/y],
  ['number', /-?\d+(?:\.\d+)?\b/y],
  ['word', /[A-Za-z_][\w-]*/y]
]

const JSON_KEY = /^(\s*)("(?:[^"\\]|\\.)*")(\s*:)/

const PROTO_KEYWORDS = new Set(`
  bool bytes double float int32 int64 uint32 uint64 string syntax package import service
  rpc returns message enum option repeated optional oneof map reserved stream
`.split(/\s+/).filter(Boolean))

const PROTO_RULES = [
  ['comment', /\/\/.*|\/\*.*?\*\//y],
  ['string', /"(?:[^"\\]|\\.)*"?/y],
  ['number', /\d+/y],
  ['word', /[A-Za-z_]\w*/y]
]

const BASH_KEYWORDS = new Set(`
  case cd do done echo elif else esac export fi for function if in local return then while
`.split(/\s+/).filter(Boolean))

const BASH_RULES = [
  ['comment', /(?<=^|\s)#.*/y],
  ['string', /"(?:[^"\\]|\\.)*"?|'[^']*'?/y],
  ['word', /[A-Za-z_][\w-]*/y]
]

function push(tokens, kind, text) {
  if (!text) return
  const last = tokens[tokens.length - 1]
  if (last && last.kind === kind) last.text += text
  else tokens.push({ kind, text })
}

/** Greedy scan: the first rule that matches at a position wins, anything else is plain text. */
function scan(text, rules, from = 0, classify = kind => kind) {
  const tokens = []
  let i = from
  while (i < text.length) {
    let matched = null
    for (const [kind, pattern] of rules) {
      pattern.lastIndex = i
      const match = pattern.exec(text)
      if (match && match[0].length) {
        matched = { kind, text: match[0] }
        break
      }
    }
    if (matched) {
      push(tokens, classify(matched.kind, matched.text), matched.text)
      i += matched.text.length
    } else {
      push(tokens, 'plain', text[i])
      i += 1
    }
  }
  return tokens
}

const javaWord = (kind, word) => {
  if (kind !== 'word') return kind
  if (JAVA_KEYWORDS.has(word)) return 'keyword'
  // Constants such as OVERWORLD stay plain; only CamelCase names are types.
  return /^[A-Z][a-z]/.test(word) ? 'type' : 'plain'
}

const literalWord = (kind, word) => {
  if (kind !== 'word') return kind
  return /^(true|false|null)$/.test(word) ? 'keyword' : 'plain'
}

const protoWord = (kind, word) => {
  if (kind !== 'word') return kind
  if (PROTO_KEYWORDS.has(word)) return 'keyword'
  return /^[A-Z][a-z]/.test(word) ? 'type' : 'plain'
}

const bashWord = (kind, word) => {
  if (kind !== 'word') return kind
  return BASH_KEYWORDS.has(word) ? 'keyword' : 'plain'
}

/** A `key:` at the start of a line is coloured as a key, the rest of the line is scanned. */
function keyed(line, keyPattern, rules, classify) {
  const key = keyPattern.exec(line)
  if (!key) return scan(line, rules, 0, classify)
  const tokens = []
  push(tokens, 'plain', key[1])
  push(tokens, 'key', key[2])
  push(tokens, 'plain', key[3])
  for (const token of scan(line, rules, key[0].length, classify)) {
    push(tokens, token.kind, token.text)
  }
  return tokens
}

/** Tokens of each snippet line as `{ kind, text }`, with kind a key of SYNTAX. */
export function highlight(lines, language) {
  if (language === 'java') return lines.map(line => scan(line, JAVA_RULES, 0, javaWord))
  if (language === 'yaml') return lines.map(line => keyed(line, YAML_KEY, YAML_VALUE_RULES, literalWord))
  if (language === 'json') return lines.map(line => keyed(line, JSON_KEY, JSON_VALUE_RULES, literalWord))
  if (language === 'protobuf') return lines.map(line => scan(line, PROTO_RULES, 0, protoWord))
  if (language === 'bash') return lines.map(line => scan(line, BASH_RULES, 0, bashWord))
  throw new Error(`no highlighter for ${language}`)
}

/** Bucket key of one image: images/projects/<slug>/<name>.png */
export const projectImageKey = (slug, name) => `images/projects/${slug}/${name}.png`

/** Frontmatter of a content file, read with the same parser the tests use. */
export function frontmatterOf(text) {
  return parseYaml(text.slice(3, text.indexOf('\n---', 3))) ?? {}
}

/** The project name as the page title shows it: the part before the subtitle colon. */
export const nameOf = title => title.split(':')[0].trim()

const h = (type, style, children) => ({ type, props: { style, children } })

const dot = color => h('div', { display: 'flex', width: 14, height: 14, borderRadius: 7, background: color })

function chip(label, background, color) {
  return h('div', {
    display: 'flex',
    padding: '6px 16px',
    borderRadius: 999,
    background,
    color,
    fontSize: 22,
    fontWeight: 700
  }, label)
}

/** Cuts a line at `columns` characters; resvg panics on glyphs placed far outside the canvas. */
function clipTokens(tokens, columns) {
  const clipped = []
  let used = 0
  for (const token of tokens) {
    if (used >= columns) break
    const text = token.text.slice(0, columns - used)
    clipped.push({ kind: token.kind, text })
    used += text.length
  }
  return clipped
}

/** One code line: a row of coloured runs, each keeping its own spaces. */
function codeLine(tokens) {
  const height = CODE_ROW
  const runs = tokens.map(token => h('div', {
    display: 'flex',
    flexShrink: 0,
    whiteSpace: 'pre',
    color: SYNTAX[token.kind]
  }, token.text))
  return h('div', {
    display: 'flex',
    flexShrink: 0,
    whiteSpace: 'pre',
    fontFamily: 'JetBrains Mono',
    fontSize: CODE_FONT_SIZE,
    lineHeight: CODE_LINE_HEIGHT,
    height,
    minHeight: height
  }, runs.length ? runs : ' ')
}

const codeLines = (snippet, language, columns) => highlight(snippet, language)
  .map(tokens => codeLine(clipTokens(tokens, columns)))

function editor({ lines, fileName, padding, style }) {
  const header = h('div', {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: PANEL_HEADER,
    padding: '0 24px',
    background: COLORS.panelHeader
  }, [
    dot(COLORS.tertiary),
    dot(COLORS.secondary),
    dot(COLORS.primary),
    h('div', { display: 'flex', marginLeft: 14, fontSize: 20, color: COLORS.onSurfaceVariant }, fileName)
  ])
  const body = h('div', {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding,
    overflow: 'hidden'
  }, lines)
  return h('div', {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: PANEL_BORDER,
    borderStyle: 'solid',
    borderColor: COLORS.outline,
    background: COLORS.panel,
    ...style
  }, [header, body])
}

const gradientBar = () => h('div', {
  display: 'flex',
  height: ICON_LAYOUT.bar,
  borderRadius: 5,
  backgroundImage: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.tertiary})`
})

/** Square card: the editor window with the first lines of the snippet, cut at the panel edge. */
export function iconTree({ snippet, language, fileName }) {
  const lines = codeLines(snippet, language, ICON_COLUMNS)
  const editorPanel = editor({ lines, fileName, padding: `${ICON_LAYOUT.bodyPadding}px 24px`, style: { flex: 1 } })
  return h('div', {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: ICON_LAYOUT.padding,
    gap: ICON_LAYOUT.gap,
    background: COLORS.surface,
    fontFamily: 'Inter'
  }, [editorPanel, gradientBar()])
}

/** 1200x630 card: brand, name and chips on top, the whole snippet below. */
export function socialTree({ name, snippet, language, fileName, platforms, license, logoSrc }) {
  const lines = codeLines(snippet, language, SOCIAL_COLUMNS)
  const chips = [
    chip(LANGUAGE_LABEL[language], COLORS.primaryContainer, COLORS.onPrimaryContainer),
    ...platforms.map(label => chip(label, COLORS.secondaryContainer, COLORS.onSecondaryContainer)),
    ...(license ? [chip(license, COLORS.surfaceContainerHighest, COLORS.onSurfaceVariant)] : [])
  ]
  const brand = h('div', { display: 'flex', flexDirection: 'column', gap: 12 }, [
    h('div', { display: 'flex', fontSize: 24, fontWeight: 700, color: COLORS.primary }, 'OneLiteFeather.net'),
    h('div', {
      display: 'flex',
      fontSize: name.length > 30 ? 40 : 60,
      fontWeight: 700,
      color: COLORS.onSurface
    }, name),
    h('div', { display: 'flex', gap: 12 }, chips)
  ])
  const logo = { type: 'img', props: { src: logoSrc, width: 112, height: 112, style: { width: '112px', height: '112px' } } }
  const editorPanel = editor({ lines, fileName, padding: `${SOCIAL_LAYOUT.bodyPadding}px 28px`, style: { flex: 1 } })
  const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: SOCIAL_LAYOUT.top }
  const top = h('div', header, [brand, logo])
  return h('div', {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: `${SOCIAL_LAYOUT.padding}px 56px`,
    gap: SOCIAL_LAYOUT.gap,
    background: COLORS.surface,
    fontFamily: 'Inter'
  }, [top, editorPanel])
}

// Satori reads TTF or WOFF only; the mono face is not shipped by nuxt-og-image, hence --fonts.
const FONT_FILES = {
  'inter-400-latin.ttf': { name: 'Inter', weight: 400 },
  'inter-700-latin.ttf': { name: 'Inter', weight: 700 },
  'jetbrains-mono-400.ttf': { name: 'JetBrains Mono', weight: 400 }
}

function loadFonts(fontDir) {
  return Object.entries(FONT_FILES).map(([file, { name, weight }]) => {
    const path = join(fontDir, file)
    if (!existsSync(path)) throw new Error(`missing ${path}: see the --fonts description at the top of this script`)
    return { name, data: readFileSync(path), weight, style: 'normal' }
  })
}

async function rasterize(tree, width, height, fonts) {
  const svg = await satori(tree, { width, height, fonts })
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng()
}

export async function renderAll({ repos, outDir, fontDir, projects = PROJECTS }) {
  await initWasm(WebAssembly.compile(readFileSync(join(ROOT, 'node_modules/@resvg/resvg-wasm/index_bg.wasm'))))
  const fonts = loadFonts(fontDir)
  const logoSvg = readFileSync(join(ROOT, 'public/images/logo.svg'), 'utf8')
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`
  const written = []

  for (const project of projects) {
    const { source, language, slug } = project
    const socialName = socialNameOf(project)
    const snippetText = readFileSync(join(repos, source.repo, source.file), 'utf8')
    const snippet = snippetOf(snippetText, source.lines)
    assertFits(snippet, ICON_MAX_LINES, `${slug} icon`)
    assertFits(snippet, SOCIAL_MAX_LINES, `${slug} social card`)
    const fileName = basename(source.file)
    const frontmatter = frontmatterOf(readFileSync(join(ROOT, `content/projects/en/${slug}.md`), 'utf8'))
    const name = nameOf(frontmatter.title)
    const platforms = frontmatter.platforms ?? []
    const projectDir = join(outDir, slug)
    mkdirSync(projectDir, { recursive: true })

    const iconSource = { snippet, language, fileName }
    const icon = await rasterize(iconTree(iconSource), SIZE_ICON, SIZE_ICON, fonts)
    const iconFile = join(projectDir, 'icon.png')
    writeFileSync(iconFile, icon)
    written.push({ file: iconFile, key: projectImageKey(slug, 'icon') })

    const license = frontmatter.license
    const socialSource = { name, snippet, language, fileName, platforms, license, logoSrc }
    const social = await rasterize(socialTree(socialSource), WIDTH_SOCIAL, HEIGHT_SOCIAL, fonts)
    const socialFile = join(projectDir, `${socialName}.png`)
    writeFileSync(socialFile, social)
    written.push({
      file: socialFile,
      key: projectImageKey(slug, socialName),
      source: `${source.repo}/${source.file}:${source.lines.join('-')}`
    })
  }
  return written
}

async function main() {
  const { values } = parseArgs({
    options: {
      repos: { type: 'string' },
      out: { type: 'string', default: join(ROOT, 'node_modules/.cache/project-images') },
      fonts: { type: 'string', default: join(ROOT, '.output/public/_og-static-fonts') },
      only: { type: 'string' }
    }
  })
  if (!values.repos) throw new Error('pass --repos <dir with the checkouts named in PROJECTS>')
  const images = await renderAll({
    repos: resolve(values.repos),
    outDir: resolve(values.out),
    fontDir: resolve(values.fonts),
    projects: values.only ? selectProjects(values.only.split(',')) : PROJECTS
  })
  for (const { source } of images.filter(image => image.source)) console.log(`snippet: ${source}`)
  console.log('Upload once every image exists, before any page requests the URLs:')
  for (const { file, key } of images) {
    console.log(`rclone copyto --s3-no-check-bucket --immutable ${file} img-onelitefeather-net:img-onelitefeather-net/${key}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
