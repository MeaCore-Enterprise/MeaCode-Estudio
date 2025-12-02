export type FsTreeItem = { name: string; path: string; isDir: boolean; children?: FsTreeItem[] };
export type SearchResult = { path: string; line: number; column: number; lineText: string };

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

export async function createDirPath(path: string): Promise<void> {
  if (!isTauri()) return;
  const { createDir } = await import('@tauri-apps/api/fs');
  await createDir(path, { recursive: true });
}

export async function removeFilePath(path: string): Promise<void> {
  if (!isTauri()) return;
  const { removeFile } = await import('@tauri-apps/api/fs');
  await removeFile(path);
}

export async function removeDirPath(path: string): Promise<void> {
  if (!isTauri()) return;
  const { removeDir } = await import('@tauri-apps/api/fs');
  await removeDir(path, { recursive: true });
}

export async function renamePath(oldPath: string, newPath: string): Promise<void> {
  if (!isTauri()) return;
  const { renameFile } = await import('@tauri-apps/api/fs');
  await renameFile(oldPath, newPath);
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

export async function pathDirname(p: string): Promise<string> {
  const { dirname } = await import('@tauri-apps/api/path');
  return dirname(p);
}

export async function pathBasename(p: string): Promise<string> {
  const { basename } = await import('@tauri-apps/api/path');
  return basename(p);
}

export function detectLanguageByExt(filename: string): 'javascript' | 'python' | 'html' | 'css' | 'json' {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'py') return 'python';
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'json') return 'json';
  return 'javascript';
}

export async function searchTextInProject(root: string, query: string, opts?: {
  caseSensitive?: boolean;
  isRegex?: boolean;
  includeExts?: string[];
  maxResults?: number;
}): Promise<SearchResult[]> {
  if (!isTauri() || !root || !query) return [];
  const { readDir, readTextFile } = await import('@tauri-apps/api/fs');
  const results: SearchResult[] = [];
  const max = opts?.maxResults ?? 500;
  const include = (opts?.includeExts || []).map(e => e.replace(/^\./, '').toLowerCase());

  async function walk(dir: string): Promise<string[]> {
    const arr: string[] = [];
    const entries = await readDir(dir, { recursive: false });
    for (const e of entries) {
      if (e.children && e.children.length) {
        const sub = await walk(e.path);
        for (const s of sub) arr.push(s);
      } else if (!e.children) {
        if (include.length > 0) {
          const ext = (e.name?.split('.').pop() || '').toLowerCase();
          if (!include.includes(ext)) continue;
        }
        arr.push(e.path);
      }
      if (results.length >= max) break;
    }
    return arr;
  }

  let files: string[] = [];
  try { files = await walk(root); } catch { return []; }

  let regex: RegExp | null = null;
  if (opts?.isRegex) {
    try { regex = new RegExp(query, opts?.caseSensitive ? 'g' : 'gi'); } catch { regex = null; }
  }

  for (const p of files) {
    if (results.length >= max) break;
    let text: string;
    try { text = await readTextFile(p); } catch { continue; }
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (results.length >= max) break;
      const lineText = lines[i];
      if (regex) {
        regex.lastIndex = 0;
        const m = regex.exec(lineText);
        if (m && typeof m.index === 'number') {
          results.push({ path: p, line: i + 1, column: m.index + 1, lineText });
        }
      } else {
        const hay = opts?.caseSensitive ? lineText : lineText.toLowerCase();
        const needle = opts?.caseSensitive ? query : query.toLowerCase();
        const idx = hay.indexOf(needle);
        if (idx >= 0) {
          results.push({ path: p, line: i + 1, column: idx + 1, lineText });
        }
      }
    }
  }
  return results;
}
