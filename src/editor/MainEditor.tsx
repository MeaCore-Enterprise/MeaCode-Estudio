import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { Editor, type OnMount, type Monaco } from '@monaco-editor/react'
import { getLspCompletions, getLspHover, getLspDiagnostics, saveFile } from '../ipc/bridge'
import { TabBar, type Tab } from '../components/TabBar'
import { detectLanguage } from '../utils/languageUtils'

export type MainEditorProps = {
  tabs: Tab[]
  activeTabId: string | null
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onContentChange: (tabId: string, content: string) => void
  onTabSaved?: (tabId: string) => void
}

const diagnosticsUpdaters = new Map<string, ((code: string) => void)>()

const setupLanguageProviders = (monaco: Monaco, language: string) => {
  // Only register once per language
  const key = `providers-${language}`
  if ((window as any)[key]) return
  ;(window as any)[key] = true

  monaco.languages.registerCompletionItemProvider(language, {
    triggerCharacters: ['.', '"', "'", '/', '@', '<'],
    provideCompletionItems: async (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn,
      )

      const prefix = word.word || ''
      const items = await getLspCompletions(prefix)

      const suggestions = items.map((item) => ({
        label: item.label,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: item.label,
        detail: item.detail,
        range,
      }))

      return { suggestions }
    },
  })

  monaco.languages.registerHoverProvider(language, {
    provideHover: async (model, position) => {
      const word = model.getWordAtPosition(position)
      if (!word || !word.word) {
        return { contents: [] }
      }

      const hover = await getLspHover(word.word)
      if (!hover) {
        return { contents: [] }
      }

      return {
        contents: [
          {
            value: hover.contents,
          },
        ],
      }
    },
  })
}

const handleEditorDidMount = (tabId: string, language: string): OnMount => {
  return (editor, monaco) => {
    setupLanguageProviders(monaco, language)

    const updateDiagnostics = async (code: string) => {
      const diags = await getLspDiagnostics(code)
      const model = editor.getModel()
      if (!model) return

      const markers = diags.map((d) => ({
        startLineNumber: d.start_line,
        startColumn: d.start_col,
        endLineNumber: d.end_line,
        endColumn: d.end_col,
        message: d.message,
        severity:
          d.severity === 1
            ? monaco.MarkerSeverity.Error
            : d.severity === 2
            ? monaco.MarkerSeverity.Warning
            : monaco.MarkerSeverity.Info,
      }))

      monaco.editor.setModelMarkers(model, 'lsp', markers)
    }

    diagnosticsUpdaters.set(tabId, updateDiagnostics)
  }
}

export const MainEditor: React.FC<MainEditorProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onContentChange,
  onTabSaved,
}) => {
  const editorRef = useRef<{ [key: string]: any }>({})
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || null

  const handleSave = useCallback(async (tab: Tab) => {
    if (!tab.path || tab.path === 'untitled') {
      // TODO: Implementar "Save As" dialog
      return
    }

    try {
      const success = await saveFile(tab.path, tab.content)
      if (success && onTabSaved) {
        onTabSaved(tab.id)
      }
    } catch (err) {
      console.error('Error saving file:', err)
    }
  }, [onTabSaved])

  const handleChange = (tabId: string) => (v?: string) => {
    onContentChange(tabId, v ?? '')
    
    const updater = diagnosticsUpdaters.get(tabId)
    if (updater) {
      updater(v ?? '')
    }

    // Auto-save after 2 seconds of inactivity
    const tab = tabs.find((t) => t.id === tabId)
    if (tab && tab.path && tab.path !== 'untitled') {
      if (saveTimeoutRef.current[tabId]) {
        clearTimeout(saveTimeoutRef.current[tabId])
      }
      saveTimeoutRef.current[tabId] = setTimeout(() => {
        handleSave(tab)
      }, 2000)
    }
  }

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (activeTab) {
          handleSave(activeTab)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      // Cleanup timeouts
      Object.values(saveTimeoutRef.current).forEach((timeout) => clearTimeout(timeout))
    }
  }, [activeTab, handleSave])

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!activeTab) return []
    const parts = activeTab.path.split(/[/\\]/)
    return parts.filter(Boolean)
  }, [activeTab])

  if (tabs.length === 0) {
    return (
      <div className="h-full w-full flex flex-col bg-neutral-950">
        <div className="h-8 flex items-center border-b border-neutral-800 bg-neutral-900/70 px-3 text-xs text-neutral-400">
          <span>No hay archivos abiertos</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-neutral-400">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="text-4xl font-bold text-red-400 mb-2">MeaCode Studio</div>
              <div className="text-sm text-neutral-500">IA-first IDE</div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // TODO: Implementar open folder
                  console.log('Open Folder')
                }}
                className="w-full px-4 py-2 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/40 text-sm transition-colors"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Open Folder
              </button>
              <button
                onClick={() => {
                  // TODO: Implementar open file
                  console.log('Open File')
                }}
                className="w-full px-4 py-2 rounded-md bg-neutral-800/50 text-neutral-300 hover:bg-neutral-800 border border-neutral-700 text-sm transition-colors"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Open File
              </button>
              <button
                onClick={() => {
                  // TODO: Implementar new file
                  console.log('New File')
                }}
                className="w-full px-4 py-2 rounded-md bg-neutral-800/50 text-neutral-300 hover:bg-neutral-800 border border-neutral-700 text-sm transition-colors"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New File
              </button>
            </div>
            <div className="mt-6 text-xs text-neutral-600">
              <p>O usa <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">Ctrl+P</kbd> para búsqueda rápida</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
      />
      
      {activeTab && (
        <>
          {/* Breadcrumbs and Save button */}
          <div className="h-6 flex items-center justify-between gap-1 px-3 border-b border-neutral-800 bg-neutral-900/50 text-[10px]">
            <div className="flex items-center gap-1 text-neutral-400">
              {breadcrumbs.map((part, idx) => (
                <React.Fragment key={idx}>
                  <span className="hover:text-neutral-200 cursor-pointer">{part}</span>
                  {idx < breadcrumbs.length - 1 && <span className="text-neutral-600">/</span>}
                </React.Fragment>
              ))}
            </div>
            {activeTab.modified && (
              <button
                onClick={() => handleSave(activeTab)}
                className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 text-[10px] border border-red-500/40"
                title="Guardar (Ctrl+S)"
              >
                Guardar
              </button>
            )}
          </div>
          
          <div className="flex-1">
            <Editor
              key={activeTab.id}
              height="100%"
              language={activeTab.language || 'plaintext'}
              theme="vs-dark"
              onMount={handleEditorDidMount(activeTab.id, activeTab.language || 'plaintext')}
              value={activeTab.content}
              onChange={handleChange(activeTab.id)}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                folding: true,
                foldingStrategy: 'auto',
                showFoldingControls: 'always',
                unfoldOnClickAfterEndOfLine: false,
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  indentation: true,
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
