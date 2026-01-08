import { useState, useEffect, useCallback } from 'react'

export type Settings = {
  theme: 'dark' | 'light'
  fontSize: number
  autoSave: boolean
  autoSaveDelay: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  fontSize: 14,
  autoSave: true,
  autoSaveDelay: 2000,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('meacode-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch {
        // Use defaults if parse fails
      }
    }
  }, [])

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value }
      localStorage.setItem('meacode-settings', JSON.stringify(newSettings))
      return newSettings
    })
  }, [])

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings }
      localStorage.setItem('meacode-settings', JSON.stringify(merged))
      return merged
    })
  }, [])

  return {
    settings,
    updateSetting,
    updateSettings,
  }
}

