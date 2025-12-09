import React, { useEffect, useState } from 'react'
import { MainEditor } from '../editor/MainEditor'
import { ExplorerPanel } from '../panels/ExplorerPanel'
import { TerminalThemed } from '../panels/TerminalThemed'
import { AIChatThemed } from '../panels/AIChatThemed'
import { getAppInfo, pingKernel } from '../ipc/bridge'

const DEFAULT_CONTENT = [
  '// MeaCode Studio · GPU-first AI IDE',
  '// MVP de escritorio con Tauri + Rust + LSP.',
  '// Usa el panel Explorer para abrir archivos reales del workspace.',
  '',
  'function helloMeaCode() {',
  '  console.log("Bienvenido a MeaCode Studio");',
  '}',
].join('\n')

type KernelStatus = 'idle' | 'ok' | 'error'

export const IdeLayout: React.FC = () => {
  const [appName, setAppName] = useState('MeaCode Studio')
  const [appVersion, setAppVersion] = useState('dev')
  const [kernelStatus, setKernelStatus] = useState<KernelStatus>('idle')
  const [editorContent, setEditorContent] = useState(DEFAULT_CONTENT)
  const [editorPath, setEditorPath] = useState<string | undefined>(undefined)
  const [showExplorer, setShowExplorer] = useState(true)
  const [showAiChat, setShowAiChat] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)

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

  const handleOpenFile = (file: { path: string; content: string }) => {
    setEditorPath(file.path)
    setEditorContent(file.content)
  }

  const kernelLabel =
    kernelStatus === 'ok' ? 'Kernel: OK' : kernelStatus === 'error' ? 'Kernel: ERROR' : 'Kernel: ...'

  const kernelClassName =
    kernelStatus === 'ok'
      ? 'rounded-full bg-red-600/20 px-2 py-0.5 text-red-400 border border-red-500/40'
      : kernelStatus === 'error'
      ? 'rounded-full bg-red-900/40 px-2 py-0.5 text-red-300 border border-red-500/60'
      : 'rounded-full bg-neutral-800/80 px-2 py-0.5 text-neutral-300 border border-neutral-700'

  const baseToggleButtonClass =
    'h-7 px-2 rounded-md border text-[10px] flex items-center justify-center gap-1 transition-colors'
  const activeToggleButtonClass = 'border-red-500/70 bg-red-600/40 text-red-50'
  const inactiveToggleButtonClass =
    'border-neutral-700 bg-neutral-900/80 text-neutral-300 hover:bg-red-600/40 hover:border-red-500/70 hover:text-red-50'

  const toggleExplorer = () => setShowExplorer((prev) => !prev)
  const toggleAiChat = () => setShowAiChat((prev) => !prev)
  const toggleTerminal = () => setShowTerminal((prev) => !prev)

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-neutral-200">
      {/* Top bar */}
      <header className="h-10 flex items-center justify-between px-3 md:px-5 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-wide text-sm text-red-400">{appName}</span>
            <span className="text-[11px] text-neutral-400">v{appVersion}</span>
          </div>
          <nav className="hidden md:flex items-center gap-3 text-[11px] text-neutral-400">
            <button className="hover:text-red-400">File</button>
            <button className="hover:text-red-400">Edit</button>
            <button className="hover:text-red-400">Selection</button>
            <button className="hover:text-red-400">View</button>
            <button className="hover:text-red-400">Run</button>
            <button className="hover:text-red-400">Help</button>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="hidden md:flex items-center gap-1 text-neutral-400">
            <button
              type="button"
              onClick={toggleExplorer}
              className={`${baseToggleButtonClass} ${
                showExplorer ? activeToggleButtonClass : inactiveToggleButtonClass
              }`}
              title="Toggle Explorer panel"
            >
              <span className="text-[12px]">📂</span>
            </button>
            <button
              type="button"
              onClick={toggleAiChat}
              className={`${baseToggleButtonClass} ${
                showAiChat ? activeToggleButtonClass : inactiveToggleButtonClass
              }`}
              title="Toggle AI Chat panel"
            >
              <span className="text-[12px]">🤖</span>
            </button>
            <button
              type="button"
              onClick={toggleTerminal}
              className={`${baseToggleButtonClass} ${
                showTerminal ? activeToggleButtonClass : inactiveToggleButtonClass
              }`}
              title="Toggle Terminal panel"
            >
              <span className="text-[12px]">⌨</span>
            </button>
          </div>
          <span className={kernelClassName}>{kernelLabel}</span>
          <div className="hidden md:flex items-center gap-1 text-neutral-300">
            <button
              type="button"
              className="h-7 w-7 rounded-md border border-neutral-700 bg-neutral-900/80 flex items-center justify-center text-[11px] hover:bg-red-600/40 hover:border-red-500/70"
            >
              ▶
            </button>
            <button
              type="button"
              className="h-7 w-7 rounded-md border border-neutral-700 bg-neutral-900/80 flex items-center justify-center text-[11px] hover:bg-red-600/40 hover:border-red-500/70"
            >
              🔍
            </button>
            <button
              type="button"
              className="h-7 w-7 rounded-md border border-neutral-700 bg-neutral-900/80 flex items-center justify-center text-[11px] hover:bg-red-600/40 hover:border-red-500/70"
            >
              ⚙
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left icon rail */}
        <aside className="w-12 border-r border-neutral-800 bg-neutral-950 flex flex-col items-center py-2 gap-1 text-[11px]">
          {[
            { label: '</>', title: 'Explorer', active: true },
            { label: '🐞', title: 'Debug', active: false, disabled: true },
            { label: '⚙', title: 'Settings', active: false, disabled: true },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              className={
                'h-9 w-9 flex items-center justify-center rounded-md text-neutral-300 text-[13px]' +
                (item.active ? ' bg-red-600/40 text-red-50' : ' hover:bg-red-600/20 hover:text-white') +
                (item.disabled
                  ? ' opacity-40 cursor-not-allowed hover:bg-transparent hover:text-neutral-400'
                  : '')
              }
              title={item.title + (item.disabled ? ' (coming soon)' : '')}
              disabled={!!item.disabled}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Explorer + main content */}
        {showExplorer && (
          <aside className="w-64 border-r border-neutral-800 bg-neutral-950/95">
            <ExplorerPanel onOpenFile={handleOpenFile} />
          </aside>
        )}

        <main className="flex-1 flex flex-col overflow-hidden bg-neutral-950/80">
          <div className="flex-1 flex overflow-hidden">
            <section
              className={
                showAiChat
                  ? 'flex-1 border-r border-neutral-800 bg-neutral-950'
                  : 'flex-1 bg-neutral-950'
              }
            >
              <MainEditor value={editorContent} onChange={setEditorContent} filePath={editorPath} />
            </section>
            {showAiChat && (
              <section className="w-80 border-l border-neutral-800 bg-neutral-950/95">
                <AIChatThemed />
              </section>
            )}
          </div>
          {showTerminal && (
            <section className="h-48 border-t border-red-600/40 bg-black/95">
              <TerminalThemed />
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
