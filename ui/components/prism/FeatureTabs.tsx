import * as Tabs from '@radix-ui/react-tabs'
import { GitBranch, Layers, Workflow } from 'lucide-react'
import React from 'react'
import { Badge } from '../ui/badge'
import { ButtonColorful } from '../ui/button-colorful'
import { ModelLogo } from '../ui/ModelLogo'

import { getNpmInstallLabel } from '../../lib/downloads'

interface FeatureTabsProps {
  onFeaturesDetail: () => void
  onCopyInstall: () => void
  installCopied?: boolean
}

const tabs = [
  {
    value: 'context',
    icon: <Layers className="h-4 w-4 shrink-0" />,
    label: 'Context Layer',
    badge: 'Cross-Session Memory',
    title: 'Context that compounds over time.',
    description:
      'PRISM injects repository context before every model request and records outcomes in a persistent datalog — model-agnostic by design.',
    visual: 'context' as const,
  },
  {
    value: 'pipeline',
    icon: <GitBranch className="h-4 w-4 shrink-0" />,
    label: 'Pipelines',
    badge: 'Multi-Agent Orchestration',
    title: 'Coordinate agents without conflict.',
    description:
      'Route work across models with file locks and a full activity ledger. Every task completion is logged.',
    visual: 'pipeline' as const,
  },
  {
    value: 'proxy',
    icon: <Workflow className="h-4 w-4 shrink-0" />,
    label: 'Desktop Workspace',
    badge: 'Native App',
    title: 'One workspace. Every model.',
    description:
      'Session history per model, datalog across the project, and /catchup to sync any model with changes since its last run.',
    visual: 'proxy' as const,
  },
]

export function FeatureTabs({ onFeaturesDetail, onCopyInstall, installCopied }: FeatureTabsProps) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge variant="outline" className="border-neutral-300 bg-white/80 text-neutral-600">
            Agentic Development Environment
          </Badge>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            The first ADE built for production engineering
          </h2>
        </div>

        <Tabs.Root defaultValue={tabs[0].value} className="mt-10">
          <Tabs.List className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            {tabs.map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-neutral-500 transition-all data-[state=active]:border-neutral-200 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm"
              >
                {tab.icon}
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/60 p-6 backdrop-blur-md lg:p-12">
            {tabs.map((tab) => (
              <Tabs.Content
                key={tab.value}
                value={tab.value}
                className="grid place-items-center gap-12 lg:grid-cols-2 lg:gap-10"
              >
                <div className="flex flex-col gap-4">
                  <Badge variant="outline" className="w-fit border-neutral-300">
                    {tab.badge}
                  </Badge>
                  <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 lg:text-4xl">
                    {tab.title}
                  </h3>
                  <p className="leading-relaxed text-neutral-600 lg:text-base">{tab.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <ButtonColorful
                      label={installCopied ? 'Copied!' : getNpmInstallLabel()}
                      onClick={onCopyInstall}
                    />
                    <button
                      type="button"
                      onClick={onFeaturesDetail}
                      className="rounded-md border border-neutral-400 bg-white px-4 py-2 text-[14px] font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
                    >
                      Learn more
                    </button>
                  </div>
                </div>
                <div className="w-full">
                  {tab.visual === 'context' && <ContextVisual />}
                  {tab.visual === 'pipeline' && <PipelineVisual />}
                  {tab.visual === 'proxy' && <ProxyVisual />}
                </div>
              </Tabs.Content>
            ))}
          </div>
        </Tabs.Root>
      </div>
    </section>
  )
}

function ContextVisual() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 font-mono text-[13px]">
      <div className="text-neutral-400">// Injected before every request</div>
      <div className="mt-2 text-violet-600">vision.md</div>
      <div className="text-sky-600">active_task.json</div>
      <div className="text-emerald-600">ledger_continuity</div>
    </div>
  )
}

function PipelineVisual() {
  return (
    <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
      {['index', 'compile', 'route'].map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[12px] font-medium shadow-sm">
            {i + 1}
          </span>
          <span className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 font-mono text-[13px]">
            {step}
          </span>
        </div>
      ))}
    </div>
  )
}

function ProxyVisual() {
  const models = ['openai', 'claude-code', 'gemini-cli', 'local-model']
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
      {models.map((m) => (
        <div key={m} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 shadow-sm">
          <ModelLogo provider={m} size={20} />
          <span className="text-[13px] font-medium capitalize text-neutral-700">{m.split('-')[0]}</span>
        </div>
      ))}
    </div>
  )
}
