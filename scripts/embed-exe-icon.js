/**
 * Embed PRISM icon into Windows executables after electron-builder.
 * Required because signAndEditExecutable:false skips rcedit (avoids winCodeSign symlink issues).
 */
const { existsSync } = require('fs')
const { join } = require('path')
const rcedit = require('rcedit')

const root = join(__dirname, '..')
const iconPath = join(root, 'build', 'icon.ico')

const targets = [
  join(root, 'release', 'win-unpacked', 'PRISM.exe'),
  join(root, 'release', 'PRISM-Setup-x64.exe'),
]

async function main() {
  if (process.platform !== 'win32') {
    console.log('embed-exe-icon: skipped (Windows only)')
    return
  }

  if (!existsSync(iconPath)) {
    console.warn('embed-exe-icon: build/icon.ico missing — run npm run generate-icons first')
    return
  }

  for (const exe of targets) {
    if (!existsSync(exe)) {
      console.log(`embed-exe-icon: skip missing ${exe}`)
      continue
    }
    await rcedit(exe, { icon: iconPath })
    console.log(`embed-exe-icon: set icon on ${exe}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
