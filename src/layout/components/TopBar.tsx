import React from 'react'

export type TopBarProps = {
  appName: string
  appVersion: string
  kernelLabel: string
  kernelClassName: string
  handleKernelClick: () => void
  activeMenu: string | null
  setActiveMenu: (menu: string | null) => void
  showUserMenu: boolean
  setShowUserMenu: (show: boolean) => void
  showAiChat: boolean
  toggleAiChat: () => void
  showTerminal: boolean
  toggleTerminal: () => void
  newFile: () => void
  handleOpenFileMenu: () => void
  handleOpenFolder: () => void
  handleSaveAs: () => void
  setShowWelcome: (show: boolean) => void
  setShowSettings: (show: boolean) => void
  baseToggleButtonClass: string
  activeToggleButtonClass: string
  inactiveToggleButtonClass: string
}

export const TopBar: React.FC<TopBarProps> = ({
  appName,
  appVersion,
  kernelLabel,
  kernelClassName,
  handleKernelClick,
  activeMenu,
  setActiveMenu,
  showUserMenu,
  setShowUserMenu,
  showAiChat,
  toggleAiChat,
  showTerminal,
  toggleTerminal,
  newFile,
  handleOpenFileMenu,
  handleOpenFolder,
  handleSaveAs,
  setShowWelcome,
  setShowSettings,
  baseToggleButtonClass,
  activeToggleButtonClass,
  inactiveToggleButtonClass,
}) => {
  return (
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
                <button
                  type="button"
                  onClick={() => {
                    newFile()
                    setShowWelcome(false)
                    setActiveMenu(null)
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New File</span>
                  <span className="ml-auto text-[10px] text-neutral-500">Ctrl+N</span>
                </button>
                <button 
                  onClick={handleOpenFileMenu}
                  className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span>Open File...</span>
                  <span className="ml-auto text-[10px] text-neutral-500">Ctrl+O</span>
                </button>
                <button 
                  onClick={handleOpenFolder}
                  className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                >
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
                <button 
                  onClick={handleSaveAs}
                  className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <span>Save As...</span>
                  <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Shift+S</span>
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
                  <span>Undo</span>
                  <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Z</span>
                </button>
                <button className="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                  <span>Redo</span>
                  <span className="ml-auto text-[10px] text-neutral-500">Ctrl+Shift+Z</span>
                </button>
              </div>
            )}
          </div>
          
          {/* ... other menus ... */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <span 
          className={kernelClassName}
          onClick={handleKernelClick}
        >
          {kernelLabel}
        </span>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="h-7 w-7 rounded-md border border-neutral-700 bg-neutral-900/80 flex items-center justify-center hover:bg-red-600/40"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
