'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { pickFolder, readDirectory, readText, writeText, saveDialog, getAppConfigDir, pathJoin, detectLanguageByExt, type FsTreeItem } from '@/lib/fs-tauri';

export interface FileTab {
  id: string;
  name: string;
  language: 'javascript' | 'python' | 'html' | 'css' | 'json';
  content: string;
  isDirty: boolean;
  path?: string | null;
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  content: (string | object)[];
  timestamp: Date;
}

interface EditorContextType {
  // Archivos
  files: FileTab[];
  activeFileId: string;
  activeFile: FileTab | null;
  workspaceRoot: string | null;
  fsTree: FsTreeItem[];
  
  // Acciones de archivos
  createFile: (name: string, language: FileTab['language']) => void;
  updateFileContent: (fileId: string, content: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  saveFile: (fileId: string) => void;
  saveFileAs: (fileId: string) => Promise<void>;
  openFolder: () => Promise<void>;
  openFileFromDisk: (fullPath: string) => Promise<void>;
  reloadFsTree: () => Promise<void>;
  applyRename: (oldPath: string, newPath: string) => void;
  
  // Estado de la console
  consoleLogs: ConsoleLog[];
  hasErrors: boolean;
  
  // Estado del preview
  previewError: string | null;
  
  // Acciones
  addConsoleLog: (log: ConsoleLog) => void;
  clearConsoleLogs: () => void;
  setPreviewError: (error: string | null) => void;
  
  // Obtener contexto para la IA
  getContextForAI: () => string;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileTab[]>([
    {
      id: 'default-js',
      name: 'script.js',
      language: 'javascript',
      content: 'function greet() {\n  console.log("Hello from MeaCode Estudio!");\n}\ngreet();\n',
      isDirty: false,
      path: null,
    },
    {
      id: 'default-html',
      name: 'index.html',
      language: 'html',
      content: '<h1>Welcome to MeaCode Estudio</h1>\n<p>Start coding!</p>',
      isDirty: false,
      path: null,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState('default-js');
  const [workspaceRoot, setWorkspaceRoot] = useState<string | null>(null);
  const [fsTree, setFsTree] = useState<FsTreeItem[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const activeFile = files.find(f => f.id === activeFileId) || null;
  const hasErrors = consoleLogs.some(log => log.type === 'error');

  const addConsoleLog = useCallback((log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev, log]);
  }, []);

  const clearConsoleLogs = useCallback(() => {
    setConsoleLogs([]);
  }, []);

  const createFile = useCallback((name: string, language: FileTab['language']) => {
    const newFile: FileTab = {
      id: `file-${Date.now()}`,
      name,
      language,
      content: '',
      isDirty: true,
      path: null,
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  }, []);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        // Only mark as dirty if content actually changed
        if (file.content !== content) {
          return { ...file, content, isDirty: true };
        }
      }
      return file;
    }));
  }, []);

  const closeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const closingFileIndex = prev.findIndex(f => f.id === fileId);
      if (closingFileIndex === -1) return prev;

      // Ask for confirmation if file is dirty
      if (prev[closingFileIndex].isDirty) {
        if (!confirm(`You have unsaved changes in ${prev[closingFileIndex].name}. Close anyway?`)) {
          return prev;
        }
      }

      const newFiles = prev.filter(f => f.id !== fileId);
      
      // If we closed the active file, activate another one
      if (fileId === activeFileId) {
        if (newFiles.length === 0) {
          // No files left
        } else {
          // Activate the previous file, or the first one if it was the first
          const newActiveIndex = Math.max(0, closingFileIndex - 1);
          setActiveFileId(newFiles[newActiveIndex].id);
        }
      }
      
      return newFiles;
    });
  }, [activeFileId]);

  const saveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => {
      if (file.id !== fileId) return file;
      return { ...file };
    }));
    (async () => {
      const target = files.find(f => f.id === fileId);
      if (!target) return;
      if (target.path) {
        await writeText(target.path, target.content);
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isDirty: false } : f));
      } else {
        await saveFileAs(fileId);
      }
    })();
  }, [files]);

  const applyRename = useCallback((oldPath: string, newPath: string) => {
    setFiles(prev => prev.map(f => {
      if (!f.path) return f;
      if (f.path === oldPath) {
        const name = newPath.split(/[/\\]/).pop() || f.name;
        return { ...f, path: newPath, name };
      }
      if (oldPath.endsWith('/') || oldPath.endsWith('\\')) {
        const prefix = oldPath;
        if (f.path.startsWith(prefix)) {
          const rest = f.path.slice(prefix.length);
          const nextPath = newPath + rest;
          return { ...f, path: nextPath };
        }
      } else {
        const slashOld = oldPath + (/[/\\]$/.test(oldPath) ? '' : (/\\/.test(oldPath) ? '\\' : '/'));
        if (f.path.startsWith(slashOld)) {
          const rest = f.path.slice(slashOld.length);
          const sep = newPath.endsWith('/') || newPath.endsWith('\\') ? '' : (slashOld.includes('\\') ? '\\' : '/');
          const nextPath = newPath + sep + rest;
          return { ...f, path: nextPath };
        }
      }
      return f;
    }));
  }, []);

  const refreshFsTree = useCallback(async () => {
    if (!workspaceRoot) return;
    try {
      const next = await readDirectory(workspaceRoot);
      const sameLen = (fsTree?.length || 0) === (next?.length || 0);
      const key = (list: FsTreeItem[]) => JSON.stringify(list.map(i => ({ n: i.name, d: i.isDir })));
      if (!sameLen || key(fsTree) !== key(next)) {
        setFsTree(next);
      }
    } catch {}
  }, [workspaceRoot, fsTree]);

  useEffect(() => {
    if (!workspaceRoot) return;
    const id = setInterval(() => { refreshFsTree(); }, 1500);
    return () => clearInterval(id);
  }, [workspaceRoot, refreshFsTree]);

  const saveFileAs = useCallback(async (fileId: string) => {
    const target = files.find(f => f.id === fileId);
    if (!target) return;
    let defaultPath: string | undefined = undefined;
    if (workspaceRoot) {
      try { defaultPath = await pathJoin(workspaceRoot, target.name); } catch {}
    }
    const p = await saveDialog(defaultPath);
    if (!p) return;
    await writeText(p, target.content);
    const name = p.split(/[/\\]/).pop() || target.name;
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name, path: p, isDirty: false } : f));
  }, [files, workspaceRoot]);

  const openFolder = useCallback(async () => {
    const dir = await pickFolder();
    if (!dir) return;
    setWorkspaceRoot(dir);
    const tree = await readDirectory(dir);
    setFsTree(tree);
  }, []);

  const reloadFsTree = useCallback(async () => {
    if (!workspaceRoot) return;
    try {
      const tree = await readDirectory(workspaceRoot);
      setFsTree(tree);
    } catch {}
  }, [workspaceRoot]);

  const openFileFromDisk = useCallback(async (fullPath: string) => {
    try {
      const content = await readText(fullPath);
      const name = fullPath.split(/[/\\]/).pop() || fullPath;
      const language = detectLanguageByExt(name);
      const existing = files.find(f => f.path === fullPath);
      if (existing) {
        setFiles(prev => prev.map(f => f.id === existing.id ? { ...f, content } : f));
        setActiveFileId(existing.id);
        return;
      }
      const id = `file-${Date.now()}`;
      const file: FileTab = { id, name, language, content, isDirty: false, path: fullPath };
      setFiles(prev => [...prev, file]);
      setActiveFileId(id);
    } catch {}
  }, [files]);

  const getContextForAI = useCallback(() => {
    const context = {
      currentFile: activeFile ? {
        name: activeFile.name,
        language: activeFile.language,
        code: activeFile.content,
        lineCount: activeFile.content.split('\n').length,
      } : null,
      openFiles: files.map(f => ({ name: f.name, language: f.language, isDirty: f.isDirty })),
      console: {
        totalLogs: consoleLogs.length,
        errors: consoleLogs.filter(l => l.type === 'error').map(l => ({
          content: l.content.join(' '),
          timestamp: l.timestamp.toISOString(),
        })),
        warnings: consoleLogs.filter(l => l.type === 'warn').length,
        hasErrors: hasErrors,
      },
      preview: {
        hasError: !!previewError,
        error: previewError,
      },
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(context, null, 2);
  }, [activeFile, files, consoleLogs, previewError, hasErrors]);

  const persistSession = useCallback(async () => {
    try {
      const dir = await getAppConfigDir();
      if (!dir) return;
      const wsPath = await pathJoin(dir, 'workspace.json');
      const data = JSON.stringify({ workspaceRoot, files: files.map(f => ({ id: f.id, name: f.name, language: f.language, path: f.path || null })) });
      await writeText(wsPath, data);
    } catch {}
  }, [files, workspaceRoot]);

  const restoreSession = useCallback(async () => {
    try {
      const dir = await getAppConfigDir();
      if (!dir) return;
      const wsPath = await pathJoin(dir, 'workspace.json');
      const json = await readText(wsPath);
      const data = JSON.parse(json);
      if (data.workspaceRoot) {
        setWorkspaceRoot(data.workspaceRoot);
        try { setFsTree(await readDirectory(data.workspaceRoot)); } catch {}
      }
      if (Array.isArray(data.files)) {
        const restored: FileTab[] = [];
        for (const f of data.files) {
          let content = '';
          if (f.path) {
            try { content = await readText(f.path); } catch {}
          }
          restored.push({ id: f.id || `file-${Date.now()}`, name: f.name, language: f.language, content, isDirty: false, path: f.path || null });
        }
        if (restored.length > 0) {
          setFiles(restored);
          setActiveFileId(restored[0].id);
        }
      }
    } catch {}
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);
  useEffect(() => { persistSession(); }, [persistSession]);
  useEffect(() => {
    const t = setInterval(() => {
      const target = files.find(f => f.isDirty && f.path);
      if (target) saveFile(target.id);
    }, 2000);
    return () => clearInterval(t);
  }, [files, saveFile]);

  return (
    <EditorContext.Provider
      value={{
        files,
        activeFileId,
        activeFile,
        workspaceRoot,
        fsTree,
        createFile,
        updateFileContent,
        closeFile,
        setActiveFile: setActiveFileId,
        saveFile,
        saveFileAs,
        openFolder,
        openFileFromDisk,
        reloadFsTree,
        applyRename,
        consoleLogs,
        hasErrors,
        previewError,
        addConsoleLog,
        clearConsoleLogs,
        setPreviewError,
        getContextForAI,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}
