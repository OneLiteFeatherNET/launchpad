// Renders the code-based images of the projects from real lines of their repositories:
// a square icon (512x512, card and detail header) and a social card (1200x630, carousel
// and og:image) per project. Prints the rclone commands that upload them.
//   node scripts/render-project-images.mjs --repos <dir> [--out <dir>] [--fonts <dir>]
// --repos holds the Falco, Otis and AntiRedstoneClock-Remastered checkouts (read only).
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
    }
  }
]

const LANGUAGE_LABEL = { yaml: 'YAML', java: 'Java' }

/** The lines of a snippet, dedented; ranges outside the 6 to 12 lines a card fits are refused. */
export function snippetOf(text, [start, end]) {
  const lines = text.split('\n').slice(start - 1, end).map(line => line.replace(/\t/g, '    ').trimEnd())
  if (lines.length < 6 || lines.length > 12) throw new Error(`snippet has ${lines.length} lines, want 6 to 12`)
  const indents = lines
    .filter(line => line.trim())
    .map(line => line.length - line.trimStart().length)
  const indent = Math.min(...indents)
  return lines.map(line => line.slice(indent))
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

const yamlWord = (kind, word) => {
  if (kind !== 'word') return kind
  return /^(true|false|null)$/.test(word) ? 'keyword' : 'plain'
}

/** Tokens of each snippet line as `{ kind, text }`, with kind a key of SYNTAX. */
export function highlight(lines, language) {
  if (language === 'java') return lines.map(line => scan(line, JAVA_RULES, 0, javaWord))
  if (language === 'yaml') {
    return lines.map((line) => {
      const key = YAML_KEY.exec(line)
      if (!key) return scan(line, YAML_VALUE_RULES, 0, yamlWord)
      const tokens = []
      push(tokens, 'plain', key[1])
      push(tokens, 'key', key[2])
      push(tokens, 'plain', key[3])
      const value = scan(line, YAML_VALUE_RULES, key[0].length, yamlWord)
      for (const token of value) push(tokens, token.kind, token.text)
      return tokens
    })
  }
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
  const height = Math.round(CODE_FONT_SIZE * CODE_LINE_HEIGHT)
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
    height: 52,
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
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: COLORS.outline,
    background: COLORS.panel,
    ...style
  }, [header, body])
}

const gradientBar = () => h('div', {
  display: 'flex',
  height: 10,
  borderRadius: 5,
  backgroundImage: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.tertiary})`
})

/** Square card: the editor window with the first lines of the snippet, cut at the panel edge. */
export function iconTree({ snippet, language, fileName }) {
  const lines = codeLines(snippet, language, ICON_COLUMNS)
  const editorPanel = editor({ lines, fileName, padding: '20px 24px', style: { flex: 1 } })
  return h('div', {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: 32,
    gap: 24,
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
    h('div', { display: 'flex', fontSize: 60, fontWeight: 700, color: COLORS.onSurface }, name),
    h('div', { display: 'flex', gap: 12 }, chips)
  ])
  const logo = { type: 'img', props: { src: logoSrc, width: 112, height: 112, style: { width: '112px', height: '112px' } } }
  const editorPanel = editor({ lines, fileName, padding: '18px 28px', style: { flex: 1 } })
  const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const top = h('div', header, [brand, logo])
  return h('div', {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: '44px 56px',
    gap: 28,
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

export async function renderAll({ repos, outDir, fontDir }) {
  await initWasm(WebAssembly.compile(readFileSync(join(ROOT, 'node_modules/@resvg/resvg-wasm/index_bg.wasm'))))
  const fonts = loadFonts(fontDir)
  const logoSvg = readFileSync(join(ROOT, 'public/images/logo.svg'), 'utf8')
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`
  const written = []

  for (const project of PROJECTS) {
    const { source, language, slug } = project
    const snippetText = readFileSync(join(repos, source.repo, source.file), 'utf8')
    const snippet = snippetOf(snippetText, source.lines)
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
    const socialFile = join(projectDir, 'social.png')
    writeFileSync(socialFile, social)
    written.push({
      file: socialFile,
      key: projectImageKey(slug, 'social'),
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
      fonts: { type: 'string', default: join(ROOT, '.output/public/_og-static-fonts') }
    }
  })
  if (!values.repos) throw new Error('pass --repos <dir with Falco, Otis and AntiRedstoneClock-Remastered>')
  const images = await renderAll({
    repos: resolve(values.repos),
    outDir: resolve(values.out),
    fontDir: resolve(values.fonts)
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
