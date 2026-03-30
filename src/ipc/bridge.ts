import { invoke } from '@tauri-apps/api/tauri'
import { getChatCompletionsUrl, loadAISettings, type AISettings } from '../utils/aiSettings'

export async function callKernel<T = unknown>(
  command: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  return invoke<T>(command, payload)
}

export async function getAppInfo() {
  try {
    return await callKernel<{ name: string; version: string }>('get_app_info')
  } catch (err) {
    console.error('Error calling get_app_info', err)
    return { name: 'MeaCode Studio', version: 'dev' }
  }
}

export type KernelPingResult = {
  status: string
}

export async function pingKernel(): Promise<KernelPingResult> {
  try {
    return await callKernel<KernelPingResult>('ping_kernel')
  } catch (err) {
    console.error('Error calling ping_kernel', err)
    return { status: 'error' }
  }
}

export type FileEntry = {
  name: string
  path: string
  is_dir: boolean
}

export type FileContent = {
  path: string
  content: string
}

export async function listDir(path?: string): Promise<FileEntry[]> {
  try {
    const payload = path ? { path } : undefined
    return await callKernel<FileEntry[]>('list_dir', payload)
  } catch (err) {
    console.error('Error calling list_dir', err)
    return []
  }
}

export async function readFile(path: string): Promise<FileContent | null> {
  try {
    return await callKernel<FileContent>('read_file', { path })
  } catch (err) {
    console.error('Error calling read_file', err)
    return null
  }
}

export type LspDiagnostic = {
  message: string
  severity?: number
  start_line: number
  start_col: number
  end_line: number
  end_col: number
}

export async function getLspDiagnostics(text: string, language?: string): Promise<LspDiagnostic[]> {
  try {
    const payload = language ? { text, language } : { text }
    return await callKernel<LspDiagnostic[]>('lsp_diagnostics', payload)
  } catch (err) {
    console.error('Error calling lsp_diagnostics', err)
    return []
  }
}

export type LspCompletionItem = {
  label: string
  detail?: string
}

export async function getLspCompletions(prefix: string, language?: string): Promise<LspCompletionItem[]> {
  try {
    const payload = language ? { prefix, language } : { prefix }
    return await callKernel<LspCompletionItem[]>('lsp_completion', payload)
  } catch (err) {
    console.error('Error calling lsp_completion', err)
    return []
  }
}

export type LspHoverResult = {
  contents: string
}

export async function getLspHover(symbol: string, language?: string): Promise<LspHoverResult | null> {
  try {
    const payload = language ? { symbol, language } : { symbol }
    return await callKernel<LspHoverResult>('lsp_hover', payload)
  } catch (err) {
    console.error('Error calling lsp_hover', err)
    return null
  }
}

export async function openFolder(): Promise<string | null> {
  try {
    const path = await callKernel<string | null>('open_folder')
    return path
  } catch (err) {
    console.error('Error calling open_folder', err)
    return null
  }
}

export async function openFile(): Promise<string | null> {
  try {
    const path = await callKernel<string | null>('open_file')
    return path
  } catch (err) {
    console.error('Error calling open_file', err)
    return null
  }
}

export async function saveFile(path: string, content: string): Promise<boolean> {
  try {
    return await callKernel<boolean>('save_file', { path, content })
  } catch (err) {
    console.error('Error calling save_file', err)
    return false
  }
}

export async function saveFileAs(content: string): Promise<string | null> {
  try {
    const path = await callKernel<string | null>('save_file_as', { content })
    return path
  } catch (err) {
    console.error('Error calling save_file_as', err)
    return null
  }
}

export type TerminalOutput = {
  stdout: string
  stderr: string
  exit_code: number
}

export async function getCurrentDirectory(): Promise<string> {
  try {
    return await callKernel<string>('get_current_directory')
  } catch (err) {
    console.error('Error calling get_current_directory', err)
    return '.'
  }
}

export async function executeShellCommand(command: string): Promise<TerminalOutput> {
  try {
    return await callKernel<TerminalOutput>('execute_shell_command', { command })
  } catch (err) {
    console.error('Error calling execute_shell_command', err)
    return { stdout: '', stderr: String(err), exit_code: 1 }
  }
}

export type WorkspaceInfo = {
  path: string
  project_type: string
  name: string
}

export async function detectProjectType(path: string): Promise<string> {
  try {
    return await callKernel<string>('detect_project_type', { path })
  } catch (err) {
    console.error('Error calling detect_project_type', err)
    return 'unknown'
  }
}

export async function getWorkspaceInfo(path: string): Promise<WorkspaceInfo | null> {
  try {
    return await callKernel<WorkspaceInfo>('get_workspace_info', { path })
  } catch (err) {
    console.error('Error calling get_workspace_info', err)
    return null
  }
}

// Nexusify API integration
export type NexusifyMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type NexusifyChatRequest = {
  model: string
  messages: NexusifyMessage[]
  stream?: boolean
  temperature?: number
}

export type NexusifyChatResponse = {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}

export type AIError = {
  type: 'invalid_api_key' | 'rate_limit' | 'service_unavailable' | 'network_error' | 'unknown'
  message: string
}

export function parseAIError(error: unknown): AIError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('401') || message.includes('unauthorized') || message.includes('invalid') && message.includes('key')) {
      return {
        type: 'invalid_api_key',
        message: 'API key inválida. Por favor verifica tu clave en la configuración.',
      }
    }
    
    if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
      return {
        type: 'rate_limit',
        message: 'Límite de solicitudes alcanzado. Por favor espera un momento antes de intentar de nuevo.',
      }
    }
    
    if (message.includes('503') || message.includes('service unavailable') || message.includes('unavailable')) {
      return {
        type: 'service_unavailable',
        message: 'Servicio no disponible temporalmente. Por favor intenta más tarde.',
      }
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: 'network_error',
        message: 'Error de conexión. Verifica tu conexión a internet.',
      }
    }
  }
  
  return {
    type: 'unknown',
    message: 'Error desconocido. Por favor intenta de nuevo.',
  }
}

const CHAT_TIMEOUT_MS = 120_000

/**
 * Chat completions con API estilo OpenAI (Nexusify, OpenAI, LM Studio, Ollama /v1, etc.).
 */
export async function chatCompletion(
  settings: AISettings,
  messages: NexusifyMessage[],
  temperature: number = 0.7,
): Promise<string> {
  if (settings.mode !== 'ollama' && !settings.apiKey?.trim()) {
    throw new Error('API key no configurada')
  }
  if (!settings.model?.trim()) {
    throw new Error('Modelo no configurado')
  }

  const url = getChatCompletionsUrl(settings)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (settings.apiKey?.trim()) {
    headers['Authorization'] = `Bearer ${settings.apiKey.trim()}`
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: settings.model.trim(),
        messages,
        temperature,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }))
      const errorMessage =
        (errorData as { error?: { message?: string } }).error?.message || `HTTP ${response.status}`
      throw new Error(errorMessage)
    }

    const data: NexusifyChatResponse = await response.json()
    return data.choices[0]?.message?.content || 'Sin respuesta'
  } catch (err) {
    const maybeErr = err as { name?: string }
    if (maybeErr?.name === 'AbortError') {
      throw new Error(`Solicitud agotó el tiempo de espera (${CHAT_TIMEOUT_MS}ms)`)
    }
    console.error('Error chat completion:', err)
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/** Compatibilidad: Nexusify con clave explícita. */
export async function chatWithNexusify(
  apiKey: string,
  model: string,
  messages: NexusifyMessage[],
  temperature: number = 0.7,
): Promise<string> {
  const base = loadAISettings()
  return chatCompletion(
    {
      ...base,
      mode: 'nexusify',
      apiKey,
      model,
      baseUrl: 'https://api.nexusify.co/v1',
    },
    messages,
    temperature,
  )
}

// AI Code Actions
export async function explainCodeWithAI(
  code: string,
  language?: string,
  settings?: AISettings,
): Promise<string> {
  const s = settings ?? loadAISettings()
  const messages: NexusifyMessage[] = [
    {
      role: 'system',
      content: 'Eres un experto en programación. Explica código de forma clara y concisa.',
    },
    {
      role: 'user',
      content: `Explica este código${language ? ` en ${language}` : ''}:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``,
    },
  ]

  return chatCompletion(s, messages)
}

export async function fixErrorWithAI(
  code: string,
  error: string,
  language?: string,
  settings?: AISettings,
): Promise<string> {
  const s = settings ?? loadAISettings()
  const messages: NexusifyMessage[] = [
    {
      role: 'system',
      content: 'Eres un experto en programación. Arregla errores en código de forma precisa. Devuelve solo el código corregido, sin explicaciones adicionales.',
    },
    {
      role: 'user',
      content: `Arregla este error en el código:\n\nError: ${error}\n\nCódigo:\n\`\`\`${language || ''}\n${code}\n\`\`\`\n\nDevuelve solo el código corregido.`,
    },
  ]

  return chatCompletion(s, messages)
}

export async function refactorCodeWithAI(
  code: string,
  language?: string,
  settings?: AISettings,
): Promise<string> {
  const s = settings ?? loadAISettings()
  const messages: NexusifyMessage[] = [
    {
      role: 'system',
      content: 'Eres un experto en programación. Refactoriza código para mejorarlo manteniendo la funcionalidad. Devuelve solo el código refactorizado, sin explicaciones adicionales.',
    },
    {
      role: 'user',
      content: `Refactoriza este código${language ? ` en ${language}` : ''} para mejorarlo:\n\n\`\`\`${language || ''}\n${code}\n\`\`\`\n\nDevuelve solo el código refactorizado.`,
    },
  ]

  return chatCompletion(s, messages)
}