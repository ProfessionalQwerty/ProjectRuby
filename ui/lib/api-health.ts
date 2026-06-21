import { API_URL, buildApiHeaders } from '../api-config'

let lastOnline = false

export async function checkApiHealth(): Promise<boolean> {
  if (!API_URL) {
    lastOnline = false
    return false
  }

  const paths = ['/health', '/api/health']
  for (const path of paths) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: 'GET',
        headers: buildApiHeaders(),
      })
      if (!res.ok) continue
      const data = (await res.json()) as { success?: boolean; status?: string }
      if (data.status === 'healthy' || data.success === true) {
        lastOnline = true
        return true
      }
    } catch {
      // try next path
    }
  }

  lastOnline = false
  return false
}

export function wasApiOnline(): boolean {
  return lastOnline
}
