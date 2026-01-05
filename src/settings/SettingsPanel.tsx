import React, { useState, useEffect } from 'react'

type Settings = {
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

export type SettingsPanelProps = {
  visible: boolean
  onClose: () => void
  onSettingsChange?: (settings: Settings) => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ visible, onClose, onSettingsChange }) => {
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

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('meacode-settings', JSON.stringify(newSettings))
    onSettingsChange?.(newSettings)
  }

  if (!visible) return null

  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 border-l border-neutral-800">
      <div className="h-10 flex items-center justify-between px-4 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-200">Configuración</h2>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-200 text-xs px-2 py-1"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Editor Settings */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-300 mb-3">Editor</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Tamaño de fuente</label>
              <input
                type="number"
                min="8"
                max="32"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value) || 14)}
                className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-200"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Tamaño de tabulación</label>
              <input
                type="number"
                min="1"
                max="8"
                value={settings.tabSize}
                onChange={(e) => updateSetting('tabSize', parseInt(e.target.value) || 2)}
                className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-200"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[11px] text-neutral-400">Ajuste de línea</label>
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => updateSetting('wordWrap', e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[11px] text-neutral-400">Minimapa</label>
              <input
                type="checkbox"
                checked={settings.minimap}
                onChange={(e) => updateSetting('minimap', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* Auto-save Settings */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-300 mb-3">Auto-guardado</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-neutral-400">Habilitar auto-guardado</label>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSetting('autoSave', e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            {settings.autoSave && (
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Retraso (ms)
                </label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="500"
                  value={settings.autoSaveDelay}
                  onChange={(e) => updateSetting('autoSaveDelay', parseInt(e.target.value) || 2000)}
                  className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-300 mb-3">Apariencia</h3>
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Tema</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value as 'dark' | 'light')}
              className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-200"
            >
              <option value="dark">Oscuro</option>
              <option value="light">Claro</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

