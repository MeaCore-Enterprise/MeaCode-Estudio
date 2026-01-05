import React, { useState, useEffect, useRef } from 'react'

export type QuickOpenItem = {
  path: string
  name: string
  type: 'file' | 'folder'
}

export type QuickOpenProps = {
  items: QuickOpenItem[]
  onSelect: (item: QuickOpenItem) => void
  onClose: () => void
  visible: boolean
}

export const QuickOpen: React.FC<QuickOpenProps> = ({ items, onSelect, onClose, visible }) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [visible])

  const filteredItems = items.filter((item) => {
    if (!query) return true
    const lowerQuery = query.toLowerCase()
    return (
      item.name.toLowerCase().includes(lowerQuery) ||
      item.path.toLowerCase().includes(lowerQuery)
    )
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        onSelect(filteredItems[selectedIndex])
        onClose()
      }
      return
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 border-b border-neutral-800">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar archivo... (Ctrl+P)"
            className="w-full bg-transparent text-neutral-100 placeholder-neutral-500 outline-none text-sm px-2 py-1"
          />
        </div>
        <div
          ref={listRef}
          className="max-h-96 overflow-y-auto"
        >
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-sm">
              No se encontraron archivos
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.path}
                className={`
                  px-4 py-2 cursor-pointer flex items-center gap-2 text-sm
                  ${idx === selectedIndex ? 'bg-red-600/20 text-red-100' : 'text-neutral-300 hover:bg-neutral-800'}
                `}
                onClick={() => {
                  onSelect(item)
                  onClose()
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <span className="text-xs">
                  {item.type === 'file' ? '📄' : '📁'}
                </span>
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-xs text-neutral-500 truncate max-w-xs">{item.path}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

