import React, { useEffect, useState } from 'react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { ModelLogo } from '../ui/ModelLogo'

const TABS = [
  { id: 'claude-code', name: 'Claude', intro: 'Picking up the auth refactor where we left off.' },
  { id: 'openai', name: 'GPT', intro: 'Continuing the API hardening pass.' },
  { id: 'gemini-cli', name: 'Gemini', intro: 'Resuming the session-store migration.' },
  { id: 'local-model', name: 'Local', intro: 'Back on the token-budget cleanup.' },
]

const CONTEXT_FILES = ['middleware.ts', 'session.ts', 'user-store.ts']

/** Animated app-window mockup: shows the same context carrying across model switches. */
export function HeroPreview() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = window.setInterval(() => setActive((a) => (a + 1) % TABS.length), 2600)
    return () => window.clearInterval(t)
  }, [])

  const prev = TABS[(active - 1 + TABS.length) % TABS.length]
  const model = TABS[active]

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-400/30 via-fuchsia-300/20 to-amber-300/20 blur-3xl" />

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-violet-950/10">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 bg-neutral-50 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="font-mono text-[12px] text-neutral-500">PRISM · my-app</span>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Memory warm
          </span>
        </div>

        {/* Model tabs */}
        <div className="flex items-center gap-1 border-b border-neutral-200/80 bg-neutral-50/60 px-2 pt-2">
          {TABS.map((tab, i) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 rounded-t-lg border border-b-0 px-3 py-2 text-[13px] font-medium transition-colors ${
                i === active
                  ? 'border-neutral-200 bg-white text-neutral-900'
                  : 'border-transparent text-neutral-400'
              }`}
            >
              <ModelLogo provider={tab.id} size={16} />
              {tab.name}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50/70 px-3 py-2 text-[12px] text-violet-700">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="flex flex-wrap items-center gap-1">
              Switched <span className="font-semibold">{prev.name}</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-semibold">{model.name}</span>
              <span className="text-violet-500">· context kept</span>
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0">
              <ModelLogo provider={model.id} size={22} />
            </span>
            <div className="rounded-2xl rounded-tl-sm bg-neutral-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-neutral-700">
              {model.intro} I already have your repo graph and last session logs loaded from{' '}
              <span className="font-semibold text-neutral-900">{prev.name}</span>.
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              In context
            </p>
            <div className="flex flex-wrap gap-2">
              {CONTEXT_FILES.map((file) => (
                <span
                  key={file}
                  className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 font-mono text-[12px] text-neutral-600"
                >
                  <Check className="h-3 w-3 text-emerald-500" />
                  {file}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-[13px] text-neutral-400">
            <span className="flex-1">Ask {model.name} anything…</span>
            <span className="rounded-md bg-neutral-900 px-2.5 py-1 text-[12px] font-medium text-white">Send</span>
          </div>
        </div>
      </div>
    </div>
  )
}
