import { useState, useCallback, useEffect } from 'react'
import type { Tab } from '../components/TabBar'
import { detectLanguage } from '../utils/languageUtils'

export type EditorState = {
  tabs: Tab[]
  activeTabId: string | null
}

export function useEditor() {
  const [state, setState] = useState<EditorState>({
    tabs: [],
    activeTabId: null,
  })

  const openFile = useCallback((path: string, content: string) => {
    setState((prev) => {
      // Check if file is already open
      const existingTab = prev.tabs.find((tab) => tab.path === path)
      if (existingTab) {
        return {
          ...prev,
          activeTabId: existingTab.id,
        }
      }

      // Create new tab
      const newTab: Tab = {
        id: `tab-${Date.now()}-${Math.random()}`,
        path,
        name: path,
        content,
        modified: false,
        language: detectLanguage(path),
      }

      return {
        tabs: [...prev.tabs, newTab],
        activeTabId: newTab.id,
      }
    })
  }, [])

  const closeTab = useCallback((tabId: string) => {
    setState((prev) => {
      const newTabs = prev.tabs.filter((tab) => tab.id !== tabId)
      let newActiveTabId = prev.activeTabId

      // If closing active tab, switch to another
      if (prev.activeTabId === tabId) {
        if (newTabs.length > 0) {
          const closedIndex = prev.tabs.findIndex((tab) => tab.id === tabId)
          if (closedIndex > 0) {
            newActiveTabId = prev.tabs[closedIndex - 1].id
          } else {
            newActiveTabId = newTabs[0]?.id || null
          }
        } else {
          newActiveTabId = null
        }
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      }
    })
  }, [])

  const setActiveTab = useCallback((tabId: string) => {
    setState((prev) => ({
      ...prev,
      activeTabId: tabId,
    }))
  }, [])

  const updateTabContent = useCallback((tabId: string, content: string, modified: boolean = true) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, content, modified } : tab
      ),
    }))
  }, [])

  const markTabSaved = useCallback((tabId: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, modified: false } : tab
      ),
    }))
  }, [])

  const getActiveTab = useCallback((): Tab | null => {
    return state.tabs.find((tab) => tab.id === state.activeTabId) || null
  }, [state.tabs, state.activeTabId])

  // Load tabs from localStorage on mount
  useEffect(() => {
    try {
      const savedTabs = localStorage.getItem('meacode-editor-tabs')
      if (savedTabs) {
        const parsed = JSON.parse(savedTabs)
        if (parsed.tabs && parsed.tabs.length > 0) {
          // Only restore paths, content will be loaded on demand
          setState({
            tabs: parsed.tabs.map((tab: any) => ({
              ...tab,
              content: '', // Will be loaded when tab is activated
            })),
            activeTabId: parsed.activeTabId,
          })
        }
      }
    } catch (err) {
      console.error('Error loading editor state:', err)
    }
  }, [])

  // Save tabs to localStorage
  useEffect(() => {
    try {
      const toSave = {
        tabs: state.tabs.map(tab => ({
          id: tab.id,
          path: tab.path,
          name: tab.name,
          language: tab.language,
          modified: tab.modified,
          // Don't save content to avoid localStorage size limits
        })),
        activeTabId: state.activeTabId,
      }
      localStorage.setItem('meacode-editor-tabs', JSON.stringify(toSave))
    } catch (err) {
      console.error('Error saving editor state:', err)
    }
  }, [state.tabs, state.activeTabId])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Tab or Ctrl+PageDown: Next tab
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Tab' || e.key === 'PageDown')) {
        e.preventDefault()
        setState((prev) => {
          if (prev.tabs.length === 0) return prev
          const currentIndex = prev.tabs.findIndex((tab) => tab.id === prev.activeTabId)
          const nextIndex = currentIndex < prev.tabs.length - 1 ? currentIndex + 1 : 0
          return {
            ...prev,
            activeTabId: prev.tabs[nextIndex].id,
          }
        })
      }

      // Ctrl+Shift+Tab or Ctrl+PageUp: Previous tab
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'Tab' || e.key === 'PageUp')) {
        e.preventDefault()
        setState((prev) => {
          if (prev.tabs.length === 0) return prev
          const currentIndex = prev.tabs.findIndex((tab) => tab.id === prev.activeTabId)
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : prev.tabs.length - 1
          return {
            ...prev,
            activeTabId: prev.tabs[prevIndex].id,
          }
        })
      }

      // Ctrl+W: Close current tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault()
        setState((prev) => {
          if (!prev.activeTabId) return prev
          const tabId = prev.activeTabId
          const newTabs = prev.tabs.filter((tab) => tab.id !== tabId)
          let newActiveTabId = null
          if (newTabs.length > 0) {
            const closedIndex = prev.tabs.findIndex((tab) => tab.id === tabId)
            if (closedIndex > 0) {
              newActiveTabId = prev.tabs[closedIndex - 1].id
            } else {
              newActiveTabId = newTabs[0]?.id || null
            }
          }
          return {
            tabs: newTabs,
            activeTabId: newActiveTabId,
          }
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    openFile,
    closeTab,
    setActiveTab,
    updateTabContent,
    markTabSaved,
    getActiveTab,
  }
}

