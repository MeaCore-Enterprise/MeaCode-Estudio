import React, { useEffect, useState, useRef } from 'react'

export type Command = {
  id: string
  label: string
  category: string
  action: () => void
  shortcut?: string
}

export type CommandPaletteProps = {
  visible: boolean
  onClose: () => void
  commands: Command[]
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  visible,
  onClose,
  commands,
}) => {
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

  const filteredCommands = commands.filter((cmd) => {
    if (!query) return true
    const lowerQuery = query.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery) ||
      cmd.id.toLowerCase().includes(lowerQuery)
    )
  })

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = []
    }
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  const flatCommands = Object.values(groupedCommands).flat()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, flatCommands.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (flatCommands[selectedIndex]) {
        flatCommands[selectedIndex].action()
        onClose()
      }
      return
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && flatCommands[selectedIndex]) {
      const selectedElement = listRef.current.querySelector(
        `[data-command-id="${flatCommands[selectedIndex].id}"]`
      ) as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, flatCommands])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-neutral-800">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-neutral-100 text-sm outline-none placeholder-neutral-500"
          />
        </div>
        <div
          ref={listRef}
          className="max-h-96 overflow-y-auto"
        >
          {flatCommands.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-sm">
              No commands found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-950/50">
                  {category}
                </div>
                {cmds.map((cmd, idx) => {
                  const flatIndex = flatCommands.findIndex((c) => c.id === cmd.id)
                  const isSelected = flatIndex === selectedIndex
                  return (
                    <div
                      key={cmd.id}
                      data-command-id={cmd.id}
                      className={`px-4 py-2 cursor-pointer flex items-center justify-between text-sm ${
                        isSelected
                          ? 'bg-red-600/20 text-red-100'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                      onClick={() => {
                        cmd.action()
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(flatIndex)}
                    >
                      <span>{cmd.label}</span>
                      {cmd.shortcut && (
                        <span className="text-xs text-neutral-500 ml-4">
                          {cmd.shortcut}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

