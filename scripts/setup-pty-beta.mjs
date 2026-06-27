#!/usr/bin/env node
/**
 * Optional: reinstall node-pty@beta without touching package-lock.json.
 * Committed desktop already pins 1.2.0-beta.13 — you only need this after
 * `npm ci` if you temporarily downgraded for testing.
 */
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = process.cwd()

if (process.platform !== 'win32') {
  console.log('[setup-pty-beta] Skipped — only needed on Windows when lockfile drifted.')
  process.exit(0)
}

console.log('[setup-pty-beta] Reinstalling node-pty@1.2.0-beta.13 into desktop workspace...')

const result = spawnSync(
  'npm',
  ['install', 'node-pty@1.2.0-beta.13', '-w', 'desktop', '--no-package-lock', '--no-save'],
  { cwd: ROOT, stdio: 'inherit', shell: true }
)

process.exit(result.status || 0)
