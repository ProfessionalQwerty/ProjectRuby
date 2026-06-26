/**
 * Copy main-process runtime deps into desktop/dist/node_modules so they ship
 * inside app.asar via the desktop/dist pack rule in electron-builder.yml.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const DEST = join(ROOT, 'desktop', 'dist', 'node_modules')

const PACKAGES = [
  'electron-updater',
  'builder-util-runtime',
  'fs-extra',
  'graceful-fs',
  'jsonfile',
  'universalify',
  'js-yaml',
  'argparse',
  'lazy-val',
  'lodash.escaperegexp',
  'lodash.isequal',
  'semver',
  'tiny-typed-emitter',
  'debug',
  'ms',
  'sax',
  'node-pty',
]

/** Desktop workspace is the canonical owner of node-pty — never copy root beta hoists. */
function resolvePackageSrc(name) {
  const candidates = [
    join(ROOT, 'desktop', 'node_modules', name),
    join(ROOT, 'node_modules', name),
  ]
  for (const src of candidates) {
    if (existsSync(join(src, 'package.json'))) return src
  }
  throw new Error(`Missing dependency ${name} — run npm install at prism-app root`)
}

function pruneForeignPtyPrebuilds(ptyDest) {
  const prebuildsDir = join(ptyDest, 'prebuilds')
  if (!existsSync(prebuildsDir)) return

  const keep = `${process.platform}-${process.arch}`
  for (const entry of readdirSync(prebuildsDir)) {
    if (entry === keep) continue
    const target = join(prebuildsDir, entry)
    rmSync(target, { recursive: true, force: true })
    console.log(`[copy-main-deps] Pruned foreign prebuild: ${entry}`)
  }
}

function copyPackage(name) {
  const src = resolvePackageSrc(name)
  const dest = join(DEST, name)
  cpSync(src, dest, { recursive: true })
  if (name === 'node-pty') {
    const pkg = JSON.parse(readFileSync(join(dest, 'package.json'), 'utf8'))
    console.log(`[copy-main-deps] node-pty ${pkg.version} from ${src}`)
    pruneForeignPtyPrebuilds(dest)
  }
}

if (existsSync(DEST)) {
  rmSync(DEST, { recursive: true, force: true })
}
mkdirSync(DEST, { recursive: true })

for (const pkg of PACKAGES) {
  copyPackage(pkg)
}

console.log(`[copy-main-deps] Copied ${PACKAGES.length} packages to desktop/dist/node_modules`)
