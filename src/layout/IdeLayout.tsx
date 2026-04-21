import React, { useEffect, useState } from 'react'
import { MainEditor } from '../features/editor/MainEditor'
import { ExplorerPanel } from '../features/explorer/ExplorerPanel'
import { TerminalThemed } from '../features/terminal/TerminalThemed'
import { AIChatThemed } from '../features/ai/AIChatThemed'
import { QuickOpen, type QuickOpenItem } from '../shared/components/QuickOpen'
import { CommandPalette, type Command } from '../shared/components/CommandPalette'
import { SettingsPanel } from '../features/settings/SettingsPanel'
import { RunDebugPanel } from '../features/terminal/RunDebugPanel'
import { WelcomeScreen } from '../features/editor/WelcomeScreen'
import { getAppInfo, pingKernel, readFile, listDir, openFolder as openFolderDialog, openFile as openFileDialog, saveFileAs } from '../api/bridge'
import { useEditor } from '../shared/hooks/useEditor'
import { showToast } from '../shared/utils/toast'
import { loadFeatureFlags, type FeatureFlagsState } from '../shared/hooks/useFeatureFlags'
import { TopBar } from './components/TopBar'
import { ActivityBar } from './components/ActivityBar'

type KernelStatus = 'idle' | 'ok' | 'error'

export const IdeLayout: React.FC = () => {
  const [appName, setAppName] = useState('MeaCode Studio')
  const [appVersion, setAppVersion] = useState('dev')
  const [kernelStatus, setKernelStatus] = useState<KernelStatus>('idle')
  const [showExplorer, setShowExplorer] = useState(true)
  const [showAiChat, setShowAiChat] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)
  const [showRunDebug, setShowRunDebug] = useState(false)
  const [showQuickOpen, setShowQuickOpen] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [quickOpenItems, setQuickOpenItems] = useState<QuickOpenItem[]>([])
  const [workspacePath, setWorkspacePath] = useState<string | null>(null)
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagsState>(() => loadFeatureFlags())
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('meacode-welcome-dismissed')
    } catch {
      return true
    }
  })
  
  const {
    tabs,
    activeTabId,
    openFile,
    closeTab,
    setActiveTab,
    updateTabContent,
    markTabSaved,
    newFile,
  } = useEditor()
  
  // Load session state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('meacode-session')
      if (savedState) {
        const state = JSON.parse(savedState)
        setShowExplorer(state.showExplorer ?? true)
        setShowAiChat(state.showAiChat ?? true)
        setShowTerminal(state.showTerminal ?? true)
        setShowRunDebug(state.showRunDebug ?? false)
      }
    } catch (err) {
      console.error('Error loading session:', err)
    }
  }, [])

  // Save session state to localStorage
  useEffect(() => {
    const sessionState = {
      showExplorer,
      showAiChat,
      showTerminal,
      showRunDebug,
    }
    try {
      localStorage.setItem('meacode-session', JSON.stringify(sessionState))
    } catch (err) {
      console.error('Error saving session:', err)
    }
  }, [showExplorer, showAiChat, showTerminal, showRunDebug])

  // Reload feature flags when settings panel se cierra (o cada apertura)
  useEffect(() => {
    if (!showSettings) {
      setFeatureFlags(loadFeatureFlags())
    }
  }, [showSettings])

  // Aplicar flags que deshabilitan secciones
  useEffect(() => {
    if (!featureFlags.aiChat && showAiChat) {
      setShowAiChat(false)
    }
  }, [featureFlags.aiChat, showAiChat])

  // Load files for Quick Open
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const entries = await listDir()
        const items: QuickOpenItem[] = entries.map((entry) => ({
          path: entry.path,
          name: entry.name,
          type: entry.is_dir ? 'folder' : 'file',
        }))
        setQuickOpenItems(items)
      } catch (err) {
        console.error('Error loading files for Quick Open:', err)
      }
    }
    
    loadFiles()
  }, [])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N new file
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N') && !e.shiftKey) {
        e.preventDefault()
        newFile()
        setShowWelcome(false)
        return
      }

      // Ctrl+P for Quick Open
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault()
        setShowQuickOpen(true)
        return
      }

      // Ctrl+K for Command Palette (issue #17)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setShowCommandPalette(true)
        return
      }
      
      // Ctrl+Shift+P for Command Palette (fallback / alternative)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setShowCommandPalette(true)
        return
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [newFile])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
      if (!target.closest('.menu-container')) {
        setActiveMenu(null)
      }
    }

    if (showUserMenu || activeMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu, activeMenu])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const info = await getAppInfo()
        if (!cancelled) {
          setAppName(info.name)
          setAppVersion(info.version)
        }
      } catch {
        // ignore
      }

      try {
        setKernelStatus('idle')
        const res = await pingKernel()
        if (!cancelled) {
          setKernelStatus(res.status === 'ok' ? 'ok' : 'error')
        }
      } catch {
        if (!cancelled) setKernelStatus('error')
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const handleOpenFile = async (file: { path: string; content: string }) => {
    openFile(file.path, file.content)
  }
  
  const handleOpenFolder = async () => {
    const path = await openFolderDialog()
    if (path) {
      setWorkspacePath(path)
      try {
        localStorage.setItem('meacode-welcome-dismissed', 'true')
      } catch {
        // ignore
      }
      setShowWelcome(false)
      // Reload explorer with new path
      try {
        const entries = await listDir(path)
        const items: QuickOpenItem[] = entries.map((entry) => ({
          path: entry.path,
          name: entry.name,
          type: entry.is_dir ? 'folder' : 'file',
        }))
        setQuickOpenItems(items)
      } catch (err) {
        console.error('Error loading folder:', err)
      }
    }
    setActiveMenu(null)
  }
  
  const handleOpenFileMenu = async () => {
    const path = await openFileDialog()
    if (path) {
      const file = await readFile(path)
      if (file) {
        openFile(file.path, file.content)
      }
    }
    setActiveMenu(null)
  }
  
  const handleSaveAs = async () => {
    if (activeTabId) {
      const tab = tabs.find(t => t.id === activeTabId)
      if (tab) {
        const path = await saveFileAs(tab.content)
        if (path) {
          // Update tab with new path
          openFile(path, tab.content)
          markTabSaved(tab.id)
        }
      }
    }
    setActiveMenu(null)
  }
  
  const handleContentChange = (tabId: string, content: string) => {
    updateTabContent(tabId, content, true)
  }
  
  const handleTabSaved = (tabId: string) => {
    markTabSaved(tabId)
  }
  
  const handleQuickOpenSelect = async (item: QuickOpenItem) => {
    if (item.type === 'file') {
      const file = await readFile(item.path)
      if (file) {
        openFile(file.path, file.content)
      }
    }
  }

  const kernelLabel =
    kernelStatus === 'ok' 
      ? '🟢 Kernel: OK' 
      : kernelStatus === 'error' 
      ? '🔴 Kernel: Disconnected' 
      : '🟡 Kernel: Starting…'

  const kernelClassName =
    kernelStatus === 'ok'
      ? 'rounded-full bg-green-600/20 px-2 py-0.5 text-green-400 border border-green-500/40 cursor-default'
      : kernelStatus === 'error'
      ? 'rounded-full bg-red-900/40 px-2 py-0.5 text-red-300 border border-red-500/60 cursor-pointer hover:bg-red-900/60'
      : 'rounded-full bg-yellow-600/20 px-2 py-0.5 text-yellow-400 border border-yellow-500/40 cursor-default'
  
  const handleKernelClick = () => {
    if (kernelStatus === 'error') {
      // TODO: Mostrar detalles del error en un modal o tooltip
      console.log('Kernel disconnected. Click para ver detalles.')
    }
  }

  const baseToggleButtonClass =
    'h-7 px-2 rounded-md border text-[10px] flex items-center justify-center gap-1 transition-colors'
  const activeToggleButtonClass = 'border-red-500/70 bg-red-600/40 text-red-50'
  const inactiveToggleButtonClass =
    'border-neutral-700 bg-neutral-900/80 text-neutral-300 hover:bg-red-600/40 hover:border-red-500/70 hover:text-red-50'

  const toggleExplorer = () => {
    if (showRunDebug) {
      setShowRunDebug(false)
    }
    setShowExplorer((prev) => !prev)
  }
  const toggleRunDebug = () => {
    if (showExplorer) {
      setShowExplorer(false)
    }
    setShowRunDebug((prev) => !prev)
  }
  const toggleAiChat = () => setShowAiChat((prev) => !prev)
  const toggleTerminal = () => setShowTerminal((prev) => !prev)

  // Command Palette commands
  const commands: Command[] = [
    {
      id: 'file.new',
      label: 'New File',
      category: 'File',
      action: () => {
        newFile()
        setShowWelcome(false)
      },
      shortcut: 'Ctrl+N',
    },
    {
      id: 'file.open',
      label: 'Open File...',
      category: 'File',
      action: () => {
        handleOpenFileMenu()
      },
      shortcut: 'Ctrl+O',
    },
    {
      id: 'file.openFolder',
      label: 'Open Folder...',
      category: 'File',
      action: () => {
        handleOpenFolder()
      },
      shortcut: 'Ctrl+K Ctrl+O',
    },
    {
      id: 'file.save',
      label: 'Save',
      category: 'File',
      action: () => {
        if (activeTabId) {
          const tab = tabs.find(t => t.id === activeTabId)
          if (tab && tab.modified) {
            // TODO: Trigger save
            console.log('Save', tab.path)
          }
        }
      },
      shortcut: 'Ctrl+S',
    },
    {
      id: 'view.explorer',
      label: 'Toggle Explorer',
      category: 'View',
      action: () => {
        toggleExplorer()
      },
    },
    {
      id: 'view.terminal',
      label: 'Toggle Terminal',
      category: 'View',
      action: () => {
        toggleTerminal()
      },
    },
    {
      id: 'view.aichat',
      label: 'Toggle AI Chat',
      category: 'View',
      action: () => {
        if (!featureFlags.aiChat) {
          showToast('AI Chat está deshabilitado (Settings → Experimental)', 'info')
          return
        }
        toggleAiChat()
      },
    },
    {
      id: 'view.quickopen',
      label: 'Quick Open...',
      category: 'View',
      action: () => {
        setShowQuickOpen(true)
      },
      shortcut: 'Ctrl+P',
    },
    {
      id: 'view.settings',
      label: 'Open Settings',
      category: 'View',
      action: () => {
        setShowSettings(true)
      },
      shortcut: 'Ctrl+,',
    },
    {
      id: 'run.debug',
      label: 'Start Debugging',
      category: 'Run',
      action: () => {
        showToast('Debugger en desarrollo (próximamente)', 'info')
      },
      shortcut: 'F5',
    },
    {
      id: 'run.run',
      label: 'Run Without Debugging',
      category: 'Run',
      action: () => {
        showToast('Ejecutar sin debugger en desarrollo (próximamente)', 'info')
      },
      shortcut: 'Ctrl+F5',
    },
  ]

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-neutral-200">
      <QuickOpen
        items={quickOpenItems}
        onSelect={handleQuickOpenSelect}
        onClose={() => setShowQuickOpen(false)}
        visible={showQuickOpen}
      />
      <CommandPalette
        visible={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commands}
      />
      <TopBar
        appName={appName}
        appVersion={appVersion}
        kernelLabel={kernelLabel}
        kernelClassName={kernelClassName}
        handleKernelClick={handleKernelClick}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        showAiChat={showAiChat}
        toggleAiChat={toggleAiChat}
        showTerminal={showTerminal}
        toggleTerminal={toggleTerminal}
        newFile={newFile}
        handleOpenFileMenu={handleOpenFileMenu}
        handleOpenFolder={handleOpenFolder}
        handleSaveAs={handleSaveAs}
        setShowWelcome={setShowWelcome}
        setShowSettings={setShowSettings}
        baseToggleButtonClass={baseToggleButtonClass}
        activeToggleButtonClass={activeToggleButtonClass}
        inactiveToggleButtonClass={inactiveToggleButtonClass}
      />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar
          showExplorer={showExplorer}
          toggleExplorer={toggleExplorer}
          showRunDebug={showRunDebug}
          toggleRunDebug={toggleRunDebug}
        />

        {/* Explorer or Run/Debug - Mutually exclusive - Layout responsivo */}
        {showExplorer && (
          <aside className="w-64 border-r border-neutral-800 bg-neutral-950/95 flex-shrink-0">
            <ExplorerPanel onOpenFile={handleOpenFile} rootPath={workspacePath || undefined} />
          </aside>
        )}
        {showRunDebug && (
          <aside className="w-64 border-r border-neutral-800 bg-neutral-950/95 flex-shrink-0">
            <RunDebugPanel />
          </aside>
        )}

        <main className="flex-1 flex flex-col overflow-hidden bg-neutral-950/80 min-w-0">
          {showWelcome && !workspacePath ? (
            <WelcomeScreen
              onOpenFolder={handleOpenFolder}
              onCreateProject={() => showToast('Crear proyecto llegará pronto', 'info')}
            />
          ) : (
            <>
              {/* Editor and side panels - Fixed height, no shrink */}
              <div className="flex-1 flex overflow-hidden min-w-0" style={{ minHeight: 0, maxHeight: '100%' }}>
                <section className="flex-1 min-w-0 bg-neutral-950" style={{ minWidth: 0, maxWidth: '100%' }}>
                  <MainEditor
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabClick={setActiveTab}
                    onTabClose={closeTab}
                    onContentChange={handleContentChange}
                    onTabSaved={handleTabSaved}
                    onOpenFolder={handleOpenFolder}
                    onOpenFile={handleOpenFileMenu}
                    onNewFile={() => {
                      newFile()
                      setShowWelcome(false)
                    }}
                  />
                </section>
                {showAiChat && featureFlags.aiChat && (
                  <section 
                    className="border-l border-neutral-800 bg-neutral-950/95" 
                    style={{ 
                      width: '320px', 
                      minWidth: '320px', 
                      maxWidth: '320px',
                      flexShrink: 0,
                      flexGrow: 0
                    }}
                  >
                    <AIChatThemed />
                  </section>
                )}
                {showSettings && (
                  <section 
                    className="border-l border-neutral-800 bg-neutral-950/95" 
                    style={{ 
                      width: '320px', 
                      minWidth: '320px', 
                      maxWidth: '320px',
                      flexShrink: 0,
                      flexGrow: 0
                    }}
                  >
                    <SettingsPanel
                      visible={showSettings}
                      onClose={() => setShowSettings(false)}
                    />
                  </section>
                )}
              </div>
              {/* Bottom panel - Terminal only */}
              {showTerminal && (
                <div 
                  className="flex border-t border-neutral-800" 
                  style={{ 
                    height: '200px', 
                    minHeight: '200px', 
                    maxHeight: '200px',
                    flexShrink: 0,
                    flexGrow: 0
                  }}
                >
                  <section className="flex-1 min-w-0" style={{ minWidth: 0 }}>
                  <TerminalThemed visible={showTerminal} />
                </section>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
