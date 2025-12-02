// MeaMind AI Chat Assistant (moved to Desarrollo)

export interface AIChatAssistantInput {
  query: string;
  context: string;
}

export interface AIChatAssistantOutput {
  response: string;
}

export async function aiChatAssistant(
  input: AIChatAssistantInput
): Promise<AIChatAssistantOutput> {
  const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;
  if (!isTauri) {
    return {
      response:
        'Esta función está disponible en la app de escritorio. Abre el proyecto con Tauri para usar MeaMind.',
    };
  }
  const invoke = (window as any).__TAURI__?.invoke;
  const response = (await invoke('ai_chat', {
    query: input.query,
    context: input.context,
  })) as string;
  return { response };
}
