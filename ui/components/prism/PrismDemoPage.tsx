import React, { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { AuroraBackground } from '../ui/aurora-background'
import { Button } from '../ui/button'
import { ModelLogo } from '../ui/ModelLogo'
import { PrismBrand } from './PrismBrand'

interface PrismDemoPageProps {
  onBack: () => void
}

const DEMO_MESSAGES = [
  { role: 'user' as const, text: 'Refactor auth middleware to use the new session store.' },
  {
    role: 'agent' as const,
    text: 'I found 3 related files from your ledger. Updating middleware.ts and syncing context for Claude…',
  },
  { role: 'user' as const, text: '/catchup — what changed since my last Gemini session?' },
  {
    role: 'agent' as const,
    text: 'Since your last run: 2 commits on main, vision.md updated, active task switched to API hardening.',
  },
]

export function PrismDemoPage({ onBack }: PrismDemoPageProps) {
  const [visibleMessages, setVisibleMessages] = useState(0)
  const [typing, setTyping] = useState(false)
  const [activeAgent, setActiveAgent] = useState(0)
  const agents = ['claude-code', 'openai', 'gemini-cli'] as const

  useEffect(() => {
    if (visibleMessages >= DEMO_MESSAGES.length) {
      const t = window.setTimeout(() => {
        setVisibleMessages(0)
        setActiveAgent((a) => (a + 1) % agents.length)
      }, 4000)
      return () => window.clearTimeout(t)
    }

    setTyping(true)
    const t = window.setTimeout(() => {
      setTyping(false)
      setVisibleMessages((n) => n + 1)
    }, visibleMessages % 2 === 0 ? 900 : 1800)
    return () => window.clearTimeout(t)
  }, [visibleMessages, agents.length])

  return (
    <AuroraBackground>
      <header className="sticky top-0 z-50 border-b border-neutral-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <PrismBrand size="nav" />
          <Button variant="landingGhost" onClick={onBack} className="gap-2 text-[14px] font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Live preview</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          Inside PRISM
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] text-neutral-600">
          A non-interactive sample of the desktop workspace — multi-model tabs, project memory, and persistent chat.
        </p>
      </section>

      <div className="mx-auto mb-16 max-w-5xl px-6">
        <div
          className="pointer-events-none select-none overflow-hidden rounded-2xl border border-neutral-300/80 bg-[#ececec] shadow-2xl dark:border-neutral-700 dark:bg-neutral-950"
          aria-hidden
        >
          {/* Title bar mock */}
          <div className="flex items-center gap-2 border-b border-neutral-300/80 bg-[#f3f3f3] px-4 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
            <img src="./prism-logo.png" alt="" className="h-6 w-6 object-contain" />
            <span className="text-[14px] font-semibold tracking-wide text-neutral-800 dark:text-neutral-200">PRISM</span>
            <div className="ml-4 flex gap-1">
              {agents.map((a, i) => (
                <div
                  key={a}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] transition-all duration-500 ${
                    i === activeAgent
                      ? 'bg-white shadow-sm dark:bg-neutral-800'
                      : 'opacity-50'
                  }`}
                >
                  <ModelLogo provider={a} size={14} />
                  <span className="capitalize">{a.split('-')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-[420px]">
            {/* Sidebar */}
            <div className="w-52 shrink-0 border-r border-neutral-300/80 bg-[#f8f8f8] p-3 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Project</p>
              <p className="mt-1 text-[13px] font-medium text-neutral-800 dark:text-neutral-200">prism-app</p>
              <ul className="mt-4 space-y-1.5 text-[12px] text-neutral-600 dark:text-neutral-400">
                {['ui/App.tsx', 'desktop/main.ts', 'VISION.md', 'api-config.ts'].map((f, i) => (
                  <li
                    key={f}
                    className="rounded px-2 py-1 transition-opacity duration-700"
                    style={{ opacity: i <= visibleMessages ? 1 : 0.3 }}
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Chat */}
            <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-neutral-950">
              <div className="flex-1 space-y-3 overflow-hidden p-4">
                {DEMO_MESSAGES.slice(0, visibleMessages).map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed transition-opacity duration-500 ${
                      m.role === 'user'
                        ? 'ml-auto bg-neutral-900 text-neutral-100'
                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {typing && (
                  <div className="flex max-w-[85%] items-center gap-1 rounded-xl bg-neutral-100 px-3 py-3 dark:bg-neutral-800">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
                  </div>
                )}
              </div>
              <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[13px] text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900">
                  Ask PRISM anything about your codebase…
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="hidden w-44 shrink-0 border-l border-neutral-300/80 bg-[#f8f8f8] p-3 md:block dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Ledger</p>
              <div className="mt-3 space-y-2">
                {['Context compiled', 'Task routed', 'Memory saved'].map((e, i) => (
                  <div
                    key={e}
                    className="rounded border border-neutral-200 bg-white px-2 py-1.5 text-[11px] text-neutral-600 transition-opacity duration-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    style={{ opacity: visibleMessages > i ? 1 : 0.25 }}
                  >
                    {e}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  )
}
