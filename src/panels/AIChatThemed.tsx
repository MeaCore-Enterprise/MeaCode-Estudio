import React, { useState, useRef, useEffect } from 'react'
import { chatCompletion, resolveModelForTask, type NexusifyMessage } from '../ipc/bridge'
import {
  loadAISettings,
  saveAISettings,
  isAIConfigured,
  defaultBaseUrl,
  type AISettings,
  type AIProviderMode,
} from '../utils/aiSettings'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
  /** Solo respuestas del asistente: modelo realmente usado */
  usedModel?: string
}

const PROVIDER_LABELS: Record<AIProviderMode, string> = {
  nexusify: 'Nexusify',
  openai_compatible: 'API compatible (OpenAI, LM Studio, etc.)',
  ollama: 'Local (Ollama)',
}

export const AIChatThemed: React.FC = () => {
  const [settings, setSettings] = useState<AISettings>(() => loadAISettings())
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        'Asistente de MeaCode Studio. Elige proveedor en ⚙: Nexusify, una API compatible con OpenAI (OpenAI, Azure, LM Studio, etc.) o modelos locales con Ollama.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showApiSettings, setShowApiSettings] = useState(() => !isAIConfigured(loadAISettings()))
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const updateMode = (mode: AIProviderMode) => {
    setSettings((prev) => ({
      ...prev,
      mode,
      baseUrl: defaultBaseUrl(mode),
    }))
  }

  const handleSaveSettings = () => {
    saveAISettings(settings)
    setShowApiSettings(false)
  }

  const configured = isAIConfigured(settings)
  const canSend = configured && !isLoading

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!configured) {
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

    const loadingMsg: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      loading: true,
    }
    setMessages((prev) => [...prev, loadingMsg])

    const history: NexusifyMessage[] = [
      {
        role: 'system',
        content:
          'Eres un asistente de programación integrado en MeaCode Studio. Respondes de forma clara y práctica, con código cuando ayude.',
      },
      ...messages
        .filter((m) => !m.loading && m.id !== 1)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      { role: 'user', content: userMsg.content },
    ]

    try {
      const modelId = await resolveModelForTask(settings, 'chat', userMsg.content)
      const { content, model: usedModel } = await chatCompletion(settings, history, 0.7, modelId)

      setMessages((prev) => {
        const next = [...prev]
        const loadingIndex = next.findIndex((m) => m.loading)
        if (loadingIndex !== -1) {
          next[loadingIndex] = {
            id: next[loadingIndex].id,
            role: 'assistant',
            content,
            loading: false,
            usedModel,
          }
        }
        return next
      })
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev]
        const loadingIndex = next.findIndex((m) => m.loading)
        if (loadingIndex !== -1) {
          next[loadingIndex] = {
            id: next[loadingIndex].id,
            role: 'assistant',
            content: `Error: ${String(err)}`,
            loading: false,
          }
        }
        return next
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col text-xs bg-neutral-950 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-900/80">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-semibold text-neutral-100 text-[11px]">AI Chat</span>
          <span
            className="text-[9px] text-neutral-500 truncate"
            title={settings.modelSelection === 'auto_best' ? 'Selección automática' : settings.model}
          >
            {PROVIDER_LABELS[settings.mode]} ·{' '}
            {settings.modelSelection === 'auto_best' ? 'modelo automático' : settings.model || 'sin modelo'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canSend && (
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Listo
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="text-[10px] text-neutral-400 hover:text-neutral-200"
            title="Configurar proveedor y modelo"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {showApiSettings && (
        <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-900/50 space-y-2 max-h-[min(320px,45vh)] overflow-y-auto">
          <label className="block text-[10px] text-neutral-400">Proveedor</label>
          <select
            value={settings.mode}
            onChange={(e) => updateMode(e.target.value as AIProviderMode)}
            className="w-full text-[10px] bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
          >
            {(Object.keys(PROVIDER_LABELS) as AIProviderMode[]).map((k) => (
              <option key={k} value={k}>
                {PROVIDER_LABELS[k]}
              </option>
            ))}
          </select>

          <label className="block text-[10px] text-neutral-400">
            URL base (incluye /v1 para OpenAI/Ollama; sin /chat/completions)
          </label>
          <input
            type="text"
            value={settings.baseUrl}
            onChange={(e) => setSettings((s) => ({ ...s, baseUrl: e.target.value }))}
            placeholder={defaultBaseUrl(settings.mode)}
            className="w-full text-[10px] bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 placeholder-neutral-600"
          />
          <p className="text-[9px] text-neutral-600">
            {settings.mode === 'ollama'
              ? 'Ej: http://127.0.0.1:11434/v1 — se usa GET /v1/models y POST /v1/chat/completions'
              : settings.mode === 'nexusify'
              ? 'https://api.nexusify.co/v1'
              : 'Ej: https://api.openai.com/v1 o http://localhost:1234/v1 (LM Studio)'}
          </p>

          <label className="block text-[10px] text-neutral-400">Modelo</label>
          <select
            value={settings.modelSelection}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                modelSelection: e.target.value === 'auto_best' ? 'auto_best' : 'manual',
              }))
            }
            className="w-full text-[10px] bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
          >
            <option value="manual">Manual (indicas el ID abajo)</option>
            <option value="auto_best">Automático (mejor para código/chat según lista de la API)</option>
          </select>
          <p className="text-[9px] text-neutral-600">
            En automático se consulta <code className="text-neutral-400">/v1/models</code> y se elige el más capaz
            por heurística (GPT-4, Claude, Gemini, Ollama grandes, etc.).
          </p>

          {settings.mode !== 'ollama' && (
            <>
              <label className="block text-[10px] text-neutral-400">API key</label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                placeholder="Bearer token"
                className="w-full text-[10px] bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
              />
            </>
          )}

          <label className="block text-[10px] text-neutral-400">
            {settings.modelSelection === 'auto_best'
              ? 'Modelo de respaldo (si falla listar modelos)'
              : 'ID del modelo'}
          </label>
          <input
            type="text"
            value={settings.model}
            onChange={(e) => setSettings((s) => ({ ...s, model: e.target.value }))}
            placeholder={
              settings.modelSelection === 'auto_best'
                ? 'Opcional: ej. llama3.2'
                : settings.mode === 'ollama'
                  ? 'llama3.2, mistral, codellama…'
                  : 'gpt-4o, claude-3-5-sonnet…'
            }
            className="w-full text-[10px] bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
          />

          <button
            type="button"
            onClick={handleSaveSettings}
            className="w-full px-2 py-1.5 text-[10px] bg-red-600 hover:bg-red-500 rounded text-white font-medium"
          >
            Guardar configuración
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto space-y-2 p-3">
        {messages.map((m) => (
          <div key={m.id} className="text-[11px]">
            <span
              className={
                m.role === 'assistant' ? 'font-semibold text-red-400 mr-1' : 'font-semibold text-sky-400 mr-1'
              }
            >
              {m.role === 'assistant' ? 'IA' : 'Tú'}:
            </span>
            {m.loading ? (
              <span className="text-neutral-400 italic">Pensando...</span>
            ) : (
              <div className="mt-0.5">
                <div className="text-neutral-200 whitespace-pre-wrap">{m.content}</div>
                {m.role === 'assistant' && m.usedModel && (
                  <div className="mt-1 flex justify-end">
                    <span className="text-[9px] text-neutral-500 border border-neutral-700 rounded px-1.5 py-0.5">
                      modelo: {m.usedModel}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-neutral-800 p-2 space-y-1 bg-neutral-950/95">
        <textarea
          className="w-full resize-none rounded-md bg-black/70 px-2 py-1 text-[11px] text-neutral-100 outline-none border border-neutral-700 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
          rows={3}
          placeholder={
            configured
              ? 'Pregunta sobre código, genera o refactoriza…'
              : 'Abre ⚙ y configura proveedor + modelo…'
          }
          disabled={!configured || isLoading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSend || !input.trim()}
            className="rounded-md bg-red-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-500 active:bg-red-700 disabled:opacity-40 disabled:pointer-events-none"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
