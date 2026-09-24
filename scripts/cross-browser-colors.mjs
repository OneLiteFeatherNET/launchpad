// Renders the MD3 colour mechanics in Chromium, Firefox and WebKit, light and
// dark, and checks the pixels (openspec change adopt-md3-design-system, task
// 2.4). Unit tests cannot see this: every role is a light-dark() pair, and an
// opacity modifier wraps it in color-mix() — whether a browser resolves that
// combination per colour scheme is a rendering question.
//
//   pnpm exec playwright install chromium firefox webkit
//   node scripts/cross-browser-colors.mjs
//   node scripts/cross-browser-colors.mjs --only=chromium   (one engine)
//
// CHROMIUM_EXECUTABLE points Chromium at an existing binary, for a local run
// where only another Playwright build's browser is installed.
//
// Pixels rather than computed styles: browsers serialise the same colour as
// oklab(), color(srgb …) or rgb(), but a rendered pixel is comparable.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'
import { chromium, firefox, webkit } from 'playwright'
import { compile } from 'tailwindcss'

const root = fileURLToPath(new URL('..', import.meta.url))
const themeCss = readFileSync(`${root}assets/css/tailwind.css`, 'utf8')

/** Both sides of a `light-dark(#a, #b)` role, as [r, g, b] per scheme. */
function role(name) {
  const match = new RegExp(`--color-${name}:\\s*light-dark\\((#[0-9a-f]{6}),\\s*(#[0-9a-f]{6})\\)`, 'i')
    .exec(themeCss)
  if (!match) throw new Error(`--color-${name} is not a light-dark() pair`)
  const OFFSETS = [
    1,
    3,
    5,
  ]
  const rgb = (hex) => OFFSETS.map((i) => parseInt(hex.slice(i, i + 2), 16))
  return { light: rgb(match[1]), dark: rgb(match[2]) }
}

/** `front` at `alpha` composited over `back`, per channel. */
const over = (front, back, alpha) => front.map((c, i) => c * alpha + back[i] * (1 - alpha))

async function css() {
  const tailwindDir = `${root}node_modules/tailwindcss/`
  const cssDir = `${root}assets/css/`
  const compiler = await compile(themeCss, {
    base: `${root}assets/css`,
    loadStylesheet: async (id) => {
      // The project's own imports (./seasons.css) sit next to tailwind.css.
      if (id.startsWith('./')) {
        const path = cssDir + id.slice(2)
        return { path, base: cssDir, content: readFileSync(path, 'utf8') }
      }
      const file = id === 'tailwindcss' ? 'index.css' : id.replace(/^tailwindcss\//, '')
      return { path: tailwindDir + file, base: tailwindDir, content: readFileSync(tailwindDir + file, 'utf8') }
    },
  })
  return compiler.build([
    'bg-surface',
    'bg-primary/10',
    'text-on-surface',
    'state-layer',
  ])
}

/** RGB of the centre pixel of a PNG screenshot (8-bit RGB or RGBA). */
function centrePixel(png) {
  let offset = 8
  let width = 0
  let height = 0
  let channels = 4
  const data = []
  while (offset < png.length) {
    const length = png.readUInt32BE(offset)
    const type = png.toString('ascii', offset + 4, offset + 8)
    const chunk = png.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0)
      height = chunk.readUInt32BE(4)
      channels = chunk[9] === 6 ? 4 : 3
    } else if (type === 'IDAT') {
      data.push(chunk)
    }
    offset += 12 + length
  }
  const raw = inflateSync(Buffer.concat(data))
  const stride = width * channels
  const rows = []
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)))
    const prev = rows[y - 1] ?? Buffer.alloc(stride)
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? line[x - channels] : 0
      const b = prev[x]
      const c = x >= channels ? prev[x - channels] : 0
      const p = a + b - c
      const paeth = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c)
        ? a
        : Math.abs(p - b) <= Math.abs(p - c) ? b : c
      // PNG filter types 0–4: none, sub, up, average, paeth.
      const add = [
        0,
        a,
        b,
        (a + b) >> 1,
        paeth,
      ][filter] ?? 0
      line[x] = (line[x] + add) & 0xff
    }
    rows.push(line)
  }
  const row = rows[height >> 1]
  const x = (width >> 1) * channels
  return [
    row[x],
    row[x + 1],
    row[x + 2],
  ]
}

const surface = role('surface')
const primary = role('primary')
const onSurface = role('on-surface')

/** What each box must render as, per scheme. */
const cases = [
  { id: 'surface', label: 'bg-surface', expect: (s) => surface[s] },
  { id: 'tint', label: 'bg-primary/10', expect: (s) => over(primary[s], surface[s], 0.1) },
  { id: 'rest', label: 'state-layer at rest', expect: (s) => surface[s] },
  { id: 'hover', label: 'state-layer on hover', expect: (s) => over(onSurface[s], surface[s], 0.08), hover: true },
]

const html = (style) => `<!doctype html><html><head><style>
${style}
:root { color-scheme: light dark; }
body { margin: 0; }
.box { width: 80px; height: 40px; margin: 8px; display: block; border: 0; padding: 0; }
</style></head><body class="bg-surface text-on-surface">
<div id="surface" class="box bg-surface"></div>
<div id="tint" class="box bg-primary/10"></div>
<button id="rest" class="box state-layer bg-surface text-on-surface"></button>
<button id="hover" class="box state-layer bg-surface text-on-surface"></button>
</body></html>`

const TOLERANCE = 4
const style = await css()
const failures = []

const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length)
const engines = [
  ['chromium', chromium],
  ['firefox', firefox],
  ['webkit', webkit],
].filter(([name]) => !only || name === only)

for (const [name, engine] of engines) {
  const executablePath = name === 'chromium' ? process.env.CHROMIUM_EXECUTABLE : undefined
  const browser = await engine.launch(executablePath ? { executablePath } : {})
  for (const scheme of ['light', 'dark']) {
    const page = await browser.newPage({ colorScheme: scheme })
    await page.setContent(html(style))
    for (const test of cases) {
      const box = page.locator(`#${test.id}`)
      if (test.hover) await box.hover()
      else await page.mouse.move(0, 0)
      const got = centrePixel(await box.screenshot())
      const want = test.expect(scheme).map(Math.round)
      const ok = got.every((c, i) => Math.abs(c - want[i]) <= TOLERANCE)
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(8)} ${scheme.padEnd(5)} ${test.label.padEnd(22)} got ${got} want ${want}`)
      if (!ok) failures.push(`${name} ${scheme} ${test.label}`)
    }
    await page.close()
  }
  await browser.close()
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
