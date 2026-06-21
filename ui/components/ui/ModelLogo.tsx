import React, { useState } from 'react'
import { cn } from '../../lib/utils'
import { assetUrl } from '../../lib/asset-url'
import type { ModelProviderId } from '../../lib/models'

interface ModelLogoProps {
  provider: string
  className?: string
  size?: number
}

const LOGO_SRC: Partial<Record<ModelProviderId, string>> = {
  openai: assetUrl('ailogos/CHATGPTLOGO.png'),
  codex: assetUrl('ailogos/CHATGPTLOGO.png'),
  'claude-code': assetUrl('ailogos/CLAUDELOGO.webp'),
  'gemini-cli': assetUrl('ailogos/GEMINILOGO.jpg'),
  deepseek: assetUrl('ailogos/deepseeklogo.png'),
  mistral: assetUrl('ailogos/MistralLogo.png'),
  grok: assetUrl('ailogos/groklogo.png'),
  qwen: assetUrl('ailogos/qwenlogo.jpg'),
  'local-model': assetUrl('ailogos/OLLAMALOGO.png'),
}

export function ModelLogo({ provider, className, size = 18 }: ModelLogoProps) {
  const id = normalizeProvider(provider)
  if (id === 'unknown') {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded bg-neutral-200 text-[10px] font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
          className
        )}
        style={{ width: size, height: size, lineHeight: `${size}px`, textAlign: 'center' }}
        aria-hidden
      >
        AI
      </span>
    )
  }
  const src = LOGO_SRC[id]
  if (!src) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded bg-neutral-200 text-[10px] font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {id.slice(0, 1).toUpperCase()}
      </span>
    )
  }

  return (
    <LogoImage src={src} alt="" size={size} className={className} fallback={id.slice(0, 1).toUpperCase()} />
  )
}

function LogoImage({
  src,
  alt,
  size,
  className,
  fallback,
}: {
  src: string
  alt: string
  size: number
  className?: string
  fallback: string
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded bg-neutral-200 text-[10px] font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {fallback}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('inline-block shrink-0 object-contain', className)}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      draggable={false}
      aria-hidden
    />
  )
}

function normalizeProvider(provider: string): ModelProviderId | 'unknown' {
  const p = provider.toLowerCase()
  if (p.includes('deepseek')) return 'deepseek'
  if (p.includes('mistral')) return 'mistral'
  if (p.includes('grok')) return 'grok'
  if (p.includes('qwen')) return 'qwen'
  if (p.includes('openai') && !p.includes('codex')) return 'openai'
  if (p.includes('claude')) return 'claude-code'
  if (p.includes('gemini')) return 'gemini-cli'
  if (p.includes('codex')) return 'codex'
  if (p.includes('ollama') || p.includes('local')) return 'local-model'
  if (p === 'openai') return 'openai'
  if (p === 'claude-code') return 'claude-code'
  if (p === 'gemini-cli') return 'gemini-cli'
  if (p === 'codex') return 'codex'
  if (p === 'local-model') return 'local-model'
  if (p === 'deepseek') return 'deepseek'
  if (p === 'mistral') return 'mistral'
  if (p === 'grok') return 'grok'
  if (p === 'qwen') return 'qwen'
  return 'unknown'
}
