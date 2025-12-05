// MeaMind IntelliSense
import { intellisenseCache } from '@/lib/intellisense-cache';

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
  // Check cache first
  const cached = intellisenseCache.get(
    input.codeSnippet,
    input.programmingLanguage,
    input.context
  );

  if (cached) {
    return {
      completionSuggestions: cached.suggestions,
      errorDetection: cached.error,
    };
  }

  const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;
  if (!isTauri) {
    // Fallback for web - basic suggestions
    return { 
      completionSuggestions: ['// Web mode: Limited suggestions'], 
      errorDetection: '' 
    };
  }

  try {
    const invoke = (window as any).__TAURI__?.invoke;
    const result = await invoke('ai_intellisense', {
      codeSnippet: input.codeSnippet,
      programmingLanguage: input.programmingLanguage,
      context: input.context ?? null,
    }) as AIPoweredIntelliSenseOutput;

    // Cache the result
    intellisenseCache.set(
      input.codeSnippet,
      input.programmingLanguage,
      input.context,
      result.completionSuggestions,
      result.errorDetection
    );

    return result;
  } catch (error) {
    console.error('Error in AI IntelliSense:', error);
    return { 
      completionSuggestions: [], 
      errorDetection: 'Error connecting to AI service' 
    };
  }
}
