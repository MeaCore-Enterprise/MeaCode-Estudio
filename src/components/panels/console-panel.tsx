'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Trash2, Terminal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditor, type ConsoleLog, FileTab } from '@/contexts/editor-context';


interface ConsolePanelProps {
  className?: string;
  file: FileTab;
}

export function ConsolePanel({ className, file }: ConsolePanelProps) {
  const { consoleLogs, addConsoleLog, clearConsoleLogs } = useEditor();
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevos logs
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [consoleLogs]);


  const executeJavaScript = async () => {
    if (file.language !== 'javascript') {
      const logEntry: ConsoleLog = {
        id: `${Date.now()}`,
        type: 'warn',
        content: ['Execution is only available for JavaScript for now.'],
        timestamp: new Date()
      };
      addConsoleLog(logEntry);
      return;
    }

    setIsRunning(true);
    clearConsoleLogs();

    try {
      // Prefer Tauri when available
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        try {
          const { invoke } = await import('@tauri-apps/api/tauri');
          const result: any = await invoke('run_js', { code: file.content });
          if (Array.isArray(result?.logs)) {
            for (const entry of result.logs) {
              const type = (entry.type as ConsoleLog['type']) ?? 'log';
              const content = Array.isArray(entry.content) ? entry.content.map(String) : [String(entry.content ?? '')];
              addConsoleLog({ id: `${Date.now()}-${Math.random()}`, type, content, timestamp: new Date() });
            }
            addConsoleLog({ id: `${Date.now()}`, type: 'info', content: ['✓ Code executed via Tauri'], timestamp: new Date() });
            return;
          }
        } catch { /* fall through to other strategies */ }
      }

      // Electron bridge
      // @ts-ignore
      const bridge = (window as any)?.appBridge;
      if (bridge?.runJS) {
        const result = await bridge.runJS(file.content);
        if (Array.isArray(result?.logs)) {
          for (const entry of result.logs) {
            const type = entry.type as ConsoleLog['type'] ?? 'log';
            const content = Array.isArray(entry.content) ? entry.content.map(String) : [String(entry.content ?? '')];
            addConsoleLog({ id: `${Date.now()}-${Math.random()}`, type, content, timestamp: new Date() });
          }
        }
        addConsoleLog({ id: `${Date.now()}`, type: 'info', content: ['✓ Code executed in Node'], timestamp: new Date() });
      } else {
        setTimeout(() => {
          try {
            const customConsole = {
              log: (...args: any[]) => addConsoleLog({ id: `${Date.now()}-${Math.random()}`, type: 'log', content: args.map(String), timestamp: new Date() }),
              error: (...args: any[]) => addConsoleLog({ id: `${Date.now()}-${Math.random()}`, type: 'error', content: args.map(String), timestamp: new Date() }),
              warn: (...args: any[]) => addConsoleLog({ id: `${Date.now()}-${Math.random()}`, type: 'warn', content: args.map(String), timestamp: new Date() }),
              info: (...args: any[]) => addConsoleLog({ id: `${Date.now()}-${Math.random()}`, type: 'info', content: args.map(String), timestamp: new Date() }),
            };
            const func = new Function('console', file.content);
            func(customConsole);
            addConsoleLog({ id: `${Date.now()}`, type: 'info', content: ['✓ Code executed successfully'], timestamp: new Date() });
          } catch (error: any) {
            addConsoleLog({ id: `${Date.now()}`, type: 'error', content: [`❌ Execution Error: ${error.message}`], timestamp: new Date() });
          } finally {
            setIsRunning(false);
          }
        }, 50);
        return;
      }
    } catch (error: any) {
      addConsoleLog({ id: `${Date.now()}`, type: 'error', content: [`❌ Execution Error: ${error.message}`], timestamp: new Date() });
    } finally {
      setIsRunning(false);
    }
  };

  const getLogColor = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-foreground';
    }
  };

  const getLogIcon = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '▸';
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/50">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="text-sm font-medium">Console</span>
          {consoleLogs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({consoleLogs.length})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={clearConsoleLogs}
            disabled={consoleLogs.length === 0}
            className="h-8"
            title="Clear console"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            size="sm"
            onClick={executeJavaScript}
            disabled={isRunning || file.language !== 'javascript' || file.content.trim() === ''}
            className="h-8 gap-1.5"
          >
            {isRunning ? (
                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <Play className="h-3.5 w-3.5" />
            )}
            Run
          </Button>
        </div>
      </div>

      {/* Console Output */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-3 font-mono text-sm space-y-1">
          {consoleLogs.length === 0 ? (
            <div className="text-muted-foreground text-center pt-16">
              <Terminal className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                Press "Run" to execute your code and see the output.
              </p>
            </div>
          ) : (
            consoleLogs.map((log: ConsoleLog) => (
              <div
                key={log.id}
                className={cn(
                  'flex gap-3 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors',
                  getLogColor(log.type)
                )}
              >
                <span className="shrink-0 select-none">{getLogIcon(log.type)}</span>
                <div className="flex-1 whitespace-pre-wrap break-words">
                  {log.content.join(' ')}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 self-start">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
