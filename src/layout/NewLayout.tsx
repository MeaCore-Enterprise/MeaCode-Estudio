import React, { useState } from 'react'
import { MainEditor, type MainEditorProps } from '../features/editor/MainEditor'
import { ExplorerPanel } from '../features/explorer/ExplorerPanel'
import { TerminalThemed } from '../features/terminal/TerminalThemed'
import { AIChatThemed } from '../features/ai/AIChatThemed'

/**
 * NewLayout - Alternative layout component for future iterations
 * Currently experimental; consider using IdeLayout for production
 */
export const NewLayout: React.FC = () => {
  const [showExplorer, setShowExplorer] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)
  const [showAiChat, setShowAiChat] = useState(true)
  const [tabs, setTabs] = useState<Array<{ id: string; name: string; content: string; path?: string }>>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [editorPath, setEditorPath] = useState<string | undefined>()

  const handleTabCreate = (name: string, content: string, path?: string) => {
    const id = `tab-${Date.now()}`
    setTabs((prev) => [...prev, { id, name, content, path }])
    setActiveTabId(id)
    setEditorContent(content)
    setEditorPath(path)
  }

  const handleTabClose = (tabId: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== tabId))
    if (activeTabId === tabId) {
      const remaining = tabs.filter((t) => t.id !== tabId)
      setActiveTabId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-neutral-200">
      {/* Top Bar */}
      <header className="h-10 flex items-center px-4 border-b border-neutral-800 bg-neutral-950">
        <span className="font-semibold text-red-400">MeaCode Studio</span>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Explorer */}
        {showExplorer && (
          <aside className="w-64 border-r border-neutral-800 overflow-y-auto">
            <ExplorerPanel onOpenFile={(file) => {
              handleTabCreate(file.path.split('/').pop() || 'Untitled', file.content, file.path)
            }} />
          </aside>
        )}

        {/* Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {/* Placeholder for MainEditor */}
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-500">
              Editor Area (MainEditor component)
            </div>
          </div>

          {/* Terminal */}
          {showTerminal && (
            <div className="h-64 border-t border-neutral-800 overflow-hidden">
              <TerminalThemed visible={showTerminal} />
            </div>
          )}
        </main>

        {/* AI Chat */}
        {showAiChat && (
          <aside className="w-64 border-l border-neutral-800 overflow-y-auto">
            <AIChatThemed />
          </aside>
        )}
      </div>
    </div>
  )
}
