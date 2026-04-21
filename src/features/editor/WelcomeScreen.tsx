import React from 'react'

type WelcomeScreenProps = {
  onOpenFolder: () => void
  onCreateProject?: () => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenFolder, onCreateProject }) => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="max-w-xl w-full bg-neutral-900/70 border border-neutral-800 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-300 font-semibold">
            MC
          </div>
          <div>
            <h1 className="text-xl font-semibold">Bienvenido a MeaCode Studio</h1>
            <p className="text-sm text-neutral-400">AI-first desktop IDE con Rust + Tauri</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-neutral-300 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-red-400">●</span>
            <span>Abre una carpeta existente para empezar a editar.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">●</span>
            <span>Elige “Create project” si quieres partir desde una plantilla (próximamente).</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">●</span>
            <span>Las features experimentales se pueden activar en Settings → Experimental.</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onOpenFolder}
            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-500 transition-colors"
          >
            Open Folder
          </button>
          <button
            onClick={onCreateProject}
            className="px-4 py-2 rounded-md border border-neutral-700 text-neutral-200 text-sm hover:bg-neutral-800 transition-colors"
          >
            Create project (soon)
          </button>
        </div>
      </div>
    </div>
  )
}

