/**
 * Generate electron-builder icons from prism-logo or cut-stone source PNG.
 * Trims transparent padding and fills the frame so taskbar/desktop icons match other apps.
 * Run: npm run generate-icons
 */
const { mkdir, readFile, writeFile } = require('fs/promises')
const { existsSync } = require('fs')
const { join } = require('path')
const sharp = require('sharp')
const pngToIco = require('png-to-ico')

const root = join(__dirname, '..')
const buildDir = join(root, 'build')

const SOURCE_CANDIDATES = [
  join(root, '..', 'prism_logo_cut_stone_final.png'),
  join(root, 'ui', 'public', 'prism-logo.png'),
]

async function findSource() {
  for (const candidate of SOURCE_CANDIDATES) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error(`No source logo found. Expected one of:\n${SOURCE_CANDIDATES.join('\n')}`)
}

/** Trim alpha padding, then composite logo at ~92% of canvas (Windows/macOS expect full-bleed icons). */
async function renderIconCanvas(sourceBuffer, size) {
  const trimmed = await sharp(sourceBuffer).trim().toBuffer()
  const logoSize = Math.round(size * 0.92)
  const logo = await sharp(trimmed).resize(logoSize, logoSize, { fit: 'inside' }).png().toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer()
}

async function main() {
  await mkdir(buildDir, { recursive: true })
  const sourcePath = await findSource()
  console.log('Using source:', sourcePath)

  const source = await readFile(sourcePath)
  const icon1024 = await renderIconCanvas(source, 1024)
  const icon512 = await renderIconCanvas(source, 512)
  const icon256 = await renderIconCanvas(source, 256)

  await writeFile(join(buildDir, 'icon.png'), icon512)
  await writeFile(join(buildDir, 'icon@2x.png'), icon1024)

  const icoSizes = [16, 24, 32, 48, 64, 128, 256]
  const icoBuffers = await Promise.all(icoSizes.map((s) => renderIconCanvas(source, s)))
  const ico = await pngToIco(icoBuffers)
  await writeFile(join(buildDir, 'icon.ico'), ico)

  // macOS electron-builder reads icon.png; keep 256 for window icon fallback
  await writeFile(join(buildDir, 'icon-256.png'), icon256)

  console.log('Wrote build/icon.png (512), build/icon@2x.png (1024), build/icon.ico')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
