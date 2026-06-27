import React from 'react'
import { ArrowLeft, ExternalLink, Shield } from 'lucide-react'
import { AuroraBackground } from '../ui/aurora-background'
import { Button } from '../ui/button'
import { PrismBrand } from './PrismBrand'
import { GITHUB_REPO_URL } from '../../lib/app-shell'

interface PrivacyPolicyPageProps {
  onBack: () => void
}

const LAST_UPDATED = 'June 27, 2026'

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  return (
    <AuroraBackground>
      <header className="sticky top-0 z-50 border-b border-neutral-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <PrismBrand size="nav" />
          <Button variant="ghost" onClick={onBack} className="gap-2 text-[14px]">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12 pb-20">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white/80">
            <Shield className="h-5 w-5 text-neutral-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Privacy Policy</h1>
            <p className="text-[14px] text-neutral-500">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed text-neutral-700">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">Overview</h2>
            <p>
              PRISM is an open-source desktop shell and web workspace backed by a cloud-hosted intelligence engine.
              This policy describes what data the PRISM project and its services collect, how it is used, and your
              choices. By using the PRISM website, desktop app, or cloud engine, you agree to this policy.
            </p>
          </section>

          <section className="rounded-xl border border-violet-200 bg-violet-50/60 p-5">
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">Our bigger mission (full transparency)</h2>
            <p>
              We want to be completely upfront about why PRISM exists. Beyond being a great coding tool, PRISM is
              building a <strong>world model for AI agents</strong> — a high-fidelity map of how autonomous agents
              take actions in real software environments and how those environments react. Today&apos;s frontier AI
              labs struggle to train agents that can reliably operate computers, because running trial-and-error in
              real systems is slow, expensive, and risky. By learning from the causal loop of{' '}
              <em>state → action → resulting state</em> across many real sessions, we aim to build the training
              ground and action models that power the next generation of autonomous coding, DevOps, and security
              agents.
            </p>
            <p className="mt-3">
              This is why we offer the optional <strong>PRISM Intelligence Engine</strong> below. It is the engine of
              that mission — and it is built so that contributing <strong>never requires sharing your source code</strong>.
              It is off by default and entirely your choice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">What we collect</h2>

            <h3 className="mb-2 font-semibold text-neutral-800">1. Data you choose to send</h3>
            <ul className="mb-4 list-disc space-y-2 pl-5">
              <li>
                <strong>Project files:</strong> When you connect a repository (especially via the desktop app), file
                paths and contents you select may be uploaded to the cloud engine for indexing and AI context.
              </li>
              <li>
                <strong>Prompts and chat:</strong> Messages you send in the workspace are transmitted to the cloud engine
                and may be forwarded to third-party AI providers (OpenAI, Anthropic, Google, etc.) using API keys you or
                the operator configure.
              </li>
              <li>
                <strong>Repository metadata:</strong> The engine stores derived project intelligence (structure,
                relationships, session history, vision documents) to provide persistent context across sessions.
              </li>
            </ul>

            <h3 className="mb-2 font-semibold text-neutral-800">2. Data stored locally in your browser or app</h3>
            <ul className="mb-4 list-disc space-y-2 pl-5">
              <li>
                UI preferences (theme, chat tabs, selected agents) in <code className="rounded bg-neutral-100 px-1">localStorage</code>{' '}
                on your device. This stays in your browser unless cleared by you.
              </li>
              <li>
                Desktop install metadata (install path) written locally by the npm install script.
              </li>
            </ul>

            <h3 className="mb-2 font-semibold text-neutral-800">3. Hosting and infrastructure logs</h3>
            <ul className="mb-4 list-disc space-y-2 pl-5">
              <li>
                <strong>Vercel</strong> (website hosting) and <strong>Hugging Face</strong> (cloud engine hosting) may
                collect standard server logs such as IP address, request timestamps, and user-agent strings as part of
                operating their platforms.
              </li>
              <li>
                <strong>GitHub</strong> and <strong>npm</strong> process downloads when you install the desktop app via{' '}
                <code className="rounded bg-neutral-100 px-1">npx github:ProfessionalQwerty/ProjectPrism</code>.
              </li>
            </ul>

            <h3 className="mb-2 font-semibold text-neutral-800">4. Third-party services loaded by the website</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Google Fonts</strong> — the marketing site loads fonts from Google&apos;s CDN. Google may receive
                your IP address when fonts are fetched. See{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-900 underline underline-offset-2"
                >
                  Google&apos;s Privacy Policy
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">What we do not collect (in the open-source client)</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>No third-party analytics SDKs (no Google Analytics, Mixpanel, PostHog, etc.) in the open-source app shell.</li>
              <li>No advertising trackers or sale of personal data.</li>
              <li>API keys you enter are sent to the cloud engine for AI requests — they are not embedded in the open-source client source code.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">How we use data</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide repository intelligence, multi-model chat, and project memory features.</li>
              <li>Operate, secure, and debug the cloud engine (error logs, rate limiting).</li>
              <li>Improve reliability of the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">Data retention</h2>
            <p>
              Project data on the cloud engine persists in the operator&apos;s Hugging Face Space storage until deleted
              or the Space is reset. Browser localStorage persists until you clear site data. You can disconnect
              projects and stop using the service at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">Code signing (SignPath Foundation)</h2>
            <p>
              Windows desktop installers may be code-signed through the{' '}
              <a
                href="https://signpath.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-neutral-900 underline underline-offset-2"
              >
                SignPath Foundation
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              , a free program for open-source projects. SignPath verifies that installers are built from our public
              GitHub repository and signs the binary. SignPath does not receive your project files, prompts, or personal
              usage data — only the installer artifact submitted during the release build.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">PRISM Intelligence Engine (opt-in, off by default)</h2>
            <p>
              With your explicit consent via &quot;Join the PRISM Intelligence Engine&quot; in settings, PRISM
              contributes <strong>abstracted</strong> action → state records to the world-model dataset described
              above. Every record is built and scrubbed <strong>on your device</strong> before anything is sent. We
              do not collect, view, or store your raw source code, file contents, prompts, model responses, file
              names, or personally identifiable information.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                <h3 className="mb-2 font-semibold text-emerald-800">What we collect</h3>
                <ul className="list-disc space-y-1.5 pl-4 text-[14px] text-neutral-700">
                  <li>Which tool or command ran (e.g. &quot;search&quot;, &quot;shell&quot;) and the <em>shape</em> of its inputs — types and sizes, never values</li>
                  <li>Outcome (success / error / partial) and a coarse error category (e.g. &quot;type_error&quot;)</li>
                  <li>Structural deltas: count of files changed, lines added/removed, code-structure counts</li>
                  <li>Terminal exit codes and failure → recovery sequences</li>
                </ul>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50/60 p-4">
                <h3 className="mb-2 font-semibold text-red-800">What never leaves your device</h3>
                <ul className="list-disc space-y-1.5 pl-4 text-[14px] text-neutral-700">
                  <li>Your source code or file contents</li>
                  <li>Your prompts or the model&apos;s responses</li>
                  <li>File names, paths, or repository identity</li>
                  <li>API keys, secrets, or personal information (scrubbed on-device first)</li>
                </ul>
              </div>
            </div>

            <p className="mt-4">
              If you opt out, compute usage is rate-limited to 600,000 tokens per 5-hour window (with a soft prompt at
              100,000 tokens per hour). Opting in removes this cap. You can withdraw consent at any time in
              Connections; collection stops immediately.
            </p>

            <h3 className="mb-2 mt-4 font-semibold text-neutral-800">Sample record (exactly what is sent)</h3>
            <pre className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-[12px] text-neutral-700">
{`{
  "schemaVersion": 1,
  "session_hash": "s_1a2b3c",
  "stateBefore": { "lastExitCode": 1 },
  "action": {
    "kind": "tool_call",
    "name": "search_code",
    "argShape": { "query": "string(42)" }
  },
  "transition": {
    "outcome": "success",
    "filesTouched": 2,
    "errorClass": null
  },
  "recoveryOf": "prior-failed-record-id"
}`}
            </pre>
            <p className="mt-2 text-[14px] text-neutral-600">
              No file contents, paths, prompts, API keys, or user identifiers are included — only abstracted,
              scrubbed structure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">Your rights (GDPR &amp; CCPA)</h2>
            <p>
              Wherever you live, we aim to honor the rights granted under the EU/UK GDPR and the California CCPA/CPRA:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><strong>Access &amp; portability:</strong> request a copy of the data associated with your account.</li>
              <li><strong>Deletion (&quot;right to be forgotten&quot;):</strong> request deletion of your contributed records. Intelligence-Engine records are linked to your account id so they can be located and removed.</li>
              <li><strong>Withdraw consent:</strong> toggle off &quot;Join the PRISM Intelligence Engine&quot; anytime; future collection stops immediately.</li>
              <li><strong>Object / restrict:</strong> object to processing or ask us to restrict it.</li>
              <li><strong>No sale of personal data:</strong> we do not sell personal information. The world-model dataset is abstracted and non-identifying by construction.</li>
              <li><strong>Legal basis:</strong> for the optional Intelligence Engine we rely on your explicit consent; for operating the service we rely on legitimate interest and contract.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these, open an issue or contact us via the channel below. We will respond within the
              timeframes required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">Your choices</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Do not connect repositories if you do not want files uploaded to the cloud engine.</li>
              <li>Use the browser workspace for preview only; run sensitive work only through a self-hosted engine if required.</li>
              <li>Clear browser localStorage via your browser settings.</li>
              <li>Review third-party AI provider policies before sending prompts containing sensitive information.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">Children</h2>
            <p>PRISM is not directed at children under 13. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">Changes</h2>
            <p>
              We may update this policy. Material changes will be reflected by updating the date above. Continued use
              after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">Contact</h2>
            <p>
              Questions about privacy: open an issue on{' '}
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-900 underline underline-offset-2"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </AuroraBackground>
  )
}
