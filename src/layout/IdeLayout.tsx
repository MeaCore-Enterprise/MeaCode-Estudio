import React, { useEffect, useState } from 'react'
import { MainEditor } from '../editor/MainEditor'
import { ExplorerPanel } from '../panels/ExplorerPanel'
import { TerminalThemed } from '../panels/TerminalThemed'
import { AIChatThemed } from '../panels/AIChatThemed'
import { QuickOpen, type QuickOpenItem } from '../components/QuickOpen'
import { CommandPalette, type Command } from '../components/CommandPalette'
import { SettingsPanel } from '../settings/SettingsPanel'
import { RunDebugPanel } from '../panels/RunDebugPanel'
import { getAppInfo, pingKernel, readFile, listDir } from '../ipc/bridge'
import { useEditor } from '../hooks/useEditor'

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
  
  const {
    tabs,
    activeTabId,
    openFile,
    closeTab,
    setActiveTab,
    updateTabContent,
    markTabSaved,
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
      // Ctrl+P for Quick Open
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault()
        setShowQuickOpen(true)
        return
      }
      
      // Ctrl+Shift+P for Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setShowCommandPalette(true)
        return
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
        // TODO: Implement new file
        console.log('New File')
      },
      shortcut: 'Ctrl+N',
    },
    {
      id: 'file.open',
      label: 'Open File...',
      category: 'File',
      action: () => {
        setShowQuickOpen(true)
      },
      shortcut: 'Ctrl+O',
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
        // TODO: Implement debug
        console.log('Start Debugging')
      },
      shortcut: 'F5',
    },
    {
      id: 'run.run',
      label: 'Run Without Debugging',
      category: 'Run',
      action: () => {
        // TODO: Implement run
        console.log('Run')
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
      {/* Top bar */}
      <header className="h-10 flex items-center justify-between px-3 md:px-5 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-wide text-sm text-red-400">{appName}</span>
            <span className="text-[11px] text-neutral-400">v{appVersion}</span>
          </div>
          <nav className="hidden md:flex items-center gap-3 text-[11px] text-neutral-400">
            {/* File Menu */}
            <div className="relative menu-container">
              <button 
                className="hover:text-red-400 px-1 py-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveMenu(activeMenu === 'file' ? null : 'file')
                }}
              >
                File
              </button>
              {activeMenu === 'file' && (
                <div className="absolute left-0 top-8 w-56 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50 py-1"
                     onClick={(e) => e.stopPropagation()}>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New File</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+N</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span>Open File...</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+O</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h12a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                    <span>Open Folder...</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+K Ctrl+O</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Save</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+S</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span>Save As...</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Shift+S</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Close Editor</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+W</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Exit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="relative menu-container">
              <button 
                className="hover:text-red-400 px-1 py-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveMenu(activeMenu === 'edit' ? null : 'edit')
                }}
              >
                Edit
              </button>
              {activeMenu === 'edit' && (
                <div className="absolute left-0 top-8 w-56 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50 py-1"
                     onClick={(e) => e.stopPropagation()}>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Undo</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Z</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Redo</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Shift+Z</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Cut</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+X</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+C</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Paste</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+V</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+F</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Replace</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+H</span>
                  </button>
                </div>
              )}
            </div>

            {/* Selection Menu */}
            <div className="relative menu-container">
              <button 
                className="hover:text-red-400 px-1 py-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveMenu(activeMenu === 'selection' ? null : 'selection')
                }}
              >
                Selection
              </button>
              {activeMenu === 'selection' && (
                <div className="absolute left-0 top-8 w-56 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50 py-1"
                     onClick={(e) => e.stopPropagation()}>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <span>Select All</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+A</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <span>Expand Selection</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Shift+→</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <span>Shrink Selection</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Shift+←</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <span>Select Line</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+L</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <span>Add Cursor Above</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Alt+↑</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <span>Add Cursor Below</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Alt+↓</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="relative menu-container">
              <button 
                className="hover:text-red-400 px-1 py-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveMenu(activeMenu === 'view' ? null : 'view')
                }}
              >
                View
              </button>
              {activeMenu === 'view' && (
                <div className="absolute left-0 top-8 w-56 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50 py-1"
                     onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    onClick={() => {
                      toggleExplorer()
                      setActiveMenu(null)
                    }}
                  >
                    <span>Explorer</span>
                    <span className="ml-auto text-[10px] text-neutral-500">{showExplorer ? '✓' : ''}</span>
                  </button>
                  <button 
                    className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    onClick={() => {
                      toggleRunDebug()
                      setActiveMenu(null)
                    }}
                  >
                    <span>Run and Debug</span>
                    <span className="ml-auto text-[10px] text-neutral-500">{showRunDebug ? '✓' : ''}</span>
                  </button>
                  <button 
                    className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    onClick={() => {
                      setShowTerminal(!showTerminal)
                      setActiveMenu(null)
                    }}
                  >
                    <span>Terminal</span>
                    <span className="ml-auto text-[10px] text-neutral-500">{showTerminal ? '✓' : ''}</span>
                  </button>
                  <button 
                    className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    onClick={() => {
                      setShowAiChat(!showAiChat)
                      setActiveMenu(null)
                    }}
                  >
                    <span>AI Chat</span>
                    <span className="ml-auto text-[10px] text-neutral-500">{showAiChat ? '✓' : ''}</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button 
                    className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    onClick={() => {
                      setShowQuickOpen(true)
                      setActiveMenu(null)
                    }}
                  >
                    <span>Quick Open...</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+P</span>
                  </button>
                  <button 
                    className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    onClick={() => {
                      setShowSettings(true)
                      setActiveMenu(null)
                    }}
                  >
                    <span>Settings</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+,</span>
                  </button>
                </div>
              )}
            </div>

            {/* Run Menu */}
            <div className="relative menu-container">
              <button 
                className="hover:text-red-400 px-1 py-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveMenu(activeMenu === 'run' ? null : 'run')
                }}
              >
                Run
              </button>
              {activeMenu === 'run' && (
                <div className="absolute left-0 top-8 w-56 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50 py-1"
                     onClick={(e) => e.stopPropagation()}>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Start Debugging</span>
                    <span className="ml-auto text-[10px] text-neutral-500">F5</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Run Without Debugging</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+F5</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z" />
                    </svg>
                    <span>Stop</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Shift+F5</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <span>Toggle Breakpoint</span>
                    <span className="ml-auto text-[10px] text-neutral-500">F9</span>
                  </button>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <div className="relative menu-container">
              <button 
                className="hover:text-red-400 px-1 py-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveMenu(activeMenu === 'help' ? null : 'help')
                }}
              >
                Help
              </button>
              {activeMenu === 'help' && (
                <div className="absolute left-0 top-8 w-56 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50 py-1"
                     onClick={(e) => e.stopPropagation()}>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Welcome</span>
                  </button>
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Documentation</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Keyboard Shortcuts</span>
                    <span className="ml-auto text-[10px] text-neutral-500">Ctrl+K Ctrl+S</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                    <span>About MeaCode Studio</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="hidden md:flex items-center gap-1 text-neutral-400">
            <button
              type="button"
              onClick={toggleAiChat}
              className={`${baseToggleButtonClass} ${
                showAiChat ? activeToggleButtonClass : inactiveToggleButtonClass
              }`}
              title="Toggle AI Chat panel"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={toggleTerminal}
              className={`${baseToggleButtonClass} ${
                showTerminal ? activeToggleButtonClass : inactiveToggleButtonClass
              }`}
              title="Toggle Terminal panel"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <span 
            className={kernelClassName}
            onClick={handleKernelClick}
            title={kernelStatus === 'error' ? 'Click para ver detalles' : undefined}
          >
            {kernelLabel}
          </span>
          <div className="hidden md:flex items-center gap-1 text-neutral-300">
            <button
              type="button"
              className="h-7 w-7 rounded-md border border-neutral-700 bg-neutral-900/80 flex items-center justify-center text-[11px] hover:bg-red-600/40 hover:border-red-500/70"
              title="Buscar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <div className="relative user-menu-container">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowUserMenu((prev) => !prev)
                }}
                className="h-7 w-7 rounded-md border border-neutral-700 bg-neutral-900/80 flex items-center justify-center text-[11px] hover:bg-red-600/40 hover:border-red-500/70"
                title="Usuario"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-8 w-48 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50 py-1"
                     onClick={(e) => e.stopPropagation()}>
                  <button
                    className="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    onClick={() => {
                      setShowUserMenu(false)
                      // TODO: Implementar perfil de usuario
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Perfil</span>
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    onClick={() => {
                      setShowUserMenu(false)
                      setShowSettings(true)
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Preferencias</span>
                  </button>
                  <div className="border-t border-neutral-800 my-1" />
                  <button
                    className="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    onClick={() => {
                      setShowUserMenu(false)
                      // TODO: Implementar cierre de sesión
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSettings((prev) => !prev)
                setShowUserMenu(false)
              }}
              className="h-7 w-7 rounded-md border border-neutral-700 bg-neutral-900/80 flex items-center justify-center text-[11px] hover:bg-red-600/40 hover:border-red-500/70"
              title="Configuración"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left icon rail */}
        <aside className="w-12 border-r border-neutral-800 bg-neutral-950 flex flex-col items-center py-2 gap-1 text-[11px]">
          {[
            { 
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              ),
              title: 'Explorer', 
              active: showExplorer, 
              onClick: toggleExplorer
            },
            { 
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              ),
              title: 'Run and Debug', 
              active: showRunDebug, 
              onClick: toggleRunDebug
            },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={item.onClick}
              className={
                'h-9 w-9 flex items-center justify-center rounded-md text-neutral-300 transition-colors' +
                (item.active ? ' bg-red-600/40 text-red-50' : ' hover:bg-red-600/20 hover:text-white')
              }
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
        </aside>

        {/* Explorer or Run/Debug - Mutually exclusive - Layout responsivo */}
        {showExplorer && (
          <aside className="w-64 border-r border-neutral-800 bg-neutral-950/95 flex-shrink-0">
            <ExplorerPanel onOpenFile={handleOpenFile} />
          </aside>
        )}
        {showRunDebug && (
          <aside className="w-64 border-r border-neutral-800 bg-neutral-950/95 flex-shrink-0">
            <RunDebugPanel />
          </aside>
        )}

        <main className="flex-1 flex flex-col overflow-hidden bg-neutral-950/80 min-w-0">
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
              />
            </section>
            {showAiChat && (
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
                <TerminalThemed />
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
