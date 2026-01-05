import React, { useState, useRef, useEffect } from 'react'
import { chatWithNexusify, type NexusifyMessage } from '../ipc/bridge'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

export const AIChatThemed: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        'IA de MeaCode Studio lista. Conectado a Nexusify API. Puedes hacer preguntas sobre código, generar funciones, refactorizar código y más.\n\nModelos disponibles: GPT-4, Gemini, Claude, y más.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('nexusify-api-key') || ''
  })
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [showApiSettings, setShowApiSettings] = useState(!apiKey)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const availableModels = [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-ultra', label: 'Gemini Ultra' },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('nexusify-api-key', apiKey.trim())
      setShowApiSettings(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!apiKey) {
      setShowApiSettings(true)
      return
    }

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Add loading message
    const loadingMsg: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      loading: true,
    }
    setMessages((prev) => [...prev, loadingMsg])

    try {
      // Convert messages to Nexusify format
      const nexusifyMessages: NexusifyMessage[] = [
        {
          role: 'system',
          content: 'Eres un asistente de IA especializado en programación. Ayudas a los desarrolladores a escribir código, explicar conceptos, refactorizar código y resolver problemas de programación.',
        },
        ...messages
          .filter((m) => !m.loading)
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        {
          role: 'user',
          content: userMsg.content,
        },
      ]

      const response = await chatWithNexusify(apiKey, selectedModel, nexusifyMessages)

      setMessages((prev) => {
        const newMessages = [...prev]
        const loadingIndex = newMessages.findIndex((m) => m.loading)
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            id: newMessages[loadingIndex].id,
            role: 'assistant',
            content: response,
            loading: false,
          }
        }
        return newMessages
      })
    } catch (err) {
      setMessages((prev) => {
        const newMessages = [...prev]
        const loadingIndex = newMessages.findIndex((m) => m.loading)
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            id: newMessages[loadingIndex].id,
            role: 'assistant',
            content: `Error: ${String(err)}\n\nAsegúrate de que tu API key de Nexusify sea válida.`,
            loading: false,
          }
        }
        return newMessages
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col text-xs bg-neutral-950 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-900/80">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-100 text-[11px]">AI Chat</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-[10px] bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-neutral-300"
          >
            {availableModels.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {apiKey && (
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Conectado
            </span>
          )}
          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="text-[10px] text-neutral-400 hover:text-neutral-200"
            title="Configurar API"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      {showApiSettings && (
        <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-900/50">
          <div className="space-y-2">
            <label className="block text-[10px] text-neutral-400">
              Nexusify API Key
            </label>
            <div className="flex gap-1">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu API key de Nexusify"
                className="flex-1 text-[10px] bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 placeholder-neutral-500"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-2 py-1 text-[10px] bg-red-600 hover:bg-red-500 rounded text-white"
              >
                Guardar
              </button>
            </div>
            <p className="text-[9px] text-neutral-500">
              Obtén tu API key en{' '}
              <a
                href="https://nexusify.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:underline"
              >
                nexusify.co
              </a>
            </p>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto space-y-2 p-3">
        {messages.map((m) => (
          <div key={m.id} className="text-[11px]">
            <span
              className={
                m.role === 'assistant'
                  ? 'font-semibold text-red-400 mr-1'
                  : 'font-semibold text-sky-400 mr-1'
              }
            >
              {m.role === 'assistant' ? 'AI' : 'Tú'}:
            </span>
            {m.loading ? (
              <span className="text-neutral-400 italic">Pensando...</span>
            ) : (
              <span className="text-neutral-200 whitespace-pre-wrap">{m.content}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-neutral-800 p-2 space-y-1 bg-neutral-950/95">
        <textarea
          className="w-full resize-none rounded-md bg-black/70 px-2 py-1 text-[11px] text-neutral-100 outline-none border border-neutral-700 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
          rows={3}
          placeholder={apiKey ? "Pregunta sobre código, genera funciones, refactoriza código..." : "Configura tu API key de Nexusify para comenzar..."}
          disabled={!apiKey}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-red-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-500 active:bg-red-700"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
