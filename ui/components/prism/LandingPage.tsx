import React, { useCallback, useState } from 'react'
import { Check, Code2, Copy, ExternalLink, Terminal } from 'lucide-react'
import { AuroraBackground } from '../ui/aurora-background'
import { ButtonColorful } from '../ui/button-colorful'
import { Button } from '../ui/button'
import { BentoFeatures } from './BentoFeatures'
import { FeatureTabs } from './FeatureTabs'
import { ModelLogo } from '../ui/ModelLogo'
import { PrismBrand } from './PrismBrand'
import { GITHUB_REPO_URL } from '../../lib/app-shell'
import {
  NPM_INSTALL_COMMAND,
  copyNpmInstallCommand,
  getInstallHint,
  getNpmInstallLabel,
} from '../../lib/downloads'

const GITHUB_APP_URL = GITHUB_REPO_URL

interface LandingPageProps {
  onOpenWorkspace: () => void
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

function NpmInstallBlock({ className = '', onCopy, copied }: { className?: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onCopy}
        className="group flex w-full max-w-md items-center gap-3 rounded-xl border border-neutral-300 bg-neutral-900 px-4 py-3 text-left font-mono text-[14px] text-neutral-100 shadow-sm transition hover:border-neutral-400"
      >
        <span className="min-w-0 flex-1 truncate">{NPM_INSTALL_COMMAND}</span>
        {copied ? (
          <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
        ) : (
          <Copy className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-neutral-200" aria-hidden />
        )}
      </button>
      <p className="mt-3 max-w-md text-[13px] leading-relaxed text-neutral-500">{getInstallHint()}</p>
      {copied && (
        <p className="mt-2 max-w-md text-[13px] font-medium text-emerald-600">Copied — paste into Terminal or CMD.</p>
      )}
    </div>
  )
}

export function LandingPage({ onOpenWorkspace }: LandingPageProps) {
  const { copied, copy } = useInstallCopy()
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }
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
            <Button variant="ghost" onClick={onOpenWorkspace} className="text-[14px]">
              Workspace
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
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-neutral-900 md:text-6xl md:leading-[1.08]">
          Your codebase doesn&apos;t reset when your model does.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-neutral-600">
          PRISM is a native desktop workspace for multi-model development. The intelligence engine runs
          in the cloud — the app shell is open source on GitHub.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <NpmInstallBlock onCopy={() => void copy()} copied={copied} />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <ButtonColorful label={npmLabel} onClick={() => void copy()} />
            <Button variant="outline" size="lg" onClick={scrollToFeatures} className="border-neutral-300 text-[15px]">
              Explore features
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-lg flex-wrap items-center justify-center gap-3">
          {['openai', 'claude-code', 'gemini-cli', 'local-model'].map((m) => (
            <div
              key={m}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-[13px] text-neutral-700 shadow-sm"
            >
              <ModelLogo provider={m} size={18} />
              <span className="capitalize">{m.split('-')[0]}</span>
            </div>
          ))}
        </div>
      </section>

      <div id="features">
        <FeatureTabs onExplore={scrollToFeatures} onCopyInstall={() => void copy()} installCopied={copied} />
      </div>
      <BentoFeatures />

      <section className="border-t border-neutral-200/80 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200/80 bg-white/70 p-8 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
              <Terminal className="h-6 w-6 text-neutral-700" />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900">Desktop app</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
              Install the PRISM workspace on your machine. Connect repositories, add your own API keys,
              and run multi-model sessions with persistent project memory.
            </p>
            <NpmInstallBlock className="mt-6" onCopy={() => void copy()} copied={copied} />
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white/70 p-8 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
              <ExternalLink className="h-6 w-6 text-neutral-700" />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900">Open source shell</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
              The PRISM desktop UI is partially open source on GitHub — app shell and workspace
              components only. The intelligence engine (graph indexing, datalog, orchestration) is
              cloud-hosted.
            </p>
            <Button variant="outline" size="lg" className="mt-6 border-neutral-300" asChild>
              <a href={GITHUB_APP_URL} target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200/80 py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-3xl font-semibold text-neutral-900">Ready to build with PRISM?</h2>
          <p className="mt-4 text-[16px] text-neutral-600">
            Run the command below in Terminal or CMD — works on Windows, macOS, and Linux.
          </p>
          <NpmInstallBlock className="mx-auto mt-8" onCopy={() => void copy()} copied={copied} />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonColorful label={npmLabel} onClick={() => void copy()} />
            <Button variant="outline" size="lg" onClick={onOpenWorkspace}>
              Preview in browser
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-[14px] text-neutral-500 md:flex-row">
          <div className="flex items-center gap-2 opacity-80">
            <PrismBrand size="footer" showText={false} />
            <span>© 2026 PRISM</span>
          </div>
          <div className="flex gap-6">
            <a href={GITHUB_APP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-800">
              GitHub
            </a>
            <button type="button" onClick={() => void copy()} className="hover:text-neutral-800">
              Install
            </button>
            <button type="button" onClick={onOpenWorkspace} className="hover:text-neutral-800">
              Workspace
            </button>
          </div>
        </div>
      </footer>
    </AuroraBackground>
  )
}
