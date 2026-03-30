/**
 * Configuración de proveedores de IA: Nexusify, API compatible (OpenAI/LM Studio/etc.) y local (Ollama).
 * Persistencia en localStorage.
 */

export type AIProviderMode = 'nexusify' | 'openai_compatible' | 'ollama'

export type AISettings = {
  mode: AIProviderMode
  /** Bearer para Nexusify / OpenAI-compatible; vacío en Ollama local típico */
  apiKey: string
  /** Sin barra final. Ej: https://api.openai.com/v1, http://127.0.0.1:11434 */
  baseUrl: string
  /** ID del modelo (ej. gpt-4, llama3.2, mistral) */
  model: string
}

const STORAGE_KEY = 'meacode-ai-settings'

const LEGACY_KEY = 'nexusify-api-key'

export function defaultBaseUrl(mode: AIProviderMode): string {
  switch (mode) {
    case 'nexusify':
      return 'https://api.nexusify.co/v1'
    case 'openai_compatible':
      return 'https://api.openai.com/v1'
    case 'ollama':
      return 'http://127.0.0.1:11434'
    default:
      return 'https://api.openai.com/v1'
  }
}

function defaultSettings(): AISettings {
  return {
    mode: 'nexusify',
    apiKey: '',
    baseUrl: defaultBaseUrl('nexusify'),
    model: 'gpt-4',
  }
}

/** URL completa POST .../chat/completions (OpenAI-compatible, incluye Ollama). */
export function getChatCompletionsUrl(settings: AISettings): string {
  const base = settings.baseUrl.trim().replace(/\/+$/, '')
  return `${base}/chat/completions`
}

export function loadAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AISettings>
      const mode = (parsed.mode as AIProviderMode) || 'nexusify'
      return {
        mode,
        apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
        baseUrl: typeof parsed.baseUrl === 'string' && parsed.baseUrl.trim() ? parsed.baseUrl.trim() : defaultBaseUrl(mode),
        model: typeof parsed.model === 'string' && parsed.model.trim() ? parsed.model.trim() : 'gpt-4',
      }
    }
  } catch {
    // ignore
  }

  try {
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy?.trim()) {
      return {
        mode: 'nexusify',
        apiKey: legacy.trim(),
        baseUrl: defaultBaseUrl('nexusify'),
        model: 'gpt-4',
      }
    }
  } catch {
    // ignore
  }

  return defaultSettings()
}

export function saveAISettings(settings: AISettings): void {
  const normalized: AISettings = {
    ...settings,
    baseUrl: settings.baseUrl.trim().replace(/\/+$/, '') || defaultBaseUrl(settings.mode),
    model: settings.model.trim(),
    apiKey: settings.apiKey.trim(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
}

export function isAIConfigured(settings: AISettings): boolean {
  if (!settings.model.trim()) return false
  if (settings.mode === 'ollama') {
    return !!(settings.baseUrl.trim() && settings.model.trim())
  }
  return !!(settings.apiKey.trim() && settings.model.trim())
}
