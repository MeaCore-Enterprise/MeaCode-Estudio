import React, { useEffect, useRef } from 'react'
import { Terminal as XTermTerminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export type TerminalProps = {
  visible: boolean
}

export const Terminal: React.FC<TerminalProps> = ({ visible }) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstanceRef = useRef<XTermTerminal | null>(null)

  useEffect(() => {
    if (!visible || !terminalRef.current) return

    if (!terminalInstanceRef.current) {
      const term = new XTermTerminal({
        theme: {
          background: '#000000',
          foreground: '#d4d4d4',
        },
        fontSize: 12,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(terminalRef.current)
      fitAddon.fit()

      terminalInstanceRef.current = term
      term.write('Terminal ready\r\n')
    }

    return () => {
      // Cleanup if needed
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={terminalRef}
      className="w-full h-full bg-black text-neutral-200"
      style={{ overflow: 'hidden' }}
    />
  )
}
