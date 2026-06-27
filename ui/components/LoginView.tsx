/**
 * Login View Component
 * Google OAuth login UI with email verification
 */

import React, { useState, useEffect } from 'react'

// ============================================================================
// Types
// ============================================================================

interface LoginViewProps {
  onLoginSuccess: (user: any, token: string) => void
  onError?: (error: string) => void
}

interface AuthState {
  isLoading: boolean
  error?: string
  isVerifying: boolean
  verificationSent: boolean
  verificationEmail?: string
}

// ============================================================================
// Login View Component
// ============================================================================

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onError }) => {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isVerifying: false,
    verificationSent: false,
  })

  const [verificationCode, setVerificationCode] = useState('')

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Check if we're in an OAuth callback
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    if (error) {
      setState((prev) => ({ ...prev, error: errorDescription || 'Authentication failed' }))
      onError?.(errorDescription || 'Authentication failed')
    }
  }, [])

  // ============================================================================
  // OAuth Flow
  // ============================================================================

  /**
   * Initiate login flow
   */
  const handleLoginClick = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const response = await fetch('http://localhost:19991/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = (await response.json()) as any

      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate login')
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed'
      setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }))
      onError?.(errorMsg)
    }
  }

  // ============================================================================
  // Email Verification
  // ============================================================================

  /**
   * Verify email with code
   */
  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      setState((prev) => ({ ...prev, error: 'Please enter verification code' }))
      return
    }

    setState((prev) => ({ ...prev, isVerifying: true, error: undefined }))

    try {
      const response = await fetch('http://localhost:19991/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationToken: verificationCode }),
      })

      const data = (await response.json()) as any

      if (!data.success) {
        throw new Error(data.error || 'Verification failed')
      }

      // Get updated user
      const userResponse = await fetch('http://localhost:19991/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      const userData = (await userResponse.json()) as any

      if (userData.success) {
        setState((prev) => ({ ...prev, isVerifying: false, verificationSent: false }))
        onLoginSuccess(userData.user, localStorage.getItem('auth_token') || '')

        // Clear URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Verification failed'
      setState((prev) => ({ ...prev, isVerifying: false, error: errorMsg }))
    }
  }

  const handleSkipVerification = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('auth_token') || ''
    setState((prev) => ({ ...prev, verificationSent: false }))
    onLoginSuccess(user, token)
  }

  // ============================================================================
  // Render
  // ============================================================================

  if (state.verificationSent) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logoContainer}>
            <div style={styles.logo}>🔐</div>
          </div>

          <h1 style={styles.title}>Verify Your Email</h1>

          <p style={styles.subtitle}>
            A verification code has been sent to <strong>{state.verificationEmail}</strong>
          </p>

          <div style={styles.formGroup}>
            <label style={styles.label}>Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              disabled={state.isVerifying}
              style={styles.input}
            />
          </div>

          {state.error && <div style={styles.error}>{state.error}</div>}

          <button
            onClick={handleVerifyEmail}
            disabled={state.isVerifying}
            style={{
              ...styles.button,
              opacity: state.isVerifying ? 0.6 : 1,
            }}
          >
            {state.isVerifying ? 'Verifying...' : 'Verify Email'}
          </button>

          <button onClick={handleSkipVerification} style={styles.secondaryButton}>
            Skip for Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>✨</div>
        </div>

        <h1 style={styles.title}>Welcome to Claude Code</h1>

        <p style={styles.subtitle}>Sign in with your Google account to get started</p>

        {state.error && <div style={styles.error}>{state.error}</div>}

        <button
          onClick={handleLoginClick}
          disabled={state.isLoading}
          style={{
            ...styles.loginButton,
            opacity: state.isLoading ? 0.6 : 1,
          }}
        >
          <span style={styles.googleIcon}>🔵</span>
          {state.isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <p style={styles.footer}>
          By signing in, you agree to our{' '}
          <a href="#terms" target="_blank" rel="noopener noreferrer" style={styles.link}>Terms of Service</a> and{' '}
          <a href="#privacy" target="_blank" rel="noopener noreferrer" style={styles.link}>Privacy Policy</a>
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            <strong>Free Tier:</strong> 15 prompts per day
          </p>
          <p style={styles.infoText}>
            <strong>Pro Tier:</strong> 500+ prompts per day + advanced features
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Styles
// ============================================================================

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
    padding: '20px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  } as React.CSSProperties,

  card: {
    background: '#252526',
    border: '1px solid #3e3e42',
    borderRadius: '8px',
    padding: '40px 30px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  } as React.CSSProperties,

  logoContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  } as React.CSSProperties,

  logo: {
    fontSize: '48px',
    display: 'inline-block',
  } as React.CSSProperties,

  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 12px 0',
    textAlign: 'center',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '14px',
    color: '#cccccc',
    textAlign: 'center',
    margin: '0 0 24px 0',
  } as React.CSSProperties,

  formGroup: {
    marginBottom: '20px',
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#999999',
    marginBottom: '6px',
    textTransform: 'uppercase',
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    background: '#1e1e1e',
    border: '1px solid #3e3e42',
    borderRadius: '4px',
    color: '#cccccc',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,

  error: {
    background: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid #f44336',
    borderRadius: '4px',
    color: '#ff9999',
    padding: '12px',
    fontSize: '13px',
    marginBottom: '16px',
  } as React.CSSProperties,

  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
    background: '#007acc',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  loginButton: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
    background: '#4285f4',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  googleIcon: {
    fontSize: '16px',
  } as React.CSSProperties,

  secondaryButton: {
    width: '100%',
    padding: '10px 16px',
    marginTop: '8px',
    fontSize: '13px',
    color: '#cccccc',
    background: 'transparent',
    border: '1px solid #3e3e42',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,

  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
    textAlign: 'center',
  } as React.CSSProperties,

  dividerText: {
    flex: 1,
    height: '1px',
    background: '#3e3e42',
    position: 'relative',
    display: 'inline-block',
  } as React.CSSProperties,

  footer: {
    fontSize: '12px',
    color: '#999999',
    textAlign: 'center',
    margin: '0',
  } as React.CSSProperties,

  link: {
    color: '#4ec9b0',
    textDecoration: 'none',
  } as React.CSSProperties,

  infoBox: {
    marginTop: '24px',
    padding: '12px 16px',
    background: 'rgba(78, 201, 176, 0.1)',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#4ec9b0',
  } as React.CSSProperties,

  infoText: {
    margin: '6px 0',
  } as React.CSSProperties,
}
