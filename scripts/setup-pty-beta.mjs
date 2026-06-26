#!/usr/bin/env node
/**
 * Local Windows dev only — install node-pty@beta into the desktop workspace
 * without updating package-lock.json (VS2026 / node-gyp 18 workaround).
 *
 * Usage:
 *   npm run setup:pty-beta
 *   set PRISM_PTY_BETA=1 && npm run dev
 */
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = process.cwd()

if (process.platform !== 'win32') {
  console.log('[setup-pty-beta] Skipped — only needed on Windows.')
  process.exit(0)
}

console.log('[setup-pty-beta] Installing node-pty@1.2.0-beta.13 into desktop workspace (no lockfile change)...')

const result = spawnSync(
  'npm',
  ['install', 'node-pty@1.2.0-beta.13', '-w', 'desktop', '--no-package-lock', '--no-save'],
  { cwd: ROOT, stdio: 'inherit', shell: true }
)

if (result.status !== 0) {
  process.exit(result.status || 1)
}

console.log('[setup-pty-beta] Done. Run with:')
console.log('  set PRISM_PTY_BETA=1')
console.log('  npm run dev')
