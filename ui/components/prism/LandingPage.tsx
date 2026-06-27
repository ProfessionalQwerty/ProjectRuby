import React, { useCallback, useState } from 'react'
import {
  ArrowRight,
  Brain,
  Check,
  Code2,
  FileLock2,
  History,
  Play,
  Repeat,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Globe,
  X,
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

// Plain-language outcomes — what you actually get, no jargon.
const OUTCOMES = [
  {
    icon: Brain,
    title: 'Never re-explain your project',
    body: 'PRISM remembers your whole codebase, every decision, and every past chat — so you can pick up exactly where you left off, even weeks later.',
  },
  {
    icon: Repeat,
    title: 'Use any AI, all in one place',
    body: 'Claude, ChatGPT, Gemini, or a local model. Switch anytime without losing your context — and use the subscriptions you already pay for.',
  },
  {
    icon: Rocket,
    title: 'Ship without the scary parts',
    body: 'Go from an idea to a live website without touching a terminal or typing a single git command.',
  },
]

// PRISM vs typical AI coding tools — concrete, scannable, not wordy.
const COMPARISON = [
  { label: 'Remembers your whole project, long-term', prism: true, others: false, othersNote: 'Forgets between chats' },
  { label: 'Works with every major AI model', prism: true, others: false, othersNote: 'Locked to one' },
  { label: 'Your history stays yours', prism: true, others: false, othersNote: 'Lives in the AI’s memory' },
  { label: 'Go live with one click', prism: true, others: false, othersNote: 'You wire it up yourself' },
  { label: 'Open source & transparent', prism: true, others: false, othersNote: 'Closed box' },
]

const CAPABILITIES = [
  { icon: Brain, label: 'Remembers everything' },
  { icon: Repeat, label: 'Any AI model' },
  { icon: Rocket, label: 'One-click deploy' },
  { icon: FileLock2, label: 'Safe parallel edits' },
  { icon: Zap, label: 'Lower AI costs' },
  { icon: History, label: 'History per model' },
  { icon: Terminal, label: 'Instant catch-up' },
  { icon: Globe, label: 'Live preview' },
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
  onIntegrations: () => void
  onTechnologies: () => void
  onPricing: () => void
  onTerms?: () => void
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

export function LandingPage({
  onOpenDemo,
  onFeaturesDetail,
  onPrivacy,
  onIntegrations,
  onTechnologies,
  onPricing,
  onTerms,
}: LandingPageProps) {
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

      {/* HERO — one plain promise + immediate payoff */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-2 lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="text-center lg:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-violet-600 md:tracking-[0.34em]">
            The home for your AI coding
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
            The AI workspace that
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
              never forgets your project.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-neutral-600 lg:mx-0">
            Build software with any AI — Claude, ChatGPT, Gemini — in one place that remembers your
            whole project. No more re-explaining your code every time. No more starting over when you
            switch tools.
          </p>

          <div className="mt-8">
            <p className="mb-3 text-[13px] leading-relaxed text-neutral-600">
              <strong>Windows:</strong> press Win+R, type <code className="rounded bg-neutral-100 px-1 font-mono text-[12px]">cmd</code>, press Enter, then paste the command below.
            </p>
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

      {/* OUTCOMES — the whole pitch in three plain glances */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Why people love PRISM</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
            Three things that change how it feels to build software with AI.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {OUTCOMES.map((p) => (
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

      {/* COMPARISON — PRISM vs typical AI coding tools */}
      <section className="mx-auto max-w-4xl px-6 pb-14">
        <div className="mb-7 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-violet-600">The difference</p>
          <h2 className="mt-3 text-2xl font-semibold text-neutral-900 sm:text-3xl">
            PRISM vs. the rest
          </h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 backdrop-blur-sm">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-neutral-200 bg-neutral-50/80 px-4 py-3 sm:px-6">
            <span className="text-[13px] font-semibold text-neutral-500">What matters</span>
            <span className="w-20 text-center text-[13px] font-bold text-violet-700 sm:w-28">PRISM</span>
            <span className="w-20 text-center text-[13px] font-medium text-neutral-400 sm:w-28">Other tools</span>
          </div>
          {COMPARISON.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-neutral-100 px-4 py-3.5 last:border-b-0 sm:px-6"
            >
              <span className="text-[14px] font-medium text-neutral-800">{row.label}</span>
              <span className="flex w-20 justify-center sm:w-28">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-4 w-4" />
                </span>
              </span>
              <span className="flex w-20 flex-col items-center gap-0.5 sm:w-28">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                  <X className="h-4 w-4" />
                </span>
                <span className="hidden text-center text-[10px] leading-tight text-neutral-400 sm:block">
                  {row.othersNote}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* VISION / TRUST — full transparency turned into a credibility asset */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/40 p-8 backdrop-blur-sm sm:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10">
                <Sparkles className="h-5 w-5 text-violet-600" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-violet-600">The bigger picture</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">
                We’re building the brain for the next generation of AI agents
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                Every time an AI takes an action and the project reacts, that’s a lesson in how software
                really gets built. With your permission, PRISM learns from those lessons to train smarter,
                more reliable AI agents for everyone — and we’re completely open about it.
              </p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-white/90 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-[16px] font-semibold text-neutral-900">Your code stays yours</h3>
              </div>
              <ul className="space-y-2.5 text-[14px] leading-relaxed text-neutral-600">
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Off by default — nothing is shared unless you opt in.</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Your source code, files, and prompts never leave your device.</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Only anonymized, structural signals — and you can turn it off anytime.</li>
              </ul>
              <button
                type="button"
                onClick={onPrivacy}
                className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-violet-600 hover:text-violet-700"
              >
                Read exactly what we collect
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
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
                Connect your accounts once. Preview your app right inside PRISM. Hit Deploy and PRISM
                publishes it and hands you the live link — no terminal, no commands. If something breaks,
                your AI already knows your project well enough to fix it.
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
            <h2 className="text-xl font-semibold text-neutral-900 sm:text-2xl">Everything you get</h2>
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
          <p className="mt-4 text-center text-[12px] text-neutral-500 sm:text-left">
            Smart context handling keeps your AI fast and your costs low — automatically.
          </p>
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
              <button type="button" onClick={onIntegrations} className="hover:text-neutral-800">
                Integrations
              </button>
              <button type="button" onClick={onTechnologies} className="hover:text-neutral-800">
                Technologies
              </button>
              <button type="button" onClick={onPricing} className="hover:text-neutral-800">
                Pricing
              </button>
              <button type="button" onClick={onPrivacy} className="hover:text-neutral-800">
                Privacy
              </button>
              {onTerms && (
                <button type="button" onClick={onTerms} className="hover:text-neutral-800">
                  Terms
                </button>
              )}
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
