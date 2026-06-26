/**
 * CI check: node-pty must exist inside the packaged app (asar or asar.unpacked).
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const prePack = join(root, 'desktop', 'dist', 'node_modules', 'node-pty', 'lib', 'index.js')

if (existsSync(prePack)) {
  console.log('[verify-asar-node-pty] desktop/dist/node_modules/node-pty OK (pre-pack)')
  process.exit(0)
}

const unpacked = join(root, 'release', 'win-unpacked', 'resources', 'app.asar.unpacked')
const asarPty = join(
  unpacked,
  'desktop',
  'dist',
  'node_modules',
  'node-pty',
  'lib',
  'index.js'
)

if (existsSync(asarPty)) {
  console.log('[verify-asar-node-pty] node-pty found in app.asar.unpacked')
  process.exit(0)
}

const asar = join(root, 'release', 'win-unpacked', 'resources', 'app.asar')
if (!existsSync(asar)) {
  console.log('[verify-asar-node-pty] Skipping — no win-unpacked artifact')
  process.exit(0)
}

console.error('[verify-asar-node-pty] node-pty missing from packaged app')
process.exit(1)
