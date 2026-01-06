import React from 'react'
import { explainCodeWithAI, fixErrorWithAI } from '../ipc/bridge'

export type Problem = {
  message: string
  severity: 'error' | 'warning' | 'info'
  startLine: number
  startCol: number
  endLine: number
  endCol: number
  code?: string
}

export type ProblemsPanelProps = {
  problems: Problem[]
  fileContent?: string
  language?: string
  onExplainWithAI?: (problem: Problem) => void
  onFixWithAI?: (problem: Problem) => void
}

export const ProblemsPanel: React.FC<ProblemsPanelProps> = ({
  problems,
  fileContent,
  language,
  onExplainWithAI,
  onFixWithAI,
}) => {
  const getApiKey = () => {
    return localStorage.getItem('nexusify-api-key') || ''
  }

  const handleExplain = async (problem: Problem) => {
    const apiKey = getApiKey()
    if (!apiKey) {
      alert('Por favor configura tu API key de Nexusify en el panel de IA')
      return
    }

    if (onExplainWithAI) {
      onExplainWithAI(problem)
      return
    }

    try {
      const code = problem.code || fileContent || ''
      const explanation = await explainCodeWithAI(apiKey, code, language)
      alert(explanation) // Temporal - debería mostrarse en un panel
    } catch (err) {
      console.error('Error explaining problem:', err)
      alert('Error al explicar el problema')
    }
  }

  const handleFix = async (problem: Problem) => {
    const apiKey = getApiKey()
    if (!apiKey) {
      alert('Por favor configura tu API key de Nexusify en el panel de IA')
      return
    }

    if (onFixWithAI) {
      onFixWithAI(problem)
      return
    }

    try {
      const code = problem.code || fileContent || ''
      const fixedCode = await fixErrorWithAI(apiKey, code, problem.message, language)
      // TODO: Aplicar el código corregido
      console.log('Fixed code:', fixedCode)
    } catch (err) {
      console.error('Error fixing problem:', err)
      alert('Error al arreglar el problema')
    }
  }

  if (problems.length === 0) {
    return (
      <div className="p-4 text-center text-neutral-500 text-sm">
        No hay problemas
      </div>
    )
  }

  return (
    <div className="p-2 space-y-1">
      {problems.map((problem, idx) => (
        <div
          key={idx}
          className={`
            p-2 rounded text-xs
            ${problem.severity === 'error' ? 'bg-red-900/20 border border-red-800/40' : ''}
            ${problem.severity === 'warning' ? 'bg-yellow-900/20 border border-yellow-800/40' : ''}
            ${problem.severity === 'info' ? 'bg-blue-900/20 border border-blue-800/40' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`
                  ${problem.severity === 'error' ? 'text-red-400' : ''}
                  ${problem.severity === 'warning' ? 'text-yellow-400' : ''}
                  ${problem.severity === 'info' ? 'text-blue-400' : ''}
                  font-semibold
                `}>
                  {problem.severity === 'error' ? '●' : problem.severity === 'warning' ? '⚠' : 'ℹ'}
                </span>
                <span className="text-neutral-300">
                  Línea {problem.startLine}:{problem.startCol}
                </span>
              </div>
              <p className="text-neutral-400 text-[11px]">{problem.message}</p>
            </div>
            {problem.severity === 'error' && (
              <div className="flex gap-1">
                <button
                  onClick={() => handleExplain(problem)}
                  className="px-2 py-1 rounded text-[10px] bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/40"
                  title="Explain with AI"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleFix(problem)}
                  className="px-2 py-1 rounded text-[10px] bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/40"
                  title="Fix with AI"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

