import React, { useCallback, useEffect, useState } from 'react'
import { LandingPage } from './components/prism/LandingPage'
import { FeaturesDetailPage } from './components/prism/FeaturesDetailPage'
import { PrismDemoPage } from './components/prism/PrismDemoPage'
import { PrivacyPolicyPage } from './components/prism/PrivacyPolicyPage'
import { TermsPage } from './components/prism/TermsPage'
import { IntegrationsPage } from './components/prism/IntegrationsPage'
import { TechnologiesPage } from './components/prism/TechnologiesPage'
import { PricingPage } from './components/prism/PricingPage'
import { WorkspaceShell } from './components/prism/WorkspaceShell'
import { SignInGate } from './components/prism/SignInGate'
import { isDesktopApp } from './lib/desktop-bridge'
import { getGitHubUser, isGitHubSignedIn, type GitHubUser } from './lib/github-auth'
import {
  getCurrentUser,
  isSupabaseAuthConfigured,
  type PrismAuthUser,
} from './lib/supabase-auth'

export type PrismView = 'landing' | 'demo' | 'features' | 'privacy' | 'terms' | 'integrations' | 'technologies' | 'pricing' | 'workspace'

function viewFromHash(): PrismView {
  const hash = window.location.hash.replace('#', '')
  if (hash === 'privacy') return 'privacy'
  if (hash === 'terms') return 'terms'
  if (hash === 'integrations') return 'integrations'
  if (hash === 'technologies') return 'technologies'
  if (hash === 'pricing') return 'pricing'
  if (hash === 'demo') return 'demo'
  if (hash === 'features') return 'features'
  if (hash === 'workspace') return 'workspace'
  if (hash === 'landing') return 'landing'
  if (hash === 'onboarding') return 'landing'
  return isDesktopApp() ? 'workspace' : 'landing'
}

function navigate(view: PrismView) {
  window.location.hash = view
}

const App: React.FC = () => {
  const [view, setView] = useState<PrismView>(viewFromHash)
  const [githubUser, setGithubUser] = useState<GitHubUser | PrismAuthUser | null>(() => {
    if (isDesktopApp() && isSupabaseAuthConfigured()) {
      return null
    }
    return isDesktopApp() && isGitHubSignedIn() ? getGitHubUser() : null
  })

  useEffect(() => {
    if (!isDesktopApp() || !isSupabaseAuthConfigured()) return
    void getCurrentUser().then((u) => {
      if (u) setGithubUser(u)
    })
  }, [])

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (isDesktopApp() && view !== 'workspace') {
      navigate('workspace')
      setView('workspace')
    }
  }, [view])

  const goTo = useCallback((next: PrismView) => {
    navigate(next)
    setView(next)
  }, [])

  if (isDesktopApp() && !githubUser) {
    return <SignInGate onSignedIn={setGithubUser} />
  }

  switch (view) {
    case 'workspace':
      return <WorkspaceShell />
    case 'demo':
      return <PrismDemoPage onBack={() => goTo('landing')} />
    case 'features':
      return <FeaturesDetailPage onBack={() => goTo('landing')} />
    case 'privacy':
      return <PrivacyPolicyPage onBack={() => goTo('landing')} />
    case 'terms':
      return <TermsPage onBack={() => goTo('landing')} />
    case 'integrations':
      return <IntegrationsPage onBack={() => goTo('landing')} onTechnologies={() => goTo('technologies')} />
    case 'technologies':
      return (
        <TechnologiesPage
          onBack={() => goTo('landing')}
          onIntegrations={() => goTo('integrations')}
        />
      )
    case 'pricing':
      return <PricingPage onBack={() => goTo('landing')} />
    case 'landing':
    default:
      return (
        <LandingPage
          onOpenDemo={() => goTo('demo')}
          onFeaturesDetail={() => goTo('features')}
          onPrivacy={() => goTo('privacy')}
          onIntegrations={() => goTo('integrations')}
          onTechnologies={() => goTo('technologies')}
          onPricing={() => goTo('pricing')}
          onTerms={() => goTo('terms')}
        />
      )
  }
}

export default App
