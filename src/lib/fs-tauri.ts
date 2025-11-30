export type FsTreeItem = { name: string; path: string; isDir: boolean; children?: FsTreeItem[] };

function isTauri() {
  return typeof window !== 'undefined' && (window as any).__TAURI__;
}

export async function pickFolder(): Promise<string | null> {
  if (!isTauri()) return null;
  const { open } = await import('@tauri-apps/api/dialog');
  const sel = await open({ directory: true, multiple: false });
  if (typeof sel === 'string') return sel;
  return null;
}

export async function saveDialog(defaultPath?: string): Promise<string | null> {
  if (!isTauri()) return null;
  const { save } = await import('@tauri-apps/api/dialog');
  const res = await save({ defaultPath });
  return res || null;
}

export async function readDirectory(dir: string): Promise<FsTreeItem[]> {
  if (!isTauri()) return [];
  const { readDir } = await import('@tauri-apps/api/fs');
  const entries = await readDir(dir, { recursive: true });
  function toTree(items: any[], base: string): FsTreeItem[] {
    const out: FsTreeItem[] = [];
    for (const e of items) {
      const node: FsTreeItem = {
        name: e.name,
        path: e.path,
        isDir: !!e.children,
        children: e.children ? toTree(e.children, e.path) : undefined,
      };
      out.push(node);
    }
    return out;
  }
  return toTree(entries, dir);
}

export async function readText(path: string): Promise<string> {
  if (!isTauri()) return '';
  const { readTextFile } = await import('@tauri-apps/api/fs');
  return readTextFile(path);
}

export async function writeText(path: string, contents: string): Promise<void> {
  if (!isTauri()) return;
  const { writeFile } = await import('@tauri-apps/api/fs');
  await writeFile({ path, contents });
}

export async function getAppConfigDir(): Promise<string | null> {
  if (!isTauri()) return null;
  const { appConfigDir } = await import('@tauri-apps/api/path');
  return appConfigDir();
}

export async function pathJoin(...parts: string[]): Promise<string> {
  const { join } = await import('@tauri-apps/api/path');
  return join(...parts);
}

export function detectLanguageByExt(filename: string): 'javascript' | 'python' | 'html' | 'css' | 'json' {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'py') return 'python';
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'json') return 'json';
  return 'javascript';
}
