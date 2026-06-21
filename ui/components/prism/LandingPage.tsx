import React, { useCallback, useState } from 'react'
import { Code2, Play } from 'lucide-react'
import { GitHubIcon } from '../ui/GitHubIcon'
import { AuroraBackground } from '../ui/aurora-background'
import { ButtonColorful } from '../ui/button-colorful'
import { Button } from '../ui/button'
import { BentoFeatures } from './BentoFeatures'
import { FeatureTabs } from './FeatureTabs'
import { InstallCTA } from './InstallCTA'
import { MemoryGraphShowcase } from './MemoryGraphShowcase'
import { ModelLogo } from '../ui/ModelLogo'
import { PrismBrand } from './PrismBrand'
import { GITHUB_REPO_URL } from '../../lib/app-shell'
import { getNpmInstallLabel, copyNpmInstallCommand } from '../../lib/downloads'
import { cn } from '../../lib/utils'

const GITHUB_APP_URL = GITHUB_REPO_URL

const MODEL_PROVIDERS = ['openai', 'claude-code', 'gemini-cli', 'local-model'] as const

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
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[14px] text-neutral-600 hover:text-neutral-900"
            >
              <Code2 className="h-4 w-4" />
              Open Source App
            </a>
          <Button variant="landingGhost" onClick={onOpenDemo} className="gap-1.5 text-[14px] font-medium">
            <Play className="h-4 w-4" />
            See demo
          </Button>
            <ButtonColorful label={npmLabel} onClick={() => void copy()} />
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
        <div className="mx-auto mb-8 flex justify-center">
          <PrismBrand size="hero" showText={false} />
        </div>
        <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
          Agentic Development Environment
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-neutral-900 md:text-6xl md:leading-[1.08]">
          Your codebase doesn&apos;t reset when your model does.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-neutral-600">
          PRISM is a native desktop workspace for multi-model development. The intelligence engine runs
          in the cloud — the app shell is open source on GitHub.
        </p>

        <div className="mx-auto mt-10 w-full max-w-6xl rounded-2xl border border-neutral-200/80 bg-white/75 p-5 text-left shadow-sm backdrop-blur-sm sm:p-6 lg:p-8">
          <InstallCTA
            layout="wide"
            centered={false}
            copied={copied}
            onCopy={() => void copy()}
          />
          <div className="mt-5 flex flex-col gap-4 border-t border-neutral-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="landingOutline" size="lg" onClick={onOpenDemo} className="shrink-0 gap-2 font-medium">
              <Play className="h-4 w-4" />
              See PRISM in action
            </Button>
            <ModelPills className="sm:justify-end" />
          </div>
        </div>
      </section>

      <div id="features">
        <FeatureTabs
          onFeaturesDetail={onFeaturesDetail}
          onCopyInstall={() => void copy()}
          installCopied={copied}
        />
      </div>
      <MemoryGraphShowcase />
      <BentoFeatures />

      <section className="border-t border-neutral-200/80 py-24">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-6 lg:grid-cols-2 lg:gap-10">
          <div className="flex min-w-0 flex-col rounded-2xl border border-neutral-200/80 bg-white/70 p-6 backdrop-blur-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-neutral-900">Desktop app</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
              Install via npm or direct download for Windows, macOS, and Linux.
            </p>
            <InstallCTA
              className="mt-5 min-w-0"
              layout="compact"
              centered={false}
              showAllPlatforms
              copied={copied}
              onCopy={() => void copy()}
            />
          </div>

          <div className="flex min-w-0 flex-col rounded-2xl border border-neutral-200/80 bg-white/70 p-6 backdrop-blur-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-neutral-900">Open source shell</h2>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-neutral-600">
              The PRISM desktop UI is partially open source on GitHub — app shell and workspace
              components only. The intelligence engine is cloud-hosted.
            </p>
            <Button variant="landingOutline" size="lg" className="mt-6 w-fit gap-2 font-medium" asChild>
              <a href={GITHUB_APP_URL} target="_blank" rel="noopener noreferrer">
                <GitHubIcon className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200/80 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-neutral-200/80 bg-white/75 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Ready to build with PRISM?</h2>
              <Button variant="landingOutline" size="default" onClick={onOpenDemo} className="w-fit shrink-0 gap-2 font-medium">
                <Play className="h-4 w-4" />
                Watch the demo
              </Button>
            </div>
            <InstallCTA
              layout="wide"
              centered={false}
              showAllPlatforms
              copied={copied}
              onCopy={() => void copy()}
            />
          </div>
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
            <a href="https://signpath.org/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-neutral-600">
              SignPath Foundation
            </a>{' '}
            (open-source program)
          </p>
        </div>
      </footer>
    </AuroraBackground>
  )
}
