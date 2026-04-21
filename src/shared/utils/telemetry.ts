type TelemetryError = {
  message: string
  stack?: string
  timestamp: string
  context?: Record<string, unknown>
}

const STORAGE_KEY = 'meacode-telemetry-errors'
const MAX_ERRORS = 50

export function logErrorTelemetry(error: Error, context?: Record<string, unknown>) {
  try {
    const entry: TelemetryError = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    const list: TelemetryError[] = saved ? JSON.parse(saved) : []
    const next = [entry, ...list].slice(0, MAX_ERRORS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore telemetry failures
  }
}

export function getErrorTelemetry(): TelemetryError[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

