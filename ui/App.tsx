import React, { useCallback, useEffect, useState } from 'react'
import { LandingPage } from './components/prism/LandingPage'
import { FeaturesDetailPage } from './components/prism/FeaturesDetailPage'
import { PrismDemoPage } from './components/prism/PrismDemoPage'
import { PrivacyPolicyPage } from './components/prism/PrivacyPolicyPage'
import { WorkspaceShell } from './components/prism/WorkspaceShell'
import { SignInGate } from './components/prism/SignInGate'
import { isDesktopApp } from './lib/desktop-bridge'
import { getGitHubUser, isGitHubSignedIn, type GitHubUser } from './lib/github-auth'

export type PrismView = 'landing' | 'demo' | 'features' | 'privacy' | 'workspace'

function viewFromHash(): PrismView {
  const hash = window.location.hash.replace('#', '')
  if (hash === 'privacy') return 'privacy'
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
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(() =>
    isDesktopApp() && isGitHubSignedIn() ? getGitHubUser() : null
  )

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
    case 'landing':
    default:
      return (
        <LandingPage
          onOpenDemo={() => goTo('demo')}
          onFeaturesDetail={() => goTo('features')}
          onPrivacy={() => goTo('privacy')}
        />
      )
  }
}

export default App
