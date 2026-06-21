/** Resolve public asset paths for web (/) and Electron (./) builds. */
export function assetUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const clean = relativePath.replace(/^\//, '')
  return `${base}${clean}`
}
