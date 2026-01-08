import React, { useEffect, useState, useCallback } from 'react'
import type { FileEntry } from '../ipc/bridge'
import { listDir, readFile } from '../ipc/bridge'

export type ExplorerPanelProps = {
  onOpenFile: (file: { path: string; content: string }) => void
  rootPath?: string
  activeFilePath?: string
}

type ExplorerNode = {
  entry: FileEntry
  children?: ExplorerNode[]
  expanded: boolean
  loaded: boolean
}

export const ExplorerPanel: React.FC<ExplorerPanelProps> = ({ onOpenFile, rootPath, activeFilePath }) => {
  const [rootNodes, setRootNodes] = useState<ExplorerNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDirectory = useCallback(async (path: string): Promise<FileEntry[]> => {
    try {
      return await listDir(path)
    } catch (err) {
      console.error(`Error loading directory ${path}:`, err)
      return []
    }
  }, [])

  const buildTree = useCallback(async (entries: FileEntry[]): Promise<ExplorerNode[]> => {
    // Sort: directories first, then files, both alphabetically
    const sorted = [...entries].sort((a, b) => {
      if (a.is_dir && !b.is_dir) return -1
      if (!a.is_dir && b.is_dir) return 1
      return a.name.localeCompare(b.name)
    })

    return sorted.map((entry) => ({
      entry,
      expanded: false,
      loaded: false,
    }))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const entries = await loadDirectory(rootPath || '.')
        if (!cancelled) {
          const nodes = await buildTree(entries)
          setRootNodes(nodes)
        }
      } catch (err) {
        console.error('Error loading directory', err)
        if (!cancelled) setError('No se pudo leer el directorio de trabajo')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [rootPath, loadDirectory, buildTree])

  const toggleNode = async (node: ExplorerNode) => {
    if (!node.entry.is_dir) {
      // Open file
      const file = await readFile(node.entry.path)
      if (file) {
        onOpenFile(file)
      }
      return
    }

    // Toggle directory
    if (!node.loaded) {
      // Load children
      const children = await loadDirectory(node.entry.path)
      const childNodes = await buildTree(children)
      
      setRootNodes((prev) => {
        const updateNode = (n: ExplorerNode): ExplorerNode => {
          if (n.entry.path === node.entry.path) {
            return {
              ...n,
              expanded: true,
              loaded: true,
              children: childNodes,
            }
          }
          if (n.children) {
            return {
              ...n,
              children: n.children.map(updateNode),
            }
          }
          return n
        }
        return prev.map(updateNode)
      })
    } else {
      // Just toggle expansion
      setRootNodes((prev) => {
        const updateNode = (n: ExplorerNode): ExplorerNode => {
          if (n.entry.path === node.entry.path) {
            return { ...n, expanded: !n.expanded }
          }
          if (n.children) {
            return {
              ...n,
              children: n.children.map(updateNode),
            }
          }
          return n
        }
        return prev.map(updateNode)
      })
    }
  }

  const renderNode = (node: ExplorerNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.entry.is_dir && node.children && node.children.length > 0
    const isExpanded = node.expanded && hasChildren
    const isActive = !node.entry.is_dir && activeFilePath === node.entry.path

    return (
      <div key={node.entry.path}>
        <button
          type="button"
          onClick={() => toggleNode(node)}
          className={`explorer-file-item
            flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left
            text-[11px] transition-all duration-150
            ${isActive 
              ? 'bg-red-600/30 text-red-100 border-l-2 border-red-500' 
              : 'hover:bg-neutral-800 text-neutral-200 hover:text-neutral-100'
            }
            ${node.entry.is_dir ? 'font-medium' : 'font-normal'}
          `}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          tabIndex={0}
        >
          <span className="text-xs flex-shrink-0 w-4 text-center">
            {node.entry.is_dir ? (
              isExpanded ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              )
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </span>
          <span className="truncate flex-1">{node.entry.name}</span>
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 border-r border-neutral-800 bg-neutral-950/95 flex flex-col">
      <div className="px-3 py-2 border-b border-neutral-800">
        <div className="font-semibold text-sm text-neutral-200">Explorer</div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {loading && <div className="text-neutral-500 text-xs py-2">Cargando archivos...</div>}
        {error && <div className="text-red-400 text-[11px] py-2">{error}</div>}
        {!loading && !error && (
          <div className="space-y-0.5">
            {rootNodes.map((node) => renderNode(node))}
          </div>
        )}
      </div>
    </div>
  )
}
