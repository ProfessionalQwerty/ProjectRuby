export const TELEMETRY_CONSENT_KEY = 'prism-intelligence-engine-opt-in'
export const TELEMETRY_PROMPTED_KEY = 'prism-intelligence-engine-prompted'

/** Opt-in is OFF until the user explicitly enables it. */
export function isTelemetryOptedIn(): boolean {
  try {
    return localStorage.getItem(TELEMETRY_CONSENT_KEY) === '1'
  } catch {
    return false
  }
}

export function setTelemetryOptIn(enabled: boolean): void {
  try {
    localStorage.setItem(TELEMETRY_CONSENT_KEY, enabled ? '1' : '0')
    // Making any explicit choice counts as having been prompted.
    localStorage.setItem(TELEMETRY_PROMPTED_KEY, '1')
  } catch {
    // ignore storage failures
  }
}

/** True once the user has seen and answered the first-run consent prompt. */
export function hasSeenTelemetryPrompt(): boolean {
  try {
    return localStorage.getItem(TELEMETRY_PROMPTED_KEY) === '1'
  } catch {
    return true
  }
}

export function markTelemetryPrompted(): void {
  try {
    localStorage.setItem(TELEMETRY_PROMPTED_KEY, '1')
  } catch {
    // ignore
  }
}

/**
 * Plain-language description of exactly what the PRISM Intelligence Engine
 * collects and what it never touches. Shared by the consent modal and the
 * settings panel so the two can never drift.
 */
export const TELEMETRY_COLLECTED = [
  'Abstracted actions: which tool or command ran (e.g. "search", "shell") and the shape of its inputs — types and sizes, never values',
  'Outcomes: success / error / partial, plus a coarse error category (e.g. "type_error")',
  'Structural deltas: how many files changed, lines added/removed, and code-structure counts',
  'Terminal exit codes and failure → recovery sequences',
]

export const TELEMETRY_NEVER_COLLECTED = [
  'Your source code or file contents',
  'Your prompts or the model’s responses',
  'File names, paths, or repository identity',
  'API keys, secrets, or personal information (scrubbed on-device before anything is sent)',
]
