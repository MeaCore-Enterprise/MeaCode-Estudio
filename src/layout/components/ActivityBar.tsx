import React from 'react'

export type ActivityBarProps = {
  showExplorer: boolean
  toggleExplorer: () => void
  showRunDebug: boolean
  toggleRunDebug: () => void
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  showExplorer,
  toggleExplorer,
  showRunDebug,
  toggleRunDebug,
}) => {
  const items = [
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
  ]

  return (
    <aside className="w-12 border-r border-neutral-800 bg-neutral-950 flex flex-col items-center py-2 gap-1 text-[11px]">
      {items.map((item, idx) => (
        <button
          key={idx}
          type="button"
          onClick={item.onClick}
          className={`h-9 w-9 flex items-center justify-center rounded-md text-neutral-300 transition-colors ${
            item.active ? 'bg-red-600/40 text-red-50' : 'hover:bg-red-600/20 hover:text-white'
          }`}
          title={item.title}
        >
          {item.icon}
        </button>
      ))}
    </aside>
  )
}
