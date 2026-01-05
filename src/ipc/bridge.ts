import { invoke } from '@tauri-apps/api/tauri'

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

export async function getLspDiagnostics(text: string): Promise<LspDiagnostic[]> {
  try {
    return await callKernel<LspDiagnostic[]>('lsp_diagnostics', { text })
  } catch (err) {
    console.error('Error calling lsp_diagnostics', err)
    return []
  }
}

export type LspCompletionItem = {
  label: string
  detail?: string
}

export async function getLspCompletions(prefix: string): Promise<LspCompletionItem[]> {
  try {
    return await callKernel<LspCompletionItem[]>('lsp_completion', { prefix })
  } catch (err) {
    console.error('Error calling lsp_completion', err)
    return []
  }
}

export type LspHoverResult = {
  contents: string
}

export async function getLspHover(symbol: string): Promise<LspHoverResult | null> {
  try {
    return await callKernel<LspHoverResult>('lsp_hover', { symbol })
  } catch (err) {
    console.error('Error calling lsp_hover', err)
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

export async function chatWithNexusify(
  apiKey: string,
  model: string,
  messages: NexusifyMessage[],
  temperature: number = 0.7,
): Promise<string> {
  try {
    const response = await fetch('https://api.nexusify.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error?.message || `HTTP ${response.status}`)
    }

    const data: NexusifyChatResponse = await response.json()
    return data.choices[0]?.message?.content || 'No response'
  } catch (err) {
    console.error('Error calling Nexusify API:', err)
    throw err
  }
}