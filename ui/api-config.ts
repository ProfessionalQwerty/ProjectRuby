/**
 * API Configuration — cloud engine URL + optional client key for HF Spaces.
 */

const viteEnv = import.meta.env

const DEFAULT_CLOUD_API = 'https://yashshshsh-prism.hf.space'

/** Production desktop/web builds always target the cloud engine unless overridden. */
export const API_URL =
  viteEnv.VITE_API_URL?.trim() ||
  (viteEnv.DEV ? '' : DEFAULT_CLOUD_API)

const CLIENT_KEY = viteEnv.VITE_PRISM_CLIENT_KEY?.trim() || ''
const HF_ACCESS_TOKEN = viteEnv.VITE_HF_ACCESS_TOKEN?.trim() || ''

export const getApiUrl = (path: string): string => `${API_URL}${path}`

export function buildApiHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  }
  if (CLIENT_KEY) {
    headers['X-PRISM-Client-Key'] = CLIENT_KEY
  }
  if (HF_ACCESS_TOKEN) {
    headers['Authorization'] = `Bearer ${HF_ACCESS_TOKEN}`
  }
  return headers
}

export const apiClient = {
  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(getApiUrl(path), {
      ...options,
      headers: buildApiHeaders(options?.headers as Record<string, string>),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  },

  async post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.fetch<T>(path, { ...options, method: 'GET' })
  },
}
