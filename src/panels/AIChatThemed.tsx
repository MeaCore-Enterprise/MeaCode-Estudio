import React, { useState } from 'react'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export const AIChatThemed: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        'IA de MeaCode Studio lista. Esta vista se conectará al kernel-ai (local + remoto) y agentes.',
    },
  ])
  const [input, setInput] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')

    const echo: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      content: 'Por ahora soy un eco local. Más adelante me conectaré al kernel-ai en Rust.',
    }
    setMessages((prev) => [...prev, echo])
  }

  return (
    <div className="flex h-full flex-col text-xs bg-neutral-950">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-900/80">
        <span className="font-semibold text-neutral-100 text-[11px]">AI Chat</span>
        <span className="text-[10px] text-neutral-500">Echo local · kernel-ai pending</span>
      </div>
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
            <span className="text-neutral-200 whitespace-pre-wrap">{m.content}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="border-t border-neutral-800 p-2 space-y-1 bg-neutral-950/95">
        <textarea
          className="w-full resize-none rounded-md bg-black/70 px-2 py-1 text-[11px] text-neutral-100 outline-none border border-neutral-700 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
          rows={3}
          placeholder="Describe una tarea y en futuras versiones la IA del kernel la ejecutará dentro del IDE..."
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
