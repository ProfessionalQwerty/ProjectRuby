import React, { useCallback, useEffect, useState } from 'react'
import { LandingPage } from './components/prism/LandingPage'
import { WorkspaceShell } from './components/prism/WorkspaceShell'
import { isDesktopApp } from './lib/desktop-bridge'

export type PrismView = 'landing' | 'workspace'

function viewFromHash(): PrismView {
  const hash = window.location.hash.replace('#', '')
  if (hash === 'workspace' || hash === 'landing') return hash
  if (hash === 'onboarding') return 'landing'
  return isDesktopApp() ? 'workspace' : 'landing'
}

function navigate(view: PrismView) {
  window.location.hash = view
}

const App: React.FC = () => {
  const [view, setView] = useState<PrismView>(viewFromHash)

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (isDesktopApp() && view === 'landing') {
      navigate('workspace')
      setView('workspace')
    }
  }, [view])

  const goTo = useCallback((next: PrismView) => {
    navigate(next)
    setView(next)
  }, [])

  switch (view) {
    case 'workspace':
      return <WorkspaceShell />
    case 'landing':
    default:
      return <LandingPage onOpenWorkspace={() => goTo('workspace')} />
  }
}

export default App
