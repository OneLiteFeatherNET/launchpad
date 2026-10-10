// Renders the 18 section cards (9 sections x de/en) from the real NuxtSeo.satori.vue
// template, without prerendering, and prints the rclone commands that upload them.
//   pnpm build && node scripts/render-og-images.mjs [--out <dir>] [--fonts <dir>]

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import * as cheerio from 'cheerio'
import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import { compileScript, parse } from 'vue/compiler-sfc'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ts from 'typescript'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATE = join(ROOT, 'components/OgImage/NuxtSeo.satori.vue')
const WIDTH = 1200
const HEIGHT = 630
const LOCALES = ['de', 'en']

/** Section -> the i18n keys its page uses for the title and description today. */
export const SECTIONS = [
  { section: 'home', title: 'index.title', description: 'seo.default_description' },
  { section: 'blog', title: 'blog.overview.title', description: 'blog.overview.description' },
  { section: 'projects', title: 'projects.overview.title', description: 'projects.overview.description' },
  { section: 'community', title: 'community.title', description: 'community.description' },
  { section: 'community-poi', title: 'community_poi.overview.title', description: 'community_poi.overview.description' },
  { section: 'events', title: 'events.title', description: 'events.description' },
  { section: 'team', title: 'team.index.title', description: 'team.index.description' },
  { section: 'about', title: 'about.title', description: 'about.description' },
  { section: 'bluemap', title: 'bluemap.title', description: 'bluemap.description' }
]

/** Bucket key (and public path suffix) of one card. */
export const uploadKey = (section, locale) => `images/og/${section}-${locale}.png`

const lookup = (json, key) => key.split('.').reduce((node, part) => node?.[part], json)

/** Compiles the real SFC with Vue's compiler; `?raw` imports are inlined as strings. */
async function loadTemplate() {
  const { descriptor, errors } = parse(readFileSync(TEMPLATE, 'utf8'), { filename: TEMPLATE })
  if (errors.length) throw new Error(`template does not parse: ${errors[0].message}`)
  const script = compileScript(descriptor, { id: 'og-section-card', inlineTemplate: true, isProd: true })
  let code = ts.transpileModule(script.content, {
    fileName: 'NuxtSeo.satori.ts',
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  }).outputText
  code = code.replace(/import (\w+) from ['"]([^'"]+)\?raw['"];?/g, (_, name, file) => `const ${name} = ${JSON.stringify(readFileSync(resolve(dirname(TEMPLATE), file), 'utf8'))};`)
  // Next to the repo, so the bare `vue` import resolves to the repo's copy.
  const dir = join(ROOT, 'node_modules/.cache/og-section-cards')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, 'NuxtSeo.satori.mjs')
  writeFileSync(file, code)
  return (await import(pathToFileURL(file).href)).default
}

/** Inline style string from Vue's SSR output -> Satori style object. */
function parseStyle(text) {
  const style = {}
  for (const declaration of text.split(';')) {
    const at = declaration.indexOf(':')
    if (at < 0) continue
    const key = declaration.slice(0, at).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const value = declaration.slice(at + 1).trim()
    style[key] = /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value
  }
  return style
}

/** Rendered HTML -> the element tree Satori takes. Comments and blank text are dropped. */
function toSatoriTree(html) {
  const $ = cheerio.load(html, null, false)
  const convert = (node) => {
    if (node.type === 'text') {
      const text = node.data.replace(/\s+/g, ' ').trim()
      return text ? text : null
    }
    if (node.type !== 'tag') return null
    const props = {}
    for (const [name, value] of Object.entries(node.attribs)) {
      if (name === 'style') props.style = parseStyle(value)
      else props[name] = /^\d+$/.test(value) ? Number(value) : value
    }
    const children = node.children.map(convert).filter(child => child !== null)
    if (children.length) props.children = children.length === 1 ? children[0] : children
    return { type: node.name, props }
  }
  return convert($.root().contents().toArray().find(node => node.type === 'tag'))
}

async function renderCard(component, props, fonts) {
  const html = await renderToString(createSSRApp(component, props))
  const svg = await satori(toSatoriTree(html), { width: WIDTH, height: HEIGHT, fonts })
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
}

function loadFonts(fontDir) {
  const files = [[400, 'inter-400-latin.ttf'], [700, 'inter-700-latin.ttf']]
  return files.map(([weight, file]) => {
    const path = join(fontDir, file)
    if (!existsSync(path)) throw new Error(`missing ${path}: run pnpm build once, or pass --fonts`)
    return { name: 'Inter', data: readFileSync(path), weight, style: 'normal' }
  })
}

export async function renderAll({ outDir, fontDir }) {
  await initWasm(WebAssembly.compile(readFileSync(join(ROOT, 'node_modules/@resvg/resvg-wasm/index_bg.wasm'))))
  const component = await loadTemplate()
  const fonts = loadFonts(fontDir)
  mkdirSync(outDir, { recursive: true })
  const written = []
  for (const locale of LOCALES) {
    const json = JSON.parse(readFileSync(join(ROOT, `i18n/locales/${locale}.json`), 'utf8'))
    for (const entry of SECTIONS) {
      const title = lookup(json, entry.title)
      const description = lookup(json, entry.description)
      if (typeof title !== 'string' || typeof description !== 'string') {
        throw new Error(`${locale}: ${entry.title} or ${entry.description} is missing`)
      }
      const file = join(outDir, `${entry.section}-${locale}.png`)
      writeFileSync(file, await renderCard(component, { title, description }, fonts))
      written.push({ file, key: uploadKey(entry.section, locale) })
    }
  }
  return written
}

async function main() {
  const { values } = parseArgs({
    options: {
      out: { type: 'string', default: join(ROOT, 'node_modules/.cache/og-section-cards/png') },
      fonts: { type: 'string', default: join(ROOT, '.output/public/_og-static-fonts') }
    }
  })
  const cards = await renderAll({ outDir: resolve(values.out), fontDir: resolve(values.fonts) })
  console.log('Upload once every card exists, before anything requests the URLs:')
  for (const { file, key } of cards) {
    console.log(`rclone copyto --s3-no-check-bucket --immutable ${file} img-onelitefeather-net:img-onelitefeather-net/${key}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
