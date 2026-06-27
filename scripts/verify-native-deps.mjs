/**
 * Fail the pack step if node-pty was not staged under desktop/dist/node_modules.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const ptyRoot = join(ROOT, 'desktop', 'dist', 'node_modules', 'node-pty')
const indexJs = join(ptyRoot, 'lib', 'index.js')

function nativeCandidates() {
  const plat = `${process.platform}-${process.arch}`
  const release = join(ptyRoot, 'build', 'Release')
  const prebuild = join(ptyRoot, 'prebuilds', plat)
  const names =
    process.platform === 'win32'
      ? ['pty.node', 'conpty.node', 'conpty_console_list.node']
      : ['pty.node']

  const found = []
  for (const dir of [release, prebuild]) {
    for (const name of names) {
      const path = join(dir, name)
      if (existsSync(path)) found.push(path)
    }
  }
  return found
}

if (!existsSync(indexJs)) {
  console.error('[verify-native-deps] Missing desktop/dist/node_modules/node-pty — run copy-main-deps.mjs')
  process.exit(1)
}

let pkgVersion = ''
try {
  pkgVersion = JSON.parse(readFileSync(join(ptyRoot, 'package.json'), 'utf8')).version || ''
} catch {
  // ignore
}

const natives = nativeCandidates()
if (natives.length === 0) {
  console.error('[verify-native-deps] No native node-pty binary found for this platform.')
  process.exit(1)
}

const rebuilt = natives.some((p) => p.includes('build') && p.includes('Release'))
const mode = rebuilt ? 'electron-rebuild build/Release' : 'platform prebuilds'
console.log(`[verify-native-deps] node-pty ${pkgVersion} OK (${mode}) — ${natives.length} binary(s)`)
