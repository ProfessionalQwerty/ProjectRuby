/**
 * Fail the pack step if node-pty was not staged under desktop/dist/node_modules.
 * CI requires electron-rebuild output (build/Release), not Node.js prebuilds.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const IS_CI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
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

const natives = nativeCandidates()
if (natives.length === 0) {
  console.error('[verify-native-deps] No native node-pty binary found for this platform.')
  process.exit(1)
}

const rebuilt = natives.some((p) => p.includes('build') && p.includes('Release'))
if (IS_CI && !rebuilt) {
  console.error(
    '[verify-native-deps] CI requires build/Release/*.node from electron-rebuild, not prebuilds alone.'
  )
  process.exit(1)
}

console.log(
  `[verify-native-deps] node-pty OK (${rebuilt ? 'electron-rebuild build/Release' : 'prebuilds'}) — ${natives.length} binary(s)`
)
