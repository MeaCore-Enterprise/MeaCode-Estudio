'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  CornerDownLeft,
  Bot,
  User,
  Sparkles,
  Code,
  Terminal,
  Eye,
  Send,
  Loader2,
  Zap,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { aiChatAssistant } from '@/ai/flows/ai-chat-assistant';
import { useEditor } from '@/contexts/editor-context';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedCode?: string;
  language?: string;
  applied?: boolean;
}

export function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<{
    code: string;
    messageId: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    activeFile,
    consoleLogs,
    hasErrors,
    getContextForAI,
    updateFileContent,
  } = useEditor();

  const lang = activeFile?.language || 'javascript';

  useEffect(() => {
    // A little delay to allow the new message to be rendered
    setTimeout(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, 100);
  }, [messages]);

  // Extraer código sugerido de la respuesta
  const extractSuggestedCode = (content: string): { cleanContent: string, suggestedCode: string | null } => {
    const suggestionRegex = /```suggestion:\w+\n([\s\S]*?)```/;
    const match = content.match(suggestionRegex);
    if (match) {
        const suggestedCode = match[1].trim();
        // Return the full content, the suggestion will be rendered separately
        return { cleanContent: content, suggestedCode };
    }
    return { cleanContent: content, suggestedCode: null };
  };

  const sendMessage = async (customPrompt?: string) => {
    const messageContent = customPrompt || input;
    if (!messageContent.trim() || isLoading) return;

    const fullContext = getContextForAI();

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = messageContent;
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiChatAssistant({
        query: currentInput,
        context: fullContext,
      });
      
      const { cleanContent, suggestedCode } = extractSuggestedCode(response.response);

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: cleanContent.replace(/```suggestion:\w+\n([\s\S]*?)```/g, '').trim(),
        timestamp: new Date(),
        suggestedCode: suggestedCode || undefined,
        language: lang,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);

      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApplySuggestion = (messageId: string, suggestedCode: string) => {
    setPendingSuggestion({ code: suggestedCode, messageId });
    setShowDiffDialog(true);
  };

  const confirmApplySuggestion = () => {
    if (!pendingSuggestion) return;

    if (activeFile) {
      updateFileContent(activeFile.id, pendingSuggestion.code);
    }

    // Marcar como aplicado
    setMessages(prev =>
      prev.map(msg =>
        msg.id === pendingSuggestion.messageId ? { ...msg, applied: true } : msg
      )
    );

    setShowDiffDialog(false);
    setPendingSuggestion(null);
  };
  
    const copyCode = async (codeToCopy: string, messageId: string) => {
        await navigator.clipboard.writeText(codeToCopy);
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 2000);
    };

  // Quick actions con contexto
  const quickActions = [
    {
      icon: Terminal,
      label: 'Fix Errors',
      prompt: 'Corrige los errores automáticamente',
      variant: 'destructive' as const,
      disabled: !hasErrors,
    },
    {
      icon: Code,
      label: 'Explicar código',
      prompt: 'Explica qué hace este código paso a paso',
      variant: 'secondary' as const,
    },
    {
      icon: Zap,
      label: 'Optimize',
      prompt: 'Optimiza este código',
      variant: 'secondary' as const,
    },
    {
      icon: Eye,
      label: 'Review',
      prompt: 'Revisa mi código',
      variant: 'outline' as const,
    },
  ];


  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">MeaMind</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {lang}
              </Badge>
              {hasErrors && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {consoleLogs.filter(l => l.type === 'error').length} errors
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="p-4 border-b space-y-3">
             <p className="text-xs text-muted-foreground font-medium">
              ⚡ Acciones rápidas
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(action => (
                <Button
                  key={action.label}
                  variant={action.variant}
                  size="sm"
                  className="justify-start gap-2 h-auto py-3"
                  onClick={() => sendMessage(action.prompt)}
                  disabled={action.disabled || isLoading}
                >
                  <action.icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-xs font-medium">{action.label}</div>
                  </div>
                </Button>
              ))}
            </div>
             <div className="pt-2 space-y-1">
              <p className="text-xs text-muted-foreground">💡 También puedes:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 ml-4">
                <li>• "Genera un componente React funcional"</li>
                <li>• "Agrega validación de inputs"</li>
                <li>• "Convierte esto a async/await"</li>
              </ul>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">MeaMind está listo</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Tengo contexto completo de tu código
              </p>
              <p className="text-xs text-muted-foreground">
                Puedo generar, explicar, optimizar y corregir código
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback>
                        <Bot className="w-5 h-5" />
                        </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 space-y-2',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap font-code">
                      {message.content}
                    </p>

                    {/* Código sugerido */}
                    {message.suggestedCode && (
                      <div className="mt-3 space-y-2">
                        <div className="bg-background/50 rounded-lg p-3 font-mono text-xs overflow-x-auto border">
                          <pre className="text-foreground/90">
                            {message.suggestedCode}
                          </pre>
                        </div>

                        <div className="flex gap-2">
                          {!message.applied ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApplySuggestion(
                                  message.id,
                                  message.suggestedCode!
                                )
                              }
                              className="gap-1.5"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Aplicar al editor
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="gap-1.5">
                              <CheckCircle2 className="h-3 w-3" />
                              Aplicado
                            </Badge>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() =>
                              copyCode(message.suggestedCode!, message.id)
                            }
                          >
                            {copiedId === message.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    <p className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'user' && (
                     <Avatar className="w-8 h-8 border">
                        <AvatarFallback>
                        <User className="w-5 h-5" />
                        </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                 <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback>
                        <Bot className="w-5 h-5" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2 flex items-center space-x-2">
                    <span className="h-2 w-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-foreground rounded-full animate-pulse"></span>
                    </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 bg-background space-y-2">
           {hasErrors && messages.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full gap-2"
              onClick={() => sendMessage('Corrige los errores automáticamente')}
              disabled={isLoading}
            >
              <Terminal className="h-4 w-4" />
              Fix errors ahora
            </Button>
          )}
          <div className="relative flex gap-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Describe qué quieres hacer..."
              className="min-h-[60px] resize-none pr-12 text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

       {/* Diff Dialog */}
      <AlertDialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aplicar código sugerido</AlertDialogTitle>
            <AlertDialogDescription>
              Esto reemplazará tu código actual. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {pendingSuggestion && (
            <div className="my-4">
              <div className="text-xs font-medium mb-2 text-muted-foreground">
                Código nuevo:
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border bg-muted p-3">
                <pre className="text-xs font-mono">
                  {pendingSuggestion.code}
                </pre>
              </ScrollArea>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApplySuggestion}>
              Aplicar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
