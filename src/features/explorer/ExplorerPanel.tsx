import React, { useEffect, useState, useCallback, useRef } from 'react'
import type { FileEntry } from '../../api/bridge'
import { listDir, readFile, createFile, createDir, deleteItem, renameItem } from '../../api/bridge'
import { ContextMenu, type ContextMenuItem } from '../../shared/components/ContextMenu'
import { showToast } from '../../shared/utils/toast'

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

  const expandedPaths = useRef<Set<string>>(new Set())

  // Estados para Context Menu y CRUD
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; node: ExplorerNode | null; isRoot?: boolean }>({ visible: false, x: 0, y: 0, node: null })
  const [renamingNode, setRenamingNode] = useState<ExplorerNode | null>(null)
  const [creatingItem, setCreatingItem] = useState<{ parentPath: string; isDir: boolean } | null>(null)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if ((renamingNode || creatingItem) && inputRef.current) {
      inputRef.current.focus()
      // Si estamos renombrando un archivo, seleccionar solo el nombre, no la extensión
      if (renamingNode && !renamingNode.entry.is_dir) {
        const dotIndex = inputValue.lastIndexOf('.')
        if (dotIndex > 0) {
          inputRef.current.setSelectionRange(0, dotIndex)
        } else {
          inputRef.current.select()
        }
      } else {
        inputRef.current.select()
      }
    }
  }, [renamingNode, creatingItem])

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

    const nodes: ExplorerNode[] = []
    for (const entry of sorted) {
      const isExpanded = expandedPaths.current.has(entry.path)
      let children: ExplorerNode[] | undefined = undefined
      let loaded = false
      
      if (isExpanded && entry.is_dir) {
        const childEntries = await loadDirectory(entry.path)
        children = await buildTree(childEntries)
        loaded = true
      }
      
      nodes.push({
        entry,
        expanded: isExpanded,
        loaded,
        children
      })
    }
    return nodes
  }, [loadDirectory])

  const refreshTree = useCallback(async () => {
    try {
      const entries = await loadDirectory(rootPath || '.')
      const nodes = await buildTree(entries)
      setRootNodes(nodes)
    } catch (err) {
      console.error('Error refreshing tree', err)
    }
  }, [rootPath, loadDirectory, buildTree])

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
    return () => { cancelled = true }
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
    const newExpanded = !node.expanded
    if (newExpanded) {
      expandedPaths.current.add(node.entry.path)
    } else {
      expandedPaths.current.delete(node.entry.path)
    }

    if (!node.loaded && newExpanded) {
      const children = await loadDirectory(node.entry.path)
      const childNodes = await buildTree(children)
      
      setRootNodes((prev) => {
        const updateNode = (n: ExplorerNode): ExplorerNode => {
          if (n.entry.path === node.entry.path) {
            return { ...n, expanded: true, loaded: true, children: childNodes }
          }
          if (n.children) return { ...n, children: n.children.map(updateNode) }
          return n
        }
        return prev.map(updateNode)
      })
    } else {
      setRootNodes((prev) => {
        const updateNode = (n: ExplorerNode): ExplorerNode => {
          if (n.entry.path === node.entry.path) {
            return { ...n, expanded: newExpanded }
          }
          if (n.children) return { ...n, children: n.children.map(updateNode) }
          return n
        }
        return prev.map(updateNode)
      })
    }
  }

  // --- Manejo de Context Menu ---
  const handleContextMenu = (e: React.MouseEvent, node?: ExplorerNode, isRoot: boolean = false) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node: node || null,
      isRoot
    })
  }

  // --- Acciones CRUD ---
  const actionNewFile = () => {
    if (contextMenu.node && contextMenu.node.entry.is_dir) {
      // Expandir carpeta automáticamente si creamos algo dentro
      expandedPaths.current.add(contextMenu.node.entry.path)
      setCreatingItem({ parentPath: contextMenu.node.entry.path, isDir: false })
    } else {
      setCreatingItem({ parentPath: rootPath || '.', isDir: false })
    }
    setInputValue('')
    // Refrescar para que la carpeta se expanda antes de renderizar el input
    refreshTree()
  }

  const actionNewDir = () => {
    if (contextMenu.node && contextMenu.node.entry.is_dir) {
      expandedPaths.current.add(contextMenu.node.entry.path)
      setCreatingItem({ parentPath: contextMenu.node.entry.path, isDir: true })
    } else {
      setCreatingItem({ parentPath: rootPath || '.', isDir: true })
    }
    setInputValue('')
    refreshTree()
  }

  const actionRename = () => {
    if (!contextMenu.node) return
    setRenamingNode(contextMenu.node)
    setInputValue(contextMenu.node.entry.name)
  }

  const actionDelete = async () => {
    if (!contextMenu.node) return
    const success = await deleteItem(contextMenu.node.entry.path)
    if (success) {
      showToast('Elemento eliminado', 'success')
      refreshTree()
    }
  }

  // Confirmar creación o renombrado
  const handleInputConfirm = async () => {
    if (!inputValue.trim()) {
      handleInputCancel()
      return
    }

    const separator = navigator.platform.toLowerCase().includes('win') ? '\\' : '/'

    if (creatingItem) {
      const fullPath = `${creatingItem.parentPath}${creatingItem.parentPath === rootPath ? separator : separator}${inputValue}`
      let success = false
      if (creatingItem.isDir) {
        success = await createDir(fullPath)
      } else {
        success = await createFile(fullPath)
      }

      if (success) {
        showToast(`Creado: ${inputValue}`, 'success')
        await refreshTree()
        if (!creatingItem.isDir) {
          const file = await readFile(fullPath)
          if (file) onOpenFile(file)
        }
      } else {
        showToast('Error al crear el elemento', 'error')
      }
    } else if (renamingNode) {
      if (inputValue !== renamingNode.entry.name) {
        const oldPathStr = renamingNode.entry.path
        const lastSlash = Math.max(oldPathStr.lastIndexOf('/'), oldPathStr.lastIndexOf('\\'))
        const dirPath = oldPathStr.substring(0, lastSlash)
        const newPath = `${dirPath}${separator}${inputValue}`
        
        const success = await renameItem(oldPathStr, newPath)
        if (success) {
          showToast(`Renombrado a: ${inputValue}`, 'success')
          refreshTree()
        } else {
          showToast('Error al renombrar', 'error')
        }
      }
    }
    
    handleInputCancel()
  }

  const handleInputCancel = () => {
    setCreatingItem(null)
    setRenamingNode(null)
    setInputValue('')
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputConfirm()
    } else if (e.key === 'Escape') {
      handleInputCancel()
    }
  }

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'new-file',
      label: 'Nuevo Archivo',
      action: actionNewFile,
    },
    {
      id: 'new-folder',
      label: 'Nueva Carpeta',
      action: actionNewDir,
    },
    ...(contextMenu.node ? [
      { id: 'sep1', label: '-', separator: true, action: () => {} },
      {
        id: 'rename',
        label: 'Renombrar',
        action: actionRename,
      },
      {
        id: 'delete',
        label: 'Eliminar',
        action: actionDelete,
      }
    ] : [])
  ]

  const renderInputBox = (depth: number) => {
    return (
      <div 
        className="flex w-full items-center gap-1.5 rounded px-1.5 py-1"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <span className="text-xs flex-shrink-0 w-4 text-center text-neutral-400">
          {(creatingItem?.isDir || (renamingNode && renamingNode.entry.is_dir)) ? (
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          ) : (
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputConfirm}
          className="flex-1 bg-neutral-900 border border-red-500 rounded px-1 text-[11px] text-neutral-200 focus:outline-none"
        />
      </div>
    )
  }

  const renderNode = (node: ExplorerNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.entry.is_dir && node.children && node.children.length > 0
    const isExpanded = node.expanded && hasChildren
    const isActive = !node.entry.is_dir && activeFilePath === node.entry.path
    const isRenaming = renamingNode?.entry.path === node.entry.path

    return (
      <div key={node.entry.path}>
        {isRenaming ? (
          renderInputBox(depth)
        ) : (
          <button
            type="button"
            onClick={() => toggleNode(node)}
            onContextMenu={(e) => handleContextMenu(e, node)}
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
                node.expanded ? (
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
        )}
        
        {/* Render input if creating under this directory */}
        {creatingItem && creatingItem.parentPath === node.entry.path && node.expanded && (
          renderInputBox(depth + 1)
        )}

        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className="w-64 border-r border-neutral-800 bg-neutral-950/95 flex flex-col h-full"
      onContextMenu={(e) => {
        // Para crear en la raíz, cuando damos click derecho en una zona vacía
        if ((e.target as HTMLElement).closest('.explorer-file-item')) return
        handleContextMenu(e, undefined, true)
      }}
    >
      <div className="px-3 py-2 border-b border-neutral-800 flex justify-between items-center group">
        <div className="font-semibold text-sm text-neutral-200">Explorer</div>
        <div className="hidden group-hover:flex space-x-1">
           <button onClick={(e) => { e.stopPropagation(); actionNewFile(); }} className="text-neutral-400 hover:text-neutral-100" title="Nuevo Archivo">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </button>
           <button onClick={(e) => { e.stopPropagation(); actionNewDir(); }} className="text-neutral-400 hover:text-neutral-100" title="Nueva Carpeta">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1h-5a2 2 0 00-2 2v1H9z" /></svg>
           </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2" onClick={() => handleInputCancel()}>
        {loading && <div className="text-neutral-500 text-xs py-2">Cargando archivos...</div>}
        {error && <div className="text-red-400 text-[11px] py-2">{error}</div>}
        {!loading && !error && (
          <div className="space-y-0.5 min-h-full pb-10">
            {creatingItem && creatingItem.parentPath === (rootPath || '.') && (
              renderInputBox(0)
            )}
            {rootNodes.map((node) => renderNode(node))}
          </div>
        )}
      </div>

      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenuItems}
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0, node: null })}
      />
    </div>
  )
}
