/**
 * Prepare node-pty native binaries for Electron packaging.
 *
 * node-pty@1.2.0-beta.13 ships platform prebuilds and avoids node-gyp on CI
 * (required for Windows VS2026 / node-gyp 18 locally). Stable 1.1.0 still needs
 * electron-rebuild when prebuilds are absent.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const IS_CI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
const SKIP_REBUILD = process.env.PRISM_SKIP_NATIVE_REBUILD === '1'

function resolvePtyRoot() {
  const candidates = [
    join(ROOT, 'desktop', 'node_modules', 'node-pty'),
    join(ROOT, 'node_modules', 'node-pty'),
  ]
  for (const p of candidates) {
    if (existsSync(join(p, 'package.json'))) return p
  }
  return candidates[0]
}

function resolveElectronVersion() {
  const candidates = [
    join(ROOT, 'node_modules', 'electron', 'package.json'),
    join(ROOT, 'desktop', 'node_modules', 'electron', 'package.json'),
  ]
  for (const p of candidates) {
    try {
      return JSON.parse(readFileSync(p, 'utf8')).version || ''
    } catch {
      // continue
    }
  }
  return ''
}

function ptyVersion(ptyRoot) {
  try {
    return JSON.parse(readFileSync(join(ptyRoot, 'package.json'), 'utf8')).version || ''
  } catch {
    return ''
  }
}

function hasNativeBinary(ptyRoot) {
  const plat = `${process.platform}-${process.arch}`
  const release = join(ptyRoot, 'build', 'Release')
  const prebuild = join(ptyRoot, 'prebuilds', plat)
  const names =
    process.platform === 'win32'
      ? ['pty.node', 'conpty.node', 'conpty_console_list.node']
      : ['pty.node']

  for (const dir of [release, prebuild]) {
    if (!existsSync(dir)) continue
    for (const name of names) {
      if (existsSync(join(dir, name))) return true
    }
  }
  return false
}

function isPrebuildPty(version) {
  return version.includes('beta')
}

const ptyRoot = resolvePtyRoot()
const version = ptyVersion(ptyRoot)
const electronVersion = resolveElectronVersion()

if (SKIP_REBUILD || isPrebuildPty(version)) {
  console.log(
    `[rebuild-native] Using node-pty prebuilds (version=${version || 'unknown'}, CI=${IS_CI})`
  )
  if (!hasNativeBinary(ptyRoot)) {
    console.error('[rebuild-native] node-pty prebuild/native binary missing for this platform.')
    process.exit(1)
  }
  process.exit(0)
}

// Stable node-pty — compile against Electron headers (root hoisted electron).
const moduleDir = join(ROOT, 'node_modules')
const args = ['@electron/rebuild', '-f', '-w', 'node-pty', '-m', moduleDir]
if (electronVersion) args.push('--version', electronVersion)

console.log(`[rebuild-native] npx ${args.join(' ')}`)

const result = spawnSync('npx', args, {
  cwd: ROOT,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (result.status === 0) {
  console.log(`[rebuild-native] node-pty rebuilt for Electron ${electronVersion || '(auto)'}`)
  process.exit(0)
}

if (IS_CI) {
  console.error('[rebuild-native] electron-rebuild failed in CI — refusing prebuild fallback.')
  process.exit(result.status || 1)
}

if (hasNativeBinary(ptyRoot)) {
  console.warn('[rebuild-native] electron-rebuild failed locally — using existing native binary.')
  process.exit(0)
}

console.error('[rebuild-native] No node-pty native binary and rebuild failed.')
process.exit(result.status || 1)
