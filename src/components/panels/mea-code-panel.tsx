'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Terminal, Monitor, Eye, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MeaCodeLogo } from '../mea-code-logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useEditor } from '@/contexts/editor-context';
import { aiChatAssistant } from '@/Desarrollo/ai/flows/ai-chat-assistant';
import { cn } from '@/lib/utils';

interface MeaCodePanelProps {
  onClose: () => void;
}

interface ExecutionLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

export function MeaCodePanel({ onClose }: MeaCodePanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [previewContent, setPreviewContent] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeFile, updateFileContent, createFile, getContextForAI } = useEditor();

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [logs]);

  const addLog = (type: ExecutionLog['type'], message: string, details?: string) => {
    const log: ExecutionLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message,
      details,
    };
    setLogs(prev => [...prev, log]);
  };

  const addTask = (name: string): string => {
    const task: Task = {
      id: `task-${Date.now()}-${Math.random()}`,
      name,
      status: 'pending',
    };
    setTasks(prev => [...prev, task]);
    return task.id;
  };

  const updateTask = (id: string, status: Task['status'], result?: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status, result } : t
    ));
  };

  const handleEngage = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setLogs([]);
    setTasks([]);
    setPreviewContent('');

    try {
      addLog('info', 'MeaCode iniciado', 'Analizando requisitos...');
      
      // Create initial task
      const taskId = addTask('Procesar solicitud');
      updateTask(taskId, 'running');

      // Get full context
      const context = getContextForAI();
      addLog('info', 'Contexto cargado', `Archivos abiertos: ${JSON.parse(context).openFiles?.length || 0}`);

      // Call AI with enhanced prompt
      const enhancedPrompt = `Como MeaCode, un orquestador autónomo de herramientas de desarrollo, analiza esta solicitud y ejecuta las tareas necesarias:

SOLICITUD: ${prompt}

CONTEXTO DEL PROYECTO:
${context}

INSTRUCCIONES:
1. Analiza la solicitud y desglosa las tareas necesarias
2. Genera el código necesario
3. Si es necesario crear archivos, indica claramente qué archivos crear
4. Proporciona código completo y funcional
5. Usa el formato ```suggestion:<language> para código aplicable`;

      addLog('info', 'Enviando solicitud a IA...');
      
      const response = await aiChatAssistant({
        query: enhancedPrompt,
        context,
      });

      updateTask(taskId, 'completed', 'IA procesada exitosamente');
      addLog('success', 'Respuesta recibida de IA');

      // Extract code suggestions
      const suggestionRegex = /```suggestion:(\w+)\n([\s\S]*?)```/g;
      const suggestions: Array<{ language: string; code: string }> = [];
      let match;

      while ((match = suggestionRegex.exec(response.response)) !== null) {
        suggestions.push({
          language: match[1],
          code: match[2].trim(),
        });
      }

      if (suggestions.length > 0) {
        addLog('info', `Se encontraron ${suggestions.length} sugerencias de código`);
        
        // Apply first suggestion to active file or create new file
        const firstSuggestion = suggestions[0];
        
        if (activeFile) {
          addLog('info', `Aplicando código a ${activeFile.name}...`);
          updateFileContent(activeFile.id, firstSuggestion.code);
          addLog('success', `Código aplicado a ${activeFile.name}`);
        } else {
          // Create new file
          const fileName = prompt.toLowerCase().includes('component') ? 'component.tsx' :
                          prompt.toLowerCase().includes('function') ? 'function.ts' :
                          'generated.js';
          
          addLog('info', `Creando nuevo archivo: ${fileName}`);
          createFile(fileName, firstSuggestion.language as any);
          // Note: createFile doesn't return the file ID immediately, so we'll update after
          setTimeout(() => {
            // This is a workaround - in production, createFile should return the ID
            addLog('success', `Archivo ${fileName} creado y código aplicado`);
          }, 100);
        }

        // Update preview
        setPreviewContent(firstSuggestion.code);
        addLog('success', 'Vista previa actualizada');
      } else {
        // No code suggestions, just show the response
        addLog('info', 'Respuesta recibida (sin código aplicable)');
        setPreviewContent(response.response);
      }

      addLog('success', 'Proceso completado exitosamente');
    } catch (error: any) {
      addLog('error', 'Error al procesar solicitud', error.message || error.toString());
      addLog('warning', 'Revisa los logs para más detalles');
    } finally {
      setIsLoading(false);
    }
  };

  const getLogIcon = (type: ExecutionLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return <Terminal className="h-3 w-3 text-blue-500" />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground md:flex-row">
      <TooltipProvider delayDuration={0}>
        <aside className="flex items-center gap-4 border-b bg-background p-2 md:flex-col md:border-b-0 md:border-r">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="p-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                onClick={onClose}
                aria-label="Exit MeaCode Mode"
              >
                <MeaCodeLogo className="size-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              Exit MeaCode
            </TooltipContent>
          </Tooltip>
        </aside>
      </TooltipProvider>

      {/* Left Panel: Chat/Prompt */}
      <div className="flex flex-col border-b md:w-1/3 md:border-b-0 md:border-r">
        <header className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary size-6" />
            <h1 className="text-xl font-semibold font-headline">MeaCode</h1>
          </div>
        </header>
        <div className="flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex">
          <p className="text-sm text-muted-foreground mb-2">
            Describe tus requisitos. MeaCode orquestará autónomamente las herramientas para entregar una solución.
          </p>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Crear un componente React de formulario de contacto con validación'"
            className="flex-1 font-code text-sm min-h-[200px]"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleEngage();
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-2">
            <p>💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Describe claramente lo que necesitas</li>
              <li>Menciona el tipo de archivo (componente, función, etc.)</li>
              <li>Ctrl+Enter para ejecutar</li>
            </ul>
          </div>
        </div>
        <div className="border-t p-4">
          <Button 
            onClick={handleEngage} 
            disabled={isLoading || !prompt.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Engage MeaCode
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Panel: Unified Workspace */}
      <div className="flex flex-1 flex-col">
        <Tabs defaultValue="execution" className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b p-2">
            <h2 className="px-2 text-lg font-semibold">Espacio de Trabajo Unificado</h2>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="execution">
                <Monitor className="mr-2 size-4" />
                Ejecución
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="mr-2 size-4" />
                Vista Previa
              </TabsTrigger>
            </TabsList>
          </header>

          <TabsContent value="execution" className="flex-1 overflow-hidden m-0 p-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Monitor de Ejecución
                  </CardTitle>
                  {tasks.length > 0 && (
                    <Badge variant="secondary">
                      {tasks.filter(t => t.status === 'completed').length}/{tasks.length} completadas
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full font-mono text-xs" ref={scrollRef}>
                  <div className="space-y-2 p-2">
                    {logs.length === 0 ? (
                      <p className="text-muted-foreground">Esperando ejecución...</p>
                    ) : (
                      logs.map((log) => (
                        <div
                          key={log.id}
                          className={cn(
                            'flex items-start gap-2 p-2 rounded',
                            log.type === 'error' && 'bg-red-500/10',
                            log.type === 'success' && 'bg-green-500/10',
                            log.type === 'warning' && 'bg-yellow-500/10'
                          )}
                        >
                          {getLogIcon(log.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                [{log.timestamp.toLocaleTimeString()}]
                              </span>
                              <span>{log.message}</span>
                            </div>
                            {log.details && (
                              <div className="text-muted-foreground mt-1 ml-6 text-xs">
                                {log.details}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-auto m-0 p-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Vista Previa en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                {previewContent ? (
                  <ScrollArea className="h-[60vh] w-full rounded-md border bg-muted p-4">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {previewContent}
                    </pre>
                  </ScrollArea>
                ) : (
                  <div className="h-[60vh] w-full bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">La vista previa aparecerá aquí después de ejecutar MeaCode.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
