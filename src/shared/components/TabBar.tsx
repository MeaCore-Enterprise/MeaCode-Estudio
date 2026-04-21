import React from 'react'

export type Tab = {
  id: string
  path: string
  name: string
  content: string
  modified: boolean
  language?: string
}

export type TabBarProps = {
  tabs: Tab[]
  activeTabId: string | null
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onTabCloseOthers?: (tabId: string) => void
  onTabCloseAll?: () => void
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabCloseOthers,
  onTabCloseAll,
}) => {
  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault()
    // TODO: Implementar menú contextual
  }

  const getFileName = (path: string) => {
    const parts = path.split(/[/\\]/)
    return parts[parts.length - 1] || path
  }

  if (tabs.length === 0) {
    return (
      <div className="h-8 flex items-center border-b border-neutral-800 bg-neutral-900/70 px-3 text-xs text-neutral-400">
        <span>No hay archivos abiertos</span>
      </div>
    )
  }

  return (
    <div className="h-8 flex items-center border-b border-neutral-800 bg-neutral-900/70 overflow-x-auto overflow-y-hidden">
      <div className="flex items-center h-full min-w-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              className={`tab-item
                h-full flex items-center gap-1.5 px-3 border-r border-neutral-800 cursor-pointer
                transition-colors min-w-[120px] max-w-[240px] group
                ${isActive ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-900/50 text-neutral-400 hover:bg-neutral-900/80'}
              `}
              onClick={() => onTabClick(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              title={tab.path}
              tabIndex={0}
            >
              <span className="truncate text-[11px] flex-1">{getFileName(tab.name)}</span>
              {tab.modified && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" title="Sin guardar" />
              )}
              <button
                className={`
                  w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100
                  hover:bg-neutral-700 transition-opacity flex-shrink-0
                  ${isActive ? 'opacity-100' : ''}
                `}
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                title="Cerrar pestaña"
              >
                <span className="text-[10px] leading-none">×</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

