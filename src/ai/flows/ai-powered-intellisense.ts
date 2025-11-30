// MeaMind IntelliSense
 

/**
 * @fileOverview Provides AI-powered code completion and error detection.
 *
 * - aiPoweredIntelliSense - A function that suggests code completions and detects errors using AI.
 * - AIPoweredIntelliSenseInput - The input type for the aiPoweredIntelliSense function.
 * - AIPoweredIntelliSenseOutput - The return type for the aiPoweredIntelliSense function.
 */

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
