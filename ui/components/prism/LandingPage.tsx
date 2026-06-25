import React, { useCallback, useState } from 'react'
import {
  ArrowRight,
  Brain,
  Code2,
  FileLock2,
  GitBranch,
  History,
  Layers,
  Play,
  Repeat,
  Rocket,
  ScrollText,
  Terminal,
  Globe,
  Zap,
} from 'lucide-react'
import { GitHubIcon } from '../ui/GitHubIcon'
import { AuroraBackground } from '../ui/aurora-background'
import { ButtonColorful } from '../ui/button-colorful'
import { Button } from '../ui/button'
import { InstallCTA } from './InstallCTA'
import { HeroPreview } from './HeroPreview'
import { MemoryGraphShowcase } from './MemoryGraphShowcase'
import { ModelLogo } from '../ui/ModelLogo'
import { PrismBrand } from './PrismBrand'
import { GITHUB_REPO_URL } from '../../lib/app-shell'
import { getNpmInstallLabel, copyNpmInstallCommand } from '../../lib/downloads'
import { cn } from '../../lib/utils'

const GITHUB_APP_URL = GITHUB_REPO_URL

const MODEL_PROVIDERS = ['openai', 'claude-code', 'gemini-cli', 'local-model'] as const

const PILLARS = [
  {
    icon: Brain,
    title: 'Persistent memory',
    body: 'Your repo context survives every model switch and session.',
  },
  {
    icon: Repeat,
    title: 'Any model',
    body: 'Claude, GPT, Gemini, or local — all in one workspace.',
  },
  {
    icon: Zap,
    title: 'Warm starts',
    body: 'New chats inherit context. Stop re-explaining your codebase.',
  },
]

const POSITIONING = [
  {
    icon: Layers,
    title: 'Model-agnostic by design',
    body:
      'PRISM is not a model provider — it is the environment models run inside. Connect Claude, ChatGPT, Gemini, and local models with standard OAuth web logins (your existing Plus/Pro subscriptions), not raw API keys or a separate PRISM AI bill.',
  },
  {
    icon: ScrollText,
    title: 'Your architectural log — not theirs',
    body:
      'After six months in PRISM, every decision, build, failure, fix, and architectural choice lives in your project graph and execution ledger — not in Claude’s memory or GPT’s context window. Each agent run is documented: what changed, why, and which files were touched.',
  },
]

const CAPABILITIES = [
  { icon: Brain, label: 'Cross-session memory' },
  { icon: GitBranch, label: 'Multi-agent pipelines' },
  { icon: Rocket, label: 'One-click deploy' },
  { icon: FileLock2, label: 'File-lock safety' },
  { icon: Zap, label: '30–50% fewer tokens' },
  { icon: History, label: 'Per-model history' },
  { icon: Terminal, label: '/catchup sync' },
  { icon: Globe, label: 'Local preview' },
]

function ModelPills({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {MODEL_PROVIDERS.map((m) => (
        <div
          key={m}
          className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 text-[13px] text-neutral-700 shadow-sm"
        >
          <ModelLogo provider={m} size={16} />
          <span className="capitalize">{m.split('-')[0]}</span>
        </div>
      ))}
    </div>
  )
}

interface LandingPageProps {
  onOpenDemo: () => void
  onFeaturesDetail: () => void
  onPrivacy: () => void
}

function useInstallCopy() {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    const ok = await copyNpmInstallCommand()
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }, [])
  return { copied, copy }
}

export function LandingPage({ onOpenDemo, onFeaturesDetail, onPrivacy }: LandingPageProps) {
  const { copied, copy } = useInstallCopy()
  const npmLabel = copied ? 'Copied!' : getNpmInstallLabel()

  return (
    <AuroraBackground>
      <nav className="sticky top-0 z-50 border-b border-neutral-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <PrismBrand size="nav" />
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={GITHUB_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-[14px] text-neutral-600 hover:text-neutral-900 sm:flex"
            >
              <Code2 className="h-4 w-4" />
              Open source
            </a>
            <Button variant="landingGhost" onClick={onOpenDemo} className="gap-1.5 text-[14px] font-medium">
              <Play className="h-4 w-4" />
              Demo
            </Button>
            <ButtonColorful label={npmLabel} onClick={() => void copy()} />
          </div>
        </div>
      </nav>

      {/* HERO — split layout, product visual on the right */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-2 lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="text-center lg:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-violet-600 md:tracking-[0.34em]">
            Agentic Development Environment
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
            Switch AI models.
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
              Keep your context.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-neutral-600 lg:mx-0">
            PRISM is the agentic development environment models run inside — model-agnostic, with a
            persistent architectural memory that belongs to your project, not to any single AI provider.
          </p>

          <div className="mt-8">
            <InstallCTA layout="compact" centered={false} compactNotes copied={copied} onCopy={() => void copy()} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <span className="text-[13px] font-medium text-neutral-500">Works with</span>
            <ModelPills />
          </div>
        </div>

        <div className="lg:pl-4">
          <HeroPreview />
        </div>
      </section>

      {/* PILLARS — the whole pitch in three glances */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-neutral-200/80 bg-white/70 p-6 backdrop-blur-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10">
                <p.icon className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="mt-4 text-[17px] font-semibold text-neutral-900">{p.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-600">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POSITIONING — model agnostic + architectural memory */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="mb-8 text-center lg:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-violet-600">Why PRISM</p>
          <h2 className="mt-3 text-2xl font-semibold text-neutral-900 sm:text-3xl">
            The environment — not another model
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600 lg:mx-0">
            You are not competing with OpenAI, Anthropic, or Google. PRISM is where all of them work on
            the same codebase, with the same history, under your control.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {POSITIONING.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-neutral-200/80 bg-white/80 p-7 backdrop-blur-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10">
                <item.icon className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="mt-4 text-[18px] font-semibold text-neutral-900">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] leading-relaxed text-neutral-500 lg:text-left">
          Every agent session writes to the execution ledger and datalog — summaries, file changes, and
          reasoning — so the next model (or the same one weeks later) picks up a well-maintained record
          of how your software was actually built.
        </p>
      </section>

      {/* VISUAL PROOF — compact memory graph */}
      <MemoryGraphShowcase variant="compact" />

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/80 to-white p-8 backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-violet-600">Build → ship</p>
              <h2 className="mt-3 text-2xl font-semibold text-neutral-900 sm:text-3xl">
                Idea to live URL without leaving PRISM
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                Connect GitHub and Vercel once. Preview locally inside the app. Hit Deploy — PRISM commits,
                pushes, and shows you the live link when Vercel finishes. No terminal. No git commands. If
                something breaks, your agents already have the project context to fix it.
              </p>
            </div>
            <ol className="space-y-3 text-[14px] text-neutral-700">
              {[
                'Connect GitHub + Vercel in the Connections tab',
                'Build and preview locally in PRISM',
                'Deploy — PRISM pushes and returns your live URL',
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-3 rounded-xl border border-violet-100 bg-white/80 px-4 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[12px] font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CAPABILITY CHIPS — scannable, no paragraphs */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border border-neutral-200/80 bg-white/60 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-neutral-900 sm:text-2xl">Everything under the hood</h2>
            <button
              type="button"
              onClick={onFeaturesDetail}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-violet-600 hover:text-violet-700"
            >
              Explore all features
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-[14px] font-medium text-neutral-700"
              >
                <c.icon className="h-4 w-4 shrink-0 text-violet-500" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-white to-violet-50/60 p-8 shadow-sm backdrop-blur-sm sm:p-12">
          <div className="mb-6 flex flex-col gap-3 text-center sm:text-left md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">Start building with PRISM</h2>
              <p className="mt-2 text-[15px] text-neutral-600">
                Free, open-source shell. Install in seconds — Windows, macOS, or Linux.
              </p>
            </div>
            <div className="flex shrink-0 justify-center gap-2 sm:justify-start">
              <Button variant="landingOutline" size="default" onClick={onOpenDemo} className="gap-2 font-medium">
                <Play className="h-4 w-4" />
                Watch demo
              </Button>
              <Button variant="landingOutline" size="default" className="gap-2 font-medium" asChild>
                <a href={GITHUB_APP_URL} target="_blank" rel="noopener noreferrer">
                  <GitHubIcon className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
          <InstallCTA layout="wide" centered={false} showAllPlatforms copied={copied} onCopy={() => void copy()} />
        </div>
      </section>

      <footer className="border-t border-neutral-200/80 py-8">
        <div className="mx-auto max-w-6xl px-6 text-[14px] text-neutral-500">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 opacity-80">
              <PrismBrand size="footer" showText={false} />
              <span>© 2026 PRISM</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href={GITHUB_APP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-800">
                GitHub
              </a>
              <button type="button" onClick={() => void copy()} className="hover:text-neutral-800">
                Install
              </button>
              <button type="button" onClick={onOpenDemo} className="hover:text-neutral-800">
                Demo
              </button>
              <button type="button" onClick={onFeaturesDetail} className="hover:text-neutral-800">
                Features
              </button>
              <button type="button" onClick={onPrivacy} className="hover:text-neutral-800">
                Privacy
              </button>
            </div>
          </div>
          <p className="mt-4 text-center text-[12px] text-neutral-400">
            Windows installers code-signed via the{' '}
            <a
              href="https://signpath.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-neutral-600"
            >
              SignPath Foundation
            </a>{' '}
            (open-source program)
          </p>
        </div>
      </footer>
    </AuroraBackground>
  )
}
