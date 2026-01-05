import React, { useState } from 'react'

export const RunDebugPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string>('')
  const [breakpoints, setBreakpoints] = useState<number[]>([])

  const handleRun = () => {
    setIsRunning(true)
    setOutput('Ejecutando aplicación...\n')
    
    // Simulación de ejecución
    setTimeout(() => {
      setOutput((prev) => prev + '✓ Compilación exitosa\n✓ Aplicación iniciada\n')
      setIsRunning(false)
    }, 1500)
  }

  const handleDebug = () => {
    setIsRunning(true)
    setOutput('Iniciando debugger...\n')
    
    setTimeout(() => {
      setOutput((prev) => prev + '✓ Debugger conectado\n✓ Breakpoints activos\n')
      setIsRunning(false)
    }, 1500)
  }

  const handleStop = () => {
    setIsRunning(false)
    setOutput((prev) => prev + '\n⏹ Ejecución detenida\n')
  }

  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 border-t border-neutral-800">
      <div className="h-8 flex items-center justify-between px-3 border-b border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-200">Run and Debug</span>
          <span className="text-[10px] text-neutral-500">Beta</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-2 py-1 rounded text-[10px] bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title="Run (F5)"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Run
          </button>
          <button
            onClick={handleDebug}
            disabled={isRunning}
            className="px-2 py-1 rounded text-[10px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title="Debug (F5)"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Debug
          </button>
          {isRunning && (
            <button
              onClick={handleStop}
              className="px-2 py-1 rounded text-[10px] bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/40 flex items-center gap-1"
              title="Stop"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              Stop
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-3">
        <div className="text-xs font-mono text-neutral-300 whitespace-pre-wrap">
          {output || 'Listo para ejecutar. Selecciona Run o Debug para comenzar.'}
        </div>
      </div>

      <div className="h-6 flex items-center gap-2 px-3 border-t border-neutral-800 bg-neutral-900/30 text-[10px] text-neutral-400">
        <span>Breakpoints: {breakpoints.length}</span>
        <span>•</span>
        <span>Estado: {isRunning ? 'Ejecutando...' : 'Listo'}</span>
      </div>
    </div>
  )
}

