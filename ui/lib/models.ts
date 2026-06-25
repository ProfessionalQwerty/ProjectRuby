export type ModelProviderId =
  | 'openai'
  | 'claude-code'
  | 'gemini-cli'
  | 'codex'
  | 'local-model'
  | 'deepseek'
  | 'mistral'
  | 'grok'
  | 'qwen'

export type LlmOAuthProviderId = 'anthropic' | 'openai-codex'

export type ModelAuthMethod = 'oauth' | 'api_key' | 'none'

export interface ModelCatalogEntry {
  id: ModelProviderId
  name: string
  description: string
  authMethod: ModelAuthMethod
  oauthProvider?: LlmOAuthProviderId
  oauthSignInLabel?: string
  /** Optional developer fallback — hidden behind Advanced */
  supportsApiKeyFallback?: boolean
  apiKeyLabel?: string
  providerLabel: string
}

export const MODEL_CATALOG: ModelCatalogEntry[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o via your ChatGPT Plus/Pro subscription',
    authMethod: 'oauth',
    oauthProvider: 'openai-codex',
    oauthSignInLabel: 'Sign in with ChatGPT',
    supportsApiKeyFallback: true,
    apiKeyLabel: 'OpenAI API Key (advanced)',
    providerLabel: 'OpenAI',
  },
  {
    id: 'claude-code',
    name: 'Claude',
    description: 'Anthropic Claude via your Claude Pro/Max subscription',
    authMethod: 'oauth',
    oauthProvider: 'anthropic',
    oauthSignInLabel: 'Sign in with Claude',
    supportsApiKeyFallback: true,
    apiKeyLabel: 'Anthropic API Key (advanced)',
    providerLabel: 'Claude',
  },
  {
    id: 'gemini-cli',
    name: 'Gemini',
    description: 'Google Gemini models',
    authMethod: 'api_key',
    apiKeyLabel: 'Google AI API Key',
    providerLabel: 'Gemini',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek Chat and coder models',
    authMethod: 'api_key',
    apiKeyLabel: 'DeepSeek API Key',
    providerLabel: 'DeepSeek',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral AI models',
    authMethod: 'api_key',
    apiKeyLabel: 'Mistral API Key',
    providerLabel: 'Mistral',
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'xAI Grok models',
    authMethod: 'api_key',
    apiKeyLabel: 'xAI API Key',
    providerLabel: 'Grok',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    description: 'Alibaba Qwen models (DashScope)',
    authMethod: 'api_key',
    apiKeyLabel: 'DashScope API Key',
    providerLabel: 'Qwen',
  },
  {
    id: 'codex',
    name: 'Codex',
    description: 'OpenAI Codex for code generation (ChatGPT subscription)',
    authMethod: 'oauth',
    oauthProvider: 'openai-codex',
    oauthSignInLabel: 'Sign in with ChatGPT',
    supportsApiKeyFallback: true,
    apiKeyLabel: 'OpenAI API Key (advanced)',
    providerLabel: 'Codex',
  },
  {
    id: 'local-model',
    name: 'Ollama',
    description: 'Local models via Ollama — no cloud account needed',
    authMethod: 'none',
    providerLabel: 'Ollama',
  },
]

/** @deprecated use authMethod === 'api_key' */
export function requiresApiKey(entry: ModelCatalogEntry): boolean {
  return entry.authMethod === 'api_key'
}

export const USER_AGENTS_STORAGE_KEY = 'prism-user-agents'

export function loadUserAgentIds(): string[] {
  try {
    const raw = localStorage.getItem(USER_AGENTS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function saveUserAgentIds(ids: string[]): void {
  localStorage.setItem(USER_AGENTS_STORAGE_KEY, JSON.stringify(ids))
}

export function getCatalogEntry(id: string): ModelCatalogEntry | undefined {
  return MODEL_CATALOG.find((m) => m.id === id)
}
