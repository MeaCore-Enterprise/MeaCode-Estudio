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
