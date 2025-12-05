// Cache for IntelliSense suggestions to improve performance

interface CacheEntry {
  suggestions: string[];
  error: string;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

class IntelliSenseCache {
  private cache: Map<string, CacheEntry> = new Map();

  private getKey(code: string, language: string, context?: string): string {
    // Create a simple hash key
    const hash = `${language}:${code.length}:${code.slice(-50)}:${context?.slice(0, 50) || ''}`;
    return hash;
  }

  get(code: string, language: string, context?: string): { suggestions: string[]; error: string } | null {
    const key = this.getKey(code, language, context);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache is still valid
    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return {
      suggestions: entry.suggestions,
      error: entry.error,
    };
  }

  set(code: string, language: string, context: string | undefined, suggestions: string[], error: string): void {
    const key = this.getKey(code, language, context);

    // Limit cache size
    if (this.cache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      suggestions,
      error,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear old entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

export const intellisenseCache = new IntelliSenseCache();

// Cleanup cache every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    intellisenseCache.cleanup();
  }, 10 * 60 * 1000);
}

