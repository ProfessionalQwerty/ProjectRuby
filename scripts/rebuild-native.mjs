/**
 * Rebuild node-pty against Electron headers. Falls back to shipped prebuilds when
 * MSVC is not installed (local dev); CI on windows-latest should compile build/Release.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const ptyRoot = join(ROOT, 'node_modules', 'node-pty')
const prebuild = join(ptyRoot, 'prebuilds', `${process.platform}-${process.arch}`, 'pty.node')
const rebuilt = join(ptyRoot, 'build', 'Release', 'pty.node')

function hasNativeBinary() {
  return existsSync(rebuilt) || existsSync(prebuild)
}

let electronVersion = ''
try {
  const pkg = JSON.parse(
    readFileSync(join(ROOT, 'node_modules', 'electron', 'package.json'), 'utf8')
  )
  electronVersion = pkg.version || ''
} catch {
  // auto-detect
}

const args = ['@electron/rebuild', '-f', '-w', 'node-pty']
if (electronVersion) args.push('--version', electronVersion)

console.log(`[rebuild-native] npx ${args.join(' ')}`)

const result = spawnSync('npx', args, {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
})

if (result.status === 0) {
  console.log(`[rebuild-native] node-pty rebuilt for Electron ${electronVersion || '(auto)'}`)
  process.exit(0)
}

if (hasNativeBinary()) {
  console.warn(
    '[rebuild-native] electron-rebuild failed — continuing with existing native binary (prebuild or prior build).'
  )
  console.warn(
    '[rebuild-native] For production installers, install VS Build Tools and rerun, or let GitHub Actions build the release.'
  )
  process.exit(0)
}

console.error('[rebuild-native] No node-pty native binary and rebuild failed.')
process.exit(result.status || 1)
