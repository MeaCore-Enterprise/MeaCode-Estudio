import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'

export const TerminalThemed: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const terminalRef = useRef<Terminal | null>(null)

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return

    const term = new Terminal({
      convertEol: true,
      fontSize: 12,
      theme: {
        background: '#050509',
        foreground: '#e5e7eb',
        cursor: '#ef4444',
        black: '#000000',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e5e7eb',
        brightBlack: '#4b5563',
        brightRed: '#f97373',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#f9fafb',
      },
    })

    term.open(containerRef.current)
    term.writeln('MeaCode Studio · Terminal integrada')
    term.writeln('> Conectaremos esto al shell nativo via Tauri commands.\r\n')

    terminalRef.current = term

    return () => {
      term.dispose()
      terminalRef.current = null
    }
  }, [])

  return (
    <div className="h-full w-full text-xs bg-black/90">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
