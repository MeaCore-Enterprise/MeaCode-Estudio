import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { executeShellCommand, getCurrentDirectory } from '../ipc/bridge'

export const TerminalThemed: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const currentInputRef = useRef<string>('')
  const currentCwdRef = useRef<string>('.')
  const commandQueueRef = useRef<string[]>([])
  const isExecutingRef = useRef<boolean>(false)
  const [currentLine, setCurrentLine] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const updatePrompt = async () => {
    try {
      currentCwdRef.current = await getCurrentDirectory()
    } catch {
      currentCwdRef.current = '.'
    }
  }
  
  const writePrompt = () => {
    if (terminalRef.current) {
      const cwd = currentCwdRef.current
      const shortCwd = cwd.split(/[/\\]/).pop() || cwd
      terminalRef.current.write(`\x1b[32m${shortCwd}\x1b[0m $ `)
    }
  }

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return

    const term = new Terminal({
      convertEol: true,
      fontSize: 12,
      cursorBlink: true,
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

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddonRef.current = fitAddon

    term.open(containerRef.current)
    
    // Fit after a small delay to ensure container is rendered
    setTimeout(() => {
      if (fitAddonRef.current && containerRef.current) {
        fitAddonRef.current.fit()
      }
    }, 100)

    // Initialize prompt asynchronously
    updatePrompt().then(() => {
      term.writeln('MeaCode Studio · Terminal integrada')
      term.writeln('Escribe comandos y presiona Enter para ejecutarlos.\r\n')
      writePrompt()
    })

    let disposed = false

    const processQueue = async () => {
      while (commandQueueRef.current.length > 0) {
        if (disposed) return
        const command = commandQueueRef.current.shift()
        if (!command) continue

        try {
          const result = await executeShellCommand(command)
          if (result.stdout) {
            term.write(result.stdout)
          }
          if (result.stderr) {
            const stderr = result.stderr.trim()
            // Check for common error patterns
            if (
              stderr.includes('not found') ||
              stderr.includes('No such file') ||
              stderr.includes('command not found')
            ) {
              const cmdName = command.split(/\s+/)[0]
              term.write(`\x1b[31mError: comando '${cmdName}' no encontrado\x1b[0m\r\n`)
              term.write(`\x1b[33mTip: Verifica que el comando esté instalado y en tu PATH\x1b[0m\r\n`)
            } else {
              term.write(`\x1b[31m${stderr}\x1b[0m`)
            }
          }
          // Always show exit code if not 0
          if (result.exit_code !== 0) {
            term.write(`\r\n\x1b[33m[Exit code: ${result.exit_code}]\x1b[0m`)
          }
        } catch (err) {
          const errorMsg = String(err)
          if (errorMsg.includes('not found') || errorMsg.includes('No such file')) {
            const cmdName = command.split(/\s+/)[0]
            term.write(`\x1b[31mError: comando '${cmdName}' no encontrado\x1b[0m\r\n`)
            term.write(`\x1b[33mTip: Verifica que el comando esté instalado y en tu PATH\x1b[0m\r\n`)
          } else {
            term.write(`\x1b[31mError: ${errorMsg}\x1b[0m\r\n`)
          }
        }

        // Actualiza prompt tras cada ejecución (cd también cambia cwd).
        try {
          await updatePrompt()
        } catch {
          // ignore
        }
        writePrompt()
      }

      isExecutingRef.current = false
    }

    const startProcessing = () => {
      if (isExecutingRef.current) return
      if (commandQueueRef.current.length === 0) return
      isExecutingRef.current = true
      void processQueue()
    }

    const handleData = (data: string) => {
      const code = data.charCodeAt(0)

      // Ctrl+C (interrupt)
      if (code === 3) {
        term.write('^C\r\n')
        currentInputRef.current = ''
        setCurrentLine('')
        void updatePrompt()
          .catch(() => {
            currentCwdRef.current = '.'
          })
          .finally(() => writePrompt())
        return
      }

      // Ctrl+L (clear screen)
      if (code === 12) {
        term.clear()
        void updatePrompt()
          .catch(() => {
            currentCwdRef.current = '.'
          })
          .finally(() => writePrompt())
        return
      }

      // Enter key
      if (code === 13) {
        term.write('\r\n')
        const command = currentInputRef.current.trim()

        if (command) {
          // Cola: dejamos que el procesamiento ocurra fuera del handler de entrada.
          commandQueueRef.current.push(command)
          setCommandHistory((prev) => [...prev, command])
          setHistoryIndex(-1)
          startProcessing()
        }

        currentInputRef.current = ''
        setCurrentLine('')
        return
      }

      // Mientras haya un comando ejecutándose, evitamos que el input compita con la salida.
      if (isExecutingRef.current) return

      // Backspace
      if (code === 127 || code === 8) {
        if (currentInputRef.current.length > 0) {
          currentInputRef.current = currentInputRef.current.slice(0, -1)
          setCurrentLine(currentInputRef.current)
          term.write('\b \b')
        }
        return
      }

      // Arrow keys (history navigation)
      if (code === 27) {
        // ESC sequence - handle arrow keys
        return
      }

      // Printable characters
      if (code >= 32 && code <= 126) {
        currentInputRef.current += data
        setCurrentLine(currentInputRef.current)
        term.write(data)
      }
    }

    term.onData(handleData)
    terminalRef.current = term

    return () => {
      // Detiene el procesamiento de la cola y libera el terminal.
      disposed = true
      commandQueueRef.current = []
      isExecutingRef.current = false
      term.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [])

  // Handle resize when container size changes (including show/hide)
  useEffect(() => {
    if (!containerRef.current || !fitAddonRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (fitAddonRef.current && containerRef.current) {
          try {
            fitAddonRef.current.fit()
          } catch (err) {
            // Ignore errors during resize
          }
        }
      })
    })

    resizeObserver.observe(containerRef.current)

    // Also handle window resize
    const handleWindowResize = () => {
      if (fitAddonRef.current) {
        requestAnimationFrame(() => {
          if (fitAddonRef.current) {
            try {
              fitAddonRef.current.fit()
            } catch (err) {
              // Ignore errors
            }
          }
        })
      }
    }
    window.addEventListener('resize', handleWindowResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  return (
    <div className="h-full w-full text-xs bg-black/90">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
