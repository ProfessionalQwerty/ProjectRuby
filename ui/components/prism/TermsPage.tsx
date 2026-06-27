import React from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import { AuroraBackground } from '../ui/aurora-background'
import { Button } from '../ui/button'
import { PrismBrand } from './PrismBrand'
import { GITHUB_REPO_URL } from '../../lib/app-shell'

interface TermsPageProps {
  onBack: () => void
}

const LAST_UPDATED = 'June 27, 2026'

export function TermsPage({ onBack }: TermsPageProps) {
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
            <FileText className="h-5 w-5 text-neutral-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Terms of Service</h1>
            <p className="text-[14px] text-neutral-500">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed text-neutral-700">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">1. Acceptance of terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of the PRISM website, desktop application, and
              cloud intelligence engine (collectively, the &quot;Service&quot;). By accessing or using the Service, you
              agree to be bound by these Terms and by our{' '}
              <a href="#privacy" className="text-neutral-900 underline underline-offset-2">Privacy Policy</a>. If you do
              not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">2. The Service</h2>
            <p>
              PRISM provides repository intelligence, multi-model AI chat, project memory, and deployment tooling.
              Portions of the client are open source under the license stated in the project repository. We may add,
              change, or remove features at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">3. Accounts &amp; eligibility</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>You must be at least 13 years old (or the age of digital consent in your jurisdiction) to use the Service.</li>
              <li>You are responsible for activity under your account and for keeping your credentials secure.</li>
              <li>You are responsible for any third-party API keys you configure and for complying with those providers&apos; terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">4. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Abuse, overload, or attempt to disrupt the Service, including circumventing rate limits or bot/automation protections.</li>
              <li>Reverse engineer or attack the cloud engine, or attempt to access data that is not yours.</li>
              <li>Use the Service to build or operate anything illegal, infringing, or harmful.</li>
              <li>Upload content you do not have the right to process.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">5. Your content &amp; ownership</h2>
            <p>
              You retain all rights to your source code and content. We do not claim ownership of your code, and your
              source code is processed solely to provide the Service to you. The optional{' '}
              <strong>PRISM Intelligence Engine</strong> only ever receives abstracted, non-identifying action → state
              records — never your source code — and only with your explicit opt-in, as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">6. PRISM Intelligence Engine</h2>
            <p>
              If you opt in, you grant us a worldwide, royalty-free license to use the abstracted, anonymized telemetry
              records you contribute to research, develop, train, and commercialize AI models and related products. This
              license applies only to the abstracted records — not to your source code, prompts, or outputs, which are
              never collected. You may withdraw consent at any time; withdrawal stops future collection but does not
              affect records already aggregated into trained models.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">7. Rate limits &amp; fair use</h2>
            <p>
              The Service enforces per-IP and per-account rate limits to protect availability. Without telemetry opt-in,
              compute is limited to 600,000 tokens per 5-hour window. We may throttle, suspend, or terminate accounts that
              abuse the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">8. Third-party services</h2>
            <p>
              The Service integrates with third parties such as AI model providers, GitHub, Vercel, and hosting platforms.
              Your use of those services is governed by their own terms and policies. We are not responsible for
              third-party services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">9. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS
              OR IMPLIED. AI OUTPUTS MAY BE INACCURATE — YOU ARE RESPONSIBLE FOR REVIEWING AND TESTING ANY CODE OR ACTIONS
              PRODUCED BY THE SERVICE BEFORE RELYING ON THEM.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">10. Limitation of liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRISM AND ITS CONTRIBUTORS WILL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR REVENUE ARISING FROM
              YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">11. Termination</h2>
            <p>
              You may stop using the Service at any time. We may suspend or terminate access if you violate these Terms or
              to protect the Service or other users.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">12. Changes</h2>
            <p>
              We may update these Terms. Material changes will be reflected by updating the date above. Continued use after
              changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-neutral-900">13. Contact</h2>
            <p>
              Questions about these Terms: open an issue on{' '}
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
