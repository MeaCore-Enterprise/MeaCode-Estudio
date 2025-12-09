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
