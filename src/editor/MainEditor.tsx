import React from 'react'
import { Editor, type OnMount } from '@monaco-editor/react'
import { getLspCompletions, getLspHover, getLspDiagnostics } from '../ipc/bridge'

export type MainEditorProps = {
  value: string
  onChange?: (value: string) => void
  filePath?: string
}

let diagnosticsUpdater: ((code: string) => void) | null = null

const handleEditorDidMount: OnMount = (editor, monaco) => {
  monaco.languages.registerCompletionItemProvider('typescript', {
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

  monaco.languages.registerHoverProvider('typescript', {
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

  diagnosticsUpdater = async (code: string) => {
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
}

export const MainEditor: React.FC<MainEditorProps> = ({ value, onChange, filePath }) => {
  const handleChange = (v?: string) => {
    if (onChange) {
      onChange(v ?? '')
    }

    if (diagnosticsUpdater) {
      diagnosticsUpdater(v ?? '')
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-7 flex items-center border-b border-slate-800 bg-slate-900/70 px-3 text-xs text-slate-300">
        <span className="truncate">{filePath ?? 'untitled.ts'}</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          theme="vs-dark"
          onMount={handleEditorDidMount}
          value={value}
          onChange={handleChange}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  )
}
