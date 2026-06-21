/**
 * API Configuration
 * Cloud engine URL + optional client key for agent registration on HF.
 */

const viteEnv = (import.meta as ImportMeta & {
  env?: {
    VITE_API_URL?: string
    VITE_PRISM_CLIENT_KEY?: string
    VITE_HF_ACCESS_TOKEN?: string
    DEV?: boolean
  }
}).env

const DEFAULT_CLOUD_API = 'https://yashshshsh-prism.hf.space'

export const API_URL =
  viteEnv?.VITE_API_URL?.trim() ||
  (viteEnv?.DEV ? '' : DEFAULT_CLOUD_API)

const CLIENT_KEY = viteEnv?.VITE_PRISM_CLIENT_KEY?.trim() || ''
const HF_ACCESS_TOKEN = viteEnv?.VITE_HF_ACCESS_TOKEN?.trim() || ''

export const getApiUrl = (path: string): string => {
  return `${API_URL}${path}`
}

function defaultHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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
    const url = getApiUrl(path)
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders(),
        ...options?.headers,
      },
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
    return this.fetch<T>(path, {
      ...options,
      method: 'GET',
    })
  },
}
