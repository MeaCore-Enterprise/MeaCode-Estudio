// MeaMind IntelliSense (moved to Desarrollo)

export interface AIPoweredIntelliSenseInput {
  codeSnippet: string;
  programmingLanguage: string;
  context?: string;
}

export interface AIPoweredIntelliSenseOutput {
  completionSuggestions: string[];
  errorDetection: string;
}

export async function aiPoweredIntelliSense(
  input: AIPoweredIntelliSenseInput
): Promise<AIPoweredIntelliSenseOutput> {
  const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;
  if (!isTauri) {
    return { completionSuggestions: [], errorDetection: '' };
  }
  const invoke = (window as any).__TAURI__?.invoke;
  const result = await invoke('ai_intellisense', {
    codeSnippet: input.codeSnippet,
    programmingLanguage: input.programmingLanguage,
    context: input.context ?? null,
  });
  return result as AIPoweredIntelliSenseOutput;
}
