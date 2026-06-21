const DEFAULT_REPO = 'ProfessionalQwerty/ProjectRuby'

/** Install from GitHub (no npm registry publish required). */
export const NPM_INSTALL_COMMAND = 'npx --yes github:ProfessionalQwerty/ProjectRuby'

export function getNpmInstallLabel(): string {
  return 'Install with npm'
}

export async function copyNpmInstallCommand(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(NPM_INSTALL_COMMAND)
    return true
  } catch {
    return false
  }
}

export function getInstallHint(): string {
  return 'Requires Node.js 18+. Downloads PRISM from GitHub Releases and creates a desktop shortcut on Windows, macOS, and Linux.'
}
