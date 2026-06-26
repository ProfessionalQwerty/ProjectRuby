/**
 * Fail the pack step if node-pty was not staged under desktop/dist/node_modules.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const ptyRoot = join(ROOT, 'desktop', 'dist', 'node_modules', 'node-pty')
const indexJs = join(ptyRoot, 'lib', 'index.js')
const prebuild = join(ptyRoot, 'prebuilds', `${process.platform}-${process.arch}`, 'pty.node')
const rebuilt = join(ptyRoot, 'build', 'Release', 'pty.node')

if (!existsSync(indexJs)) {
  console.error('[verify-native-deps] Missing desktop/dist/node_modules/node-pty — run copy-main-deps.mjs')
  process.exit(1)
}

if (!existsSync(rebuilt) && !existsSync(prebuild)) {
  console.error(
    '[verify-native-deps] No native pty.node found (checked build/Release and prebuilds). Run: npm run rebuild:native'
  )
  process.exit(1)
}

console.log(
  `[verify-native-deps] node-pty OK (${existsSync(rebuilt) ? 'electron-rebuild build/Release' : 'prebuilds'})`
)
